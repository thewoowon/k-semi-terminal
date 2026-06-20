import { cn } from "@/lib/utils";
import { cycleTone } from "../lib/reportScoring";

const TONE_VAR: Record<string, string> = {
  hot: "var(--color-hot)",
  warm: "var(--color-warm)",
  up: "var(--color-up)",
  flat: "var(--color-flat)",
  memory: "var(--color-memory)",
};

/** Big K-Semi Cycle Score readout with regime label + tone bar. */
export function CycleScoreBlock({
  score,
  label,
  size = "md",
  className,
}: {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const color = TONE_VAR[cycleTone(score)];
  const num =
    size === "lg" ? "text-[52px]" : size === "sm" ? "text-[26px]" : "text-[38px]";
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="label-xs mb-1">K-Semi Cycle Score</span>
      <div className="flex items-end gap-2">
        <span
          className={cn("font-bold leading-none tabular-nums", num)}
          style={{ color }}
        >
          {score}
        </span>
        <span className="mb-1 text-[12px] text-ink-faint">/ 100</span>
        <span
          className="mb-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
          style={{ color, borderColor: `${color}55`, background: `${color}14` }}
        >
          {label}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}
