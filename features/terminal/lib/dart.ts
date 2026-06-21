import "@/lib/assertServer";
import { env, features } from "@/lib/env";
import { captureError } from "@/lib/observability";
import { companies } from "../data/mockCompanies";
import type { SemiEvent } from "../types";

/**
 * DART 전자공시 (opendart.fss.or.kr) client — server-only.
 *
 * Queries each company in our Korean semiconductor universe by its DART
 * corp_code and maps recent filings into SemiEvents linked to the chain node.
 * Fails soft to null so the event feed falls back to mock. DART only covers
 * 공시 (disclosures); news/earnings/export prints come from other sources and
 * stay mock for now.
 *
 * corp_code values are stable DART identifiers (resolved once from corpCode.xml
 * for our 12 tickers); refresh them if the universe changes.
 */

const BASE = "https://opendart.fss.or.kr/api/list.json";
const LOOKBACK_DAYS = 30;
const PER_CORP = 8; // most-recent filings to keep per company
const MAX_EVENTS = 24;

/** ticker → DART corp_code (resolved from corpCode.xml). */
const CORP_CODE: Record<string, string> = {
  "000660": "00164779", // SK Hynix
  "005930": "00126380", // Samsung Electronics
  "042700": "00161383", // Hanmi Semiconductor
  "403870": "01288827", // HPSP
  "240810": "01135941", // Wonik IPS
  "095340": "00572905", // ISC
  "058470": "00369657", // Leeno Industrial
  "036830": "00247975", // Soulbrain
  "000990": "00160843", // DB HiTek
  "108860": "00666064", // Cellid
  "357780": "01489648", // Solbrain Holdings
  "049070": "00226866", // Intops
};

const byTicker = new Map(companies.map((c) => [c.ticker, c]));

type DartItem = {
  corp_name: string;
  stock_code: string;
  report_nm: string;
  rcept_no: string;
  rcept_dt: string; // YYYYMMDD
  flr_nm?: string;
};

/** Crude impact/sentiment heuristics from the Korean report title. */
function scoreDisclosure(reportNm: string): {
  impactScore: number;
  sentiment: SemiEvent["sentiment"];
} {
  const t = reportNm;
  // High-impact, directional filings.
  if (/공급계약|단일판매|수주/.test(t)) return { impactScore: 80, sentiment: "positive" };
  if (/잠정실적|영업\(잠정\)|실적/.test(t)) return { impactScore: 72, sentiment: "neutral" };
  if (/유상증자|전환사채|신주인수권|소송|횡령|배임/.test(t))
    return { impactScore: 70, sentiment: "negative" };
  if (/자기주식|자사주/.test(t)) return { impactScore: 60, sentiment: "positive" };
  if (/배당/.test(t)) return { impactScore: 55, sentiment: "positive" };
  return { impactScore: 50, sentiment: "neutral" };
}

function ymd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(d)
    .replace(/-/g, "");
}

function toEvent(item: DartItem, ticker: string): SemiEvent | null {
  const company = byTicker.get(ticker);
  if (!company) return null;
  const { impactScore, sentiment } = scoreDisclosure(item.report_nm);
  const d = item.rcept_dt;
  const occurredAt =
    d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T00:00:00+09:00` : new Date().toISOString();
  const segNode = `seg-${company.segment}`;
  return {
    id: `dart-${item.rcept_no}`,
    type: "disclosure",
    title: `${company.name} — ${item.report_nm.trim()}`,
    summary: `${item.corp_name} 공시 (제출인: ${item.flr_nm ?? item.corp_name}).`,
    occurredAt,
    sourceName: "DART",
    relatedNodeIds: [company.chainNodeId, segNode],
    sentiment,
    impactScore,
  };
}

/** Fetch recent filings for one company by corp_code. */
async function fetchForCompany(
  ticker: string,
  corpCode: string,
  bgn: string,
  end: string,
): Promise<SemiEvent[]> {
  const url = new URL(BASE);
  url.searchParams.set("crtfc_key", env.dartApiKey as string);
  url.searchParams.set("corp_code", corpCode);
  url.searchParams.set("bgn_de", bgn);
  url.searchParams.set("end_de", end);
  url.searchParams.set("page_no", "1");
  url.searchParams.set("page_count", String(PER_CORP));

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    await captureError(new Error(`DART HTTP ${res.status}`), {
      where: "dart.fetchForCompany",
      ticker,
    });
    return [];
  }
  const json = (await res.json()) as {
    status?: string;
    message?: string;
    list?: DartItem[];
  };
  if (json.status === "013") return []; // no data in range — not an error
  if (json.status !== "000") {
    await captureError(new Error(`DART status ${json.status}`), {
      where: "dart.fetchForCompany",
      ticker,
      msg: json.message,
    });
    return [];
  }
  return (json.list ?? [])
    .map((item) => toEvent(item, ticker))
    .filter((e): e is SemiEvent => e !== null);
}

/** Fetch recent disclosures for our universe. Returns null when unavailable. */
export async function fetchDartDisclosures(): Promise<SemiEvent[] | null> {
  if (!features.dart) return null;
  const now = new Date();
  const bgn = ymd(new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000));
  const end = ymd(now);

  try {
    const perCompany = await Promise.all(
      Object.entries(CORP_CODE).map(([ticker, corp]) =>
        fetchForCompany(ticker, corp, bgn, end),
      ),
    );
    const collected = perCompany.flat();
    if (collected.length === 0) return null; // nothing live → fall back to mock

    const seen = new Set<string>();
    const unique = collected.filter((e) => (seen.has(e.id) ? false : seen.add(e.id)));
    unique.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return unique.slice(0, MAX_EVENTS);
  } catch (err) {
    await captureError(err, { where: "dart.fetchDartDisclosures" });
    return null;
  }
}
