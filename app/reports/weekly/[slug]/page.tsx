import type { Metadata } from "next";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { WeeklyReportView } from "@/features/reports/components/WeeklyReportView";
import { CycleScoreBlock } from "@/features/reports/components/CycleScore";
import { FoundingReaderCTA } from "@/features/reports/components/FoundingReaderCTA";
import {
  findWeeklyReport,
  latestWeeklyReport,
  weeklyReportsSorted,
} from "@/features/reports/data/mockWeeklyReports";
import { weeklyReportMetadata } from "@/features/reports/lib/reportSeo";
import { dotRange } from "@/lib/formatDate";
import type { WeeklySemiReport } from "@/features/reports/lib/reportTypes";

export function generateStaticParams() {
  return [
    { slug: "latest" },
    ...weeklyReportsSorted.map((r) => ({ slug: r.slug })),
  ];
}

function resolve(slug: string): WeeklySemiReport {
  if (slug === "latest") return latestWeeklyReport;
  return findWeeklyReport(slug) ?? latestWeeklyReport;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return weeklyReportMetadata(resolve(slug));
}

export default async function WeeklyReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = resolve(slug);

  const right = (
    <>
      <div className="rounded-lg border border-line bg-panel/70 p-4">
        <CycleScoreBlock score={report.cycleScore} label="Weekly Regime" size="sm" />
      </div>

      <nav className="rounded-lg border border-line bg-panel/70 p-4">
        <div className="label-xs mb-2">Contents</div>
        <ul className="flex flex-col gap-0.5">
          {report.deepDiveSections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block truncate rounded px-2 py-1 text-[11.5px] text-ink-dim hover:bg-elevated/50 hover:text-ink"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <FoundingReaderCTA variant="inline" />
    </>
  );

  return (
    <ReportShell
      active="weekly"
      breadcrumb={[
        { label: "Reports", href: "/reports" },
        { label: "Weekly", href: "/reports/archive?tab=weekly" },
        { label: dotRange(report.weekStart, report.weekEnd) },
      ]}
      right={right}
    >
      <WeeklyReportView report={report} />
    </ReportShell>
  );
}
