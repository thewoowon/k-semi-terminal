/**
 * K-Semi Signal — report data contracts (spec §7).
 * Types are kept verbatim to the spec so mock data and a future API/DB share
 * one shape. Reports use their own SignalDirection/segment vocabulary distinct
 * from the terminal dashboard.
 */

export type ReportType = "daily" | "weekly" | "chain-impact" | "forecast";

export type ReportAccessLevel = "public" | "founding" | "pro" | "research";

export type SignalDirection = "improving" | "neutral" | "deteriorating";

export type ConfidenceLevel = "low" | "medium" | "high";

export type SemiSegment =
  | "memory"
  | "hbm"
  | "packaging"
  | "equipment"
  | "test-socket"
  | "materials"
  | "foundry"
  | "eda-ip"
  | "power-semiconductor";

export interface ReportMetric {
  id: string;
  label: string;
  value: string | number;
  delta?: string | number;
  direction?: SignalDirection;
  description?: string;
}

export interface ReportSignal {
  id: string;
  title: string;
  segment: SemiSegment;
  score: number; // -100 to 100
  direction: SignalDirection;
  confidence: ConfidenceLevel;
  summary: string;
  rationale: string[];
  relatedCompanies: string[];
  relatedEvents: string[];
}

export interface ChainImpactNode {
  id: string;
  label: string;
  type:
    | "macro"
    | "global-company"
    | "memory-price"
    | "segment"
    | "korean-company"
    | "event"
    | "risk";
  sentiment: "positive" | "neutral" | "negative";
  impactScore: number;
}

export interface ChainImpactEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  strength: number; // 0 to 1
}

export interface ChainImpactBlock {
  title: string;
  summary: string;
  nodes: ChainImpactNode[];
  edges: ChainImpactEdge[];
}

export interface ReportScenario {
  type: "bull" | "base" | "bear";
  title: string;
  probability: number;
  summary: string;
  watchPoints: string[];
}

export interface ReportSource {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  publishedAt?: string;
  sourceType:
    | "news"
    | "disclosure"
    | "market-data"
    | "company"
    | "research"
    | "manual";
}

export interface DailySemiReport {
  id: string;
  type: "daily";
  accessLevel: ReportAccessLevel;
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  generatedAt: string;
  cycleScore: number; // 0 to 100
  cycleLabel: string;
  executiveSummary: string;
  metrics: ReportMetric[];
  topChanges: ReportSignal[];
  chainImpacts: ChainImpactBlock[];
  scenarios: ReportScenario[];
  risks: ReportSignal[];
  watchlist: string[];
  sources: ReportSource[];
  disclaimer: string;
}

export interface WeeklyDeepDiveSection {
  id: string;
  title: string;
  body: string;
  keyTakeaways: string[];
}

export interface WeeklySemiReport {
  id: string;
  type: "weekly";
  accessLevel: ReportAccessLevel;
  slug: string;
  title: string;
  subtitle: string;
  weekStart: string;
  weekEnd: string;
  publishedAt: string;
  executiveSummary: string;
  cycleScore: number;
  segmentScores: ReportSignal[];
  deepDiveSections: WeeklyDeepDiveSection[];
  chainImpacts: ChainImpactBlock[];
  scenarios: ReportScenario[];
  risks: ReportSignal[];
  sources: ReportSource[];
  disclaimer: string;
}

export type AnyReport = DailySemiReport | WeeklySemiReport;

/** Event-to-impact chain card (spec §21). */
export interface EventImpactCardData {
  eventTitle: string;
  eventSummary: string;
  impactScore: number;
  confidence: ConfidenceLevel;
  chain: string[];
  affectedSegments: SemiSegment[];
  affectedCompanies: string[];
  counterpoints: string[];
}
