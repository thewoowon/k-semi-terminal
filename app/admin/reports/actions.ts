"use server";

import { generateDailyReportJob } from "@/features/reports/jobs/generateDailyReportJob";
import { approveReport } from "@/features/reports/services/approveReport";
import { sendDailyReport } from "@/features/reports/services/sendReport";
import { getRepository } from "@/features/reports/persistence";
import { todayKst } from "@/lib/formatDate";
import type { DailySemiReport } from "@/features/reports/lib/reportTypes";
import { captureError } from "@/lib/observability";

/*
 * Admin report workflow as Server Actions (launch checklist §12). Phase 0 runs
 * without authentication per spec — the page is noindex and unlinked. External
 * automation uses the secret-protected /api/reports/* routes instead.
 */

export type ReportSummary = {
  slug: string;
  date: string;
  title: string;
  status: string;
  cycleScore: number | null;
  source: string;
  generatedAt: string | null;
  approvedAt: string | null;
  sentAt: string | null;
};

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export async function actionGenerate(date: string) {
  return generateDailyReportJob({ date: date || todayKst() });
}

export async function actionApprove(slug: string) {
  const r = await approveReport(slug);
  return { ok: Boolean(r), status: r?.status ?? null };
}

export async function actionTest(slug: string, email: string) {
  try {
    const summary = await sendDailyReport(slug, { testEmail: email });
    return { ok: true as const, ...summary };
  } catch (e) {
    await captureError(e, { action: "test-send", slug });
    return { ok: false as const, error: msg(e) };
  }
}

export async function actionSendAll(slug: string) {
  try {
    const summary = await sendDailyReport(slug);
    return { ok: true as const, ...summary };
  } catch (e) {
    return { ok: false as const, error: msg(e) };
  }
}

export async function actionListReports(): Promise<ReportSummary[]> {
  const repo = await getRepository();
  const rows = await repo.reports.list("daily");
  return rows.map((r) => {
    const snap = (r.sourceSnapshot ?? {}) as { source?: string };
    return {
      slug: r.slug,
      date: r.date,
      title: r.title,
      status: r.status,
      cycleScore: r.cycleScore,
      source: snap.source ?? "—",
      generatedAt: r.generatedAt,
      approvedAt: r.approvedAt,
      sentAt: r.sentAt,
    };
  });
}

export async function actionGetReport(
  slug: string,
): Promise<DailySemiReport | null> {
  const repo = await getRepository();
  const r = await repo.reports.findBySlug(slug);
  return r ? (r.contentJson as DailySemiReport) : null;
}

export async function actionStats() {
  const repo = await getRepository();
  return {
    backend: repo.backend,
    activeSubscribers: await repo.subscribers.count("active"),
    totalSubscribers: await repo.subscribers.count(),
  };
}
