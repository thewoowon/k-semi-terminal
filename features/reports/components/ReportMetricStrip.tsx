import { cn } from "@/lib/utils";
import type { ReportMetric } from "../lib/reportTypes";
import { DIRECTION_META } from "../constants/reportLabels";

/** Compact metric cards with small deltas + direction (spec §10). */
export function ReportMetricStrip({ metrics }: { metrics: ReportMetric[] }) {
  if (!metrics.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map((m) => {
        const dir = m.direction ? DIRECTION_META[m.direction] : null;
        return (
          <div
            key={m.id}
            className="rounded-md border border-line bg-base/50 p-2.5"
            title={m.description}
          >
            <div className="label-xs mb-1.5 truncate">{m.label}</div>
            <div className="flex items-end justify-between gap-1">
              <span className="text-[20px] font-bold leading-none tabular-nums text-ink">
                {m.value}
              </span>
              {m.delta !== undefined && m.delta !== "" && (
                <span
                  className={cn(
                    "mb-0.5 text-[11px] font-medium tabular-nums",
                    dir?.textClass ?? "text-ink-dim",
                  )}
                >
                  {dir && <span className="mr-0.5 text-[8px]">{dir.arrow}</span>}
                  {m.delta}
                </span>
              )}
            </div>
            {m.description && (
              <div className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-ink-faint">
                {m.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
