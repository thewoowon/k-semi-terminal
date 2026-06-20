import type {
  ChainNodeType,
  SegmentAccent,
  SignalDirection,
} from "../types";

/** Resolved hex values mirroring the CSS tokens in globals.css. */
export const TOKEN = {
  base: "#05070a",
  panel: "#0a0e13",
  panel2: "#0e141b",
  elevated: "#121a24",
  line: "rgba(148,163,184,0.14)",
  lineStrong: "rgba(148,163,184,0.28)",
  ink: "#e6edf3",
  inkDim: "#8b949e",
  inkFaint: "#59636e",
  up: "#00e5a8",
  down: "#ff4d5e",
  flat: "#6e7681",
  hot: "#ff6b00",
  warm: "#ffb000",
  hbm: "#a855f7",
  memory: "#38bdf8",
  equip: "#f97316",
  foundry: "#22c55e",
} as const;

/** Hex for a signal direction — used by canvas/SVG that can't read CSS vars. */
export function directionHex(direction: SignalDirection): string {
  if (direction === "positive") return TOKEN.up;
  if (direction === "negative") return TOKEN.down;
  return TOKEN.flat;
}

/** Tailwind text-color class for a direction. */
export function directionText(direction: SignalDirection): string {
  if (direction === "positive") return "text-up";
  if (direction === "negative") return "text-down";
  return "text-flat";
}

/** Tailwind text-color class chosen from a numeric delta. */
export function deltaText(delta: number): string {
  if (delta > 0.05) return "text-up";
  if (delta < -0.05) return "text-down";
  return "text-ink-dim";
}

export const SEGMENT_ACCENT_HEX: Record<SegmentAccent, string> = {
  memory: TOKEN.memory,
  hbm: TOKEN.hbm,
  equip: TOKEN.equip,
  foundry: TOKEN.foundry,
  up: TOKEN.up,
  warm: TOKEN.warm,
  hot: TOKEN.hot,
};

/** Accent hex by chain node type — gives each layer of the chain its hue. */
export function nodeTypeHex(type: ChainNodeType): string {
  switch (type) {
    case "ai_demand":
      return TOKEN.hbm;
    case "memory_price":
      return TOKEN.memory;
    case "global_index":
    case "overseas_company":
      return TOKEN.warm;
    case "export":
      return TOKEN.foundry;
    case "korea_segment":
      return TOKEN.equip;
    case "korea_company":
      return TOKEN.up;
    case "macro":
      return TOKEN.inkDim;
    case "risk":
      return TOKEN.down;
    case "event":
      return TOKEN.hot;
    default:
      return TOKEN.inkDim;
  }
}

export const NODE_TYPE_LABEL: Record<ChainNodeType, string> = {
  macro: "MACRO",
  global_index: "GLOBAL INDEX",
  memory_price: "MEMORY",
  ai_demand: "AI DEMAND",
  export: "EXPORT",
  overseas_company: "OVERSEAS CO.",
  korea_segment: "KR SEGMENT",
  korea_company: "KR COMPANY",
  event: "EVENT",
  risk: "RISK",
};

/** Map a 0–100 score to a heat color (cold blue → neutral → hot orange). */
export function heatHex(score: number): string {
  if (score >= 85) return TOKEN.hot;
  if (score >= 72) return TOKEN.warm;
  if (score >= 58) return TOKEN.up;
  if (score >= 44) return TOKEN.flat;
  return TOKEN.memory;
}
