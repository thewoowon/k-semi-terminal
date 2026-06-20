import { cn } from "@/lib/utils";
import type { ChainImpactBlock } from "../lib/reportTypes";
import { CHAIN_NODE_TYPE_LABEL, SENTIMENT_VAR } from "../constants/reportLabels";

/**
 * Event-to-impact chain as horizontal cards (spec §10 — simplified chain first,
 * reusing the SignalChainGraph concept). Edge labels sit on the connectors.
 */
export function ReportChainImpact({ block }: { block: ChainImpactBlock }) {
  const { nodes, edges } = block;
  const edgeBetween = (a: string, b: string) =>
    edges.find((e) => e.source === a && e.target === b);

  return (
    <div>
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-dim">
        {block.summary}
      </p>
      <div className="flex items-stretch gap-0 overflow-x-auto pb-2 scrollarea">
        {nodes.map((n, i) => {
          const color = SENTIMENT_VAR[n.sentiment];
          const next = nodes[i + 1];
          const edge = next ? edgeBetween(n.id, next.id) : undefined;
          return (
            <div key={n.id} className="flex items-stretch">
              <div
                className="relative flex w-[150px] shrink-0 flex-col justify-between overflow-hidden rounded-md border border-line bg-base/50 p-2.5"
                style={{ boxShadow: `inset 2px 0 0 ${color}` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[8px] font-semibold uppercase tracking-wider"
                    style={{ color }}
                  >
                    {CHAIN_NODE_TYPE_LABEL[n.type]}
                  </span>
                </div>
                <div className="mt-1 text-[12px] font-bold leading-tight text-ink">
                  {n.label}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="label-xs">Impact</span>
                  <span
                    className="text-[13px] font-bold tabular-nums"
                    style={{ color }}
                  >
                    {n.impactScore >= 0 ? "+" : ""}
                    {n.impactScore}
                  </span>
                </div>
              </div>

              {next && (
                <div className="flex w-[58px] shrink-0 flex-col items-center justify-center px-1">
                  <span className="text-[14px] leading-none text-ink-faint">→</span>
                  {edge && (
                    <span
                      className={cn(
                        "mt-1 text-center text-[8.5px] leading-tight text-ink-faint",
                      )}
                    >
                      {edge.label}
                      <span className="mt-0.5 block font-mono opacity-70">
                        {edge.strength.toFixed(2)}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
