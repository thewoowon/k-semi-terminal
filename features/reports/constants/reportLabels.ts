import type {
  ChainImpactNode,
  ConfidenceLevel,
  ReportType,
  SignalDirection,
} from "../lib/reportTypes";

export const DIRECTION_META: Record<
  SignalDirection,
  { label: string; arrow: string; cssVar: string; textClass: string }
> = {
  improving: { label: "개선", arrow: "▲", cssVar: "var(--color-up)", textClass: "text-up" },
  neutral: { label: "중립", arrow: "→", cssVar: "var(--color-flat)", textClass: "text-flat" },
  deteriorating: { label: "악화", arrow: "▼", cssVar: "var(--color-down)", textClass: "text-down" },
};

export const CONFIDENCE_META: Record<
  ConfidenceLevel,
  { label: string; dots: number }
> = {
  low: { label: "Low", dots: 1 },
  medium: { label: "Medium", dots: 2 },
  high: { label: "High", dots: 3 },
};

export const SENTIMENT_VAR: Record<ChainImpactNode["sentiment"], string> = {
  positive: "var(--color-up)",
  neutral: "var(--color-flat)",
  negative: "var(--color-down)",
};

export const CHAIN_NODE_TYPE_LABEL: Record<ChainImpactNode["type"], string> = {
  macro: "MACRO",
  "global-company": "GLOBAL CO.",
  "memory-price": "MEMORY",
  segment: "SEGMENT",
  "korean-company": "KR COMPANY",
  event: "EVENT",
  risk: "RISK",
};

export const REPORT_TYPE_META: Record<
  ReportType,
  { label: string; brand: string; cssVar: string }
> = {
  daily: { label: "Daily Signal Brief", brand: "K-Semi Morning Brief", cssVar: "var(--color-up)" },
  weekly: { label: "Weekly Deep Dive", brand: "K-Semi Weekly Deep Dive", cssVar: "var(--color-hbm)" },
  "chain-impact": { label: "AI Chain Impact", brand: "K-Semi Chain Impact", cssVar: "var(--color-warm)" },
  forecast: { label: "Cycle Forecast", brand: "K-Semi Cycle Forecast", cssVar: "var(--color-memory)" },
};

export const SCENARIO_META: Record<
  "bull" | "base" | "bear",
  { label: string; cssVar: string; textClass: string }
> = {
  bull: { label: "Bull", cssVar: "var(--color-up)", textClass: "text-up" },
  base: { label: "Base", cssVar: "var(--color-warm)", textClass: "text-warm" },
  bear: { label: "Bear", cssVar: "var(--color-down)", textClass: "text-down" },
};
