import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { DailyReportPdf } from "./DailyReportPdf";
import type { DailySemiReport } from "@/features/reports/lib/reportTypes";

/** Render a daily report to a PDF buffer (checklist §11, Option A: @react-pdf). */
export async function renderDailyReportPdf(
  report: DailySemiReport,
): Promise<Uint8Array> {
  // DailyReportPdf returns a react element; renderToBuffer accepts it directly.
  return renderToBuffer(DailyReportPdf({ report }));
}
