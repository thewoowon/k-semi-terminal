import "server-only";
import { getRepository } from "../persistence";
import type { ReportRecord } from "../persistence/types";
import type { DailySemiReport, WeeklySemiReport } from "../lib/reportTypes";
import {
  findDailyReport,
  latestDailyReport,
} from "../data/mockDailyReports";
import {
  findWeeklyReport,
  latestWeeklyReport,
} from "../data/mockWeeklyReports";
import {
  buildFreshness,
  mockFreshness,
  type ReportFreshness,
} from "../lib/reportFreshness";

export type DailyResolved = {
  report: DailySemiReport;
  record: ReportRecord | null;
  freshness: ReportFreshness;
};

export type WeeklyResolved = {
  report: WeeklySemiReport;
  record: ReportRecord | null;
  freshness: ReportFreshness;
};

/** Resolve a daily report: stored (DB) first, then bundled sample. */
export async function getDailyReport(slug: string): Promise<DailyResolved> {
  const repo = await getRepository();
  const record =
    slug === "latest"
      ? await repo.reports.latest("daily")
      : await repo.reports.findBySlug(slug);

  if (record && record.type === "daily") {
    return {
      report: record.contentJson as DailySemiReport,
      record,
      freshness: buildFreshness(record),
    };
  }

  const sample =
    slug === "latest" ? latestDailyReport : findDailyReport(slug) ?? latestDailyReport;
  return { report: sample, record: null, freshness: mockFreshness(sample) };
}

/** Resolve a weekly report: stored (DB) first, then bundled sample. */
export async function getWeeklyReport(slug: string): Promise<WeeklyResolved> {
  const repo = await getRepository();
  const record =
    slug === "latest"
      ? await repo.reports.latest("weekly")
      : await repo.reports.findBySlug(slug);

  if (record && record.type === "weekly") {
    return {
      report: record.contentJson as WeeklySemiReport,
      record,
      freshness: buildFreshness(record),
    };
  }

  const sample =
    slug === "latest" ? latestWeeklyReport : findWeeklyReport(slug) ?? latestWeeklyReport;
  return { report: sample, record: null, freshness: mockFreshness(sample) };
}
