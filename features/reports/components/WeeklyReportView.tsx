import type { WeeklySemiReport } from "../lib/reportTypes";
import { dotDate, dotRange } from "@/lib/formatDate";
import { ReportSection } from "./ReportSection";
import { ReportSignalCard } from "./ReportSignalCard";
import { ReportChainImpact } from "./ReportChainImpact";
import { ReportScenarioBox } from "./ReportScenarioBox";
import { ReportRiskPanel } from "./ReportRiskPanel";
import { ReportSourceList } from "./ReportSourceList";
import { ReportDisclaimer } from "./ReportDisclaimer";
import { FoundingReaderCTA } from "./FoundingReaderCTA";
import { CycleScoreBlock } from "./CycleScore";
import { AccessBadge } from "./ReportBadges";

/** Full weekly deep dive — Pro-grade long-form (spec §9). */
export function WeeklyReportView({ report }: { report: WeeklySemiReport }) {
  return (
    <div className="flex flex-col gap-4">
      <header className="rounded-lg border border-line bg-panel/70 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-hbm">
            K-Semi Weekly Deep Dive
          </span>
          <AccessBadge level={report.accessLevel} />
          <span className="ml-auto font-mono text-[10.5px] text-ink-faint">
            {dotRange(report.weekStart, report.weekEnd)} · 발행 {dotDate(report.publishedAt)}
          </span>
        </div>
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">
          {report.title}
        </h1>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-dim">
          {report.subtitle}
        </p>
      </header>

      <ReportSection tag="Overview" title="Executive Summary">
        <div className="rounded-md border border-line bg-base/40 p-4">
          <CycleScoreBlock score={report.cycleScore} label="Weekly Regime" />
          <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">
            {report.executiveSummary}
          </p>
        </div>
      </ReportSection>

      <ReportSection
        tag="Ranking"
        title="Segment Strength Ranking"
        subtitle="세그먼트별 강도 순위"
      >
        <div className="grid gap-2 lg:grid-cols-2">
          {report.segmentScores.map((s, i) => (
            <ReportSignalCard key={s.id} signal={s} rank={i + 1} />
          ))}
        </div>
      </ReportSection>

      <FoundingReaderCTA variant="inline" />

      {/* deep dive long-form */}
      {report.deepDiveSections.map((sec) => (
        <ReportSection key={sec.id} id={sec.id} tag="Deep Dive" title={sec.title}>
          <p className="text-[13px] leading-[1.75] text-ink-dim">{sec.body}</p>
          {sec.keyTakeaways.length > 0 && (
            <div className="mt-3 rounded-md border border-line bg-base/40 p-3">
              <div className="label-xs mb-1.5">Key Takeaways</div>
              <ul className="flex flex-col gap-1">
                {sec.keyTakeaways.map((k, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-[12px] leading-snug text-ink"
                  >
                    <span className="mt-0.5 text-up">›</span>
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ReportSection>
      ))}

      <ReportSection tag="Chain" title="Weekly Chain Impact">
        <div className="flex flex-col gap-4">
          {report.chainImpacts.map((b, i) => (
            <ReportChainImpact key={i} block={b} />
          ))}
        </div>
      </ReportSection>

      <ReportSection tag="Scenario" title="Scenarios">
        <ReportScenarioBox scenarios={report.scenarios} />
      </ReportSection>

      <ReportSection tag="Risk" title="Risk & Contradiction">
        <ReportRiskPanel risks={report.risks} />
      </ReportSection>

      <ReportSection tag="Appendix" title="Sources">
        <ReportSourceList sources={report.sources} />
      </ReportSection>

      <ReportDisclaimer text={report.disclaimer} />
    </div>
  );
}
