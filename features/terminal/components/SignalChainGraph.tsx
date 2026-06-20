"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import { chainEdges, chainNodes, segments } from "../data/mockTerminalData";
import {
  causalChain,
  edgesWithin,
  layoutNodes,
  neighborhood,
} from "../lib/graph";
import { nodeTypeHex } from "../lib/colors";
import { useTerminal } from "../store";
import { ChainNodeCard, type ChainFlowNode } from "./ChainNodeCard";
import { ChainEdge, type ChainFlowEdge } from "./ChainEdge";

const nodeTypes = { chain: ChainNodeCard };
const edgeTypes = { signal: ChainEdge };

type Highlight = {
  nodes: Set<string>;
  edges: Set<string>;
  mode: "hover" | "select" | "segment" | "focus";
} | null;

function Flow() {
  const { fitView } = useReactFlow();
  const selectedNodeId = useTerminal((s) => s.selectedNodeId);
  const hoverNodeId = useTerminal((s) => s.hoverNodeId);
  const focusSegmentId = useTerminal((s) => s.focusSegmentId);
  const focusChainNodeId = useTerminal((s) => s.focusChainNodeId);
  const selectNode = useTerminal((s) => s.selectNode);
  const setHover = useTerminal((s) => s.setHover);
  const clearFocus = useTerminal((s) => s.clearFocus);

  const positions = useMemo(() => layoutNodes(chainNodes, chainEdges), []);

  const highlight: Highlight = useMemo(() => {
    if (hoverNodeId)
      return { ...neighborhood(hoverNodeId, chainEdges), mode: "hover" };
    if (focusChainNodeId)
      return { ...causalChain(focusChainNodeId, chainEdges), mode: "focus" };
    if (focusSegmentId) {
      const seg = segments.find((s) => s.id === focusSegmentId);
      const nodes = new Set(seg?.nodeIds ?? []);
      return { nodes, edges: edgesWithin(nodes, chainEdges), mode: "segment" };
    }
    if (selectedNodeId)
      return { ...neighborhood(selectedNodeId, chainEdges), mode: "select" };
    return null;
  }, [hoverNodeId, focusChainNodeId, focusSegmentId, selectedNodeId]);

  const rfNodes = useMemo<ChainFlowNode[]>(() => {
    return chainNodes.map((node) => {
      const active = highlight ? highlight.nodes.has(node.id) : false;
      const dimmed = highlight ? !highlight.nodes.has(node.id) : false;
      return {
        id: node.id,
        type: "chain",
        position: positions.get(node.id) ?? { x: 0, y: 0 },
        data: {
          node,
          selected: node.id === selectedNodeId,
          active,
          dimmed,
        },
        draggable: false,
        selectable: false,
      };
    });
  }, [positions, highlight, selectedNodeId]);

  const rfEdges = useMemo<ChainFlowEdge[]>(() => {
    return chainEdges.map((edge) => {
      const active = highlight ? highlight.edges.has(edge.id) : !!edge.primary;
      const dimmed = highlight ? !highlight.edges.has(edge.id) : false;
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "signal",
        data: {
          weight: edge.weight,
          direction: edge.direction,
          active,
          dimmed,
        },
      };
    });
  }, [highlight]);

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_e, node) => selectNode(node.id),
    [selectNode],
  );
  const onNodeEnter = useCallback<NodeMouseHandler>(
    (_e, node) => setHover(node.id),
    [setHover],
  );
  const onNodeLeave = useCallback(() => setHover(null), [setHover]);
  const onPaneClick = useCallback(() => {
    clearFocus();
    setHover(null);
  }, [clearFocus, setHover]);

  // Re-fit when a segment or causal chain is focused.
  useEffect(() => {
    const ids = focusSegmentId
      ? segments.find((s) => s.id === focusSegmentId)?.nodeIds
      : focusChainNodeId
        ? Array.from(causalChain(focusChainNodeId, chainEdges).nodes)
        : null;
    if (ids && ids.length) {
      const t = setTimeout(
        () =>
          fitView({
            nodes: ids.map((id) => ({ id })),
            duration: 600,
            padding: 0.35,
          }),
        20,
      );
      return () => clearTimeout(t);
    }
  }, [focusSegmentId, focusChainNodeId, fitView]);

  const overlayLabel = focusSegmentId
    ? `SEGMENT · ${segments.find((s) => s.id === focusSegmentId)?.label ?? ""}`
    : focusChainNodeId
      ? `CAUSAL CHAIN · ${chainNodes.find((n) => n.id === focusChainNodeId)?.label ?? ""}`
      : "PRIMARY SIGNAL PATH · AI → HBM → DRAM → SK HYNIX → EQUIPMENT → HANMI";

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onNodeEnter}
      onNodeMouseLeave={onNodeLeave}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.3}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      selectionOnDrag={false}
      className="bg-transparent"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={26}
        size={1}
        color="rgba(148,163,184,0.12)"
      />
      <Controls
        showInteractive={false}
        position="bottom-right"
        className="!bottom-3 !right-3"
      />
      <MiniMap
        pannable
        zoomable
        position="top-right"
        maskColor="rgba(5,7,10,0.72)"
        nodeColor={(n) => {
          const data = n.data as unknown as { node?: { type: string } };
          return data?.node ? nodeTypeHex(data.node.type as never) : "#334155";
        }}
        nodeStrokeWidth={0}
        style={{ width: 168, height: 104 }}
      />

      {/* overlay: active path label (spec §18.2) */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[60%]">
        <div className="inline-flex items-center gap-2 rounded-md border border-line bg-panel/85 px-2.5 py-1.5 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-hot" style={{ animation: "k-pulse 2s infinite" }} />
          <span className="truncate font-mono text-[10px] font-medium tracking-wide text-ink-dim">
            {overlayLabel}
          </span>
        </div>
      </div>

      {/* legend (spec §18.2) */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-col gap-1 rounded-md border border-line bg-panel/85 px-2.5 py-2 backdrop-blur">
        <span className="label-xs mb-0.5">Signal Flow</span>
        <Legend color="var(--color-up)" label="Positive linkage" />
        <Legend color="var(--color-down)" label="Negative / risk" />
        <Legend color="var(--color-flat)" label="Neutral" />
      </div>
    </ReactFlow>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-[3px] w-5 rounded-full" style={{ background: color }} />
      <span className="text-[9.5px] text-ink-dim">{label}</span>
    </div>
  );
}

export function SignalChainGraph() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
