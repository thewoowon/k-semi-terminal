import { cn } from "@/lib/utils";
import type {
  ConfidenceLevel,
  ReportAccessLevel,
  SemiSegment,
  SignalDirection,
} from "../lib/reportTypes";
import { ACCESS_BADGE } from "../lib/reportAccess";
import { CONFIDENCE_META, DIRECTION_META } from "../constants/reportLabels";
import { SEGMENT_META } from "../constants/reportSegments";

const ACCESS_TONE: Record<string, string> = {
  founding: "text-hot border-hot/40 bg-hot/10",
  pro: "text-hbm border-hbm/40 bg-hbm/10",
  research: "text-memory border-memory/40 bg-memory/10",
  public: "text-flat border-line bg-elevated/60",
};

export function AccessBadge({
  level,
  className,
}: {
  level: ReportAccessLevel;
  className?: string;
}) {
  const meta = ACCESS_BADGE[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
        ACCESS_TONE[meta.tone],
        className,
      )}
    >
      {meta.tone === "founding" && <span className="text-[8px]">★</span>}
      {meta.label}
    </span>
  );
}

export function SegmentTag({
  segment,
  className,
}: {
  segment: SemiSegment;
  className?: string;
}) {
  const meta = SEGMENT_META[segment];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-line bg-base/50 px-1.5 py-0.5 text-[10px] text-ink-dim",
        className,
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: meta.accentVar }}
      />
      {meta.short}
    </span>
  );
}

export function DirectionTag({
  direction,
  className,
}: {
  direction: SignalDirection;
  className?: string;
}) {
  const meta = DIRECTION_META[direction];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        meta.textClass,
        className,
      )}
    >
      <span className="text-[9px]">{meta.arrow}</span>
      {meta.label}
    </span>
  );
}

export function ConfidenceDots({
  confidence,
  className,
}: {
  confidence: ConfidenceLevel;
  className?: string;
}) {
  const { label, dots } = CONFIDENCE_META[confidence];
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              i < dots ? "bg-ink-dim" : "bg-elevated",
            )}
          />
        ))}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
        {label}
      </span>
    </span>
  );
}

/** Signed signal score pill (-100..100), tinted by direction. */
export function SignalScorePill({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const tone =
    score > 8
      ? "text-up border-up/30 bg-up/10"
      : score < -8
        ? "text-down border-down/30 bg-down/10"
        : "text-flat border-line bg-elevated/60";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
        tone,
        className,
      )}
    >
      {score >= 0 ? "+" : ""}
      {score}
    </span>
  );
}
