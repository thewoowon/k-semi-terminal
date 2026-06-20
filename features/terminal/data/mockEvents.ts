import type { SemiEvent } from "../types";

/**
 * Event feed — disclosures, earnings, export prints, policy, supply-chain.
 * Each event links to chain node ids so selecting a node filters the feed and
 * vice-versa (spec §9.9, §17.2). Timestamps are anchored near the snapshot
 * "now" of 2026-06-19 (KST) used across the mock.
 */
export const events: SemiEvent[] = [
  {
    id: "ev-hanmi-order",
    type: "disclosure",
    title: "Hanmi Semiconductor — KRW 318B TC bonder supply contract",
    summary:
      "Single largest-ever order for hybrid bonding / TC bonder lines tied to a major customer's HBM4 ramp. ~22% of last-year revenue.",
    occurredAt: "2026-06-19T08:42:00Z",
    sourceName: "DART",
    relatedNodeIds: ["hanmi", "seg-equipment", "seg-hbm", "evt-hanmi"],
    sentiment: "positive",
    impactScore: 88,
  },
  {
    id: "ev-hynix-hbm4",
    type: "news",
    title: "SK Hynix qualifies HBM4 12-Hi for lead AI-accelerator customer",
    summary:
      "Customer qualification reported ahead of schedule; mass production targeted for 2H. Reinforces memory-maker HBM allocation lead.",
    occurredAt: "2026-06-19T07:15:00Z",
    sourceName: "Reuters",
    relatedNodeIds: ["sk-hynix", "hbm-demand", "seg-hbm", "seg-memory"],
    sentiment: "positive",
    impactScore: 84,
  },
  {
    id: "ev-export-may",
    type: "export_data",
    title: "May chip exports +38.4% YoY, 11th straight monthly gain",
    summary:
      "MOTIE/Customs print: semiconductor exports (HS 8542) hit a record on memory ASP recovery and HBM mix. DRAM unit price +highest since 2021.",
    occurredAt: "2026-06-19T00:05:00Z",
    sourceName: "Korea Customs",
    relatedNodeIds: ["kr-export", "dram-price", "seg-memory"],
    sentiment: "positive",
    impactScore: 79,
  },
  {
    id: "ev-dram-contract",
    type: "price_update",
    title: "DRAM contract price +9.2% QoQ for Q3, above guidance",
    summary:
      "TrendForce contract read shows DDR5 server modules leading; conventional DRAM tightening as makers prioritize HBM capacity conversion.",
    occurredAt: "2026-06-18T23:30:00Z",
    sourceName: "TrendForce",
    relatedNodeIds: ["dram-price", "hbm-demand", "seg-memory", "sk-hynix"],
    sentiment: "positive",
    impactScore: 76,
  },
  {
    id: "ev-nvda-earn",
    type: "earnings",
    title: "NVIDIA data-center revenue beats; guides next quarter higher",
    summary:
      "Sustained accelerator demand and tight HBM supply commentary. Read-through: continued allocation pressure on Korean memory suppliers.",
    occurredAt: "2026-06-18T20:05:00Z",
    sourceName: "Company IR",
    relatedNodeIds: ["nvda", "ai-demand", "hbm-demand"],
    sentiment: "positive",
    impactScore: 81,
  },
  {
    id: "ev-hpsp-cap",
    type: "disclosure",
    title: "HPSP announces capacity expansion for high-pressure anneal",
    summary:
      "New line to meet advanced-logic and HBM-adjacent demand. Capex guided within annual plan; utilization commentary constructive.",
    occurredAt: "2026-06-18T08:10:00Z",
    sourceName: "DART",
    relatedNodeIds: ["hpsp", "seg-equipment"],
    sentiment: "positive",
    impactScore: 61,
  },
  {
    id: "ev-asml-bookings",
    type: "analyst_note",
    title: "ASML bookings commentary points to 2H tool pull-ins",
    summary:
      "EUV demand resilient; HBM/advanced-packaging adjacency cited. Marginal positive for Korean front-end equipment names.",
    occurredAt: "2026-06-18T06:40:00Z",
    sourceName: "Sell-side",
    relatedNodeIds: ["asml", "seg-equipment", "sox"],
    sentiment: "positive",
    impactScore: 58,
  },
  {
    id: "ev-china-supply",
    type: "supply_chain",
    title: "China legacy DRAM capacity ramp pressures commodity NAND",
    summary:
      "Domestic Chinese output additions weigh on commodity NAND ASP. Limited HBM/DDR5 overlap, but a watch item for legacy-mix suppliers.",
    occurredAt: "2026-06-17T11:20:00Z",
    sourceName: "Industry",
    relatedNodeIds: ["nand-price", "risk-china", "seg-materials"],
    sentiment: "negative",
    impactScore: 47,
  },
  {
    id: "ev-policy-grant",
    type: "policy",
    title: "Korea expands semiconductor mega-cluster tax credits",
    summary:
      "Investment tax-credit extension and infrastructure support for the Yongin cluster. Structurally supportive for domestic capex chain.",
    occurredAt: "2026-06-17T02:00:00Z",
    sourceName: "MOTIE",
    relatedNodeIds: ["kr-export", "seg-equipment", "seg-materials"],
    sentiment: "positive",
    impactScore: 53,
  },
  {
    id: "ev-isc-socket",
    type: "news",
    title: "ISC test-socket demand firms on HBM known-good-die testing",
    summary:
      "Higher test intensity per HBM stack lifts socket consumption. Constructive for test/probe sub-chain into 2H.",
    occurredAt: "2026-06-16T09:05:00Z",
    sourceName: "Trade press",
    relatedNodeIds: ["isc", "leeno", "seg-test", "seg-hbm"],
    sentiment: "positive",
    impactScore: 56,
  },
  {
    id: "ev-samsung-foundry",
    type: "news",
    title: "Samsung foundry utilization mixed; memory carries the quarter",
    summary:
      "Advanced-node foundry demand uneven while memory division benefits from HBM/DDR5 ASP. Net signal balanced for the conglomerate.",
    occurredAt: "2026-06-16T05:30:00Z",
    sourceName: "Trade press",
    relatedNodeIds: ["samsung", "seg-foundry", "seg-memory"],
    sentiment: "neutral",
    impactScore: 49,
  },
  {
    id: "ev-micron-guide",
    type: "earnings",
    title: "Micron raises HBM TAM outlook for calendar 2026",
    summary:
      "Sold-out HBM commentary and higher pricing. Read-through validates Korean memory suppliers' allocation and ASP trajectory.",
    occurredAt: "2026-06-15T21:10:00Z",
    sourceName: "Company IR",
    relatedNodeIds: ["micron", "hbm-demand", "dram-price"],
    sentiment: "positive",
    impactScore: 72,
  },
];
