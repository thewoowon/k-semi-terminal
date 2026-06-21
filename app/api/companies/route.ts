import { companies } from "@/features/terminal/data/mockCompanies";
import { fetchDomesticDaily } from "@/features/terminal/lib/kis";
import { features } from "@/lib/env";

/**
 * Live quotes for the Korean company universe (heat matrix, watchlist).
 * Price + 1/5/20-day momentum + sparkline come from KIS domestic daily candles;
 * signalScore and marketCap stay model/mock. Falls back to mock per ticker.
 */
export const dynamic = "force-dynamic";

type Field = {
  price: number;
  change1d: number;
  change5d: number;
  change20d: number;
  spark: number[];
  live: boolean;
};

export async function GET() {
  const tickers = companies.map((c) => c.ticker);
  const quotes = features.marketData
    ? await Promise.all(tickers.map((t) => fetchDomesticDaily(t)))
    : tickers.map(() => null);

  const out: Record<string, Field> = {};
  companies.forEach((c, i) => {
    const q = quotes[i];
    out[c.ticker] = q
      ? {
          price: q.price,
          change1d: q.change1d,
          change5d: q.change5d,
          change20d: q.change20d,
          spark: q.spark,
          live: true,
        }
      : {
          price: c.price,
          change1d: c.change1d,
          change5d: c.change5d,
          change20d: c.change20d,
          spark: c.spark,
          live: false,
        };
  });

  return Response.json(
    { companies: out, asOf: new Date().toISOString() },
    {
      headers: {
        // Daily momentum moves slowly intraday — cache a few minutes.
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=600",
      },
    },
  );
}
