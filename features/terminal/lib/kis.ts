import "@/lib/assertServer";
import { env, features } from "@/lib/env";
import { captureError } from "@/lib/observability";
import { readAll, mutate } from "@/features/reports/persistence/fileStore";
import { getKisToken, setKisToken } from "@/features/reports/persistence/pgClient";

/**
 * Korea Investment & Securities (KIS) OpenAPI client — server-only.
 *
 * Provides live domestic index quotes (KOSPI). Auth is an OAuth
 * client-credentials token valid ~24h; KIS rate-limits issuance (1/min), so we
 * cache the token in two layers and reuse it until shortly before expiry:
 *   1. globalThis — fast, shared across module graphs within one process.
 *   2. file store (.data/kis-token.json) — survives dev restarts and is shared
 *      across instances on a shared filesystem, so we don't re-issue a fresh
 *      24h token on every cold start. (On ephemeral-fs serverless this only
 *      helps warm reuse; a shared KV/Redis would dedupe across instances.)
 *
 * Every call fails soft: on any error we log and return null so callers can
 * fall back to mock values rather than break the terminal.
 */

const HOSTS = {
  real: "https://openapi.koreainvestment.com:9443",
  paper: "https://openapivts.koreainvestment.com:29443",
} as const;

const baseUrl = HOSTS[env.kisEnv];

type TokenCache = { token: string; expiresAt: number };

/**
 * The KIS token is shared via globalThis, not a module-scoped variable. Next.js
 * bundles route handlers and server components into separate module graphs, so a
 * plain `let` would give each entrypoint its own cache — and they'd each try to
 * issue a token, tripping KIS's 1-issuance-per-minute limit (EGW00133/403).
 * globalThis is shared across all module instances in the process.
 */
const g = globalThis as typeof globalThis & {
  __kisToken?: TokenCache | null;
  __kisTokenInFlight?: Promise<string | null> | null;
};

const TOKEN_FILE = "kis-token";
const SAFETY_MS = 5 * 60_000; // refresh 5 min before expiry

function valid(t: TokenCache | null | undefined): t is TokenCache {
  return Boolean(t && t.expiresAt - SAFETY_MS > Date.now());
}

/**
 * Read the persisted token. Prefers Postgres (shared across all serverless
 * instances → issued ~once/day) and falls back to the file store when no DB.
 * Never throws — a storage hiccup just means we proceed to issue.
 */
async function readPersistedToken(): Promise<TokenCache | null> {
  try {
    if (features.db) return await getKisToken();
    const [persisted] = await readAll<TokenCache>(TOKEN_FILE);
    return persisted ?? null;
  } catch {
    return null;
  }
}

async function writePersistedToken(rec: TokenCache): Promise<void> {
  try {
    if (features.db) await setKisToken(rec.token, rec.expiresAt);
    else await mutate<TokenCache, void>(TOKEN_FILE, () => ({ rows: [rec], result: undefined }));
  } catch {
    /* best-effort cache; ignore write failures */
  }
}

/** Issue or reuse a cached access token. Returns null when unavailable. */
async function getAccessToken(): Promise<string | null> {
  if (!features.marketData) return null;

  // 1. In-process cache.
  if (valid(g.__kisToken)) return g.__kisToken!.token;
  if (g.__kisTokenInFlight) return g.__kisTokenInFlight;

  g.__kisTokenInFlight = (async () => {
    try {
      // 2. Persisted cache — shared across instances (Postgres) so we don't
      //    re-issue on every serverless cold start.
      const persisted = await readPersistedToken();
      if (valid(persisted)) {
        g.__kisToken = persisted;
        return persisted.token;
      }

      // 3. Issue a fresh token.
      const res = await fetch(`${baseUrl}/oauth2/tokenP`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          grant_type: "client_credentials",
          appkey: env.kisAppKey,
          appsecret: env.kisAppSecret,
        }),
        cache: "no-store",
      });
      if (!res.ok) {
        await captureError(new Error(`KIS token HTTP ${res.status}`), {
          where: "kis.getAccessToken",
          body: await res.text().catch(() => ""),
        });
        return null;
      }
      const json = (await res.json()) as {
        access_token?: string;
        expires_in?: number;
      };
      if (!json.access_token) return null;
      const ttlMs = (json.expires_in ?? 86_400) * 1000;
      const rec: TokenCache = {
        token: json.access_token,
        expiresAt: Date.now() + ttlMs,
      };
      g.__kisToken = rec;
      await writePersistedToken(rec);
      return rec.token;
    } catch (err) {
      await captureError(err, { where: "kis.getAccessToken" });
      return null;
    } finally {
      g.__kisTokenInFlight = null;
    }
  })();

  return g.__kisTokenInFlight;
}

export type IndexQuote = {
  /** Current index level, e.g. 2745.30 */
  value: number;
  /** Change vs previous close, in percent, e.g. -0.82 */
  changePct: number;
  /** ISO timestamp of when we fetched it. */
  asOf: string;
};

/**
 * Fetch a domestic index level by KIS index code.
 * KOSPI 종합 = "0001", KOSDAQ 종합 = "1001".
 */
export async function fetchIndexQuote(
  iscd: string,
): Promise<IndexQuote | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const url = new URL(
      `${baseUrl}/uapi/domestic-stock/v1/quotations/inquire-index-price`,
    );
    url.searchParams.set("FID_COND_MRKT_DIV_CODE", "U");
    url.searchParams.set("FID_INPUT_ISCD", iscd);

    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        appkey: env.kisAppKey as string,
        appsecret: env.kisAppSecret as string,
        tr_id: "FHPUP02100000",
        custtype: "P",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      await captureError(new Error(`KIS index HTTP ${res.status}`), {
        where: "kis.fetchIndexQuote",
        iscd,
      });
      return null;
    }
    const json = (await res.json()) as {
      rt_cd?: string;
      msg1?: string;
      output?: { bstp_nmix_prpr?: string; bstp_nmix_prdy_ctrt?: string };
    };
    if (json.rt_cd !== "0" || !json.output?.bstp_nmix_prpr) {
      await captureError(new Error(`KIS index rt_cd=${json.rt_cd}`), {
        where: "kis.fetchIndexQuote",
        iscd,
        msg: json.msg1,
      });
      return null;
    }
    const value = Number(json.output.bstp_nmix_prpr);
    const changePct = Number(json.output.bstp_nmix_prdy_ctrt ?? "0");
    if (!Number.isFinite(value)) return null;
    return {
      value,
      changePct: Number.isFinite(changePct) ? changePct : 0,
      asOf: new Date().toISOString(),
    };
  } catch (err) {
    await captureError(err, { where: "kis.fetchIndexQuote", iscd });
    return null;
  }
}

/** Convenience: live KOSPI composite index. */
export function fetchKospi(): Promise<IndexQuote | null> {
  return fetchIndexQuote("0001");
}

/**
 * Fetch an overseas index / FX quote via the daily-chart endpoint.
 * `prdy_ctrt` (전일대비율) is already signed, same as the domestic call.
 *
 *   divCode "N" = overseas index (SOX, COMP, SPX, .DJI …)
 *   divCode "X" = FX (FX@KRW = USD/KRW)
 */
export async function fetchOverseasQuote(
  divCode: "N" | "X" | "S" | "I",
  iscd: string,
): Promise<IndexQuote | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    // Query a lookback window so the most recent candle is always present even
    // on weekends/holidays (output2 is ordered most-recent first).
    const ymd = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(d)
        .replace(/-/g, "");
    const now = new Date();
    const from = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const url = new URL(
      `${baseUrl}/uapi/overseas-price/v1/quotations/inquire-daily-chartprice`,
    );
    url.searchParams.set("FID_COND_MRKT_DIV_CODE", divCode);
    url.searchParams.set("FID_INPUT_ISCD", iscd);
    url.searchParams.set("FID_INPUT_DATE_1", ymd(from));
    url.searchParams.set("FID_INPUT_DATE_2", ymd(now));
    url.searchParams.set("FID_PERIOD_DIV_CODE", "D");

    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        appkey: env.kisAppKey as string,
        appsecret: env.kisAppSecret as string,
        tr_id: "FHKST03030100",
        custtype: "P",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      await captureError(new Error(`KIS overseas HTTP ${res.status}`), {
        where: "kis.fetchOverseasQuote",
        divCode,
        iscd,
      });
      return null;
    }
    const json = (await res.json()) as {
      rt_cd?: string;
      msg1?: string;
      output1?: { prdy_ctrt?: string };
      output2?: Array<{ ovrs_nmix_prpr?: string }>;
    };
    const latest = json.output2?.[0]?.ovrs_nmix_prpr;
    if (json.rt_cd !== "0" || !latest) {
      await captureError(new Error(`KIS overseas rt_cd=${json.rt_cd}`), {
        where: "kis.fetchOverseasQuote",
        divCode,
        iscd,
        msg: json.msg1,
      });
      return null;
    }
    const value = Number(latest);
    if (!Number.isFinite(value)) return null;
    const changePct = Number(json.output1?.prdy_ctrt ?? "0");
    return {
      value,
      changePct: Number.isFinite(changePct) ? changePct : 0,
      asOf: new Date().toISOString(),
    };
  } catch (err) {
    await captureError(err, { where: "kis.fetchOverseasQuote", divCode, iscd });
    return null;
  }
}

/**
 * Fetch an overseas single-stock quote (current price).
 *   excd = exchange code: NAS (NASDAQ), NYS (NYSE), AMS (AMEX)
 *   symb = ticker symbol, e.g. "NVDA"
 * `rate` (등락율) is already signed.
 */
export async function fetchOverseasStock(
  excd: string,
  symb: string,
): Promise<IndexQuote | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const url = new URL(
      `${baseUrl}/uapi/overseas-price/v1/quotations/price`,
    );
    url.searchParams.set("AUTH", "");
    url.searchParams.set("EXCD", excd);
    url.searchParams.set("SYMB", symb);

    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        appkey: env.kisAppKey as string,
        appsecret: env.kisAppSecret as string,
        tr_id: "HHDFS00000300",
        custtype: "P",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      await captureError(new Error(`KIS overseas stock HTTP ${res.status}`), {
        where: "kis.fetchOverseasStock",
        excd,
        symb,
      });
      return null;
    }
    const json = (await res.json()) as {
      rt_cd?: string;
      msg1?: string;
      output?: { last?: string; rate?: string };
    };
    const last = json.output?.last;
    if (json.rt_cd !== "0" || !last) {
      await captureError(new Error(`KIS overseas stock rt_cd=${json.rt_cd}`), {
        where: "kis.fetchOverseasStock",
        excd,
        symb,
        msg: json.msg1,
      });
      return null;
    }
    const value = Number(last);
    if (!Number.isFinite(value)) return null;
    const changePct = Number(json.output?.rate ?? "0");
    return {
      value,
      changePct: Number.isFinite(changePct) ? changePct : 0,
      asOf: new Date().toISOString(),
    };
  } catch (err) {
    await captureError(err, { where: "kis.fetchOverseasStock", excd, symb });
    return null;
  }
}

export type CompanyQuote = {
  /** Last price in KRW. */
  price: number;
  change1d: number;
  change5d: number;
  change20d: number;
  /** Recent daily closes, oldest → newest, for a sparkline. */
  spark: number[];
  asOf: string;
};

/**
 * Fetch a domestic stock's daily candles and derive price + 1/5/20-day
 * momentum + a real sparkline. One call covers everything the heat matrix
 * needs (FID_COND_MRKT_DIV_CODE=J, adjusted close).
 */
export async function fetchDomesticDaily(
  ticker: string,
): Promise<CompanyQuote | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const ymd = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(d)
        .replace(/-/g, "");
    const now = new Date();
    const from = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000);
    const url = new URL(
      `${baseUrl}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`,
    );
    url.searchParams.set("FID_COND_MRKT_DIV_CODE", "J");
    url.searchParams.set("FID_INPUT_ISCD", ticker);
    url.searchParams.set("FID_INPUT_DATE_1", ymd(from));
    url.searchParams.set("FID_INPUT_DATE_2", ymd(now));
    url.searchParams.set("FID_PERIOD_DIV_CODE", "D");
    url.searchParams.set("FID_ORG_ADJ_PRC", "1");

    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        appkey: env.kisAppKey as string,
        appsecret: env.kisAppSecret as string,
        tr_id: "FHKST03010100",
        custtype: "P",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      await captureError(new Error(`KIS daily HTTP ${res.status}`), {
        where: "kis.fetchDomesticDaily",
        ticker,
      });
      return null;
    }
    const json = (await res.json()) as {
      rt_cd?: string;
      msg1?: string;
      output1?: { stck_prpr?: string; prdy_ctrt?: string };
      output2?: Array<{ stck_clpr?: string }>;
    };
    const candles = (json.output2 ?? [])
      .map((c) => Number(c.stck_clpr))
      .filter((n) => Number.isFinite(n) && n > 0); // most-recent first
    if (json.rt_cd !== "0" || candles.length === 0) {
      await captureError(new Error(`KIS daily rt_cd=${json.rt_cd}`), {
        where: "kis.fetchDomesticDaily",
        ticker,
        msg: json.msg1,
      });
      return null;
    }
    const c0 = candles[0];
    const at = (n: number) => candles[Math.min(n, candles.length - 1)];
    const momentum = (n: number) => {
      const base = at(n);
      return base ? ((c0 - base) / base) * 100 : 0;
    };
    const price = Number(json.output1?.stck_prpr) || c0;
    const ctrt = Number(json.output1?.prdy_ctrt);
    return {
      price,
      change1d: Number.isFinite(ctrt) ? ctrt : momentum(1),
      change5d: momentum(5),
      change20d: momentum(20),
      spark: candles.slice(0, 24).reverse(),
      asOf: new Date().toISOString(),
    };
  } catch (err) {
    await captureError(err, { where: "kis.fetchDomesticDaily", ticker });
    return null;
  }
}

export type StockTick = {
  /** Real-time price in KRW. */
  price: number;
  /** Real-time day change vs previous close, in percent (signed). */
  change1d: number;
  asOf: string;
};

/**
 * Real-time quote for a domestic stock (장중 실시간 시세). Lighter and more
 * "tick"-accurate than the daily-chart endpoint — use this for fast price
 * updates, and `fetchDomesticDaily` for 5/20-day history + sparkline.
 */
export async function fetchDomesticPrice(
  ticker: string,
): Promise<StockTick | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const url = new URL(
      `${baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price`,
    );
    url.searchParams.set("FID_COND_MRKT_DIV_CODE", "J");
    url.searchParams.set("FID_INPUT_ISCD", ticker);

    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        appkey: env.kisAppKey as string,
        appsecret: env.kisAppSecret as string,
        tr_id: "FHKST01010100",
        custtype: "P",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      await captureError(new Error(`KIS price HTTP ${res.status}`), {
        where: "kis.fetchDomesticPrice",
        ticker,
      });
      return null;
    }
    const json = (await res.json()) as {
      rt_cd?: string;
      msg1?: string;
      output?: { stck_prpr?: string; prdy_ctrt?: string };
    };
    const last = json.output?.stck_prpr;
    if (json.rt_cd !== "0" || !last) {
      await captureError(new Error(`KIS price rt_cd=${json.rt_cd}`), {
        where: "kis.fetchDomesticPrice",
        ticker,
        msg: json.msg1,
      });
      return null;
    }
    const price = Number(last);
    if (!Number.isFinite(price)) return null;
    const change1d = Number(json.output?.prdy_ctrt ?? "0");
    return {
      price,
      change1d: Number.isFinite(change1d) ? change1d : 0,
      asOf: new Date().toISOString(),
    };
  } catch (err) {
    await captureError(err, { where: "kis.fetchDomesticPrice", ticker });
    return null;
  }
}

/** Convenience: PHLX Semiconductor Index (SOX). */
export function fetchSox(): Promise<IndexQuote | null> {
  return fetchOverseasQuote("N", "SOX");
}

/** Convenience: USD/KRW spot (원/달러). */
export function fetchUsdKrw(): Promise<IndexQuote | null> {
  return fetchOverseasQuote("X", "FX@KRW");
}
