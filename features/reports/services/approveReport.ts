import "server-only";
import { getRepository } from "../persistence";
import type { ReportRecord } from "../persistence/types";

/** Move a report to `approved` (required before a full subscriber send, §12). */
export async function approveReport(slug: string): Promise<ReportRecord | null> {
  const repo = await getRepository();
  return repo.reports.update(slug, {
    status: "approved",
    approvedAt: new Date().toISOString(),
  });
}
