"use client";

import { Panel, PanelHeader } from "@/components/terminal/Panel";
import { cn } from "@/lib/utils";
import { useTerminal } from "../store";
import { segments, watchlist, cycle } from "../data/mockTerminalData";
import { useLiveQuotes } from "../lib/quotesClient";
import { SEGMENT_ACCENT_HEX } from "../lib/colors";
import { arrow, arrowForDelta, pct } from "../lib/format";
import { SemiCycleThermometer } from "./SemiCycleThermometer";

export function LeftRail() {
  const focusSegmentId = useTerminal((s) => s.focusSegmentId);
  const focusSegment = useTerminal((s) => s.focusSegment);
  const runCommand = useTerminal((s) => s.runCommand);
  const { quotes: live } = useLiveQuotes();

  return (
    <div className="flex h-full min-h-0 w-[268px] shrink-0 flex-col gap-2 overflow-y-auto scrollarea pr-0.5">
      {/* Pulse / thermometer */}
      <Panel className="shrink-0">
        <PanelHeader
          tag="K-SEMI PULSE"
          title="Semi Cycle Score"
          right={
            <span className="font-mono text-[9px] text-ink-faint">
              {new Date(cycle.updatedAt).toUTCString().slice(17, 22)} KST
            </span>
          }
        />
        <SemiCycleThermometer />
      </Panel>

      {/* Segments */}
      <Panel flush className="shrink-0">
        <div className="p-3 pb-1.5">
          <PanelHeader
            tag="VALUE CHAIN"
            title="Segments"
            className="mb-0"
            right={
              focusSegmentId ? (
                <button
                  onClick={() => focusSegment(null)}
                  className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-ink-dim hover:text-ink"
                >
                  CLEAR
                </button>
              ) : undefined
            }
          />
        </div>
        <ul className="flex flex-col px-1.5 pb-1.5">
          {segments.map((s) => {
            const active = focusSegmentId === s.id;
            const accent = SEGMENT_ACCENT_HEX[s.accent];
            return (
              <li key={s.id}>
                <button
                  onClick={() => focusSegment(active ? null : s.id)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors",
                    active ? "bg-elevated" : "hover:bg-elevated/50",
                  )}
                >
                  <span
                    className="h-5 w-[3px] shrink-0 rounded-full transition-all"
                    style={{
                      background: accent,
                      boxShadow: active ? `0 0 8px ${accent}` : undefined,
                      opacity: active ? 1 : 0.55,
                    }}
                  />
                  <span
                    className={cn(
                      "flex-1 truncate text-[12px]",
                      active ? "font-semibold text-ink" : "text-ink-dim group-hover:text-ink",
                    )}
                  >
                    {s.shortLabel}
                  </span>
                  {/* mini score bar */}
                  <span className="hidden h-1 w-9 overflow-hidden rounded-full bg-elevated sm:block">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${s.score}%`, background: accent }}
                    />
                  </span>
                  <span className="w-6 text-right text-[12px] font-semibold tabular-nums text-ink">
                    {s.score}
                  </span>
                  <span
                    className={cn(
                      "w-3 text-center text-[10px]",
                      s.direction === "positive" && "text-up",
                      s.direction === "negative" && "text-down",
                      s.direction === "neutral" && "text-flat",
                    )}
                  >
                    {arrow(s.direction)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      {/* Watchlist */}
      <Panel flush className="shrink-0 pb-1">
        <div className="p-3 pb-1.5">
          <PanelHeader tag="WATCHLIST" title="Korea Basket" className="mb-0" />
        </div>
        <ul className="flex flex-col px-1.5 pb-2">
          {watchlist.map((w) => {
            const change1d = live[w.ticker]?.live
              ? live[w.ticker].change1d
              : w.change1d;
            return (
            <li key={w.ticker}>
              <button
                onClick={() => runCommand(w.ticker)}
                className="group flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-elevated/50"
              >
                <span className="font-mono text-[10px] text-ink-faint w-12 shrink-0">
                  {w.ticker}
                </span>
                <span className="flex-1 truncate text-[12px] text-ink-dim group-hover:text-ink">
                  {w.name}
                </span>
                <span
                  className={cn(
                    "w-12 text-right text-[11px] font-medium tabular-nums",
                    change1d > 0 ? "text-up" : change1d < 0 ? "text-down" : "text-flat",
                  )}
                >
                  {arrowForDelta(change1d)} {pct(change1d)}
                </span>
                <span className="w-6 text-right text-[11px] font-semibold tabular-nums text-ink">
                  {w.signalScore}
                </span>
              </button>
            </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
