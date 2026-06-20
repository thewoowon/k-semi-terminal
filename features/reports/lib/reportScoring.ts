/**
 * Rule-based score v1 (spec §13). Transparent weights, manually controlled
 * inputs. No ML yet (spec §20.1). Pure functions — reusable by the generator
 * and a future statistical/ML layer.
 */

export interface CycleScoreInput {
  globalSemiMomentum: number; // -100 to 100
  memoryPriceMomentum: number; // -100 to 100
  hbmDemandProxy: number; // -100 to 100
  koreaSemiBasketMomentum: number; // -100 to 100
  exportMomentum: number; // -100 to 100
  newsEventSentiment: number; // -100 to 100
  riskAdjustment: number; // -100 to 100
}

export function normalizeTo100(value: number): number {
  return Math.max(0, Math.min(100, Math.round((value + 100) / 2)));
}

export function calculateCycleScore(input: CycleScoreInput): number {
  const raw =
    0.2 * input.globalSemiMomentum +
    0.2 * input.memoryPriceMomentum +
    0.15 * input.hbmDemandProxy +
    0.15 * input.koreaSemiBasketMomentum +
    0.1 * input.exportMomentum +
    0.1 * input.newsEventSentiment +
    0.1 * input.riskAdjustment;

  return normalizeTo100(raw);
}

export function getCycleLabel(score: number): string {
  if (score >= 80) return "Expansion / Overheat Watch";
  if (score >= 65) return "Expansion";
  if (score >= 50) return "Recovery";
  if (score >= 35) return "Neutral / Transition";
  if (score >= 20) return "Contraction";
  return "Stress";
}

/** Map a 0–100 cycle score to a regime band color token name. */
export function cycleTone(score: number): "hot" | "warm" | "up" | "flat" | "memory" {
  if (score >= 80) return "hot";
  if (score >= 65) return "warm";
  if (score >= 50) return "up";
  if (score >= 35) return "flat";
  return "memory";
}

/** Signed signal score (-100..100) → direction, for derived display. */
export function directionFromScore(score: number): import("./reportTypes").SignalDirection {
  if (score > 8) return "improving";
  if (score < -8) return "deteriorating";
  return "neutral";
}
