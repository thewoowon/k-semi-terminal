"use client";

import { useMemo } from "react";
import { Panel } from "@/components/terminal/Panel";
import { Sparkline } from "@/components/terminal/Sparkline";
import { DeltaPill, ScoreChip } from "@/components/terminal/StatusBadge";
import { cn } from "@/lib/utils";
import { useTerminal } from "../store";
import {
  chainEdges,
  chainNodes,
  companies,
  events,
} from "../data/mockTerminalData";
import {
  NODE_TYPE_LABEL,
  directionText,
  nodeTypeHex,
} from "../lib/colors";
import {
  directionForDelta,
  krw,
  pct,
  relTime,
  signed,
} from "../lib/format";
import { SNAPSHOT_NOW } from "../data/mockTerminalData";
import { useLiveQuotes } from "../lib/quotesClient";

export function RightInspector() {
  const selectedNodeId = useTerminal((s) => s.selectedNodeId);
  const focusChain = useTerminal((s) => s.focusChain);
  const focusChainNodeId = useTerminal((s) => s.focusChainNodeId);
  const selectNode = useTerminal((s) => s.selectNode);
  const { quotes: live } = useLiveQuotes();

  const node = useMemo(
    () => chainNodes.find((n) => n.id === selectedNodeId) ?? null,
    [selectedNodeId],
  );

  const related = useMemo(() => {
    if (!node) return { companies: [], events: [], drivers: [], effects: [] };
    const cos = companies.filter(
      (c) =>
        c.chainNodeId === node.id ||
        (node.type === "korea_segment" && c.segment === node.segment),
    );
    const evs = events.filter((e) => e.relatedNodeIds.includes(node.id));
    const drivers = chainEdges
      .filter((e) => e.target === node.id)
      .map((e) => ({
        edge: e,
        other: chainNodes.find((n) => n.id === e.source)!,
      }));
    const effects = chainEdges
      .filter((e) => e.source === node.id)
      .map((e) => ({
        edge: e,
        other: chainNodes.find((n) => n.id === e.target)!,
      }));
    return { companies: cos, events: evs, drivers, effects };
  }, [node]);

  if (!node) {
    return (
      <Panel className="h-full w-[316px] shrink-0 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-faint">
            ⌖
          </div>
          <p className="max-w-[180px] text-[11px] leading-relaxed text-ink-faint">
            Select a node in the Signal Chain to inspect its metrics, linkages,
            and events.
          </p>
        </div>
      </Panel>
    );
  }

  const accent = nodeTypeHex(node.type);
  const focused = focusChainNodeId === node.id;

  return (
    <Panel flush className="h-full w-[316px] shrink-0">
      <div className="flex h-full min-h-0 flex-col">
        {/* header */}
        <div className="shrink-0 border-b border-line p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span
              className="rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
            >
              {NODE_TYPE_LABEL[node.type]}
            </span>
            {node.ticker && (
              <span className="font-mono text-[11px] text-ink-dim">
                {node.ticker}
              </span>
            )}
          </div>
          <h2 className="text-[16px] font-bold leading-tight text-ink">
            {node.label}
          </h2>
          {node.subtitle && (
            <p className="mt-0.5 text-[11px] text-ink-faint">{node.subtitle}</p>
          )}

          <div className="mt-2.5 flex items-end justify-between gap-2">
            <div className="flex items-center gap-2">
              <div>
                <div className="label-xs mb-0.5">Signal</div>
                <ScoreChip score={node.score} className="text-[13px]" />
              </div>
              <div>
                <div className="label-xs mb-0.5">Delta</div>
                <DeltaPill direction={node.direction}>{signed(node.delta)}</DeltaPill>
              </div>
            </div>
            {node.spark && (
              <Sparkline
                data={node.spark}
                width={104}
                height={34}
                area
                dot
                color={
                  node.direction === "negative"
                    ? "var(--color-down)"
                    : node.direction === "neutral"
                      ? "var(--color-flat)"
                      : "var(--color-up)"
                }
              />
            )}
          </div>
        </div>

        {/* scroll body */}
        <div className="min-h-0 flex-1 overflow-y-auto scrollarea p-3">
          {node.description && (
            <p className="mb-3 text-[11.5px] leading-relaxed text-ink-dim">
              {node.description}
            </p>
          )}

          {node.metrics && (
            <Section title="Key Metrics">
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(node.metrics).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-md border border-line bg-base/50 px-2 py-1.5"
                  >
                    <div className="label-xs mb-0.5 truncate">{k}</div>
                    <div className="truncate text-[12px] font-semibold tabular-nums text-ink">
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {related.drivers.length > 0 && (
            <Section title="Drivers (Upstream)">
              <LinkList
                items={related.drivers}
                onPick={(id) => selectNode(id)}
              />
            </Section>
          )}

          {related.effects.length > 0 && (
            <Section title="Effects (Downstream)">
              <LinkList
                items={related.effects}
                onPick={(id) => selectNode(id)}
              />
            </Section>
          )}

          {related.companies.length > 0 && (
            <Section title="Related Companies">
              <div className="flex flex-col gap-1">
                {related.companies.map((c) => {
                  const q = live[c.ticker];
                  const price = q?.live ? q.price : c.price;
                  const change1d = q?.live ? q.change1d : c.change1d;
                  return (
                  <button
                    key={c.ticker}
                    onClick={() => selectNode(c.chainNodeId)}
                    className="flex items-center gap-2 rounded-md border border-line bg-base/40 px-2 py-1.5 text-left hover:border-line-strong hover:bg-elevated/60"
                  >
                    <span className="font-mono text-[9.5px] text-ink-faint w-11 shrink-0">
                      {c.ticker}
                    </span>
                    <span className="flex-1 truncate text-[11.5px] text-ink">
                      {c.name}
                    </span>
                    <span className="text-[10.5px] tabular-nums text-ink-faint">
                      {krw(price)}
                    </span>
                    <span
                      className={cn(
                        "w-12 text-right text-[11px] font-medium tabular-nums",
                        directionText(directionForDelta(change1d)),
                      )}
                    >
                      {pct(change1d)}
                    </span>
                  </button>
                  );
                })}
              </div>
            </Section>
          )}

          {related.events.length > 0 && (
            <Section title="Related Events">
              <div className="flex flex-col gap-1.5">
                {related.events.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-md border border-line bg-base/40 px-2 py-1.5"
                  >
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-mono text-[8.5px] font-semibold uppercase tracking-wider",
                          directionText(e.sentiment),
                        )}
                      >
                        {e.type.replace("_", " ")}
                      </span>
                      <span className="font-mono text-[9px] text-ink-faint">
                        {relTime(e.occurredAt, SNAPSHOT_NOW)} · {e.sourceName}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug text-ink-dim">
                      {e.title}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* action */}
        <div className="shrink-0 border-t border-line p-2.5">
          <button
            onClick={() => focusChain(focused ? null : node.id)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-[12px] font-semibold transition-colors",
              focused
                ? "border-hot/50 bg-hot/15 text-hot"
                : "border-line bg-elevated text-ink hover:border-line-strong hover:bg-elevated/70",
            )}
          >
            {focused ? "◉ Chain Focused — Clear" : "⛓ Focus Chain"}
          </button>
        </div>
      </div>
    </Panel>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <h3 className="label-xs mb-1.5">{title}</h3>
      {children}
    </div>
  );
}

function LinkList({
  items,
  onPick,
}: {
  items: { edge: { rationale: string; weight: number; direction: string }; other: { id: string; label: string } }[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {items.map(({ edge, other }) => (
        <button
          key={other.id}
          onClick={() => onPick(other.id)}
          className="group rounded-md border border-line bg-base/40 px-2 py-1.5 text-left hover:border-line-strong hover:bg-elevated/60"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11.5px] font-medium text-ink">
              {other.label}
            </span>
            <span
              className={cn(
                "shrink-0 font-mono text-[9px] tabular-nums",
                directionText(edge.direction as never),
              )}
            >
              w{edge.weight.toFixed(2)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-ink-faint">
            {edge.rationale}
          </p>
        </button>
      ))}
    </div>
  );
}
