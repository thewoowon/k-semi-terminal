"use client";

import { memo } from "react";
import { getBezierPath, type Edge, type EdgeProps } from "@xyflow/react";
import { directionHex } from "../lib/colors";
import type { SignalDirection } from "../types";

export type ChainEdgeData = {
  weight: number;
  direction: SignalDirection;
  active: boolean;
  dimmed: boolean;
  [key: string]: unknown;
};

export type ChainFlowEdge = Edge<ChainEdgeData, "signal">;

function ChainEdgeImpl({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<ChainFlowEdge>) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.32,
  });

  const weight = data?.weight ?? 0.5;
  const active = data?.active ?? false;
  const dimmed = data?.dimmed ?? false;
  const color = directionHex(data?.direction ?? "neutral");
  const width = 1 + weight * 2.4;

  return (
    <g
      style={{
        opacity: dimmed ? 0.12 : active ? 1 : 0.5,
        transition: "opacity 160ms ease",
      }}
    >
      {/* base track */}
      <path
        d={path}
        className="k-edge-path"
        stroke={active ? color : "var(--color-line-strong)"}
        strokeWidth={active ? width : Math.max(1, width * 0.7)}
        style={active ? { filter: `drop-shadow(0 0 4px ${color}66)` } : undefined}
      />
      {/* animated signal particles on active edges */}
      {active && !dimmed && (
        <path
          d={path}
          className="k-edge-flow"
          stroke="#fff"
          strokeWidth={Math.max(1, width - 0.6)}
          strokeOpacity={0.85}
        />
      )}
    </g>
  );
}

export const ChainEdge = memo(ChainEdgeImpl);
