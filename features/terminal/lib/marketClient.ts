"use client";

import { useSyncExternalStore } from "react";
import { terminalSnapshot, bellwethers } from "../data/mockTerminalData";

/**
 * Single shared client poller for /api/market. Every component that needs live
 * market data subscribes through `useMarketData()`; there is exactly one fetch
 * loop regardless of how many subscribers mount, so we never double-poll KIS.
 */

export type MarketField = { value: number; changePct: number; live: boolean };
export type MarketData = {
  kospi: MarketField;
  usdkrw: MarketField;
  bellwethers: Record<string, MarketField>;
  asOf: string | null;
};

const POLL_MS = 30_000;

/** Seed from mock so SSR and first client paint agree (no hydration jump). */
function seed(): MarketData {
  const ms = terminalSnapshot.marketStatus;
  const bw: Record<string, MarketField> = {};
  for (const b of bellwethers) {
    bw[b.ticker] = { value: b.price, changePct: b.change1d, live: false };
  }
  return {
    kospi: { value: ms.kospi, changePct: ms.kospiChange, live: false },
    usdkrw: { value: ms.usdkrw, changePct: 0, live: false },
    bellwethers: bw,
    asOf: null,
  };
}

let snapshot: MarketData = seed();
const listeners = new Set<() => void>();
let started = false;
let timer: ReturnType<typeof setInterval> | null = null;

function emit() {
  for (const l of listeners) l();
}

async function load() {
  try {
    const res = await fetch("/api/market", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as Partial<MarketData>;
    snapshot = {
      kospi: data.kospi ?? snapshot.kospi,
      usdkrw: data.usdkrw ?? snapshot.usdkrw,
      bellwethers: data.bellwethers ?? snapshot.bellwethers,
      asOf: data.asOf ?? snapshot.asOf,
    };
    emit();
  } catch {
    /* keep last-known snapshot */
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!started) {
    started = true;
    load();
    timer = setInterval(load, POLL_MS);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
      started = false;
    }
  };
}

export function useMarketData(): MarketData {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}
