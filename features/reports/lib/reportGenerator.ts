/**
 * Report generator v1 (spec §15). Phase 0 assembles a full daily report from
 * rule-based inputs + the mock signal/source library, so the admin preview
 * produces a complete, realistic report. The LLM path (prompt templates) plugs
 * in here at Phase 1.
 */
import type { CycleScoreInput } from "./reportScoring";
import type { DailySemiReport } from "./reportTypes";
import { calculateCycleScore, getCycleLabel } from "./reportScoring";
import { REPORT_DISCLAIMER } from "../constants/reportDisclaimers";
import { SIGNALS } from "../data/mockReportSignals";
import { SOURCES } from "../data/mockReportSources";

export const DEFAULT_DAILY_INPUT: CycleScoreInput = {
  globalSemiMomentum: 55,
  memoryPriceMomentum: 28,
  hbmDemandProxy: 76,
  koreaSemiBasketMomentum: 48,
  exportMomentum: 34,
  newsEventSentiment: 42,
  riskAdjustment: -12,
};

export function generateMockDailyReport(
  date: string,
  input: CycleScoreInput = DEFAULT_DAILY_INPUT,
): DailySemiReport {
  const cycleScore = calculateCycleScore(input);
  const dot = date.replaceAll("-", ".");

  return {
    id: `daily-${date}`,
    type: "daily",
    accessLevel: "founding",
    title: `K-Semi Morning Brief — ${dot}`,
    subtitle:
      "AI/HBM 체인은 강하지만 메모리 가격 모멘텀의 지속 여부가 핵심입니다.",
    date,
    generatedAt: new Date().toISOString(),
    cycleScore,
    cycleLabel: getCycleLabel(cycleScore),
    executiveSummary:
      "오늘 반도체 사이클은 확장 국면을 유지합니다. 다만 HBM 중심의 강한 수요 기대와 범용 메모리 가격 모멘텀 사이의 괴리를 구분해서 봐야 합니다. 점수는 투명한 가중치 기반의 확률적 해석입니다.",
    metrics: [
      { id: "cycle", label: "K-Semi Cycle", value: cycleScore, direction: "improving", description: "종합 점수" },
      { id: "global", label: "Global Semi", value: input.globalSemiMomentum, description: "글로벌 반도체 모멘텀" },
      { id: "memory", label: "Memory Price", value: input.memoryPriceMomentum, description: "메모리 가격 모멘텀" },
      { id: "hbm", label: "HBM Proxy", value: input.hbmDemandProxy, direction: "improving", description: "HBM 수요 프록시" },
      { id: "risk", label: "Risk Adj.", value: input.riskAdjustment, direction: "deteriorating", description: "리스크 조정" },
    ],
    topChanges: [SIGNALS.hbmStrength, SIGNALS.dramContract, SIGNALS.equipmentOrder],
    chainImpacts: [
      {
        title: "AI Server Demand → HBM → Korea Chain",
        summary:
          "AI 서버 수요 기대가 HBM 공급 병목을 통해 한국 메모리 및 후공정 장비 체인으로 전달된다.",
        nodes: [
          { id: "ai-server", label: "AI Server Demand", type: "macro", sentiment: "positive", impactScore: 88 },
          { id: "hbm-demand", label: "HBM Demand", type: "segment", sentiment: "positive", impactScore: 86 },
          { id: "sk-hynix", label: "SK하이닉스", type: "korean-company", sentiment: "positive", impactScore: 81 },
          { id: "hanmi", label: "한미반도체", type: "korean-company", sentiment: "positive", impactScore: 77 },
        ],
        edges: [
          { id: "e1", source: "ai-server", target: "hbm-demand", label: "수요 증가", strength: 0.9 },
          { id: "e2", source: "hbm-demand", target: "sk-hynix", label: "메모리 프리미엄", strength: 0.85 },
          { id: "e3", source: "hbm-demand", target: "hanmi", label: "본딩 장비 민감도", strength: 0.78 },
        ],
      },
    ],
    scenarios: [
      { type: "bull", title: "HBM Re-rating Continues", probability: 35, summary: "AI 수요 기대 유지 + HBM 체인 강세 지속.", watchPoints: ["HBM 가이던스", "AI CapEx"] },
      { type: "base", title: "Expansion with Volatility", probability: 45, summary: "확장 국면 유지하나 변동성 확대.", watchPoints: ["DRAM 가격", "외국인 수급"] },
      { type: "bear", title: "Price Momentum Fades", probability: 20, summary: "메모리 가격 모멘텀 둔화 + 차익실현.", watchPoints: ["재고", "미국 금리"] },
    ],
    risks: [SIGNALS.memoryMomentum, SIGNALS.chinaSupply],
    watchlist: ["삼성전자", "SK하이닉스", "한미반도체", "ISC", "리노공업"],
    sources: [SOURCES.customs, SOURCES.trendforce, SOURCES.manual],
    disclaimer: REPORT_DISCLAIMER,
  };
}
