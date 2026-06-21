import { isAdmin, unauthorized } from "@/lib/apiAuth";
import { generateDailyReportJob } from "@/features/reports/jobs/generateDailyReportJob";
import { captureError } from "@/lib/observability";
import { todayKst } from "@/lib/formatDate";

/** Admin-triggered report generation (launch checklist §7). */
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const date = typeof body.date === "string" ? body.date : todayKst();
  try {
    const result = await generateDailyReportJob({ date });
    return Response.json(result, { status: result.ok ? 200 : 500 });
  } catch (e) {
    await captureError(e, { route: "reports/generate", date });
    return Response.json({ ok: false, error: "generation failed" }, { status: 500 });
  }
}
