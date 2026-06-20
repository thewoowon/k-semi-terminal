import type {
  DailySemiReport,
  EventImpactCardData,
  SemiSegment,
} from "../lib/reportTypes";
import { dotDateWithDay, kstTime } from "@/lib/formatDate";
import { SEGMENT_META } from "../constants/reportSegments";
import { DIRECTION_META } from "../constants/reportLabels";
import { directionFromScore } from "../lib/reportScoring";
import { ReportSection } from "./ReportSection";
import { ReportMetricStrip } from "./ReportMetricStrip";
import { ReportSignalCard } from "./ReportSignalCard";
import { ReportChainImpact } from "./ReportChainImpact";
import { ReportScenarioBox } from "./ReportScenarioBox";
import { ReportRiskPanel } from "./ReportRiskPanel";
import { ReportSourceList } from "./ReportSourceList";
import { EventImpactCard } from "./EventImpactCard";
import { ReportDisclaimer } from "./ReportDisclaimer";
import { FoundingReaderCTA } from "./FoundingReaderCTA";
import { CycleScoreBlock } from "./CycleScore";
import { AccessBadge } from "./ReportBadges";

/** Derive a Segment Watch summary from the report's signals. */
function segmentWatch(report: DailySemiReport) {
  const map = new Map<SemiSegment, number>();
  for (const s of [...report.topChanges, ...report.risks]) {
    map.set(s.segment, (map.get(s.segment) ?? 0) + s.score);
  }
  return [...map.entries()]
    .map(([segment, net]) => ({ segment, net }))
    .sort((a, b) => b.net - a.net);
}

/** Build an EventImpactCard from the first chain block + risks (spec §21). */
function deriveEventImpact(report: DailySemiReport): EventImpactCardData | null {
  const block = report.chainImpacts[0];
  if (!block) return null;
  const companies = block.nodes
    .filter((n) => n.type === "korean-company")
    .map((n) => n.label);
  const segments = [...new Set(report.topChanges.map((s) => s.segment))];
  return {
    eventTitle: block.title,
    eventSummary: block.summary,
    impactScore: block.nodes[0]?.impactScore ?? 0,
    confidence: "high",
    chain: block.nodes.map((n) => n.label),
    affectedSegments: segments,
    affectedCompanies: companies,
    counterpoints: report.risks.slice(0, 2).map((r) => r.summary),
  };
}

/** Full daily report body — reused by the page and the admin preview. */
export function DailyReportView({ report }: { report: DailySemiReport }) {
  const watch = segmentWatch(report);
  const eventImpact = deriveEventImpact(report);

  return (
    <div className="flex flex-col gap-4">
      {/* header */}
      <header className="rounded-lg border border-line bg-panel/70 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-up">
            K-Semi Morning Brief
          </span>
          <AccessBadge level={report.accessLevel} />
          <span className="ml-auto font-mono text-[10.5px] text-ink-faint">
            {dotDateWithDay(report.date)} · {kstTime(report.generatedAt)} KST 생성
          </span>
        </div>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ink sm:text-[26px]">
          {report.title}
        </h1>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-dim">
          {report.subtitle}
        </p>
      </header>

      {/* temperature */}
      <ReportSection
        tag="Section 02"
        title="Today's Semiconductor Temperature"
        subtitle="K-Semi Cycle Score 및 핵심 모멘텀 지표"
      >
        <div className="mb-4 rounded-md border border-line bg-base/40 p-4">
          <CycleScoreBlock score={report.cycleScore} label={report.cycleLabel} />
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-dim">
            {report.executiveSummary}
          </p>
        </div>
        <ReportMetricStrip metrics={report.metrics} />
      </ReportSection>

      {/* top changes */}
      <ReportSection
        tag="Section 03"
        title="Top Signal Changes"
        subtitle="어제 대비 가장 큰 변화"
      >
        <div className="grid gap-2 lg:grid-cols-2">
          {report.topChanges.map((s, i) => (
            <ReportSignalCard key={s.id} signal={s} rank={i + 1} />
          ))}
        </div>
      </ReportSection>

      <FoundingReaderCTA variant="inline" />

      {/* chain impact */}
      <ReportSection
        tag="Section 04"
        title="Chain Impact"
        subtitle="이벤트 → 글로벌 체인 → 한국 밸류체인 → 종목 영향"
      >
        <div className="flex flex-col gap-4">
          {report.chainImpacts.map((b, i) => (
            <ReportChainImpact key={i} block={b} />
          ))}
          {eventImpact && (
            <div className="border-t border-line pt-4">
              <EventImpactCard data={eventImpact} />
            </div>
          )}
        </div>
      </ReportSection>

      {/* segment watch */}
      <ReportSection
        tag="Section 05"
        title="Segment Watch"
        subtitle="세그먼트별 신호 강도"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {watch.map(({ segment, net }) => {
            const dir = DIRECTION_META[directionFromScore(net)];
            return (
              <div
                key={segment}
                className="flex items-center gap-2 rounded-md border border-line bg-base/40 px-2.5 py-2"
              >
                <span
                  className="h-6 w-[3px] shrink-0 rounded-full"
                  style={{ background: SEGMENT_META[segment].accentVar }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-ink">
                    {SEGMENT_META[segment].label}
                  </div>
                  <div className={`text-[10.5px] ${dir.textClass}`}>
                    {dir.arrow} net {net >= 0 ? "+" : ""}
                    {net}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ReportSection>

      {/* risk */}
      <ReportSection
        tag="Section 06"
        title="Risk Radar"
        subtitle="가격 피크아웃 · 재고 · CapEx · 규제 · 중국 가격 · 매크로"
      >
        <ReportRiskPanel risks={report.risks} />
      </ReportSection>

      {/* scenarios */}
      <ReportSection
        tag="Section 07"
        title="Scenario"
        subtitle="Bull / Base / Bear · 확률 기반 해석"
      >
        <ReportScenarioBox scenarios={report.scenarios} />
      </ReportSection>

      {/* sources */}
      <ReportSection tag="Section 08" title="Sources">
        <ReportSourceList sources={report.sources} />
      </ReportSection>

      <ReportDisclaimer text={report.disclaimer} />
    </div>
  );
}
