import type { ReportSignal, WeeklySemiReport } from "../lib/reportTypes";
import { REPORT_DISCLAIMER } from "../constants/reportDisclaimers";
import { SIGNALS } from "./mockReportSignals";
import { SOURCES } from "./mockReportSources";

/** Segment strength ranking for the weekly (spec §9.7). */
const SEGMENT_SCORES: ReportSignal[] = [
  SIGNALS.hbmStrength,
  SIGNALS.equipmentOrder,
  SIGNALS.dramContract,
  SIGNALS.testSocket,
  SIGNALS.exportPrint,
  {
    id: "seg-materials",
    title: "소재 — 중립",
    segment: "materials",
    score: 12,
    direction: "neutral",
    confidence: "medium",
    summary: "공정 소재 수요는 생산량에 연동되나 레거시 가격 압박이 상쇄 요인.",
    rationale: ["웨이퍼 투입 증가 ↔ 중국 레거시 공급 압박"],
    relatedCompanies: ["솔브레인"],
    relatedEvents: ["wafer output"],
  },
  SIGNALS.foundrySoft,
];

export const mockWeeklyReports: WeeklySemiReport[] = [
  {
    id: "weekly-2026-w25",
    type: "weekly",
    accessLevel: "founding",
    slug: "2026-w25-hbm-leads-cycle",
    title: "K-Semi Weekly Deep Dive — 2026.06.20",
    subtitle:
      "HBM이 사이클을 끌지만 범용 메모리와의 괴리가 관전 포인트 — 확장 국면 내 변동성 구간",
    weekStart: "2026-06-16",
    weekEnd: "2026-06-22",
    publishedAt: "2026-06-22T08:00:00+09:00",
    cycleScore: 71,
    executiveSummary:
      "이번 주 반도체 사이클은 확장 국면을 유지했다. AI/HBM 체인은 여전히 가장 강한 축으로 분류되며, 수출·계약가·수주 데이터가 추세를 재확인했다. 다만 범용 DRAM/NAND 가격 모멘텀이 동반되지 않을 경우, 메모리 대형주와 후공정 장비주의 민감도는 분리될 수 있다. 강세 이후 고밸류 부담과 차익실현 압력은 단기 변동성 요인으로 남는다.",
    segmentScores: SEGMENT_SCORES,
    deepDiveSections: [
      {
        id: "thesis",
        title: "1. Weekly Thesis",
        body: "HBM 체인은 반도체 사이클 내 가장 강한 축으로 유지된다. 핵심 질문은 '강도'가 아니라 '폭'이다. HBM·후공정·테스트로 좁게 집중된 강세가 범용 메모리와 장비 전반으로 확산되는지가 확장 국면의 지속성을 결정한다. 현재 데이터는 확산보다 집중에 가깝다.",
        keyTakeaways: [
          "강도는 확인, 폭(breadth)은 미확인.",
          "HBM 집중 → 확산 여부가 다음 단계의 트리거.",
        ],
      },
      {
        id: "regime",
        title: "2. Semiconductor Cycle Regime",
        body: "K-Semi Cycle Score 71은 'Expansion' 밴드에 위치한다. 글로벌 반도체 매출 모멘텀과 메모리 가격이 점수를 견인하고, 리스크 조정 항목이 이를 일부 상쇄한다. 과열(Overheat Watch) 구간(80+)까지는 여유가 있으나, 모멘텀의 2차 미분(가속/감속)은 둔화 신호를 보이기 시작했다.",
        keyTakeaways: ["Expansion 유지, 과열까지 버퍼 존재.", "가속도는 둔화 초기."],
      },
      {
        id: "bellwether",
        title: "3. Global Bellwether Review",
        body: "NVIDIA의 데이터센터 가이던스와 Micron의 HBM TAM 상향이 글로벌 톤을 끌어올렸다. SOX는 벤치마크 모멘텀을 유지했고, ASML 코멘터리는 2H 장비 풀인 가능성을 시사했다. 벨웨더 신호는 한국 메모리·후공정 체인으로의 read-through가 유효하다.",
        keyTakeaways: ["NVDA/MU가 수요·가격 양축을 지지.", "ASML → 한국 장비 read-through."],
      },
      {
        id: "memory",
        title: "4. Memory Price Review",
        body: "DDR5 서버 계약가가 분기 +9% 수준으로 가이던스를 상회했다. HBM 캐파 전환이 범용 DRAM 공급을 제한하는 구조가 가격을 지지한다. 반면 commodity NAND는 중국 레거시 공급 압박으로 약세를 보였다. HBM과 범용 메모리의 사이클 분리가 관전 포인트다.",
        keyTakeaways: ["DDR5 계약가 가이던스 상회.", "NAND는 레거시 공급 압박."],
      },
      {
        id: "aihbm",
        title: "5. AI / HBM Chain Review",
        body: "AI 서버 수요 → HBM 수요 → 메모리 프리미엄 → 한국 HBM 체인의 인과 구조가 이번 주 데이터로 재확인됐다. HBM4 퀄리피케이션 진척과 본딩 장비 대형 수주가 체인의 하류(후공정·테스트)까지 강도를 전달했다.",
        keyTakeaways: ["체인 하류까지 강도 전달 확인.", "HBM4 전환이 후공정 강도를 높임."],
      },
      {
        id: "valuechain",
        title: "6. Korea Value Chain Map",
        body: "메모리·HBM·장비·테스트 세그먼트가 강세 상위를 차지하고, 소재·파운드리는 중립권에 머문다. 강세가 HBM 인접 세그먼트에 집중되어 있어, 소재·레거시로의 낙수 여부가 확산의 척도다. 터미널의 Signal Chain Graph에서 세그먼트별 경로를 확인할 수 있다.",
        keyTakeaways: ["강세 상위: 메모리·HBM·장비·테스트.", "중립: 소재·파운드리."],
      },
      {
        id: "eventchain",
        title: "7. Company Event Chain",
        body: "한미반도체의 대형 본딩 장비 수주 공시(약 3,180억원)는 'AI→HBM→메모리→장비→이벤트' 체인이 기업 레벨에서 실현된 사례다. 공시는 후공정 장비 사이클을 선반영하며, 테스트 소켓 기업으로 강도가 이어진다.",
        keyTakeaways: ["수주 공시 = 체인의 기업 레벨 실현.", "장비 → 테스트로 강도 연쇄."],
      },
      {
        id: "risk",
        title: "8. Risk and Contradiction",
        body: "상승 논리의 반대 증거도 명확하다. (1) 범용 메모리 가격 모멘텀 둔화, (2) 중국 레거시 공급 압박, (3) 강세 이후 고밸류·차익실현 압력, (4) 환율·금리 매크로 변수. 이 중 둘 이상이 동시에 악화되면 확장 국면의 폭이 좁아질 수 있다.",
        keyTakeaways: ["반대 증거를 명시적으로 추적.", "둘 이상 동시 악화 시 폭 축소 위험."],
      },
      {
        id: "nextweek",
        title: "9. Next Week Watch Points",
        body: "다음 주 핵심 관찰 지점: HBM 관련 가이던스/수주, DRAM·NAND 가격 업데이트, 글로벌 AI CapEx 코멘터리, 외국인 수급, 환율 경로. 데이터가 '강도 유지 + 폭 확산'을 가리키면 Bull 시나리오 확률이 상향된다.",
        keyTakeaways: ["가격·수주·수급을 동시 추적.", "폭 확산 확인 시 Bull 비중 상향."],
      },
      {
        id: "forecast",
        title: "10. AI Forecast (Rule-based)",
        body: "현 단계 예측은 규칙 기반이다. 1주 사이클 점수 방향은 '유지~소폭 상승(확률 가중 Base 45%)'으로 분류된다. 통계·ML 모델은 충분한 시계열 축적 이후 단계적으로 도입될 예정이며, 현재 점수는 투명한 가중치의 확률적 해석이다.",
        keyTakeaways: ["1주 방향: 유지~소폭 상승(Base).", "ML은 데이터 축적 후 도입."],
      },
    ],
    chainImpacts: [
      {
        title: "주간 핵심 체인 — AI CapEx → HBM → Korea Chain",
        summary:
          "글로벌 AI CapEx 기대가 HBM 수요와 메모리 프리미엄을 통해 한국 밸류체인 전반으로 전달되는 한 주였다.",
        nodes: [
          { id: "ai-capex", label: "Global AI CapEx", type: "macro", sentiment: "positive", impactScore: 90 },
          { id: "nvda", label: "NVIDIA", type: "global-company", sentiment: "positive", impactScore: 86 },
          { id: "hbm", label: "HBM Demand", type: "segment", sentiment: "positive", impactScore: 88 },
          { id: "sk-hynix", label: "SK하이닉스", type: "korean-company", sentiment: "positive", impactScore: 82 },
          { id: "hanmi", label: "한미반도체", type: "korean-company", sentiment: "positive", impactScore: 79 },
          { id: "nand", label: "Commodity NAND", type: "risk", sentiment: "negative", impactScore: -28 },
        ],
        edges: [
          { id: "w1", source: "ai-capex", target: "nvda", label: "수요 실현", strength: 0.88 },
          { id: "w2", source: "nvda", target: "hbm", label: "할당 압력", strength: 0.82 },
          { id: "w3", source: "hbm", target: "sk-hynix", label: "프리미엄", strength: 0.85 },
          { id: "w4", source: "hbm", target: "hanmi", label: "장비 수요", strength: 0.78 },
          { id: "w5", source: "nand", target: "sk-hynix", label: "믹스 상쇄", strength: 0.4 },
        ],
      },
    ],
    scenarios: [
      {
        type: "bull",
        title: "Breadth Expansion",
        probability: 35,
        summary: "HBM 강세가 범용 메모리·장비·소재로 확산되며 확장 국면의 폭이 넓어지는 시나리오.",
        watchPoints: ["DRAM/NAND 동반 강세", "장비 수주 확산", "바스켓 breadth 개선"],
      },
      {
        type: "base",
        title: "Concentrated Expansion",
        probability: 45,
        summary: "HBM 인접 체인에 집중된 강세가 유지되되 변동성이 동반되는 시나리오.",
        watchPoints: ["HBM 가이던스", "외국인 수급", "환율"],
      },
      {
        type: "bear",
        title: "Narrowing Cycle",
        probability: 20,
        summary: "범용 가격 둔화와 차익실현이 겹치며 확장 국면의 폭이 좁아지는 시나리오.",
        watchPoints: ["재고 지표", "가격 피크아웃", "미국 금리"],
      },
    ],
    risks: [SIGNALS.memoryMomentum, SIGNALS.chinaSupply, SIGNALS.valuationRisk, SIGNALS.fxRate],
    sources: [
      SOURCES.customs,
      SOURCES.trendforce,
      SOURCES.dart,
      SOURCES.nvidiaIr,
      SOURCES.micronIr,
      SOURCES.sellside,
      SOURCES.motie,
      SOURCES.manual,
    ],
    disclaimer: REPORT_DISCLAIMER,
  },
];

export const weeklyReportsSorted = [...mockWeeklyReports].sort((a, b) =>
  b.weekStart.localeCompare(a.weekStart),
);

export const latestWeeklyReport = weeklyReportsSorted[0];

export function findWeeklyReport(slug: string): WeeklySemiReport | undefined {
  return mockWeeklyReports.find((r) => r.slug === slug);
}
