import type { SignalDirection } from "../types";

/** Signed percentage, e.g. +4.7% / -1.2%. */
export function pct(value: number, digits = 1): string {
  const s = value >= 0 ? "+" : "";
  return `${s}${value.toFixed(digits)}%`;
}

/** Signed plain number, e.g. +8.4 / -3.1. */
export function signed(value: number, digits = 1): string {
  const s = value >= 0 ? "+" : "";
  return `${s}${value.toFixed(digits)}`;
}

/** KRW price with thousands separators. */
export function krw(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** USD with sensible precision for memory prices (e.g. $1.85, $4.10). */
export function usd(value: number, digits = 2): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/** Market cap in KRW trillions: 480.2T. */
export function trillion(value: number): string {
  return `${value.toFixed(value >= 100 ? 0 : 1)}T`;
}

export function arrow(direction: SignalDirection): string {
  if (direction === "positive") return "▲";
  if (direction === "negative") return "▼";
  return "→";
}

export function arrowForDelta(delta: number): string {
  if (delta > 0.05) return "▲";
  if (delta < -0.05) return "▼";
  return "→";
}

export function directionForDelta(delta: number): SignalDirection {
  if (delta > 0.05) return "positive";
  if (delta < -0.05) return "negative";
  return "neutral";
}

/** Compact relative time from an ISO string against a fixed "now". */
export function relTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  return `${day}d`;
}

/** HH:MM from an ISO string (KST display, source data already in KST). */
export function clock(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes(),
  ).padStart(2, "0")}`;
}
