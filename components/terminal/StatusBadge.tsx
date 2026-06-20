import { cn } from "@/lib/utils";
import type { SignalDirection } from "@/features/terminal/types";
import { arrow } from "@/features/terminal/lib/format";

const TONE: Record<SignalDirection, string> = {
  positive: "text-up border-up/30 bg-up/10",
  negative: "text-down border-down/30 bg-down/10",
  neutral: "text-flat border-line bg-elevated/60",
};

type DeltaPillProps = {
  direction: SignalDirection;
  children: React.ReactNode;
  showArrow?: boolean;
  className?: string;
};

/** Compact signed pill used for deltas/changes across the terminal. */
export function DeltaPill({
  direction,
  children,
  showArrow = true,
  className,
}: DeltaPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        TONE[direction],
        className,
      )}
    >
      {showArrow && <span className="text-[9px] leading-none">{arrow(direction)}</span>}
      {children}
    </span>
  );
}

type ScoreChipProps = {
  score: number;
  className?: string;
};

/** Score badge whose tint tracks the value. */
export function ScoreChip({ score, className }: ScoreChipProps) {
  const tone =
    score >= 72
      ? "text-hot border-hot/30 bg-hot/10"
      : score >= 58
        ? "text-up border-up/30 bg-up/10"
        : score >= 44
          ? "text-flat border-line bg-elevated/60"
          : "text-memory border-memory/30 bg-memory/10";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        tone,
        className,
      )}
    >
      {score.toFixed(0)}
    </span>
  );
}
