import { isAdmin, unauthorized } from "@/lib/apiAuth";
import { approveReport } from "@/features/reports/services/approveReport";
import { sendDailyReport } from "@/features/reports/services/sendReport";
import { captureError } from "@/lib/observability";

/**
 * Admin report workflow (launch checklist §12). Actions:
 *   { action: "approve", slug }
 *   { action: "test",    slug, testEmail }
 *   { action: "send",    slug }   // requires approved status
 */
export async function POST(req: Request) {
  if (!isAdmin(req)) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = typeof body.slug === "string" ? body.slug : "";
  const action = typeof body.action === "string" ? body.action : "";
  const testEmail = typeof body.testEmail === "string" ? body.testEmail : "";

  if (!slug) return Response.json({ error: "slug required" }, { status: 400 });

  try {
    if (action === "approve") {
      const report = await approveReport(slug);
      if (!report) return Response.json({ error: "not found" }, { status: 404 });
      return Response.json({ ok: true, status: report.status });
    }
    if (action === "test") {
      if (!testEmail)
        return Response.json({ error: "testEmail required" }, { status: 400 });
      const summary = await sendDailyReport(slug, { testEmail });
      return Response.json({ ok: true, ...summary });
    }
    if (action === "send") {
      const summary = await sendDailyReport(slug);
      return Response.json({ ok: true, ...summary });
    }
    return Response.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    // Expected business errors (e.g. "must be approved") return 400.
    const message = e instanceof Error ? e.message : "send failed";
    if (/approved|not found/i.test(message)) {
      return Response.json({ ok: false, error: message }, { status: 400 });
    }
    await captureError(e, { route: "reports/send", slug, action });
    return Response.json({ ok: false, error: "send failed" }, { status: 500 });
  }
}
