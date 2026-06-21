import { isCron, unauthorized } from "@/lib/apiAuth";
import { generateDailyReportJob } from "@/features/reports/jobs/generateDailyReportJob";
import { captureError } from "@/lib/observability";
import { todayKst } from "@/lib/formatDate";

// Daily generation cron (launch checklist §8.1 — 30 21 * * * UTC = 06:30 KST).
export async function GET(req: Request) {
  if (!isCron(req)) return unauthorized();
  const date = todayKst();
  try {
    const result = await generateDailyReportJob({ date });
    return Response.json(result, { status: result.ok ? 200 : 500 });
  } catch (e) {
    await captureError(e, { route: "cron/generate-daily-report", date });
    return Response.json({ ok: false, error: "generation failed" }, { status: 500 });
  }
}
