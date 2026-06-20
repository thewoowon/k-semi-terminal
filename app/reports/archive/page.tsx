import type { Metadata } from "next";
import Link from "next/link";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { ReportList } from "@/features/reports/components/ReportList";
import { cn } from "@/lib/utils";
import { dailyReportsSorted } from "@/features/reports/data/mockDailyReports";
import { weeklyReportsSorted } from "@/features/reports/data/mockWeeklyReports";
import type { AnyReport } from "@/features/reports/lib/reportTypes";

export const metadata: Metadata = {
  title: "Report Archive | K-Semi Signal",
  description: "K-Semi Signal Daily / Weekly 리포트 아카이브.",
};

const TABS = [
  { key: "all", label: "All" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
] as const;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = TABS.some((t) => t.key === tab) ? (tab as string) : "all";

  let reports: AnyReport[];
  if (active === "daily") reports = dailyReportsSorted;
  else if (active === "weekly") reports = weeklyReportsSorted;
  else reports = [...weeklyReportsSorted, ...dailyReportsSorted];

  return (
    <ReportShell
      active="archive"
      breadcrumb={[{ label: "Reports", href: "/reports" }, { label: "Archive" }]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-ink">
              Report Archive
            </h1>
            <p className="mt-1 text-[12.5px] text-ink-dim">
              모든 Daily Brief와 Weekly Deep Dive. Founding 기간 동안 전문 무료.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-line bg-panel/60 p-1">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={t.key === "all" ? "/reports/archive" : `/reports/archive?tab=${t.key}`}
                className={cn(
                  "rounded px-2.5 py-1 text-[12px] font-medium transition-colors",
                  active === t.key
                    ? "bg-elevated text-ink"
                    : "text-ink-dim hover:text-ink",
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        <ReportList reports={reports} />
      </div>
    </ReportShell>
  );
}
