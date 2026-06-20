import { create } from "zustand";
import type { SegmentId } from "./types";
import { chainNodes, segments } from "./data/mockTerminalData";

/** Resolve a typed ticker (e.g. 005930) or keyword to a chain node id. */
const tickerToNode = new Map<string, string>();
for (const n of chainNodes) if (n.ticker) tickerToNode.set(n.ticker, n.id);

const KEYWORD_NODE: Record<string, string> = {
  HBM: "hbm-demand",
  DRAM: "dram-price",
  NAND: "nand-price",
  MEMORY: "seg-memory",
  SOX: "sox",
  EXPORT: "kr-export",
  AI: "ai-demand",
  NVDA: "nvda",
  TSM: "tsmc",
  TSMC: "tsmc",
  ASML: "asml",
  MU: "micron",
  MICRON: "micron",
};

const KEYWORD_SEGMENT: Record<string, SegmentId> = {
  HBM: "hbm",
  MEMORY: "memory",
  EQUIPMENT: "equipment",
  EQUIP: "equipment",
  MATERIALS: "materials",
  FOUNDRY: "foundry",
  TEST: "test",
  OSAT: "osat",
  FABLESS: "fabless",
};

export type CommandResult =
  | { kind: "node"; id: string; echo: string }
  | { kind: "segment"; id: SegmentId; echo: string }
  | { kind: "miss"; echo: string };

export type TerminalState = {
  selectedNodeId: string | null;
  hoverNodeId: string | null;
  focusSegmentId: SegmentId | null;
  /** node whose full causal chain is isolated (Focus Chain action) */
  focusChainNodeId: string | null;
  paletteOpen: boolean;
  /** last command echoed in the command bar */
  commandEcho: string | null;

  selectNode: (id: string | null) => void;
  setHover: (id: string | null) => void;
  focusSegment: (id: SegmentId | null) => void;
  focusChain: (id: string | null) => void;
  clearFocus: () => void;
  setPalette: (open: boolean) => void;
  runCommand: (raw: string) => CommandResult;
};

export const useTerminal = create<TerminalState>((set) => ({
  selectedNodeId: "hbm-demand",
  hoverNodeId: null,
  focusSegmentId: null,
  focusChainNodeId: null,
  paletteOpen: false,
  commandEcho: null,

  selectNode: (id) =>
    set({ selectedNodeId: id, focusSegmentId: null, focusChainNodeId: null }),
  setHover: (id) => set({ hoverNodeId: id }),
  focusSegment: (id) =>
    set({ focusSegmentId: id, focusChainNodeId: null, selectedNodeId: null }),
  focusChain: (id) =>
    set({ focusChainNodeId: id, focusSegmentId: null, selectedNodeId: id }),
  clearFocus: () =>
    set({ focusSegmentId: null, focusChainNodeId: null }),
  setPalette: (open) => set({ paletteOpen: open }),

  runCommand: (raw) => {
    const token = raw.trim().toUpperCase().replace(/\s*<?GO>?$/i, "").trim();
    if (!token) return { kind: "miss", echo: raw };

    // exact ticker (digits) → company node
    if (tickerToNode.has(token)) {
      const id = tickerToNode.get(token)!;
      set({
        selectedNodeId: id,
        focusSegmentId: null,
        focusChainNodeId: null,
        commandEcho: token,
        paletteOpen: false,
      });
      return { kind: "node", id, echo: token };
    }
    // keyword → node focus
    if (KEYWORD_NODE[token]) {
      const id = KEYWORD_NODE[token];
      set({
        selectedNodeId: id,
        focusSegmentId: null,
        focusChainNodeId: null,
        commandEcho: token,
        paletteOpen: false,
      });
      return { kind: "node", id, echo: token };
    }
    // keyword → segment focus
    if (KEYWORD_SEGMENT[token]) {
      const id = KEYWORD_SEGMENT[token];
      set({
        focusSegmentId: id,
        focusChainNodeId: null,
        selectedNodeId: null,
        commandEcho: token,
        paletteOpen: false,
      });
      return { kind: "segment", id, echo: token };
    }
    set({ commandEcho: `${token} ?` });
    return { kind: "miss", echo: token };
  },
}));

/** Static command suggestions for the palette. */
export const COMMAND_SUGGESTIONS: {
  cmd: string;
  label: string;
  hint: string;
}[] = [
  { cmd: "HBM", label: "Focus HBM Chain", hint: "segment" },
  { cmd: "MEMORY", label: "Focus Memory Segment", hint: "segment" },
  { cmd: "EQUIPMENT", label: "Focus Equipment Segment", hint: "segment" },
  { cmd: "DRAM", label: "DRAM Contract Price", hint: "node" },
  { cmd: "NAND", label: "NAND Price", hint: "node" },
  { cmd: "SOX", label: "Philadelphia SOX", hint: "node" },
  { cmd: "EXPORT", label: "Korea Chip Exports", hint: "node" },
  { cmd: "000660", label: "SK Hynix", hint: "ticker" },
  { cmd: "005930", label: "Samsung Electronics", hint: "ticker" },
  { cmd: "042700", label: "Hanmi Semiconductor", hint: "ticker" },
];

export const SEGMENT_LIST = segments;
