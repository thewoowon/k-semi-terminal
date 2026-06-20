/**
 * Pure scoring functions (spec §11). No React, no data imports — every input
 * is passed in so these stay unit-testable and reusable by the future signal
 * engine (v0.3). All scores are clamped to 0–100.
 */
import type { CycleRegime, SignalDirection } from "../types";

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export type CycleInputs = {
  globalSalesMomentum: number;
  memoryPriceMomentum: number;
  koreaExportMomentum: number;
  bellwetherMomentum: number;
  koreaBasketBreadth: number;
  eventSentiment: number;
};

/** Semi Cycle Score — weighted blend (spec §11.1). */
export function semiCycleScore(i: CycleInputs): number {
  return round1(
    clamp(
      0.25 * i.globalSalesMomentum +
        0.2 * i.memoryPriceMomentum +
        0.15 * i.koreaExportMomentum +
        0.15 * i.bellwetherMomentum +
        0.15 * i.koreaBasketBreadth +
        0.1 * i.eventSentiment,
    ),
  );
}

export type SegmentInputs = {
  companiesMomentum: number;
  eventsScore: number;
  globalDriver: number;
  relativeStrength: number;
};

/** Segment Score (spec §11.2). */
export function segmentScore(i: SegmentInputs): number {
  return round1(
    clamp(
      0.35 * i.companiesMomentum +
        0.25 * i.eventsScore +
        0.2 * i.globalDriver +
        0.2 * i.relativeStrength,
    ),
  );
}

export type CompanyInputs = {
  priceMomentum: number;
  volumeShock: number;
  newsEvent: number;
  segmentMomentum: number;
  globalLinkage: number;
};

/** Company Signal Score (spec §11.3). */
export function companySignalScore(i: CompanyInputs): number {
  return round1(
    clamp(
      0.3 * i.priceMomentum +
        0.2 * i.volumeShock +
        0.2 * i.newsEvent +
        0.15 * i.segmentMomentum +
        0.15 * i.globalLinkage,
    ),
  );
}

/** Map a 0–100 cycle score to its regime band (spec §9.3). */
export function regimeFor(score: number): CycleRegime {
  if (score >= 85) return "Overheated";
  if (score >= 68) return "Heating";
  if (score >= 48) return "Neutral";
  if (score >= 30) return "Cold";
  return "Frozen";
}

/** Phrase the regime as an observation, never as advice (spec §11 note). */
export function regimeHeadline(regime: CycleRegime): string {
  switch (regime) {
    case "Overheated":
      return "Cycle running hot — watch for momentum exhaustion";
    case "Heating":
      return "Cycle accelerating — broad signal expansion";
    case "Neutral":
      return "Mixed signals — no dominant regime";
    case "Cold":
      return "Cycle cooling — defensive breadth";
    case "Frozen":
      return "Cycle troughing — early-stabilization watch";
  }
}

export function directionFromScore(score: number): SignalDirection {
  if (score >= 58) return "positive";
  if (score <= 44) return "negative";
  return "neutral";
}
