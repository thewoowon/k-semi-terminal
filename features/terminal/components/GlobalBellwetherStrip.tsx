"use client";

import { Panel, PanelHeader } from "@/components/terminal/Panel";
import { Sparkline } from "@/components/terminal/Sparkline";
import { cn } from "@/lib/utils";
import { bellwethers } from "../data/mockTerminalData";
import { useTerminal } from "../store";
import { pct } from "../lib/format";
import type { Bellwether } from "../types";

/** Overseas bellwether flow — animated ticker strip (spec §9.7, §17 polish). */
export function GlobalBellwetherStrip() {
  const selectNode = useTerminal((s) => s.selectNode);
  const selectedNodeId = useTerminal((s) => s.selectedNodeId);
  const setHover = useTerminal((s) => s.setHover);

  return (
    <Panel flush className="h-full">
      <div className="p-2.5 pb-1.5">
        <PanelHeader
          tag="GLOBAL"
          title="Bellwethers"
          className="mb-0"
          right={<span className="font-mono text-[9px] text-ink-faint">US / TW</span>}
        />
      </div>
      <div className="group/strip relative min-h-0 flex-1 overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-panel to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-panel to-transparent" />
        <div
          data-ticker
          className="flex w-max gap-2 px-2 py-2 group-hover/strip:[animation-play-state:paused]"
          style={{ animation: "k-ticker 32s linear infinite" }}
        >
          {[...bellwethers, ...bellwethers].map((b, i) => (
            <Tile
              key={`${b.ticker}-${i}`}
              b={b}
              selected={selectedNodeId === b.chainNodeId}
              onPick={() => selectNode(b.chainNodeId)}
              onEnter={() => setHover(b.chainNodeId)}
              onLeave={() => setHover(null)}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Tile({
  b,
  selected,
  onPick,
  onEnter,
  onLeave,
}: {
  b: Bellwether;
  selected: boolean;
  onPick: () => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const dir = b.change1d > 0 ? "up" : b.change1d < 0 ? "down" : "flat";
  const color =
    dir === "up" ? "var(--color-up)" : dir === "down" ? "var(--color-down)" : "var(--color-flat)";
  return (
    <button
      onClick={onPick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "flex w-[148px] shrink-0 flex-col gap-1 rounded-md border bg-base/50 px-2.5 py-2 text-left transition-colors",
        selected ? "border-warm/50 bg-elevated" : "border-line hover:border-line-strong hover:bg-elevated/60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-ink">{b.ticker}</span>
        <span className="text-[10.5px] font-semibold tabular-nums" style={{ color }}>
          {pct(b.change1d)}
        </span>
      </div>
      <div className="flex items-end justify-between gap-1">
        <div className="min-w-0">
          <div className="truncate text-[9px] text-ink-faint">{b.role}</div>
          <div className="text-[11px] font-medium tabular-nums text-ink-dim">
            {b.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
        </div>
        <Sparkline data={b.spark} width={44} height={18} color={color} strokeWidth={1.25} />
      </div>
    </button>
  );
}
