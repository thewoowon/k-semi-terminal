"use client";

import { useMemo } from "react";
import { Panel, PanelHeader } from "@/components/terminal/Panel";
import { cn } from "@/lib/utils";
import { chainNodes, companies } from "../data/mockTerminalData";
import { useTerminal } from "../store";
import { pct, trillion } from "../lib/format";
import type { Company } from "../types";

/** Map a 20d momentum to a heat background + text color. */
function heat(change: number): { bg: string; fg: string } {
  const c = Math.max(-20, Math.min(20, change)) / 20; // -1..1
  if (c >= 0) {
    const a = 0.1 + c * 0.42;
    return { bg: `rgba(0,229,168,${a.toFixed(2)})`, fg: c > 0.35 ? "#031b14" : "var(--color-ink)" };
  }
  const a = 0.1 + Math.abs(c) * 0.42;
  return { bg: `rgba(255,77,94,${a.toFixed(2)})`, fg: Math.abs(c) > 0.35 ? "#1b0608" : "var(--color-ink)" };
}

/** Cap → tile column span (rough treemap weighting). */
function span(cap: number): string {
  if (cap >= 100) return "col-span-2 row-span-2";
  if (cap >= 10) return "col-span-2";
  return "";
}

/** Korea semiconductor heat matrix (spec §9.8). */
export function KoreaHeatMatrix() {
  const selectedNodeId = useTerminal((s) => s.selectedNodeId);
  const selectNode = useTerminal((s) => s.selectNode);
  const setHover = useTerminal((s) => s.setHover);

  const selectedSegment = useMemo(() => {
    const n = chainNodes.find((x) => x.id === selectedNodeId);
    return n?.segment ?? null;
  }, [selectedNodeId]);

  const sorted = useMemo(
    () => [...companies].sort((a, b) => b.marketCap - a.marketCap),
    [],
  );

  return (
    <Panel flush className="h-full">
      <div className="p-2.5 pb-1.5">
        <PanelHeader
          tag="KOREA"
          title="Heat Matrix"
          className="mb-0"
          right={<span className="font-mono text-[9px] text-ink-faint">20D mom.</span>}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scrollarea p-2 pt-0.5">
        <div className="grid auto-rows-[46px] grid-cols-6 gap-1">
          {sorted.map((c) => (
            <Tile
              key={c.ticker}
              c={c}
              related={
                c.chainNodeId === selectedNodeId ||
                (selectedSegment != null && c.segment === selectedSegment)
              }
              onPick={() => selectNode(c.chainNodeId)}
              onEnter={() => setHover(c.chainNodeId)}
              onLeave={() => setHover(null)}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Tile({
  c,
  related,
  onPick,
  onEnter,
  onLeave,
}: {
  c: Company;
  related: boolean;
  onPick: () => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const { bg, fg } = heat(c.change20d);
  const big = c.marketCap >= 10;
  return (
    <button
      onClick={onPick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-md border px-1.5 py-1 text-left transition-all",
        span(c.marketCap),
        related ? "border-warm" : "border-line/70 hover:border-line-strong",
      )}
      style={{
        background: bg,
        boxShadow: related ? "0 0 0 1px var(--color-warm), 0 0 14px -2px var(--color-warm)" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="truncate text-[10px] font-bold" style={{ color: fg }}>
          {c.name.split(" ")[0]}
        </span>
        <span className="font-mono text-[8px] tabular-nums opacity-70" style={{ color: fg }}>
          {c.signalScore}
        </span>
      </div>
      <div className="flex items-end justify-between gap-1">
        <span className="text-[11px] font-bold tabular-nums" style={{ color: fg }}>
          {pct(c.change20d, big ? 1 : 0)}
        </span>
        {big && (
          <span className="font-mono text-[8px] tabular-nums opacity-65" style={{ color: fg }}>
            {trillion(c.marketCap)}
          </span>
        )}
      </div>
    </button>
  );
}
