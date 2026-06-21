/**
 * Live Semi Cycle Score (spec §11.1) — recomputes the gauge from real data
 * where a feed exists, and keeps the rest as the documented model/mock inputs.
 *
 * Live components (KIS): "Bellwether Mom." (overseas bellwether 1-day change)
 * and "Korea Basket Breadth" (share of Korean names with positive 20-day
 * momentum). Global semi sales, memory price, Korea export, and event sentiment
 * have no live feed yet and stay at their model values — each component carries
 * a `live` flag so the UI can show what is real.
 *
 * Pure + no React/data imports so it stays testable and client-safe.
 */
import { semiCycleScore, regimeFor, regimeHeadline, clamp, round1, type CycleInputs } from "./score";
import type { CycleRegime } from "../types";

/** Map a percentage change to a 0–100 momentum score (50 = flat). */
export function momentumScore(changePct: number, scale = 4): number {
  return round1(clamp(50 + changePct * scale));
}

export type CycleComponent = {
  label: string;
  value: number;
  weight: number;
  delta: number;
  live: boolean;
};

export type LiveCycle = {
  score: number;
  regime: CycleRegime;
  headline: string;
  components: CycleComponent[];
  /** true when at least one component was computed from live data. */
  live: boolean;
};

/** Match the mock component labels so we override the right rows. */
const BELLWETHER_LABEL = "Bellwether Mom.";
const BREADTH_LABEL = "Korea Basket Breadth";

const LABEL_TO_INPUT: Record<string, keyof CycleInputs> = {
  "Global Semi Sales Mom.": "globalSalesMomentum",
  "Memory Price Mom.": "memoryPriceMomentum",
  "Korea Export Mom.": "koreaExportMomentum",
  [BELLWETHER_LABEL]: "bellwetherMomentum",
  [BREADTH_LABEL]: "koreaBasketBreadth",
  "Event Sentiment": "eventSentiment",
};

export type LiveCycleInputs = {
  /** 1-day change (%) of each overseas bellwether, when live. */
  bellwetherChanges: number[] | null;
  /** 20-day change (%) of each Korean company, when live. */
  companyMomentum20d: number[] | null;
};

/**
 * Recompute the cycle from the base (mock) components, overriding the
 * live-derivable ones. Returns the blended score, regime, and tagged components.
 */
export function computeLiveCycle(
  base: { label: string; value: number; weight: number; delta: number }[],
  live: LiveCycleInputs,
): LiveCycle {
  const bellLive = live.bellwetherChanges && live.bellwetherChanges.length > 0;
  const breadthLive =
    live.companyMomentum20d && live.companyMomentum20d.length > 0;

  const bellValue = bellLive
    ? momentumScore(
        live.bellwetherChanges!.reduce((a, b) => a + b, 0) /
          live.bellwetherChanges!.length,
      )
    : null;
  const breadthValue = breadthLive
    ? round1(
        (live.companyMomentum20d!.filter((m) => m > 0).length /
          live.companyMomentum20d!.length) *
          100,
      )
    : null;

  const components: CycleComponent[] = base.map((c) => {
    if (c.label === BELLWETHER_LABEL && bellValue != null) {
      return { ...c, value: bellValue, delta: round1(bellValue - c.value), live: true };
    }
    if (c.label === BREADTH_LABEL && breadthValue != null) {
      return { ...c, value: breadthValue, delta: round1(breadthValue - c.value), live: true };
    }
    return { ...c, live: false };
  });

  const inputs = { ...EMPTY_INPUTS };
  for (const c of components) {
    const key = LABEL_TO_INPUT[c.label];
    if (key) inputs[key] = c.value;
  }

  const score = semiCycleScore(inputs);
  const regime = regimeFor(score);
  return {
    score,
    regime,
    headline: regimeHeadline(regime),
    components,
    live: components.some((c) => c.live),
  };
}

const EMPTY_INPUTS: CycleInputs = {
  globalSalesMomentum: 0,
  memoryPriceMomentum: 0,
  koreaExportMomentum: 0,
  bellwetherMomentum: 0,
  koreaBasketBreadth: 0,
  eventSentiment: 0,
};
