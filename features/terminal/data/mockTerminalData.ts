import type {
  Bellwether,
  ChainEdge,
  ChainNode,
  CycleSnapshot,
  MemoryQuote,
  Segment,
  TerminalSnapshot,
} from "../types";
import { genSeries } from "../lib/series";
import { regimeFor, regimeHeadline, semiCycleScore } from "../lib/score";
import { companies, watchlist } from "./mockCompanies";
import { events } from "./mockEvents";

// Re-export so components have a single import surface for the snapshot data.
export { companies, watchlist } from "./mockCompanies";
export { events } from "./mockEvents";

/** Snapshot "now" — everything is anchored to this for stable relative time. */
export const SNAPSHOT_NOW = new Date("2026-06-19T09:05:00Z").getTime();

/* ----------------------------------------------------------------------------
   Signal-chain nodes (spec §9.4, §19). A DAG flowing global drivers → memory
   price → bellwethers → Korea export → value-chain segments → companies →
   company-level events.
   -------------------------------------------------------------------------- */
export const chainNodes: ChainNode[] = [
  // — Global drivers (sources) —
  {
    id: "ai-demand",
    label: "AI Server Demand",
    type: "ai_demand",
    group: "Global Drivers",
    score: 94,
    delta: 8.4,
    direction: "positive",
    subtitle: "Hyperscaler accelerator pull",
    description:
      "Accelerator build-outs at hyperscalers set the pace for HBM allocation and leading-edge memory demand.",
    spark: genSeries("ai-demand", { trend: 0.26, volatility: 0.04 }),
    metrics: { "YoY": "+41%", "Backlog": "Tight", "Weight": "0.25" },
  },
  {
    id: "hyperscaler",
    label: "Hyperscaler CapEx",
    type: "macro",
    group: "Global Drivers",
    score: 90,
    delta: 6.1,
    direction: "positive",
    subtitle: "Cloud infra spend impulse",
    spark: genSeries("hyperscaler", { trend: 0.18, volatility: 0.05 }),
    metrics: { "YoY": "+33%", "Guide": "Raised" },
  },
  {
    id: "risk-china",
    label: "China Legacy Oversupply",
    type: "risk",
    group: "Risk",
    score: 38,
    delta: -4.2,
    direction: "negative",
    subtitle: "Commodity NAND/DRAM pressure",
    description:
      "Domestic Chinese capacity additions pressure commodity memory ASP. Limited overlap with HBM/DDR5 but a downside watch for legacy mix.",
    spark: genSeries("risk-china", { trend: -0.12, volatility: 0.06 }),
    metrics: { "Overlap": "Low", "Watch": "NAND" },
  },

  // — Global memory price + index —
  {
    id: "hbm-demand",
    label: "HBM Demand",
    type: "memory_price",
    group: "Memory",
    score: 96,
    delta: 11.2,
    direction: "positive",
    segment: "hbm",
    subtitle: "Sold-out through cycle",
    description:
      "HBM allocation remains supply-constrained; pricing and mix lead the broader memory recovery.",
    spark: genSeries("hbm-demand", { trend: 0.34, volatility: 0.03 }),
    metrics: { "ASP": "+6.1% QoQ", "Supply": "Sold-out" },
  },
  {
    id: "dram-price",
    label: "DRAM Contract Price",
    type: "memory_price",
    group: "Memory",
    score: 88,
    delta: 9.2,
    direction: "positive",
    segment: "memory",
    subtitle: "DDR5 server leads",
    spark: genSeries("dram-price", { trend: 0.24, volatility: 0.04 }),
    metrics: { "QoQ": "+9.2%", "Lead": "DDR5" },
  },
  {
    id: "nand-price",
    label: "NAND Price",
    type: "memory_price",
    group: "Memory",
    score: 57,
    delta: -1.8,
    direction: "negative",
    segment: "memory",
    subtitle: "Commodity soft",
    spark: genSeries("nand-price", { trend: -0.04, volatility: 0.05 }),
    metrics: { "QoQ": "-1.8%", "Mix": "Legacy soft" },
  },
  {
    id: "sox",
    label: "Philadelphia SOX",
    type: "global_index",
    group: "Global Index",
    score: 79,
    delta: 2.1,
    direction: "positive",
    subtitle: "Semi benchmark momentum",
    spark: genSeries("sox", { trend: 0.12, volatility: 0.04 }),
    metrics: { "1M": "+7.4%", "RS": "Strong" },
  },

  // — Overseas bellwether companies —
  {
    id: "nvda",
    label: "NVIDIA",
    type: "overseas_company",
    group: "Bellwether",
    score: 92,
    delta: 3.4,
    direction: "positive",
    ticker: "NVDA",
    subtitle: "Accelerator demand anchor",
    spark: genSeries("nvda", { trend: 0.2, volatility: 0.05 }),
  },
  {
    id: "tsmc",
    label: "TSMC",
    type: "overseas_company",
    group: "Bellwether",
    score: 84,
    delta: 1.9,
    direction: "positive",
    ticker: "TSM",
    subtitle: "Leading-edge foundry / CoWoS",
    spark: genSeries("tsmc", { trend: 0.14, volatility: 0.04 }),
  },
  {
    id: "asml",
    label: "ASML",
    type: "overseas_company",
    group: "Bellwether",
    score: 70,
    delta: 0.8,
    direction: "neutral",
    ticker: "ASML",
    subtitle: "EUV / litho bellwether",
    spark: genSeries("asml", { trend: 0.06, volatility: 0.05 }),
  },
  {
    id: "micron",
    label: "Micron",
    type: "overseas_company",
    group: "Bellwether",
    score: 86,
    delta: 2.7,
    direction: "positive",
    ticker: "MU",
    subtitle: "Memory read-through",
    spark: genSeries("micron", { trend: 0.18, volatility: 0.05 }),
  },

  // — Korea macro proxy —
  {
    id: "kr-export",
    label: "Korea Chip Exports",
    type: "export",
    group: "Korea Macro",
    score: 82,
    delta: 38.4,
    direction: "positive",
    subtitle: "HS 8542 · +38% YoY",
    description:
      "Real-economy proxy for the Korean memory cycle. Eleventh consecutive monthly YoY gain on ASP recovery and HBM mix.",
    spark: genSeries("kr-export", { trend: 0.28, volatility: 0.05 }),
    metrics: { "YoY": "+38.4%", "Streak": "11 mo" },
  },

  // — Korea value-chain segments —
  {
    id: "seg-memory",
    label: "Korea Memory",
    type: "korea_segment",
    group: "Segment",
    score: 88,
    delta: 5.4,
    direction: "positive",
    segment: "memory",
    spark: genSeries("seg-memory", { trend: 0.2, volatility: 0.03 }),
  },
  {
    id: "seg-hbm",
    label: "HBM Supply Chain",
    type: "korea_segment",
    group: "Segment",
    score: 92,
    delta: 7.1,
    direction: "positive",
    segment: "hbm",
    spark: genSeries("seg-hbm", { trend: 0.3, volatility: 0.03 }),
  },
  {
    id: "seg-equipment",
    label: "Equipment",
    type: "korea_segment",
    group: "Segment",
    score: 76,
    delta: 3.6,
    direction: "positive",
    segment: "equipment",
    spark: genSeries("seg-equipment", { trend: 0.15, volatility: 0.05 }),
  },
  {
    id: "seg-test",
    label: "Test / Probe",
    type: "korea_segment",
    group: "Segment",
    score: 67,
    delta: 2.2,
    direction: "positive",
    segment: "test",
    spark: genSeries("seg-test", { trend: 0.12, volatility: 0.05 }),
  },
  {
    id: "seg-osat",
    label: "OSAT / Packaging",
    type: "korea_segment",
    group: "Segment",
    score: 64,
    delta: 1.6,
    direction: "positive",
    segment: "osat",
    spark: genSeries("seg-osat", { trend: 0.1, volatility: 0.05 }),
  },
  {
    id: "seg-materials",
    label: "Materials",
    type: "korea_segment",
    group: "Segment",
    score: 58,
    delta: -0.4,
    direction: "neutral",
    segment: "materials",
    spark: genSeries("seg-materials", { trend: 0.0, volatility: 0.05 }),
  },
  {
    id: "seg-foundry",
    label: "Foundry",
    type: "korea_segment",
    group: "Segment",
    score: 54,
    delta: -1.1,
    direction: "neutral",
    segment: "foundry",
    spark: genSeries("seg-foundry", { trend: -0.03, volatility: 0.05 }),
  },

  // — Korea companies —
  {
    id: "sk-hynix",
    label: "SK Hynix",
    type: "korea_company",
    group: "Korea Memory",
    score: 91,
    delta: 4.7,
    direction: "positive",
    ticker: "000660",
    segment: "memory",
    subtitle: "HBM allocation leader",
    spark: genSeries("000660", { trend: 0.22, volatility: 0.04 }),
  },
  {
    id: "samsung",
    label: "Samsung Electronics",
    type: "korea_company",
    group: "Korea Memory",
    score: 77,
    delta: 1.2,
    direction: "positive",
    ticker: "005930",
    segment: "memory",
    subtitle: "Memory + foundry",
    spark: genSeries("005930", { trend: 0.09, volatility: 0.03 }),
  },
  {
    id: "hanmi",
    label: "Hanmi Semiconductor",
    type: "korea_company",
    group: "Equipment",
    score: 88,
    delta: 4.7,
    direction: "positive",
    ticker: "042700",
    segment: "hbm",
    subtitle: "TC bonder / HBM packaging",
    spark: genSeries("042700", { trend: 0.31, volatility: 0.06 }),
  },
  {
    id: "hpsp",
    label: "HPSP",
    type: "korea_company",
    group: "Equipment",
    score: 74,
    delta: 2.3,
    direction: "positive",
    ticker: "403870",
    segment: "equipment",
    subtitle: "High-pressure anneal",
    spark: genSeries("403870", { trend: 0.14, volatility: 0.05 }),
  },
  {
    id: "wonik",
    label: "Wonik IPS",
    type: "korea_company",
    group: "Equipment",
    score: 62,
    delta: -0.8,
    direction: "neutral",
    ticker: "240810",
    segment: "equipment",
    subtitle: "Deposition / etch",
    spark: genSeries("240810", { trend: 0.05, volatility: 0.06 }),
  },
  {
    id: "isc",
    label: "ISC",
    type: "korea_company",
    group: "Test",
    score: 70,
    delta: 1.9,
    direction: "positive",
    ticker: "095340",
    segment: "test",
    subtitle: "Test sockets",
    spark: genSeries("095340", { trend: 0.16, volatility: 0.05 }),
  },
  {
    id: "leeno",
    label: "Leeno Industrial",
    type: "korea_company",
    group: "Test",
    score: 66,
    delta: 0.9,
    direction: "positive",
    ticker: "058470",
    segment: "test",
    subtitle: "Probe / pogo pins",
    spark: genSeries("058470", { trend: 0.11, volatility: 0.04 }),
  },
  {
    id: "soulbrain",
    label: "Soulbrain",
    type: "korea_company",
    group: "Materials",
    score: 58,
    delta: -1.4,
    direction: "negative",
    ticker: "036830",
    segment: "materials",
    subtitle: "Etchants / electrolytes",
    spark: genSeries("036830", { trend: -0.02, volatility: 0.05 }),
  },

  // — Company-level event —
  {
    id: "evt-hanmi",
    label: "Hanmi TC Bonder Order",
    type: "event",
    group: "Events",
    score: 86,
    delta: 0,
    direction: "positive",
    subtitle: "KRW 318B disclosure",
    description:
      "Largest-ever bonding equipment order tied to an HBM4 ramp — the company-level event that closes the AI→HBM→memory→equipment chain.",
    spark: genSeries("evt-hanmi", { trend: 0.2, volatility: 0.04 }),
  },
];

/* ----------------------------------------------------------------------------
   Edges — causal spine + branches. `primary` marks the headline AI→HBM→DRAM→
   SK Hynix→Equipment→Hanmi→Event path highlighted by default (spec §19).
   -------------------------------------------------------------------------- */
export const chainEdges: ChainEdge[] = [
  // global drivers
  { id: "e1", source: "ai-demand", target: "hbm-demand", weight: 0.96, direction: "positive", primary: true, rationale: "AI server demand drives HBM allocation pressure." },
  { id: "e2", source: "ai-demand", target: "nvda", weight: 0.9, direction: "positive", rationale: "Accelerator demand is realized first in NVIDIA results." },
  { id: "e3", source: "ai-demand", target: "sox", weight: 0.68, direction: "positive", rationale: "AI capex underpins the broad semiconductor index." },
  { id: "e4", source: "ai-demand", target: "tsmc", weight: 0.6, direction: "positive", rationale: "Accelerator packaging (CoWoS) demand flows to TSMC." },
  { id: "e5", source: "hyperscaler", target: "hbm-demand", weight: 0.6, direction: "positive", rationale: "Cloud capex sets the HBM order pipeline." },
  { id: "e6", source: "hyperscaler", target: "sox", weight: 0.5, direction: "positive", rationale: "Infra spend supports semi equities broadly." },
  { id: "e7", source: "risk-china", target: "nand-price", weight: 0.6, direction: "negative", rationale: "Chinese legacy supply pressures commodity NAND." },
  { id: "e8", source: "risk-china", target: "seg-materials", weight: 0.32, direction: "negative", rationale: "Legacy oversupply weighs on commodity materials demand." },

  // memory price layer
  { id: "e9", source: "hbm-demand", target: "dram-price", weight: 0.85, direction: "positive", primary: true, rationale: "HBM capacity conversion tightens conventional DRAM." },
  { id: "e10", source: "hbm-demand", target: "seg-hbm", weight: 0.92, direction: "positive", rationale: "HBM demand directly drives the Korean HBM supply chain." },
  { id: "e11", source: "hbm-demand", target: "micron", weight: 0.7, direction: "positive", rationale: "HBM read-through lifts the third memory maker." },
  { id: "e12", source: "hbm-demand", target: "seg-memory", weight: 0.6, direction: "positive", rationale: "HBM mix lifts blended memory economics." },
  { id: "e13", source: "dram-price", target: "sk-hynix", weight: 0.9, direction: "positive", primary: true, rationale: "Contract price gains map to the leading Korean memory supplier." },
  { id: "e14", source: "dram-price", target: "kr-export", weight: 0.75, direction: "positive", rationale: "Memory ASP recovery shows up in chip export value." },
  { id: "e15", source: "dram-price", target: "seg-memory", weight: 0.7, direction: "positive", rationale: "Pricing improves the Korea memory segment outlook." },
  { id: "e16", source: "dram-price", target: "samsung", weight: 0.58, direction: "positive", rationale: "ASP recovery benefits the diversified memory leader." },
  { id: "e17", source: "nand-price", target: "kr-export", weight: 0.4, direction: "negative", rationale: "Soft NAND partially offsets export value gains." },
  { id: "e18", source: "nand-price", target: "samsung", weight: 0.34, direction: "negative", rationale: "NAND weakness tempers the conglomerate's mix." },

  // bellwether layer
  { id: "e19", source: "nvda", target: "sox", weight: 0.55, direction: "positive", rationale: "NVIDIA is the largest weight in the semi benchmark." },
  { id: "e20", source: "tsmc", target: "asml", weight: 0.7, direction: "positive", rationale: "Leading-edge capex sustains litho equipment demand." },
  { id: "e21", source: "tsmc", target: "seg-foundry", weight: 0.5, direction: "neutral", rationale: "Global foundry read-through for Korean foundry." },
  { id: "e22", source: "micron", target: "sk-hynix", weight: 0.45, direction: "positive", rationale: "Peer guidance validates Korean memory trajectory." },
  { id: "e23", source: "asml", target: "seg-equipment", weight: 0.55, direction: "positive", rationale: "Litho strength supports the broad equipment cycle." },

  // korea macro → companies
  { id: "e24", source: "kr-export", target: "sk-hynix", weight: 0.55, direction: "positive", rationale: "Export momentum confirms memory-maker volume." },
  { id: "e25", source: "kr-export", target: "samsung", weight: 0.5, direction: "positive", rationale: "Export strength supports the largest exporter." },

  // segments → companies
  { id: "e26", source: "seg-memory", target: "sk-hynix", weight: 0.8, direction: "positive", rationale: "Memory segment strength concentrates in SK Hynix." },
  { id: "e27", source: "seg-memory", target: "samsung", weight: 0.75, direction: "positive", rationale: "Memory segment strength supports Samsung's core." },
  { id: "e28", source: "seg-memory", target: "seg-materials", weight: 0.4, direction: "neutral", rationale: "Memory output pulls process-materials demand." },
  { id: "e29", source: "seg-hbm", target: "sk-hynix", weight: 0.85, direction: "positive", rationale: "HBM supply chain centers on the allocation leader." },
  { id: "e30", source: "seg-hbm", target: "hanmi", weight: 0.8, direction: "positive", primary: false, rationale: "HBM packaging intensity drives bonding equipment." },
  { id: "e31", source: "seg-hbm", target: "seg-equipment", weight: 0.7, direction: "positive", rationale: "HBM ramp lifts advanced-packaging equipment." },
  { id: "e32", source: "seg-hbm", target: "seg-osat", weight: 0.6, direction: "positive", rationale: "Stacking and packaging intensity rises with HBM." },
  { id: "e33", source: "seg-hbm", target: "seg-test", weight: 0.55, direction: "positive", rationale: "Higher test intensity per HBM stack." },
  { id: "e34", source: "sk-hynix", target: "seg-equipment", weight: 0.62, direction: "positive", primary: true, rationale: "Capacity expansion converts into equipment orders." },
  { id: "e35", source: "seg-equipment", target: "hanmi", weight: 0.85, direction: "positive", primary: true, rationale: "Advanced-packaging capex flows to bonding equipment." },
  { id: "e36", source: "seg-equipment", target: "hpsp", weight: 0.7, direction: "positive", rationale: "Anneal demand rises with advanced-process capex." },
  { id: "e37", source: "seg-equipment", target: "wonik", weight: 0.58, direction: "neutral", rationale: "Front-end deposition/etch tracks the capex cycle." },
  { id: "e38", source: "seg-test", target: "isc", weight: 0.75, direction: "positive", rationale: "Test-socket consumption rises with HBM testing." },
  { id: "e39", source: "seg-test", target: "leeno", weight: 0.7, direction: "positive", rationale: "Probe demand rises with device test intensity." },
  { id: "e40", source: "seg-materials", target: "soulbrain", weight: 0.7, direction: "neutral", rationale: "Process-chemical demand tracks wafer output." },
  { id: "e41", source: "seg-foundry", target: "samsung", weight: 0.4, direction: "neutral", rationale: "Foundry utilization feeds the conglomerate mix." },

  // company → event
  { id: "e42", source: "hanmi", target: "evt-hanmi", weight: 0.9, direction: "positive", primary: true, rationale: "Order disclosure is the realized company-level event." },
];

/* ----------------------------------------------------------------------------
   Value-chain segments (LeftRail + ValueChainMap)
   -------------------------------------------------------------------------- */
export const segments: Segment[] = [
  { id: "hbm", label: "HBM Supply Chain", shortLabel: "HBM Chain", score: 92, delta: 7.1, direction: "positive", accent: "hbm", nodeIds: ["seg-hbm", "hbm-demand", "sk-hynix", "hanmi", "seg-osat"] },
  { id: "memory", label: "Memory", shortLabel: "Memory", score: 88, delta: 5.4, direction: "positive", accent: "memory", nodeIds: ["seg-memory", "dram-price", "nand-price", "sk-hynix", "samsung"] },
  { id: "equipment", label: "Equipment", shortLabel: "Equipment", score: 76, delta: 3.6, direction: "positive", accent: "equip", nodeIds: ["seg-equipment", "hanmi", "hpsp", "wonik", "asml"] },
  { id: "test", label: "Test Socket / Probe", shortLabel: "Test/Probe", score: 67, delta: 2.2, direction: "positive", accent: "up", nodeIds: ["seg-test", "isc", "leeno"] },
  { id: "osat", label: "OSAT / Packaging", shortLabel: "OSAT", score: 64, delta: 1.6, direction: "positive", accent: "warm", nodeIds: ["seg-osat"] },
  { id: "materials", label: "Materials", shortLabel: "Materials", score: 58, delta: -0.4, direction: "neutral", accent: "warm", nodeIds: ["seg-materials", "soulbrain"] },
  { id: "foundry", label: "Foundry", shortLabel: "Foundry", score: 54, delta: -1.1, direction: "neutral", accent: "foundry", nodeIds: ["seg-foundry", "samsung", "tsmc"] },
  { id: "fabless", label: "Fabless / IP", shortLabel: "Fabless", score: 49, delta: -2.3, direction: "negative", accent: "warm", nodeIds: ["seg-foundry"] },
];

/* ----------------------------------------------------------------------------
   Memory price board (spec §9.6)
   -------------------------------------------------------------------------- */
export const memoryQuotes: MemoryQuote[] = [
  { id: "m1", item: "HBM3E 8-Hi (idx)", category: "HBM", market: "contract", current: 14.2, sessionHigh: 14.35, sessionLow: 13.9, changePct: 6.1, unit: "idx", lastUpdated: "2026-06-19T08:30:00Z", spark: genSeries("m1", { trend: 0.3, volatility: 0.02 }) },
  { id: "m2", item: "HBM4 12-Hi (prelim)", category: "HBM", market: "contract", current: 18.5, sessionHigh: 18.5, sessionLow: 18.2, changePct: 1.4, unit: "idx", lastUpdated: "2026-06-19T08:30:00Z", spark: genSeries("m2", { trend: 0.06, volatility: 0.02 }) },
  { id: "m3", item: "DDR5 16Gb 5600", category: "DRAM", market: "contract", current: 4.1, sessionHigh: 4.12, sessionLow: 3.98, changePct: 3.2, unit: "USD", lastUpdated: "2026-06-19T08:30:00Z", spark: genSeries("m3", { trend: 0.18, volatility: 0.03 }) },
  { id: "m4", item: "DDR5 16Gb (spot)", category: "DRAM", market: "spot", current: 4.55, sessionHigh: 4.62, sessionLow: 4.3, changePct: 5.4, unit: "USD", lastUpdated: "2026-06-19T08:45:00Z", spark: genSeries("m4", { trend: 0.22, volatility: 0.05 }) },
  { id: "m5", item: "DDR4 8Gb 3200", category: "DRAM", market: "contract", current: 1.95, sessionHigh: 1.97, sessionLow: 1.92, changePct: 1.1, unit: "USD", lastUpdated: "2026-06-19T08:30:00Z", spark: genSeries("m5", { trend: 0.08, volatility: 0.03 }) },
  { id: "m6", item: "NAND 512Gb TLC", category: "NAND", market: "contract", current: 3.85, sessionHigh: 3.95, sessionLow: 3.84, changePct: -1.8, unit: "USD", lastUpdated: "2026-06-19T08:30:00Z", spark: genSeries("m6", { trend: -0.05, volatility: 0.03 }) },
  { id: "m7", item: "NAND Wafer (spot)", category: "NAND", market: "spot", current: 2.6, sessionHigh: 2.72, sessionLow: 2.58, changePct: -2.4, unit: "USD", lastUpdated: "2026-06-19T08:45:00Z", spark: genSeries("m7", { trend: -0.08, volatility: 0.05 }) },
  { id: "m8", item: "eSSD 1TB (idx)", category: "NAND", market: "contract", current: 78.0, sessionHigh: 78.4, sessionLow: 77.1, changePct: 0.9, unit: "idx", lastUpdated: "2026-06-19T08:30:00Z", spark: genSeries("m8", { trend: 0.05, volatility: 0.03 }) },
];

/* ----------------------------------------------------------------------------
   Overseas bellwether strip (spec §9.7)
   -------------------------------------------------------------------------- */
export const bellwethers: Bellwether[] = [
  { ticker: "NVDA", name: "NVIDIA", price: 1284.5, change1d: 3.4, chainNodeId: "nvda", role: "Accelerators", spark: genSeries("bw-nvda", { trend: 0.2, volatility: 0.05 }) },
  { ticker: "TSM", name: "TSMC ADR", price: 246.8, change1d: 1.9, chainNodeId: "tsmc", role: "Foundry / CoWoS", spark: genSeries("bw-tsm", { trend: 0.14, volatility: 0.04 }) },
  { ticker: "MU", name: "Micron", price: 168.3, change1d: 2.7, chainNodeId: "micron", role: "Memory peer", spark: genSeries("bw-mu", { trend: 0.18, volatility: 0.05 }) },
  { ticker: "ASML", name: "ASML", price: 1042.2, change1d: 0.8, chainNodeId: "asml", role: "EUV litho", spark: genSeries("bw-asml", { trend: 0.06, volatility: 0.04 }) },
  { ticker: "AMD", name: "AMD", price: 214.6, change1d: 2.2, chainNodeId: "ai-demand", role: "Accelerators", spark: genSeries("bw-amd", { trend: 0.12, volatility: 0.06 }) },
  { ticker: "AVGO", name: "Broadcom", price: 1762.4, change1d: 1.5, chainNodeId: "hbm-demand", role: "Custom AI / networking", spark: genSeries("bw-avgo", { trend: 0.13, volatility: 0.05 }) },
  { ticker: "ARM", name: "Arm Holdings", price: 158.9, change1d: -0.6, chainNodeId: "sox", role: "Compute IP", spark: genSeries("bw-arm", { trend: 0.04, volatility: 0.06 }) },
  { ticker: "SOX", name: "PHLX Semi Index", price: 6248.1, change1d: 2.1, chainNodeId: "sox", role: "Benchmark", spark: genSeries("bw-sox", { trend: 0.11, volatility: 0.03 }) },
];

/* ----------------------------------------------------------------------------
   Cycle snapshot — computed from the scoring model (spec §11.1)
   -------------------------------------------------------------------------- */
const cycleComponents = [
  { label: "Global Semi Sales Mom.", value: 84, weight: 0.25, delta: 3.1 },
  { label: "Memory Price Mom.", value: 93, weight: 0.2, delta: 6.4 },
  { label: "Korea Export Mom.", value: 88, weight: 0.15, delta: 4.2 },
  { label: "Bellwether Mom.", value: 82, weight: 0.15, delta: 2.0 },
  { label: "Korea Basket Breadth", value: 64, weight: 0.15, delta: -0.8 },
  { label: "Event Sentiment", value: 76, weight: 0.1, delta: 1.4 },
];

const cycleScore = semiCycleScore({
  globalSalesMomentum: 84,
  memoryPriceMomentum: 93,
  koreaExportMomentum: 88,
  bellwetherMomentum: 82,
  koreaBasketBreadth: 64,
  eventSentiment: 76,
});

export const cycle: CycleSnapshot = {
  score: cycleScore,
  regime: regimeFor(cycleScore),
  components: cycleComponents,
  reads: [
    { label: "YoY", value: "+19.4%", direction: "positive" },
    { label: "MoM", value: "+3.8%", direction: "positive" },
    { label: "Breadth", value: "64%", direction: "neutral" },
    { label: "Memory Mom.", value: "Strong", direction: "positive" },
    { label: "SOX Mom.", value: "+7.4%", direction: "positive" },
  ],
  updatedAt: "2026-06-19T09:05:00Z",
};

/** Human-readable regime line, kept as an observation (never advice). */
export const cycleHeadline = regimeHeadline(cycle.regime);

/* ----------------------------------------------------------------------------
   Assembled snapshot — the single normalized payload the terminal consumes.
   -------------------------------------------------------------------------- */
export const terminalSnapshot: TerminalSnapshot = {
  cycle,
  segments,
  nodes: chainNodes,
  edges: chainEdges,
  companies,
  events,
  memory: memoryQuotes,
  bellwethers,
  watchlist,
  marketStatus: {
    krx: "OPEN",
    asOf: "2026-06-19T09:05:00Z",
    kospi: 2745.3,
    kospiChange: 0.82,
    usdkrw: 1362.4,
  },
};
