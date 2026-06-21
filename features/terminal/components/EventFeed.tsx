"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel, PanelHeader } from "@/components/terminal/Panel";
import { cn } from "@/lib/utils";
import { chainNodes, events as mockEvents, SNAPSHOT_NOW } from "../data/mockTerminalData";
import { useTerminal } from "../store";
import { directionText } from "../lib/colors";
import { relTime } from "../lib/format";
import type { SemiEvent } from "../types";

const TYPE_LABEL: Record<SemiEvent["type"], string> = {
  disclosure: "DISCLOSURE",
  earnings: "EARNINGS",
  news: "NEWS",
  price_update: "PRICE",
  export_data: "EXPORT",
  policy: "POLICY",
  analyst_note: "ANALYST",
  supply_chain: "SUPPLY",
};

/** News / disclosure / data event feed (spec §9.9). */
export function EventFeed() {
  const selectedNodeId = useTerminal((s) => s.selectedNodeId);
  const selectNode = useTerminal((s) => s.selectNode);
  const setHover = useTerminal((s) => s.setHover);

  // Live DART disclosures (+ mock non-disclosure events). Falls back to mock.
  const [feed, setFeed] = useState<{ events: SemiEvent[]; now: number; dartLive: boolean }>(
    () => ({ events: mockEvents, now: SNAPSHOT_NOW, dartLive: false }),
  );
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          events: SemiEvent[];
          now: string;
          dartLive: boolean;
        };
        if (!cancelled && Array.isArray(data.events)) {
          setFeed({
            events: data.events,
            now: data.dartLive ? new Date(data.now).getTime() : SNAPSHOT_NOW,
            dartLive: data.dartLive,
          });
        }
      } catch {
        /* keep mock */
      }
    };
    load();
    const id = setInterval(load, 2 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const selectedLabel = useMemo(
    () => chainNodes.find((n) => n.id === selectedNodeId)?.label ?? null,
    [selectedNodeId],
  );

  const ordered = useMemo(() => {
    const withMeta = feed.events.map((e) => ({
      e,
      related: selectedNodeId ? e.relatedNodeIds.includes(selectedNodeId) : false,
      t: new Date(e.occurredAt).getTime(),
    }));
    return withMeta.sort((a, b) => {
      if (a.related !== b.related) return a.related ? -1 : 1;
      return b.t - a.t;
    });
  }, [selectedNodeId, feed.events]);

  return (
    <Panel flush className="h-full">
      <div className="p-2.5 pb-1.5">
        <PanelHeader
          tag="LIVE"
          title="Event Feed"
          className="mb-0"
          right={
            selectedLabel ? (
              <button
                onClick={() => selectNode(null)}
                className="flex items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-warm hover:border-line-strong"
              >
                <span className="truncate max-w-[88px]">{selectedLabel}</span>
                <span className="text-ink-faint">✕</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 font-mono text-[9px] text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-up" style={{ animation: "k-pulse 2s infinite" }} />
                {feed.dartLive ? "DART · " : ""}
                {feed.events.length} events
              </span>
            )
          }
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scrollarea px-1.5 pb-1.5">
        <ul className="flex flex-col">
          {ordered.map(({ e, related }) => (
            <li key={e.id}>
              <button
                onClick={() => e.relatedNodeIds[0] && selectNode(e.relatedNodeIds[0])}
                onMouseEnter={() => e.relatedNodeIds[0] && setHover(e.relatedNodeIds[0])}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  "group flex w-full gap-2 rounded-md border border-transparent px-1.5 py-1.5 text-left hover:bg-elevated/50",
                  related && "bg-warm/[0.06]",
                )}
              >
                {/* sentiment rail */}
                <span
                  className={cn(
                    "mt-0.5 w-[3px] shrink-0 self-stretch rounded-full",
                    e.sentiment === "positive" && "bg-up",
                    e.sentiment === "negative" && "bg-down",
                    e.sentiment === "neutral" && "bg-flat",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "font-mono text-[8px] font-semibold tracking-wider",
                        directionText(e.sentiment),
                      )}
                    >
                      {TYPE_LABEL[e.type]}
                    </span>
                    {related && (
                      <span className="rounded bg-warm/15 px-1 font-mono text-[8px] text-warm">
                        LINKED
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[8.5px] text-ink-faint">
                      {relTime(e.occurredAt, feed.now)} · {e.sourceName}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium leading-snug text-ink group-hover:text-ink">
                    {e.title}
                  </p>
                  {/* impact bar */}
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-elevated">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          e.sentiment === "negative" ? "bg-down" : "bg-up",
                        )}
                        style={{ width: `${e.impactScore}%`, opacity: 0.7 }}
                      />
                    </span>
                    <span className="font-mono text-[8px] text-ink-faint">
                      IMP {e.impactScore}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
