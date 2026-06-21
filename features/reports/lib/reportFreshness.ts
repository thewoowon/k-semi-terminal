import type { ReportRecord } from "../persistence/types";
import type { DailySemiReport, WeeklySemiReport } from "./reportTypes";

/** Data-freshness indicators shown on every report (launch checklist §13). */
export type ReportFreshness = {
  generatedAt: string | null;
  dataCutoffAt: string | null;
  sourceCount: number | null;
  model: string;
  status: string;
  mode: string;
};

type Snapshot = {
  model?: string;
  sourceCount?: number;
  dataCutoff?: string;
  source?: "claude" | "mock";
};

/** Freshness for a stored (generated) report. */
export function buildFreshness(record: ReportRecord): ReportFreshness {
  const snap = (record.sourceSnapshot ?? {}) as Snapshot;
  return {
    generatedAt: record.generatedAt,
    dataCutoffAt: snap.dataCutoff ?? null,
    sourceCount: snap.sourceCount ?? null,
    model:
      snap.source === "claude"
        ? `Claude · ${snap.model ?? "structured generation"}`
        : "Rule-based generation",
    status: record.status,
    mode: "Founding Reader Access",
  };
}

/** Freshness for a bundled sample report (no DB record). */
export function mockFreshness(
  report: DailySemiReport | WeeklySemiReport,
): ReportFreshness {
  const generatedAt =
    report.type === "daily" ? report.generatedAt : report.publishedAt;
  return {
    generatedAt,
    dataCutoffAt: generatedAt,
    sourceCount: report.sources.length,
    model: "Sample · pre-launch",
    status: "sample",
    mode: "Founding Reader Access",
  };
}
