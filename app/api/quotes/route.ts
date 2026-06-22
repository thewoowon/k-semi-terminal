import { companies } from "@/features/terminal/data/mockCompanies";
import { fetchDomesticPrice } from "@/features/terminal/lib/kis";
import { features } from "@/lib/env";

/**
 * Real-time intraday quotes for the Korean universe (price + day change).
 * Lighter + faster than /api/companies (which carries 5/20-day history +
 * sparkline). Clients poll this quickly during market hours.
 */
export const dynamic = "force-dynamic";

type Tick = { price: number; change1d: number; live: boolean };

export async function GET() {
  const tickers = companies.map((c) => c.ticker);
  const ticks = features.marketData
    ? await Promise.all(tickers.map((t) => fetchDomesticPrice(t)))
    : tickers.map(() => null);

  const out: Record<string, Tick> = {};
  companies.forEach((c, i) => {
    const q = ticks[i];
    out[c.ticker] = q
      ? { price: q.price, change1d: q.change1d, live: true }
      : { price: c.price, change1d: c.change1d, live: false };
  });

  return Response.json(
    { quotes: out, asOf: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
      },
    },
  );
}
