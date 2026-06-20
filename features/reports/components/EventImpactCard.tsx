import type { EventImpactCardData } from "../lib/reportTypes";
import { SEGMENT_META } from "../constants/reportSegments";
import { ConfidenceDots } from "./ReportBadges";

/** Event-to-impact interpretation card (spec §21). */
export function EventImpactCard({ data }: { data: EventImpactCardData }) {
  return (
    <article className="rounded-lg border border-line bg-panel/70 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="label-xs mb-1">Event → Impact</div>
          <h3 className="text-[14px] font-bold leading-tight text-ink">
            {data.eventTitle}
          </h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[20px] font-bold tabular-nums text-up">
            {data.impactScore >= 0 ? "+" : ""}
            {data.impactScore}
          </span>
          <ConfidenceDots confidence={data.confidence} />
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-ink-dim">
        {data.eventSummary}
      </p>

      {/* chain */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {data.chain.map((step, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[11px] text-ink-faint">→</span>}
            <span className="rounded border border-line bg-base/50 px-1.5 py-0.5 text-[11px] text-ink">
              {step}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="label-xs mb-1.5">Affected Segments</div>
          <div className="flex flex-wrap gap-1">
            {data.affectedSegments.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded border border-line bg-elevated/50 px-1.5 py-0.5 text-[10px] text-ink-dim"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: SEGMENT_META[s].accentVar }}
                />
                {SEGMENT_META[s].short}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="label-xs mb-1.5">Affected Companies</div>
          <div className="flex flex-wrap gap-1">
            {data.affectedCompanies.map((c) => (
              <span
                key={c}
                className="rounded border border-line bg-elevated/50 px-1.5 py-0.5 text-[10px] text-ink-dim"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {data.counterpoints.length > 0 && (
        <div className="mt-3 rounded-md border border-down/25 bg-down/[0.05] p-2.5">
          <div className="label-xs mb-1 text-down/80">Counterpoints</div>
          <ul className="flex flex-col gap-1">
            {data.counterpoints.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-dim"
              >
                <span className="mt-0.5 text-down">·</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
