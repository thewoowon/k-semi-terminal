import { getMemoryBoard } from "@/features/terminal/data/memoryPriceStore";

/**
 * Memory price board — admin-maintained values merged onto the static
 * definitions. Returns `source: "admin" | "mock"` so the UI can label whether
 * an operator has set real prices yet.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const board = await getMemoryBoard();
  return Response.json(board, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
