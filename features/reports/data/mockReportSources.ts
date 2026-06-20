import type { ReportSource } from "../lib/reportTypes";

/** Reusable source catalog. Mock for Phase 0; real ingestion plugs in later. */
export const SOURCES: Record<string, ReportSource> = {
  customs: {
    id: "src-customs",
    title: "월간 반도체 수출 통계 (HS 8542)",
    publisher: "관세청 / 무역통계",
    sourceType: "market-data",
    publishedAt: "2026-06-19",
  },
  trendforce: {
    id: "src-trendforce",
    title: "DRAM/NAND Contract Price Update",
    publisher: "TrendForce",
    sourceType: "market-data",
    publishedAt: "2026-06-18",
  },
  dart: {
    id: "src-dart",
    title: "주요 경영사항 공시 (수주/투자)",
    publisher: "DART 전자공시",
    sourceType: "disclosure",
    publishedAt: "2026-06-19",
  },
  nvidiaIr: {
    id: "src-nvda-ir",
    title: "NVIDIA Quarterly Results & Guidance",
    publisher: "Company IR",
    sourceType: "company",
    publishedAt: "2026-06-18",
  },
  micronIr: {
    id: "src-mu-ir",
    title: "Micron HBM TAM Commentary",
    publisher: "Company IR",
    sourceType: "company",
    publishedAt: "2026-06-15",
  },
  reuters: {
    id: "src-reuters",
    title: "SK hynix HBM4 qualification report",
    publisher: "Reuters",
    sourceType: "news",
    publishedAt: "2026-06-19",
  },
  motie: {
    id: "src-motie",
    title: "반도체 메가클러스터 세제·인프라 지원",
    publisher: "산업통상자원부",
    sourceType: "news",
    publishedAt: "2026-06-17",
  },
  sellside: {
    id: "src-sellside",
    title: "Semiconductor Equipment Sector Note",
    publisher: "Sell-side Research",
    sourceType: "research",
    publishedAt: "2026-06-18",
  },
  manual: {
    id: "src-manual",
    title: "K-Semi Signal 자체 산출 지표",
    publisher: "K-Semi Signal",
    sourceType: "manual",
  },
};

export const ALL_SOURCES: ReportSource[] = Object.values(SOURCES);
