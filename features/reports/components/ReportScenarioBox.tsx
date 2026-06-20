import type { ReportScenario } from "../lib/reportTypes";
import { SCENARIO_META } from "../constants/reportLabels";

/** Bull / Base / Bear scenarios with probability bars (spec §8.7). */
export function ReportScenarioBox({
  scenarios,
}: {
  scenarios: ReportScenario[];
}) {
  if (!scenarios.length) return null;
  return (
    <div className="grid gap-2.5 md:grid-cols-3">
      {scenarios.map((s) => {
        const meta = SCENARIO_META[s.type];
        return (
          <div
            key={s.type}
            className="flex flex-col rounded-md border border-line bg-base/40 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className="rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: meta.cssVar,
                  borderColor: `${meta.cssVar}55`,
                  background: `${meta.cssVar}14`,
                }}
              >
                {meta.label}
              </span>
              <span
                className="text-[18px] font-bold tabular-nums"
                style={{ color: meta.cssVar }}
              >
                {s.probability}%
              </span>
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.probability}%`, background: meta.cssVar }}
              />
            </div>
            <h4 className="text-[13px] font-bold text-ink">{s.title}</h4>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-dim">
              {s.summary}
            </p>
            {s.watchPoints.length > 0 && (
              <div className="mt-2.5 border-t border-line pt-2">
                <div className="label-xs mb-1">Watch Points</div>
                <ul className="flex flex-wrap gap-1">
                  {s.watchPoints.map((w) => (
                    <li
                      key={w}
                      className="rounded border border-line/70 bg-elevated/40 px-1.5 py-0.5 text-[10px] text-ink-dim"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
