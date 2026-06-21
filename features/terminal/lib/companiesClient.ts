"use client";

import { useSyncExternalStore } from "react";
import { companies } from "../data/mockCompanies";

/**
 * Single shared client poller for /api/companies (Korean company quotes).
 * Mirrors marketClient: one fetch loop regardless of subscriber count, so the
 * heat matrix / watchlist / inspector can all read live data without
 * double-polling KIS.
 */

export type CompanyField = {
  price: number;
  change1d: number;
  change5d: number;
  change20d: number;
  spark: number[];
  live: boolean;
};
export type CompanyData = {
  companies: Record<string, CompanyField>;
  asOf: string | null;
};

const POLL_MS = 3 * 60_000;

function seed(): CompanyData {
  const out: Record<string, CompanyField> = {};
  for (const c of companies) {
    out[c.ticker] = {
      price: c.price,
      change1d: c.change1d,
      change5d: c.change5d,
      change20d: c.change20d,
      spark: c.spark,
      live: false,
    };
  }
  return { companies: out, asOf: null };
}

let snapshot: CompanyData = seed();
const listeners = new Set<() => void>();
let started = false;
let timer: ReturnType<typeof setInterval> | null = null;

function emit() {
  for (const l of listeners) l();
}

async function load() {
  try {
    const res = await fetch("/api/companies", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as Partial<CompanyData>;
    if (!data.companies) return;
    snapshot = {
      companies: data.companies,
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

export function useCompanyData(): CompanyData {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}
