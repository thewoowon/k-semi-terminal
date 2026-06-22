"use client";

import { useSyncExternalStore } from "react";
import { companies } from "../data/mockCompanies";
import { krxSession } from "./marketSession";

/**
 * Shared real-time quote poller for /api/quotes (Korean stock price + day
 * change). Single loop for all subscribers. Polls fast while KRX is open and
 * slowly otherwise, so we don't burn KIS calls overnight/weekends.
 */

export type Tick = { price: number; change1d: number; live: boolean };
export type Quotes = { quotes: Record<string, Tick>; asOf: string | null };

const FAST_MS = 20_000; // intraday tick cadence
const SLOW_MS = 5 * 60_000; // market closed

function seed(): Quotes {
  const quotes: Record<string, Tick> = {};
  for (const c of companies) {
    quotes[c.ticker] = { price: c.price, change1d: c.change1d, live: false };
  }
  return { quotes, asOf: null };
}

let snapshot: Quotes = seed();
const listeners = new Set<() => void>();
let started = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  for (const l of listeners) l();
}

async function load() {
  try {
    const res = await fetch("/api/quotes", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as Partial<Quotes>;
      if (data.quotes) {
        snapshot = { quotes: data.quotes, asOf: data.asOf ?? snapshot.asOf };
        emit();
      }
    }
  } catch {
    /* keep last-known */
  }
}

/** Self-scheduling loop whose interval tracks the KRX session. */
function schedule() {
  const delay = krxSession() === "OPEN" ? FAST_MS : SLOW_MS;
  timer = setTimeout(async () => {
    await load();
    if (started) schedule();
  }, delay);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!started) {
    started = true;
    load();
    schedule();
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearTimeout(timer);
      timer = null;
      started = false;
    }
  };
}

export function useLiveQuotes(): Quotes {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}
