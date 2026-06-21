import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { dailyReportsSorted } from "@/features/reports/data/mockDailyReports";
import { weeklyReportsSorted } from "@/features/reports/data/mockWeeklyReports";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.appUrl;
  const staticPaths = [
    "/terminal",
    "/reports",
    "/reports/archive",
    "/subscribe",
    "/disclaimer",
    "/privacy",
    "/terms",
    "/contact",
  ];

  return [
    { url: base, priority: 1 },
    ...staticPaths.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...dailyReportsSorted.map((r) => ({
      url: `${base}/reports/daily/${r.date}`,
      lastModified: r.generatedAt,
      priority: 0.6,
    })),
    ...weeklyReportsSorted.map((r) => ({
      url: `${base}/reports/weekly/${r.slug}`,
      lastModified: r.publishedAt,
      priority: 0.6,
    })),
  ];
}
