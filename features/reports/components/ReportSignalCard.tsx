import { cn } from "@/lib/utils";
import type { ReportSignal } from "../lib/reportTypes";
import { SEGMENT_META } from "../constants/reportSegments";
import {
  ConfidenceDots,
  DirectionTag,
  SegmentTag,
  SignalScorePill,
} from "./ReportBadges";

/** Card for a ReportSignal — used in Top Changes and Risk Radar. */
export function ReportSignalCard({
  signal,
  rank,
  className,
}: {
  signal: ReportSignal;
  rank?: number;
  className?: string;
}) {
  const accent = SEGMENT_META[signal.segment].accentVar;
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-md border border-line bg-base/40 p-3",
        className,
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: accent }}
      />
      <div className="mb-1.5 flex items-start justify-between gap-2 pl-1.5">
        <div className="flex min-w-0 items-center gap-2">
          {rank !== undefined && (
            <span className="font-mono text-[11px] font-bold text-ink-faint">
              {String(rank).padStart(2, "0")}
            </span>
          )}
          <h4 className="truncate text-[13px] font-bold text-ink">
            {signal.title}
          </h4>
        </div>
        <SignalScorePill score={signal.score} />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 pl-1.5">
        <SegmentTag segment={signal.segment} />
        <DirectionTag direction={signal.direction} />
        <ConfidenceDots confidence={signal.confidence} />
      </div>

      <p className="pl-1.5 text-[12px] leading-relaxed text-ink-dim">
        {signal.summary}
      </p>

      {signal.rationale.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 pl-1.5">
          {signal.rationale.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-[11.5px] leading-snug text-ink-faint"
            >
              <span className="mt-0.5 text-ink-faint">·</span>
              {r}
            </li>
          ))}
        </ul>
      )}

      {(signal.relatedCompanies.length > 0 || signal.relatedEvents.length > 0) && (
        <div className="mt-2.5 flex flex-wrap gap-1 pl-1.5">
          {signal.relatedCompanies.map((c) => (
            <span
              key={c}
              className="rounded border border-line bg-elevated/60 px-1.5 py-0.5 text-[10px] text-ink-dim"
            >
              {c}
            </span>
          ))}
          {signal.relatedEvents.map((e) => (
            <span
              key={e}
              className="rounded border border-line/60 px-1.5 py-0.5 font-mono text-[9.5px] text-ink-faint"
            >
              {e}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
