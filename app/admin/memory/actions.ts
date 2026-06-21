"use server";

import {
  listEditable,
  saveMemoryQuote,
  type MemoryPriceOverride,
  type SaveMemoryPriceInput,
} from "@/features/terminal/data/memoryPriceStore";
import { memoryQuotes } from "@/features/terminal/data/mockTerminalData";
import { captureError } from "@/lib/observability";

/*
 * Admin memory-price workflow as Server Actions. Like the report studio, Phase 0
 * runs without auth — the page is noindex and unlinked.
 */

export type MemoryRow = MemoryPriceOverride & {
  item: string;
  category: string;
  market: string;
  unit: string;
};

/** Static labels so the form can render item names/units without the mock import. */
const META = new Map(
  memoryQuotes.map((q) => [
    q.id,
    { item: q.item, category: q.category, market: q.market, unit: q.unit },
  ]),
);

export async function actionListMemory(): Promise<MemoryRow[]> {
  const rows = await listEditable();
  return rows.map((r) => {
    const m = META.get(r.id);
    return {
      ...r,
      item: m?.item ?? r.id,
      category: m?.category ?? "—",
      market: m?.market ?? "—",
      unit: m?.unit ?? "",
    };
  });
}

export async function actionSaveMemory(input: SaveMemoryPriceInput) {
  try {
    const saved = await saveMemoryQuote(input);
    if (!saved) return { ok: false as const, error: "Invalid item or values." };
    return { ok: true as const, lastUpdated: saved.lastUpdated };
  } catch (e) {
    await captureError(e, { action: "save-memory", id: input.id });
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}
