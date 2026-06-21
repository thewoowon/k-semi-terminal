import type { Metadata } from "next";
import Link from "next/link";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { DailyReportView } from "@/features/reports/components/DailyReportView";
import { CycleScoreBlock } from "@/features/reports/components/CycleScore";
import { FoundingReaderCTA } from "@/features/reports/components/FoundingReaderCTA";
import { ReportFreshnessBar } from "@/features/reports/components/ReportFreshnessBar";
import { dailyReportsSorted } from "@/features/reports/data/mockDailyReports";
import { dailyReportMetadata } from "@/features/reports/lib/reportSeo";
import { getDailyReport } from "@/features/reports/services/getReport";
import { dotDate } from "@/lib/formatDate";

export function generateStaticParams() {
  return [
    { date: "latest" },
    ...dailyReportsSorted.map((r) => ({ date: r.date })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const { report } = await getDailyReport(date);
  return dailyReportMetadata(report);
}

export default async function DailyReportPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const { report, freshness } = await getDailyReport(date);
  const pdfHref = `/reports/daily/${report.date}/pdf`;

  const idx = dailyReportsSorted.findIndex((r) => r.date === report.date);
  const newer = idx > 0 ? dailyReportsSorted[idx - 1] : null;
  const older =
    idx >= 0 && idx < dailyReportsSorted.length - 1
      ? dailyReportsSorted[idx + 1]
      : null;

  const right = (
    <>
      <div className="rounded-lg border border-line bg-panel/70 p-4">
        <CycleScoreBlock score={report.cycleScore} label={report.cycleLabel} size="sm" />
        <div className="mt-3 flex flex-col divide-y divide-line/60">
          {report.metrics.slice(1, 5).map((m) => (
            <div key={m.id} className="flex items-center justify-between py-1.5">
              <span className="text-[11px] text-ink-dim">{m.label}</span>
              <span className="text-[12px] font-semibold tabular-nums text-ink">
                {m.value}
                {m.delta ? (
                  <span className="ml-1 text-[10px] text-ink-faint">{m.delta}</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-panel/70 p-4">
        <div className="label-xs mb-2">Watchlist</div>
        <div className="flex flex-wrap gap-1">
          {report.watchlist.map((w) => (
            <span
              key={w}
              className="rounded border border-line bg-elevated/50 px-1.5 py-0.5 text-[11px] text-ink-dim"
            >
              {w}
            </span>
          ))}
        </div>
        <Link
          href="/terminal"
          className="mt-3 flex items-center justify-center rounded-md border border-line bg-elevated px-3 py-2 text-[12px] font-semibold text-ink hover:border-line-strong"
        >
          터미널에서 체인 보기 →
        </Link>
      </div>

      <FoundingReaderCTA variant="inline" />
    </>
  );

  return (
    <ReportShell
      active="reports"
      breadcrumb={[
        { label: "Reports", href: "/reports" },
        { label: "Daily", href: "/reports/archive?tab=daily" },
        { label: dotDate(report.date) },
      ]}
      right={right}
    >
      <div className="mb-4">
        <ReportFreshnessBar freshness={freshness} pdfHref={pdfHref} />
      </div>
      <DailyReportView report={report} />

      {/* prev / next */}
      <nav className="mt-4 flex items-center justify-between gap-2">
        {older ? (
          <Link
            href={`/reports/daily/${older.date}`}
            className="rounded-md border border-line bg-panel/60 px-3 py-2 text-[12px] text-ink-dim hover:text-ink"
          >
            ← {dotDate(older.date)}
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link
            href={`/reports/daily/${newer.date}`}
            className="rounded-md border border-line bg-panel/60 px-3 py-2 text-[12px] text-ink-dim hover:text-ink"
          >
            {dotDate(newer.date)} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </ReportShell>
  );
}
