"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { ChainNode } from "../types";
import { NODE_TYPE_LABEL, nodeTypeHex } from "../lib/colors";
import { signed } from "../lib/format";
import { Sparkline } from "@/components/terminal/Sparkline";
import { NODE_H, NODE_W } from "../lib/graph";
import { cn } from "@/lib/utils";

export type ChainNodeData = {
  node: ChainNode;
  selected: boolean;
  dimmed: boolean;
  active: boolean;
  [key: string]: unknown;
};

export type ChainFlowNode = Node<ChainNodeData, "chain">;

function ChainNodeCardImpl({ data }: NodeProps<ChainFlowNode>) {
  const { node, selected, dimmed, active } = data;
  const accent = nodeTypeHex(node.type);
  const dirColor =
    node.direction === "positive"
      ? "var(--color-up)"
      : node.direction === "negative"
        ? "var(--color-down)"
        : "var(--color-flat)";

  return (
    <div
      style={{
        width: NODE_W,
        height: NODE_H,
        opacity: dimmed ? 0.22 : 1,
        borderColor: selected ? accent : "var(--color-line)",
        boxShadow: selected
          ? `0 0 0 1px ${accent}, 0 0 22px -2px ${accent}99`
          : active
            ? `0 0 14px -4px ${accent}aa`
            : undefined,
        transition: "opacity 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
      }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-lg border bg-panel-2 px-2.5 py-2",
      )}
    >
      {/* accent rail */}
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: accent, opacity: dimmed ? 0.4 : 1 }}
      />
      {/* top meta */}
      <div className="flex items-center justify-between gap-1 pl-1">
        <span
          className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: accent }}
        >
          {NODE_TYPE_LABEL[node.type]}
        </span>
        <div className="flex items-center gap-1">
          {node.ticker && (
            <span className="font-mono text-[8.5px] text-ink-faint">
              {node.ticker}
            </span>
          )}
          <span
            className="rounded bg-base/70 px-1 py-px text-[9px] font-bold tabular-nums"
            style={{ color: accent }}
          >
            {node.score}
          </span>
        </div>
      </div>

      {/* label */}
      <div className="pl-1 leading-tight">
        <div className="truncate text-[12.5px] font-semibold text-ink">
          {node.label}
        </div>
        {node.subtitle && (
          <div className="truncate text-[9.5px] text-ink-faint">
            {node.subtitle}
          </div>
        )}
      </div>

      {/* footer: delta + sparkline */}
      <div className="flex items-end justify-between pl-1">
        <span
          className="text-[10px] font-medium tabular-nums"
          style={{ color: dirColor }}
        >
          {node.direction === "positive" ? "▲" : node.direction === "negative" ? "▼" : "→"}{" "}
          {signed(node.delta)}
        </span>
        {node.spark && (
          <Sparkline
            data={node.spark}
            width={56}
            height={16}
            color={dirColor}
            strokeWidth={1.25}
          />
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        style={{ background: "transparent", border: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        style={{ background: "transparent", border: "none" }}
      />
    </div>
  );
}

export const ChainNodeCard = memo(ChainNodeCardImpl);
