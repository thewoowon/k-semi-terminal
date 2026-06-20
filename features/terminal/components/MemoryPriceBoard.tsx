import { Panel, PanelHeader } from "@/components/terminal/Panel";
import { Sparkline } from "@/components/terminal/Sparkline";
import { cn } from "@/lib/utils";
import { memoryQuotes } from "../data/mockTerminalData";
import { TOKEN } from "../lib/colors";
import { pct } from "../lib/format";
import type { MemoryQuote } from "../types";

const CAT_COLOR: Record<MemoryQuote["category"], string> = {
  HBM: TOKEN.hbm,
  DRAM: TOKEN.memory,
  NAND: TOKEN.equip,
};

/** DRAM / NAND / HBM price board (spec §9.6). */
export function MemoryPriceBoard() {
  return (
    <Panel flush className="h-full">
      <div className="p-2.5 pb-1.5">
        <PanelHeader
          tag="PRICES"
          title="Memory Board"
          className="mb-0"
          right={<span className="font-mono text-[9px] text-ink-faint">USD · idx</span>}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scrollarea px-1.5 pb-1.5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="label-xs text-left">
              <th className="px-1.5 py-1 font-normal">Item</th>
              <th className="px-1 py-1 text-right font-normal">Last</th>
              <th className="px-1 py-1 text-right font-normal">Chg</th>
              <th className="px-1 py-1 text-right font-normal">Trend</th>
            </tr>
          </thead>
          <tbody>
            {memoryQuotes.map((q) => {
              const dir = q.changePct > 0.05 ? "up" : q.changePct < -0.05 ? "down" : "flat";
              const color =
                dir === "up" ? TOKEN.up : dir === "down" ? TOKEN.down : TOKEN.flat;
              const rangePos =
                ((q.current - q.sessionLow) / (q.sessionHigh - q.sessionLow || 1)) * 100;
              return (
                <tr
                  key={q.id}
                  className="border-t border-line/60 hover:bg-elevated/40"
                >
                  <td className="px-1.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-[3px] shrink-0 rounded-full"
                        style={{ background: CAT_COLOR[q.category] }}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-[11.5px] font-medium text-ink">
                          {q.item}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[8.5px] uppercase text-ink-faint">
                            {q.market}
                          </span>
                          {/* session range */}
                          <span className="relative h-[3px] w-10 overflow-hidden rounded-full bg-elevated">
                            <span
                              className="absolute top-1/2 h-2 w-[2px] -translate-y-1/2 rounded-full bg-ink-dim"
                              style={{ left: `${Math.min(96, Math.max(0, rangePos))}%` }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-1.5 text-right text-[11.5px] font-semibold tabular-nums text-ink">
                    {q.current.toFixed(2)}
                  </td>
                  <td
                    className={cn(
                      "px-1 py-1.5 text-right text-[11px] font-medium tabular-nums",
                    )}
                    style={{ color }}
                  >
                    {pct(q.changePct)}
                  </td>
                  <td className="py-1.5 pl-1 pr-1.5">
                    <div className="flex justify-end">
                      <Sparkline data={q.spark} width={48} height={16} color={color} strokeWidth={1.25} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
