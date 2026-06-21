import { terminalSnapshot, bellwethers } from "@/features/terminal/data/mockTerminalData";
import { krxSession } from "@/features/terminal/lib/marketSession";
import {
  fetchKospi,
  fetchUsdKrw,
  fetchSox,
  fetchOverseasStock,
  type IndexQuote,
} from "@/features/terminal/lib/kis";
import { features } from "@/lib/env";

/**
 * Live market-status endpoint. The KRX session is computed from KST wall-clock
 * (no feed needed); KOSPI / USD-KRW and the overseas bellwethers (incl. SOX)
 * come from the KIS OpenAPI when configured, otherwise we serve the mock value
 * and flag each field's source so the UI can label non-live values.
 */
export const dynamic = "force-dynamic";

type Field = { value: number; changePct: number; live: boolean };

function field(quote: IndexQuote | null, mockValue: number, mockChange: number): Field {
  return quote
    ? { value: quote.value, changePct: quote.changePct, live: true }
    : { value: mockValue, changePct: mockChange, live: false };
}

/** Bellwether ticker → KIS overseas listing. SOX is an index, fetched apart. */
const OVERSEAS: Record<string, { excd: string; symb: string }> = {
  NVDA: { excd: "NAS", symb: "NVDA" },
  TSM: { excd: "NYS", symb: "TSM" },
  MU: { excd: "NAS", symb: "MU" },
  ASML: { excd: "NAS", symb: "ASML" },
  AMD: { excd: "NAS", symb: "AMD" },
  AVGO: { excd: "NAS", symb: "AVGO" },
  ARM: { excd: "NAS", symb: "ARM" },
};

export async function GET() {
  const krx = krxSession();
  const mock = terminalSnapshot.marketStatus;
  const mockByTicker = new Map(bellwethers.map((b) => [b.ticker, b]));

  // Fetch everything in parallel under the shared (cached) access token.
  const tickers = Object.keys(OVERSEAS);
  const [kospi, usdkrw, sox, ...stocks] = features.marketData
    ? await Promise.all([
        fetchKospi(),
        fetchUsdKrw(),
        fetchSox(),
        ...tickers.map((t) => fetchOverseasStock(OVERSEAS[t].excd, OVERSEAS[t].symb)),
      ])
    : [null, null, null, ...tickers.map(() => null)];

  const bw: Record<string, Field> = {};
  tickers.forEach((t, i) => {
    const m = mockByTicker.get(t);
    bw[t] = field(stocks[i], m?.price ?? 0, m?.change1d ?? 0);
  });
  const mockSox = mockByTicker.get("SOX");
  bw.SOX = field(sox, mockSox?.price ?? 0, mockSox?.change1d ?? 0);

  const body = {
    krx,
    asOf: new Date().toISOString(),
    kospi: field(kospi, mock.kospi, mock.kospiChange),
    usdkrw: field(usdkrw, mock.usdkrw, 0),
    bellwethers: bw,
  };

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
    },
  });
}
