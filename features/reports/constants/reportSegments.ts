import type { SemiSegment } from "../lib/reportTypes";

/**
 * Value-chain segment metadata for reports. Accent colors reuse the terminal
 * design tokens (globals.css) so the two surfaces stay visually unified.
 */
export const SEGMENT_META: Record<
  SemiSegment,
  { label: string; short: string; accentVar: string }
> = {
  memory: { label: "Memory", short: "Memory", accentVar: "var(--color-memory)" },
  hbm: { label: "HBM Supply Chain", short: "HBM", accentVar: "var(--color-hbm)" },
  packaging: { label: "OSAT / Packaging", short: "Packaging", accentVar: "var(--color-warm)" },
  equipment: { label: "Equipment", short: "Equipment", accentVar: "var(--color-equip)" },
  "test-socket": { label: "Test Socket / Probe", short: "Test", accentVar: "var(--color-up)" },
  materials: { label: "Materials", short: "Materials", accentVar: "var(--color-warm)" },
  foundry: { label: "Foundry", short: "Foundry", accentVar: "var(--color-foundry)" },
  "eda-ip": { label: "EDA / IP", short: "EDA·IP", accentVar: "var(--color-memory)" },
  "power-semiconductor": {
    label: "Power Semiconductor",
    short: "Power",
    accentVar: "var(--color-hot)",
  },
};

export const SEGMENT_ORDER: SemiSegment[] = [
  "memory",
  "hbm",
  "packaging",
  "equipment",
  "test-socket",
  "materials",
  "foundry",
  "eda-ip",
  "power-semiconductor",
];
