/**
 * Graph layout + traversal helpers for the Signal Chain Graph.
 *
 * Layout is deterministic (spec §10.2 — fixed layout for v0.1): a longest-path
 * layering places every node in a column equal to its deepest distance from a
 * source, so every edge flows strictly left→right. A one-pass barycenter
 * ordering then reduces crossings within each column. d3-force is deferred to
 * v0.2 per the spec.
 */
import type { ChainEdge, ChainNode } from "../types";

export const NODE_W = 200;
export const NODE_H = 78;
const COL_GAP = 264;
const ROW_GAP = 122;

export type XY = { x: number; y: number };

export type GraphAdjacency = {
  outgoing: Map<string, ChainEdge[]>;
  incoming: Map<string, ChainEdge[]>;
};

export function buildAdjacency(edges: ChainEdge[]): GraphAdjacency {
  const outgoing = new Map<string, ChainEdge[]>();
  const incoming = new Map<string, ChainEdge[]>();
  for (const e of edges) {
    (outgoing.get(e.source) ?? outgoing.set(e.source, []).get(e.source)!).push(
      e,
    );
    (incoming.get(e.target) ?? incoming.set(e.target, []).get(e.target)!).push(
      e,
    );
  }
  return { outgoing, incoming };
}

/** Longest-path layering + barycenter ordering → absolute positions. */
export function layoutNodes(
  nodes: ChainNode[],
  edges: ChainEdge[],
): Map<string, XY> {
  const { incoming, outgoing } = buildAdjacency(edges);
  const ids = nodes.map((n) => n.id);
  const layer = new Map<string, number>();

  // Kahn-style topological pass computing layer = max(predecessor layer)+1.
  const indeg = new Map<string, number>();
  for (const id of ids) indeg.set(id, incoming.get(id)?.length ?? 0);
  const queue = ids.filter((id) => (indeg.get(id) ?? 0) === 0);
  for (const id of queue) layer.set(id, 0);

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const base = layer.get(id) ?? 0;
    for (const e of outgoing.get(id) ?? []) {
      layer.set(e.target, Math.max(layer.get(e.target) ?? 0, base + 1));
      const left = (indeg.get(e.target) ?? 1) - 1;
      indeg.set(e.target, left);
      if (left === 0) queue.push(e.target);
    }
  }
  // Any node untouched (shouldn't happen on a DAG) lands in column 0.
  for (const id of ids) if (!layer.has(id)) layer.set(id, 0);

  // Bucket into columns.
  const columns = new Map<number, string[]>();
  for (const id of ids) {
    const l = layer.get(id) ?? 0;
    (columns.get(l) ?? columns.set(l, []).get(l)!).push(id);
  }

  const order = new Map<string, number>(); // index within its column
  const maxLayer = Math.max(...layer.values());

  // Seed column 0 by descending score so the strongest driver sits on top.
  const byScore = new Map(nodes.map((n) => [n.id, n.score]));
  const col0 = columns.get(0) ?? [];
  col0.sort((a, b) => (byScore.get(b) ?? 0) - (byScore.get(a) ?? 0));
  col0.forEach((id, i) => order.set(id, i));

  // Barycenter sweep left→right: position each node near its predecessors.
  for (let l = 1; l <= maxLayer; l++) {
    const col = columns.get(l) ?? [];
    const bary = (id: string): number => {
      const preds = incoming.get(id) ?? [];
      if (!preds.length) return order.get(id) ?? 0;
      const sum = preds.reduce((acc, e) => acc + (order.get(e.source) ?? 0), 0);
      return sum / preds.length;
    };
    col
      .map((id) => ({ id, b: bary(id) }))
      .sort((a, b) => a.b - b.b)
      .forEach(({ id }, i) => order.set(id, i));
  }

  // Convert (column, rowIndex) → centered absolute coordinates.
  const positions = new Map<string, XY>();
  for (const [l, col] of columns) {
    const colHeight = (col.length - 1) * ROW_GAP;
    col.forEach((id) => {
      const row = order.get(id) ?? 0;
      positions.set(id, {
        x: l * COL_GAP,
        y: row * ROW_GAP - colHeight / 2,
      });
    });
  }
  return positions;
}

/** Direct neighbors of a node (for hover dimming, spec §17.1). */
export function neighborhood(
  nodeId: string,
  edges: ChainEdge[],
): { nodes: Set<string>; edges: Set<string> } {
  const nodeSet = new Set<string>([nodeId]);
  const edgeSet = new Set<string>();
  for (const e of edges) {
    if (e.source === nodeId) {
      nodeSet.add(e.target);
      edgeSet.add(e.id);
    } else if (e.target === nodeId) {
      nodeSet.add(e.source);
      edgeSet.add(e.id);
    }
  }
  return { nodes: nodeSet, edges: edgeSet };
}

/**
 * Full causal chain through a node: every ancestor (upstream cause) and
 * descendant (downstream effect). Powers the "Focus Chain" action (spec §17.2).
 */
export function causalChain(
  nodeId: string,
  edges: ChainEdge[],
): { nodes: Set<string>; edges: Set<string> } {
  const { incoming, outgoing } = buildAdjacency(edges);
  const nodes = new Set<string>([nodeId]);
  const edgeSet = new Set<string>();

  const walk = (
    start: string,
    pick: Map<string, ChainEdge[]>,
    next: (e: ChainEdge) => string,
  ) => {
    const stack = [start];
    while (stack.length) {
      const id = stack.pop()!;
      for (const e of pick.get(id) ?? []) {
        edgeSet.add(e.id);
        const n = next(e);
        if (!nodes.has(n)) {
          nodes.add(n);
          stack.push(n);
        }
      }
    }
  };
  walk(nodeId, outgoing, (e) => e.target);
  walk(nodeId, incoming, (e) => e.source);
  return { nodes, edges: edgeSet };
}

/** Edges fully contained within a set of node ids (for segment focus). */
export function edgesWithin(
  nodeIds: Iterable<string>,
  edges: ChainEdge[],
): Set<string> {
  const set = new Set(nodeIds);
  const out = new Set<string>();
  for (const e of edges)
    if (set.has(e.source) && set.has(e.target)) out.add(e.id);
  return out;
}
