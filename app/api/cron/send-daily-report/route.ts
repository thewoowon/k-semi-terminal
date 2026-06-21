import { isCron, unauthorized } from "@/lib/apiAuth";
import { sendDailyReportJob } from "@/features/reports/jobs/sendDailyReportJob";
import { captureError } from "@/lib/observability";

// Daily send cron (launch checklist §8.1 — 0 22 * * * UTC = 07:00 KST).
// Only sends if the latest report is approved; otherwise returns ok:false.
export async function GET(req: Request) {
  if (!isCron(req)) return unauthorized();
  try {
    const result = await sendDailyReportJob();
    return Response.json(result);
  } catch (e) {
    await captureError(e, { route: "cron/send-daily-report" });
    return Response.json({ ok: false, error: "send failed" }, { status: 500 });
  }
}
