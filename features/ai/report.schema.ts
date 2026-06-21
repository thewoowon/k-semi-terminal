import { z } from "zod";

/**
 * Structured-output contract for AI-generated daily reports (launch checklist
 * §6.3). All LLM output is validated against this schema before it is ever
 * stored or rendered — invalid output is rejected, never persisted.
 */

const segment = z.enum([
  "memory",
  "hbm",
  "packaging",
  "equipment",
  "test-socket",
  "materials",
  "foundry",
  "eda-ip",
  "power-semiconductor",
]);
const direction = z.enum(["improving", "neutral", "deteriorating"]);
const confidence = z.enum(["low", "medium", "high"]);

const aiSignal = z.object({
  title: z.string(),
  segment,
  score: z.number(),
  direction,
  confidence,
  summary: z.string(),
  rationale: z.array(z.string()),
  relatedCompanies: z.array(z.string()),
});

const aiMetric = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  delta: z.string().optional(),
  direction: direction.optional(),
  description: z.string().optional(),
});

const aiChainImpact = z.object({
  title: z.string(),
  summary: z.string(),
  chain: z.array(z.string()),
  affectedSegments: z.array(segment),
  affectedCompanies: z.array(z.string()),
  impactScore: z.number(),
});

const aiScenario = z.object({
  type: z.enum(["bull", "base", "bear"]),
  title: z.string(),
  probability: z.number(),
  summary: z.string(),
  watchPoints: z.array(z.string()),
});

const aiSource = z.object({
  title: z.string(),
  publisher: z.string(),
  url: z.string().optional(),
  publishedAt: z.string().optional(),
  sourceType: z.enum([
    "news",
    "disclosure",
    "market-data",
    "company",
    "research",
    "manual",
  ]),
});

export const dailyReportSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  date: z.string(),
  cycleScore: z.number(),
  cycleLabel: z.string(),
  executiveSummary: z.string(),
  metrics: z.array(aiMetric),
  topSignals: z.array(aiSignal),
  chainImpacts: z.array(aiChainImpact),
  scenarios: z.array(aiScenario),
  risks: z.array(aiSignal),
  watchlist: z.array(z.string()),
  sources: z.array(aiSource),
});

export type AiDailyReport = z.infer<typeof dailyReportSchema>;
export type AiSignal = z.infer<typeof aiSignal>;

/** Compact JSON shape shown to the model so it returns exactly this structure. */
export const DAILY_REPORT_JSON_SHAPE = `{
  "title": string,
  "subtitle": string,
  "date": "YYYY-MM-DD",
  "cycleScore": number (0-100),
  "cycleLabel": string,
  "executiveSummary": string,
  "metrics": [{ "id": string, "label": string, "value": number|string, "delta"?: string, "direction"?: "improving"|"neutral"|"deteriorating", "description"?: string }],
  "topSignals": [{ "title": string, "segment": Segment, "score": number (-100..100), "direction": Direction, "confidence": "low"|"medium"|"high", "summary": string, "rationale": string[], "relatedCompanies": string[] }],
  "chainImpacts": [{ "title": string, "summary": string, "chain": string[], "affectedSegments": Segment[], "affectedCompanies": string[], "impactScore": number (-100..100) }],
  "scenarios": [{ "type": "bull"|"base"|"bear", "title": string, "probability": number (0-100), "summary": string, "watchPoints": string[] }],
  "risks": [ <same shape as topSignals> ],
  "watchlist": string[],
  "sources": [{ "title": string, "publisher": string, "url"?: string, "publishedAt"?: "YYYY-MM-DD", "sourceType": "news"|"disclosure"|"market-data"|"company"|"research"|"manual" }]
}
Segment = "memory"|"hbm"|"packaging"|"equipment"|"test-socket"|"materials"|"foundry"|"eda-ip"|"power-semiconductor"
Direction = "improving"|"neutral"|"deteriorating"`;
