import { cycle, cycleHeadline } from "../data/mockTerminalData";
import { TOKEN } from "../lib/colors";
import { cn } from "@/lib/utils";

const REGIME_COLOR: Record<string, string> = {
  Overheated: TOKEN.hot,
  Heating: TOKEN.warm,
  Neutral: TOKEN.flat,
  Cold: TOKEN.memory,
  Frozen: TOKEN.memory,
};

const R = 64;
const CX = 84;
const CY = 78;
const START = 180;
const END = 0;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  // sweep flag 1 goes clockwise in screen space for decreasing degrees
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

/** Reads-driven semicircular gauge — the "반도체 온도계" (spec §9.3). */
export function SemiCycleThermometer() {
  const value = cycle.score;
  const valueAngle = START - (value / 100) * (START - END);
  const color = REGIME_COLOR[cycle.regime];
  const needle = polar(CX, CY, R - 4, valueAngle);

  return (
    <div className="flex flex-col gap-3">
      {/* gauge */}
      <div className="relative">
        <svg viewBox="0 0 168 96" className="w-full">
          <defs>
            <linearGradient id="cycle-arc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={TOKEN.memory} />
              <stop offset="45%" stopColor={TOKEN.up} />
              <stop offset="72%" stopColor={TOKEN.warm} />
              <stop offset="100%" stopColor={TOKEN.hot} />
            </linearGradient>
          </defs>
          {/* track */}
          <path
            d={arc(CX, CY, R, START, END)}
            fill="none"
            stroke={TOKEN.elevated}
            strokeWidth={10}
            strokeLinecap="round"
          />
          {/* value */}
          <path
            d={arc(CX, CY, R, START, valueAngle)}
            fill="none"
            stroke="url(#cycle-arc)"
            strokeWidth={10}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
          {/* needle dot */}
          <circle cx={needle.x} cy={needle.y} r={4.5} fill="#fff" />
          <circle cx={needle.x} cy={needle.y} r={8} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <div className="flex items-end gap-1">
            <span
              className="text-[34px] font-bold leading-none tabular-nums"
              style={{ color }}
            >
              {value.toFixed(0)}
            </span>
            <span className="mb-1 text-[11px] text-ink-faint">/100</span>
          </div>
          <span
            className="mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color, borderColor: `${color}55`, background: `${color}14` }}
          >
            {cycle.regime}
          </span>
        </div>
      </div>

      <p className="text-center text-[11px] leading-snug text-ink-dim">
        {cycleHeadline}
      </p>

      {/* reads */}
      <div className="grid grid-cols-3 gap-1.5">
        {cycle.reads.slice(0, 3).map((r) => (
          <Read key={r.label} {...r} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {cycle.reads.slice(3).map((r) => (
          <Read key={r.label} {...r} />
        ))}
      </div>

      {/* weighted components */}
      <div className="mt-0.5 flex flex-col gap-1.5 border-t border-line pt-2.5">
        <span className="label-xs">Score Components</span>
        {cycle.components.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            <span className="w-28 shrink-0 truncate text-[10.5px] text-ink-dim">
              {c.label}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${c.value}%`,
                  background:
                    c.value >= 72 ? TOKEN.hot : c.value >= 58 ? TOKEN.up : TOKEN.flat,
                }}
              />
            </div>
            <span className="w-7 shrink-0 text-right text-[10.5px] font-medium tabular-nums text-ink">
              {c.value}
            </span>
            <span className="w-8 shrink-0 text-right font-mono text-[9px] text-ink-faint">
              {c.weight.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Read({
  label,
  value,
  direction,
}: {
  label: string;
  value: string;
  direction: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-md border border-line bg-base/50 px-2 py-1.5">
      <div className="label-xs mb-0.5">{label}</div>
      <div
        className={cn(
          "text-[12px] font-semibold tabular-nums",
          direction === "positive" && "text-up",
          direction === "negative" && "text-down",
          direction === "neutral" && "text-ink",
        )}
      >
        {value}
      </div>
    </div>
  );
}
