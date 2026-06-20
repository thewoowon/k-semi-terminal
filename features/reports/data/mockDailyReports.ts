import type {
  ChainImpactBlock,
  DailySemiReport,
  ReportScenario,
} from "../lib/reportTypes";
import { REPORT_DISCLAIMER } from "../constants/reportDisclaimers";
import { SIGNALS } from "./mockReportSignals";
import { SOURCES } from "./mockReportSources";

const WATCHLIST = [
  "삼성전자",
  "SK하이닉스",
  "한미반도체",
  "ISC",
  "리노공업",
  "원익IPS",
];

/** AI Server Demand → HBM → Korea chain, reused across daily reports (spec §14). */
const AI_HBM_CHAIN: ChainImpactBlock = {
  title: "AI Server Demand → HBM → Korea Chain",
  summary:
    "AI 서버 수요 기대가 HBM 공급 병목을 통해 한국 메모리 및 후공정 장비 체인으로 전달된다.",
  nodes: [
    { id: "ai-server", label: "AI Server Demand", type: "macro", sentiment: "positive", impactScore: 88 },
    { id: "hbm-demand", label: "HBM Demand", type: "segment", sentiment: "positive", impactScore: 86 },
    { id: "dram-price", label: "DRAM Premium", type: "memory-price", sentiment: "positive", impactScore: 74 },
    { id: "sk-hynix", label: "SK하이닉스", type: "korean-company", sentiment: "positive", impactScore: 81 },
    { id: "hanmi", label: "한미반도체", type: "korean-company", sentiment: "positive", impactScore: 77 },
    { id: "isc", label: "ISC", type: "korean-company", sentiment: "positive", impactScore: 64 },
  ],
  edges: [
    { id: "e1", source: "ai-server", target: "hbm-demand", label: "수요 증가", strength: 0.9 },
    { id: "e2", source: "hbm-demand", target: "dram-price", label: "캐파 전환", strength: 0.72 },
    { id: "e3", source: "hbm-demand", target: "sk-hynix", label: "메모리 프리미엄", strength: 0.85 },
    { id: "e4", source: "hbm-demand", target: "hanmi", label: "본딩 장비 민감도", strength: 0.78 },
    { id: "e5", source: "hanmi", target: "isc", label: "테스트 강도", strength: 0.6 },
  ],
};

const SCENARIOS: ReportScenario[] = [
  {
    type: "bull",
    title: "HBM Re-rating Continues",
    probability: 35,
    summary:
      "AI 서버 수요 기대가 유지되며 HBM 및 후공정 체인의 강세가 이어지는 시나리오.",
    watchPoints: ["HBM 관련 가이던스", "글로벌 AI CapEx", "장비 수주 뉴스"],
  },
  {
    type: "base",
    title: "Expansion with Volatility",
    probability: 45,
    summary:
      "반도체 확장 국면은 유지되지만 메모리 가격과 고밸류 부담으로 변동성이 확대되는 시나리오.",
    watchPoints: ["DRAM 가격", "SOX 지수", "외국인 수급"],
  },
  {
    type: "bear",
    title: "Price Momentum Fades",
    probability: 20,
    summary:
      "메모리 가격 모멘텀이 둔화되고 일부 밸류체인에서 차익실현 압력이 커지는 시나리오.",
    watchPoints: ["재고 지표", "가격 피크아웃", "미국 금리"],
  },
];

export const mockDailyReports: DailySemiReport[] = [
  {
    id: "daily-2026-06-20",
    type: "daily",
    accessLevel: "founding",
    title: "K-Semi Morning Brief — 2026.06.20",
    subtitle:
      "HBM 체인의 강도는 유지되지만, 메모리 가격 모멘텀 둔화 여부를 확인해야 하는 구간",
    date: "2026-06-20",
    generatedAt: "2026-06-20T06:30:00+09:00",
    cycleScore: 72,
    cycleLabel: "Expansion",
    executiveSummary:
      "오늘의 K-Semi Cycle Score는 72로 확장 국면을 유지한다. AI/HBM 수요 프록시는 강하지만, 범용 메모리 가격 모멘텀과 일부 장비주의 변동성은 단기 리스크로 분류된다. HBM 중심의 강한 기대와 commodity memory 사이클의 괴리를 구분해서 봐야 하는 구간이다.",
    metrics: [
      { id: "cycle", label: "K-Semi Cycle", value: 72, delta: "+3", direction: "improving", description: "글로벌 반도체 및 한국 밸류체인 종합 점수" },
      { id: "memory", label: "Memory Momentum", value: 61, delta: "-2", direction: "neutral", description: "DRAM/NAND 가격 및 관련 종목 모멘텀" },
      { id: "hbm", label: "HBM Demand Proxy", value: 84, delta: "+5", direction: "improving", description: "AI 서버 및 HBM 관련 수요 프록시" },
      { id: "basket", label: "Korea Basket", value: 66, delta: "+1", direction: "neutral", description: "국내 반도체 바스켓 폭(breadth)" },
      { id: "risk", label: "Risk Adjustment", value: 43, delta: "-4", direction: "deteriorating", description: "환율, 금리, 규제, 가격 피크아웃 리스크" },
    ],
    topChanges: [
      SIGNALS.hbmStrength,
      SIGNALS.dramContract,
      SIGNALS.equipmentOrder,
      SIGNALS.exportPrint,
      SIGNALS.testSocket,
    ],
    chainImpacts: [AI_HBM_CHAIN],
    scenarios: SCENARIOS,
    risks: [SIGNALS.memoryMomentum, SIGNALS.chinaSupply, SIGNALS.valuationRisk],
    watchlist: WATCHLIST,
    sources: [SOURCES.customs, SOURCES.trendforce, SOURCES.dart, SOURCES.reuters, SOURCES.manual],
    disclaimer: REPORT_DISCLAIMER,
  },
  {
    id: "daily-2026-06-19",
    type: "daily",
    accessLevel: "founding",
    title: "K-Semi Morning Brief — 2026.06.19",
    subtitle:
      "수출 서프라이즈와 HBM4 퀄 뉴스가 메모리 체인의 추세를 재확인",
    date: "2026-06-19",
    generatedAt: "2026-06-19T06:30:00+09:00",
    cycleScore: 69,
    cycleLabel: "Expansion",
    executiveSummary:
      "5월 반도체 수출 +38% YoY와 HBM4 퀄리피케이션 뉴스가 메모리 체인의 추세를 재확인했다. Cycle Score는 69로 확장 국면 초입을 유지하나, 범용 NAND 약세는 믹스 리스크로 남는다.",
    metrics: [
      { id: "cycle", label: "K-Semi Cycle", value: 69, delta: "+2", direction: "improving", description: "종합 점수" },
      { id: "memory", label: "Memory Momentum", value: 63, delta: "+1", direction: "improving", description: "메모리 가격/종목 모멘텀" },
      { id: "hbm", label: "HBM Demand Proxy", value: 79, delta: "+2", direction: "improving", description: "HBM 수요 프록시" },
      { id: "basket", label: "Korea Basket", value: 65, delta: "+2", direction: "improving", description: "바스켓 폭" },
      { id: "risk", label: "Risk Adjustment", value: 47, delta: "+1", direction: "neutral", description: "리스크 조정" },
    ],
    topChanges: [SIGNALS.exportPrint, SIGNALS.hbmStrength, SIGNALS.dramContract],
    chainImpacts: [AI_HBM_CHAIN],
    scenarios: SCENARIOS,
    risks: [SIGNALS.chinaSupply, SIGNALS.fxRate],
    watchlist: WATCHLIST,
    sources: [SOURCES.customs, SOURCES.reuters, SOURCES.trendforce, SOURCES.manual],
    disclaimer: REPORT_DISCLAIMER,
  },
  {
    id: "daily-2026-06-18",
    type: "daily",
    accessLevel: "founding",
    title: "K-Semi Morning Brief — 2026.06.18",
    subtitle:
      "NVIDIA 가이던스와 Micron HBM TAM 상향이 글로벌 벨웨더 톤을 끌어올림",
    date: "2026-06-18",
    generatedAt: "2026-06-18T06:30:00+09:00",
    cycleScore: 67,
    cycleLabel: "Expansion",
    executiveSummary:
      "NVIDIA 데이터센터 실적 호조와 Micron의 HBM TAM 상향이 글로벌 벨웨더 톤을 끌어올렸다. 한국 메모리·후공정 체인으로의 read-through가 유효하며, Cycle Score는 67을 기록했다.",
    metrics: [
      { id: "cycle", label: "K-Semi Cycle", value: 67, delta: "+4", direction: "improving", description: "종합 점수" },
      { id: "memory", label: "Memory Momentum", value: 62, delta: "+3", direction: "improving", description: "메모리 모멘텀" },
      { id: "hbm", label: "HBM Demand Proxy", value: 77, delta: "+6", direction: "improving", description: "HBM 수요 프록시" },
      { id: "basket", label: "Korea Basket", value: 63, delta: "+1", direction: "neutral", description: "바스켓 폭" },
      { id: "risk", label: "Risk Adjustment", value: 46, delta: "-1", direction: "neutral", description: "리스크 조정" },
    ],
    topChanges: [SIGNALS.hbmStrength, SIGNALS.equipmentOrder],
    chainImpacts: [AI_HBM_CHAIN],
    scenarios: SCENARIOS,
    risks: [SIGNALS.memoryMomentum, SIGNALS.valuationRisk],
    watchlist: WATCHLIST,
    sources: [SOURCES.nvidiaIr, SOURCES.micronIr, SOURCES.manual],
    disclaimer: REPORT_DISCLAIMER,
  },
];

/** Latest first. */
export const dailyReportsSorted = [...mockDailyReports].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export const latestDailyReport = dailyReportsSorted[0];

export function findDailyReport(date: string): DailySemiReport | undefined {
  return mockDailyReports.find((r) => r.date === date);
}
