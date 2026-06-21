import { getDailyReport } from "@/features/reports/services/getReport";
import { renderDailyReportPdf } from "@/features/pdf/renderReportPdf";
import { captureError } from "@/lib/observability";

// On-demand PDF (launch checklist §11 — link, not attachment). Renders from the
// stored report JSON (or the bundled sample when no DB record exists).
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ date: string }> },
) {
  const { date } = await ctx.params;
  try {
    const { report } = await getDailyReport(date);
    const pdf = await renderDailyReportPdf(report);
    return new Response(pdf as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="k-semi-${report.date}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    await captureError(e, { route: "daily-pdf", date });
    return Response.json(
      { error: "PDF를 생성할 수 없습니다." },
      { status: 503 },
    );
  }
}
