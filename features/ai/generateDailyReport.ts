import "server-only";
import { features } from "@/lib/env";
import { anthropic, REPORT_MODEL } from "./anthropic.client";
import { dailyReportSchema, type AiDailyReport, type AiSignal } from "./report.schema";
import {
  buildDailySystemPrompt,
  buildDailyUserPrompt,
} from "./prompts/dailyReportPrompt";
import { generateMockDailyReport } from "@/features/reports/lib/reportGenerator";
import { getCycleLabel } from "@/features/reports/lib/reportScoring";
import { REPORT_DISCLAIMER } from "@/features/reports/constants/reportDisclaimers";
import { terminalSnapshot } from "@/features/terminal/data/mockTerminalData";
import type {
  ChainImpactBlock,
  ChainImpactNode,
  DailySemiReport,
  ReportSignal,
} from "@/features/reports/lib/reportTypes";

export type GenerateResult = {
  report: DailySemiReport;
  source: "claude" | "mock";
  model: string;
  /** number of source records the model was grounded on */
  sourceCount: number;
  dataCutoff: string;
};

/** Trim the terminal snapshot into a grounding payload for the model. */
function buildSnapshot() {
  const s = terminalSnapshot;
  return {
    asOf: s.marketStatus.asOf,
    cycle: { score: s.cycle.score, regime: s.cycle.regime, reads: s.cycle.reads },
    memory: s.memory.map((m) => ({
      item: m.item,
      category: m.category,
      market: m.market,
      current: m.current,
      changePct: m.changePct,
    })),
    bellwethers: s.bellwethers.map((b) => ({
      ticker: b.ticker,
      name: b.name,
      change1d: b.change1d,
      role: b.role,
    })),
    segments: s.segments.map((seg) => ({
      label: seg.label,
      score: seg.score,
      delta: seg.delta,
      direction: seg.direction,
    })),
    events: s.events.map((e) => ({
      type: e.type,
      title: e.title,
      sentiment: e.sentiment,
      source: e.sourceName,
    })),
  };
}

export async function generateDailyReport(date: string): Promise<GenerateResult> {
  const snapshot = buildSnapshot();
  const dataCutoff = snapshot.asOf;
  const sourceCount = snapshot.events.length + snapshot.memory.length;

  if (!features.ai) {
    // Graceful fallback — rule-based mock when no API key is configured.
    return {
      report: generateMockDailyReport(date),
      source: "mock",
      model: "rule-based",
      sourceCount,
      dataCutoff,
    };
  }

  const ai = await callClaude(date, snapshot);
  return {
    report: aiToDaily(ai, date),
    source: "claude",
    model: REPORT_MODEL,
    sourceCount: ai.sources.length || sourceCount,
    dataCutoff,
  };
}

async function callClaude(date: string, snapshot: unknown): Promise<AiDailyReport> {
  const res = await anthropic().messages.create({
    model: REPORT_MODEL,
    max_tokens: 16000,
    system: buildDailySystemPrompt(),
    messages: [{ role: "user", content: buildDailyUserPrompt(date, snapshot) }],
  });
  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  // Schema validation — invalid output throws and the job marks the report failed.
  return dailyReportSchema.parse(extractJson(text));
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  const slice = start >= 0 && end > start ? body.slice(start, end + 1) : body;
  return JSON.parse(slice);
}

/* ---- adapter: AI structured output → renderable DailySemiReport ---- */

function slug(s: string, i: number): string {
  return `${s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}-${i}`;
}

function toSignal(s: AiSignal, i: number): ReportSignal {
  return {
    id: slug(s.title, i),
    title: s.title,
    segment: s.segment,
    score: clamp(s.score, -100, 100),
    direction: s.direction,
    confidence: s.confidence,
    summary: s.summary,
    rationale: s.rationale,
    relatedCompanies: s.relatedCompanies,
    relatedEvents: [],
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function toChainBlock(c: AiDailyReport["chainImpacts"][number]): ChainImpactBlock {
  const score = clamp(c.impactScore, -100, 100);
  const sentiment: ChainImpactNode["sentiment"] =
    score > 8 ? "positive" : score < -8 ? "negative" : "neutral";
  const nodes: ChainImpactNode[] = c.chain.map((label, i) => ({
    id: `n${i}`,
    label,
    type:
      i === 0
        ? "macro"
        : i === c.chain.length - 1
          ? "korean-company"
          : "segment",
    sentiment,
    impactScore: clamp(score - i * 2, -100, 100),
  }));
  const edges = nodes.slice(0, -1).map((n, i) => ({
    id: `e${i}`,
    source: n.id,
    target: nodes[i + 1].id,
    label: "→",
    strength: Math.max(0.4, 0.9 - i * 0.08),
  }));
  return { title: c.title, summary: c.summary, nodes, edges };
}

function aiToDaily(ai: AiDailyReport, date: string): DailySemiReport {
  const cycleScore = clamp(ai.cycleScore, 0, 100);
  return {
    id: `daily-${date}`,
    type: "daily",
    accessLevel: "founding",
    title: ai.title,
    subtitle: ai.subtitle,
    date,
    generatedAt: new Date().toISOString(),
    cycleScore,
    cycleLabel: ai.cycleLabel || getCycleLabel(cycleScore),
    executiveSummary: ai.executiveSummary,
    metrics: ai.metrics.map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
      delta: m.delta,
      direction: m.direction,
      description: m.description,
    })),
    topChanges: ai.topSignals.map(toSignal),
    chainImpacts: ai.chainImpacts.map(toChainBlock),
    scenarios: ai.scenarios,
    risks: ai.risks.map(toSignal),
    watchlist: ai.watchlist,
    sources: ai.sources.map((s, i) => ({
      id: `src-ai-${i}`,
      title: s.title,
      publisher: s.publisher,
      url: s.url,
      publishedAt: s.publishedAt,
      sourceType: s.sourceType,
    })),
    disclaimer: REPORT_DISCLAIMER,
  };
}
