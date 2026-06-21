import "server-only";
import { randomUUID } from "node:crypto";
import { getRepository } from "../persistence";
import type { DailySemiReport } from "../lib/reportTypes";
import { sendDailyReportEmail } from "@/features/email/sendReportEmail";
import { unsubscribeUrl } from "@/features/subscribers/subscribe";

export type SendSummary = {
  reportSlug: string;
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  testTo?: string;
};

/**
 * Send a stored daily report. With `testEmail`, sends a single preview. Without
 * it, sends to all active subscribers — but only if the report is `approved`
 * (safety rule §12). Every attempt is logged as a ReportDelivery row.
 */
export async function sendDailyReport(
  slug: string,
  opts?: { testEmail?: string },
): Promise<SendSummary> {
  const repo = await getRepository();
  const record = await repo.reports.findBySlug(slug);
  if (!record) throw new Error(`Report not found: ${slug}`);
  const report = record.contentJson as DailySemiReport;

  // Single test send — bypasses approval, never touches the subscriber list.
  if (opts?.testEmail) {
    const out = await sendDailyReportEmail({
      to: opts.testEmail,
      report,
      slug,
      unsubscribeUrl: unsubscribeUrl("test-preview"),
    });
    return {
      reportSlug: slug,
      total: 1,
      sent: out.status === "sent" ? 1 : 0,
      failed: out.status === "failed" ? 1 : 0,
      skipped: out.status === "skipped" ? 1 : 0,
      testTo: opts.testEmail,
    };
  }

  if (record.status !== "approved" && record.status !== "sent") {
    throw new Error(
      "Report must be approved before sending to all subscribers",
    );
  }

  const subs = await repo.subscribers.listActive();
  let sent = 0,
    failed = 0,
    skipped = 0;

  for (const sub of subs) {
    const delivery = await repo.deliveries.create({
      id: randomUUID(),
      reportId: record.id,
      subscriberId: sub.id,
      email: sub.email,
      status: "pending",
      resendId: null,
      error: null,
      sentAt: null,
      createdAt: new Date().toISOString(),
    });
    const out = await sendDailyReportEmail({
      to: sub.email,
      report,
      slug,
      unsubscribeUrl: unsubscribeUrl(sub.unsubscribeTok),
    });
    await repo.deliveries.update(delivery.id, {
      status: out.status,
      resendId: out.resendId ?? null,
      error: out.error ?? null,
      sentAt: out.status === "sent" ? new Date().toISOString() : null,
    });
    if (out.status === "sent") sent++;
    else if (out.status === "failed") failed++;
    else skipped++;
  }

  await repo.reports.update(slug, {
    status: "sent",
    sentAt: new Date().toISOString(),
  });

  return { reportSlug: slug, total: subs.length, sent, failed, skipped };
}
