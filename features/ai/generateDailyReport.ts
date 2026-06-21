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
import { companies } from "@/features/terminal/data/mockCompanies";
import { getMemoryBoard } from "@/features/terminal/data/memoryPriceStore";
import {
  fetchKospi,
  fetchUsdKrw,
  fetchSox,
  fetchDomesticDaily,
} from "@/features/terminal/lib/kis";
import { fetchDartDisclosures } from "@/features/terminal/lib/dart";
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

/**
 * Trim the terminal snapshot into a grounding payload for the model, enriched
 * with live data where we have it: market status + Korea company momentum from
 * KIS, memory prices from the admin board. Cycle/segments/events stay mock (no
 * live source yet). Every live fetch fails soft to the mock value, and the
 * payload marks each block's source so the model knows what is real.
 */
async function buildSnapshot() {
  const s = terminalSnapshot;

  const [memBoard, kospi, usdkrw, sox, dartEvents] = await Promise.all([
    getMemoryBoard(),
    features.marketData ? fetchKospi() : Promise.resolve(null),
    features.marketData ? fetchUsdKrw() : Promise.resolve(null),
    features.marketData ? fetchSox() : Promise.resolve(null),
    features.dart ? fetchDartDisclosures() : Promise.resolve(null),
  ]);
  const coQuotes = features.marketData
    ? await Promise.all(companies.map((c) => fetchDomesticDaily(c.ticker)))
    : companies.map(() => null);

  // Live DART disclosures replace the mock disclosure events; other event types
  // (news/earnings/export/price) have no live feed and stay mock.
  const eventList = dartEvents
    ? [...dartEvents, ...s.events.filter((e) => e.type !== "disclosure")]
    : s.events;

  const anyLive = Boolean(
    kospi || usdkrw || sox || coQuotes.some(Boolean) || dartEvents,
  );

  return {
    asOf: anyLive ? new Date().toISOString() : s.marketStatus.asOf,
    dataMode: anyLive ? "live (KIS) + model" : "mock",
    marketStatus: {
      kospi: kospi?.value ?? s.marketStatus.kospi,
      kospiChangePct: kospi?.changePct ?? s.marketStatus.kospiChange,
      usdkrw: usdkrw?.value ?? s.marketStatus.usdkrw,
      sox: sox?.value ?? null,
      soxChangePct: sox?.changePct ?? null,
      live: Boolean(kospi || usdkrw || sox),
    },
    cycle: { score: s.cycle.score, regime: s.cycle.regime, reads: s.cycle.reads, source: "model/mock" },
    memory: {
      source: memBoard.source,
      asOf: memBoard.asOf,
      quotes: memBoard.quotes.map((m) => ({
        item: m.item,
        category: m.category,
        market: m.market,
        current: m.current,
        changePct: m.changePct,
        unit: m.unit,
      })),
    },
    koreaCompanies: companies.map((c, i) => {
      const q = coQuotes[i];
      return {
        ticker: c.ticker,
        name: c.name,
        segment: c.segment,
        price: q?.price ?? c.price,
        change1d: q?.change1d ?? c.change1d,
        change5d: q?.change5d ?? c.change5d,
        change20d: q?.change20d ?? c.change20d,
        signalScore: c.signalScore,
        live: Boolean(q),
      };
    }),
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
    events: eventList.map((e) => ({
      type: e.type,
      title: e.title,
      sentiment: e.sentiment,
      source: e.sourceName,
    })),
  };
}

export async function generateDailyReport(date: string): Promise<GenerateResult> {
  const snapshot = await buildSnapshot();
  const dataCutoff = snapshot.asOf;
  const sourceCount = snapshot.events.length + snapshot.memory.quotes.length;

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
