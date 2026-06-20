import type { Metadata } from "next";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { ReportHero } from "@/features/reports/components/ReportHero";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { ReportList } from "@/features/reports/components/ReportList";
import { FoundingReaderCTA } from "@/features/reports/components/FoundingReaderCTA";
import { ReportSection } from "@/features/reports/components/ReportSection";
import {
  dailyReportsSorted,
  latestDailyReport,
} from "@/features/reports/data/mockDailyReports";
import {
  latestWeeklyReport,
  weeklyReportsSorted,
} from "@/features/reports/data/mockWeeklyReports";

export const metadata: Metadata = {
  title: "K-Semi Signal — Reports",
  description:
    "한국 반도체 밸류체인을 매일 해석하는 K-Semi Signal 리포트 허브. Daily Morning Brief와 Weekly Deep Dive.",
};

export default function ReportsHubPage() {
  const recent = [...dailyReportsSorted.slice(1, 4), ...weeklyReportsSorted.slice(1)];

  return (
    <ReportShell active="reports">
      <div className="flex flex-col gap-5">
        <ReportHero />

        {/* featured latest */}
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[13px] font-bold tracking-tight text-ink">
              Latest Reports
            </h2>
            <span className="font-mono text-[10px] text-ink-faint">
              Founding Access · 무료
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ReportCard report={latestDailyReport} feature />
            <ReportCard report={latestWeeklyReport} feature />
          </div>
        </section>

        {/* archive preview */}
        <ReportSection
          tag="Archive"
          title="최근 리포트"
          right={
            <a
              href="/reports/archive"
              className="rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink-dim hover:text-ink"
            >
              전체 아카이브 →
            </a>
          }
        >
          <ReportList reports={recent} />
        </ReportSection>

        <FoundingReaderCTA variant="hero" />
      </div>
    </ReportShell>
  );
}
