import "server-only";
import { getRepository } from "../persistence";
import { sendDailyReport, type SendSummary } from "../services/sendReport";

export type SendJobResult =
  | ({ ok: true } & SendSummary)
  | { ok: false; error: string };

/**
 * Send the latest (or a specified) daily report to all active subscribers.
 * Only `approved` reports send — otherwise this returns an error so the cron
 * never auto-blasts an unreviewed report (safety rule §12).
 */
export async function sendDailyReportJob(opts?: {
  date?: string;
}): Promise<SendJobResult> {
  try {
    const repo = await getRepository();
    const slug = opts?.date ?? (await repo.reports.latest("daily"))?.slug;
    if (!slug) return { ok: false, error: "No daily report available to send" };
    const summary = await sendDailyReport(slug);
    return { ok: true, ...summary };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
