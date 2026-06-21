import "server-only";
import { getRepository } from "../persistence";
import type { ReportRecord } from "../persistence/types";
import type { DailySemiReport } from "../lib/reportTypes";
import { toEmailHtml, toEmailMarkdown } from "../lib/reportFormatter";

export type ReportMeta = {
  source: "claude" | "mock";
  model: string;
  sourceCount: number;
  dataCutoff: string;
};

/** Persist a generated daily report (status `generated`). Idempotent by date. */
export async function createDailyReport(
  report: DailySemiReport,
  meta: ReportMeta,
): Promise<ReportRecord> {
  const repo = await getRepository();
  const nowIso = new Date().toISOString();
  const record: ReportRecord = {
    id: report.id,
    type: "daily",
    slug: report.date,
    title: report.title,
    subtitle: report.subtitle,
    date: report.date,
    status: "generated",
    accessLevel: report.accessLevel,
    cycleScore: report.cycleScore,
    contentJson: report,
    html: toEmailHtml(report),
    markdown: toEmailMarkdown(report),
    pdfUrl: `/reports/daily/${report.date}/pdf`,
    sourceSnapshot: meta,
    generatedAt: report.generatedAt ?? nowIso,
    approvedAt: null,
    sentAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  return repo.reports.upsertBySlug(record);
}
