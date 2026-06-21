import "@/lib/assertServer";
import { readAll, mutate } from "@/features/reports/persistence/fileStore";
import { memoryQuotes as baseQuotes } from "./mockTerminalData";
import type { MemoryQuote } from "../types";

/**
 * Admin-maintained memory price board. DRAM/NAND/HBM contract & spot prices
 * have no free real-time feed, so an operator updates them by hand (cadence is
 * weekly/monthly anyway). We persist only the editable numbers per item id and
 * merge them onto the static mock definitions (item name, category, unit,
 * sparkline), so structure stays fixed while prices come from the admin.
 *
 * Storage is the Phase-0 file store ("memory-prices" collection). Falls back to
 * pure mock when no override has been saved yet.
 */

const COLLECTION = "memory-prices";

/** The operator-editable subset of a quote, keyed by the quote id. */
export type MemoryPriceOverride = {
  id: string;
  current: number;
  changePct: number;
  sessionLow: number;
  sessionHigh: number;
  lastUpdated: string; // ISO
};

export type MemoryBoard = {
  quotes: MemoryQuote[];
  /** "admin" once any override is saved; otherwise the static mock. */
  source: "admin" | "mock";
  /** ISO of the most recent override (or the mock anchor when none). */
  asOf: string;
};

/** Valid quote ids — guards admin input against unknown rows. */
const VALID_IDS = new Set(baseQuotes.map((q) => q.id));

/** Read the merged board for display (server components / API route). */
export async function getMemoryBoard(): Promise<MemoryBoard> {
  const overrides = await readAll<MemoryPriceOverride>(COLLECTION);
  const byId = new Map(overrides.map((o) => [o.id, o]));

  const quotes = baseQuotes.map((q) => {
    const o = byId.get(q.id);
    return o
      ? {
          ...q,
          current: o.current,
          changePct: o.changePct,
          sessionLow: o.sessionLow,
          sessionHigh: o.sessionHigh,
          lastUpdated: o.lastUpdated,
        }
      : q;
  });

  const source: MemoryBoard["source"] = overrides.length > 0 ? "admin" : "mock";
  const asOf =
    overrides.reduce<string>(
      (max, o) => (o.lastUpdated > max ? o.lastUpdated : max),
      "",
    ) ||
    baseQuotes.reduce<string>(
      (max, q) => (q.lastUpdated > max ? q.lastUpdated : max),
      baseQuotes[0]?.lastUpdated ?? "",
    );

  return { quotes, source, asOf };
}

/** The current editable values (merged) for the admin form. */
export async function listEditable(): Promise<MemoryPriceOverride[]> {
  const { quotes } = await getMemoryBoard();
  return quotes.map((q) => ({
    id: q.id,
    current: q.current,
    changePct: q.changePct,
    sessionLow: q.sessionLow,
    sessionHigh: q.sessionHigh,
    lastUpdated: q.lastUpdated,
  }));
}

export type SaveMemoryPriceInput = {
  id: string;
  current: number;
  changePct: number;
  sessionLow?: number;
  sessionHigh?: number;
};

/** Upsert one item's prices. Returns the saved override, or null if id invalid. */
export async function saveMemoryQuote(
  input: SaveMemoryPriceInput,
): Promise<MemoryPriceOverride | null> {
  if (!VALID_IDS.has(input.id)) return null;
  if (!Number.isFinite(input.current) || !Number.isFinite(input.changePct)) {
    return null;
  }
  const low = Number.isFinite(input.sessionLow as number)
    ? (input.sessionLow as number)
    : input.current;
  const high = Number.isFinite(input.sessionHigh as number)
    ? (input.sessionHigh as number)
    : input.current;

  const record: MemoryPriceOverride = {
    id: input.id,
    current: input.current,
    changePct: input.changePct,
    sessionLow: Math.min(low, high),
    sessionHigh: Math.max(low, high),
    lastUpdated: new Date().toISOString(),
  };

  return mutate<MemoryPriceOverride, MemoryPriceOverride>(COLLECTION, (rows) => {
    const next = rows.filter((r) => r.id !== record.id);
    next.push(record);
    return { rows: next, result: record };
  });
}
