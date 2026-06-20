import { terminalSnapshot } from "@/features/terminal/data/mockTerminalData";

/**
 * Data-hook layer (spec §15 Phase 5). Returns the normalized terminal snapshot.
 * v0.1 serves mock data; this is the seam where real ingestion (DART, KRX,
 * TrendForce, WSTS, export CSV) will plug in. Static today, so cache it.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    snapshot: terminalSnapshot,
    meta: {
      version: "0.1.0",
      source: "mock",
      generatedAt: terminalSnapshot.marketStatus.asOf,
    },
  });
}
