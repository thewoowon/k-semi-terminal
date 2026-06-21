import type { Metadata } from "next";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { WeeklyReportView } from "@/features/reports/components/WeeklyReportView";
import { CycleScoreBlock } from "@/features/reports/components/CycleScore";
import { FoundingReaderCTA } from "@/features/reports/components/FoundingReaderCTA";
import { ReportFreshnessBar } from "@/features/reports/components/ReportFreshnessBar";
import { weeklyReportsSorted } from "@/features/reports/data/mockWeeklyReports";
import { weeklyReportMetadata } from "@/features/reports/lib/reportSeo";
import { getWeeklyReport } from "@/features/reports/services/getReport";
import { dotRange } from "@/lib/formatDate";

export function generateStaticParams() {
  return [
    { slug: "latest" },
    ...weeklyReportsSorted.map((r) => ({ slug: r.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { report } = await getWeeklyReport(slug);
  return weeklyReportMetadata(report);
}

export default async function WeeklyReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { report, freshness } = await getWeeklyReport(slug);

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
      <div className="mb-4">
        <ReportFreshnessBar freshness={freshness} />
      </div>
      <WeeklyReportView report={report} />
    </ReportShell>
  );
}
