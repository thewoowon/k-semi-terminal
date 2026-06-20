/**
 * K-Semi Terminal — typed data contracts.
 * Mirrors the spec (§12) and extends it with the fields the views actually
 * consume. Every mock record is checked against these types at module load.
 */

export type SignalDirection = "positive" | "negative" | "neutral";

export type ChainNodeType =
  | "macro"
  | "global_index"
  | "memory_price"
  | "ai_demand"
  | "export"
  | "overseas_company"
  | "korea_segment"
  | "korea_company"
  | "event"
  | "risk";

/** Canonical Korean value-chain segments (spec §9.5). */
export type SegmentId =
  | "memory"
  | "foundry"
  | "fabless"
  | "equipment"
  | "materials"
  | "osat"
  | "test"
  | "hbm"
  | "substrate"
  | "infra";

export type ChainNode = {
  id: string;
  label: string;
  type: ChainNodeType;
  group: string;
  /** 0–100 signal strength. */
  score: number;
  /** percent move or z-score depending on node type. */
  delta: number;
  direction: SignalDirection;
  ticker?: string;
  subtitle?: string;
  description?: string;
  /** value-chain segment this node belongs to, when applicable. */
  segment?: SegmentId;
  /** small history series for the node's sparkline. */
  spark?: number[];
  metrics?: Record<string, number | string>;
};

export type ChainEdge = {
  id: string;
  source: string;
  target: string;
  /** 0–1 — drives stroke width. */
  weight: number;
  direction: SignalDirection;
  rationale: string;
  /** mark the headline causal spine so it can be highlighted by default. */
  primary?: boolean;
};

export type SemiEventType =
  | "disclosure"
  | "earnings"
  | "news"
  | "price_update"
  | "export_data"
  | "policy"
  | "analyst_note"
  | "supply_chain";

export type SemiEvent = {
  id: string;
  type: SemiEventType;
  title: string;
  summary: string;
  occurredAt: string; // ISO 8601
  sourceName: string;
  relatedNodeIds: string[];
  sentiment: SignalDirection;
  /** 0–100 estimated impact. */
  impactScore: number;
};

export type Company = {
  ticker: string;
  name: string;
  segment: SegmentId;
  /** market cap in KRW trillion. */
  marketCap: number;
  /** last price in KRW. */
  price: number;
  change1d: number;
  change5d: number;
  change20d: number;
  signalScore: number;
  chainNodeId: string;
  spark: number[];
};

export type MemoryQuote = {
  id: string;
  item: string;
  category: "DRAM" | "NAND" | "HBM";
  market: "contract" | "spot";
  /** USD. */
  current: number;
  sessionHigh: number;
  sessionLow: number;
  changePct: number;
  unit: string;
  spark: number[];
  lastUpdated: string;
};

export type Bellwether = {
  ticker: string;
  name: string;
  /** USD, or index level for SOX. */
  price: number;
  change1d: number;
  /** node id this overseas name links into. */
  chainNodeId: string;
  role: string;
  spark: number[];
};

export type Segment = {
  id: SegmentId;
  label: string;
  shortLabel: string;
  score: number;
  delta: number;
  direction: SignalDirection;
  /** chain node ids that make up this segment's path. */
  nodeIds: string[];
  /** accent color token name (see lib/colors). */
  accent: SegmentAccent;
};

export type SegmentAccent =
  | "memory"
  | "hbm"
  | "equip"
  | "foundry"
  | "up"
  | "warm"
  | "hot";

export type CycleRegime =
  | "Frozen"
  | "Cold"
  | "Neutral"
  | "Heating"
  | "Overheated";

export type CycleSnapshot = {
  score: number;
  regime: CycleRegime;
  components: {
    label: string;
    value: number; // 0–100
    weight: number; // 0–1
    delta: number;
  }[];
  /** headline secondary reads shown under the gauge. */
  reads: { label: string; value: string; direction: SignalDirection }[];
  updatedAt: string;
};

export type WatchItem = {
  ticker: string;
  name: string;
  change1d: number;
  signalScore: number;
};

/** Everything the terminal needs in a single normalized payload. */
export type TerminalSnapshot = {
  cycle: CycleSnapshot;
  segments: Segment[];
  nodes: ChainNode[];
  edges: ChainEdge[];
  companies: Company[];
  events: SemiEvent[];
  memory: MemoryQuote[];
  bellwethers: Bellwether[];
  watchlist: WatchItem[];
  marketStatus: {
    krx: "PRE" | "OPEN" | "CLOSED";
    asOf: string;
    kospi: number;
    kospiChange: number;
    usdkrw: number;
  };
};
