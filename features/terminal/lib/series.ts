/**
 * Deterministic mock series generator. A seeded PRNG keeps sparklines organic
 * yet fully reproducible, so mock data stays stable across renders/builds and
 * remains type-checkable (Engineering AC, spec §20).
 */

/** Mulberry32 — tiny deterministic PRNG. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string seed into a 32-bit int. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type SeriesOpts = {
  /** number of points */
  len?: number;
  /** start value */
  start?: number;
  /** net drift across the whole series, as a fraction of start (e.g. 0.18) */
  trend?: number;
  /** per-step noise amplitude as a fraction of start */
  volatility?: number;
};

/**
 * Generate a smooth-ish trending series. Same seed → identical output.
 */
export function genSeries(seed: string | number, opts: SeriesOpts = {}): number[] {
  const { len = 24, start = 100, trend = 0.1, volatility = 0.05 } = opts;
  const rand = prng(typeof seed === "string" ? hashSeed(seed) : seed);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < len; i++) {
    const drift = (trend * start) / len;
    const noise = (rand() - 0.5) * 2 * volatility * start;
    // light momentum so the curve isn't pure white noise
    v = v + drift + noise * 0.6;
    out.push(Math.max(0.01, Number(v.toFixed(2))));
  }
  return out;
}
