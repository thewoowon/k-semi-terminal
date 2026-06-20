import type { Metadata } from "next";
import type { DailySemiReport, WeeklySemiReport } from "./reportTypes";
import { dotDate } from "@/lib/formatDate";

/** Page metadata for a daily report (spec §6 reportSeo). */
export function dailyReportMetadata(report: DailySemiReport): Metadata {
  const title = `${report.title} | K-Semi Signal`;
  const description = report.subtitle;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

export function weeklyReportMetadata(report: WeeklySemiReport): Metadata {
  const title = `${report.title} | K-Semi Signal`;
  const description = report.subtitle;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}

/** Short, shareable thesis line for cards/og. */
export function reportShareLine(report: DailySemiReport): string {
  return `${dotDate(report.date)} · Cycle ${report.cycleScore} · ${report.cycleLabel}`;
}
