import type { ReportSignal } from "../lib/reportTypes";

/**
 * Reusable signal library. Tone follows spec §19 — cold, probability-based,
 * chain-impact framing, never a stock recommendation.
 */
export const SIGNALS: Record<string, ReportSignal> = {
  hbmStrength: {
    id: "sig-hbm-strength",
    title: "AI/HBM 체인 강도 유지",
    segment: "hbm",
    score: 82,
    direction: "improving",
    confidence: "high",
    summary:
      "AI 서버 수요 기대가 HBM 밸류체인 전반의 프리미엄을 유지시키는 구간이다.",
    rationale: [
      "글로벌 AI 인프라 투자 기대가 유지된다.",
      "HBM 공급 병목은 후공정 및 테스트 체인까지 영향을 준다.",
      "한국 밸류체인에서는 메모리, 본딩, 테스트 소켓 기업의 민감도가 높다.",
    ],
    relatedCompanies: ["SK하이닉스", "한미반도체", "ISC", "리노공업"],
    relatedEvents: ["AI server demand", "HBM supply constraint"],
  },
  dramContract: {
    id: "sig-dram-contract",
    title: "DRAM 계약가 상승폭 가이던스 상회",
    segment: "memory",
    score: 64,
    direction: "improving",
    confidence: "high",
    summary:
      "DDR5 서버 모듈이 계약가 상승을 주도하며, HBM 전환에 따른 범용 DRAM 공급 타이트닝이 확인된다.",
    rationale: [
      "메모리 업체의 HBM 캐파 전환이 범용 DRAM 공급을 제한한다.",
      "서버 교체 수요가 DDR5 믹스를 끌어올린다.",
    ],
    relatedCompanies: ["SK하이닉스", "삼성전자"],
    relatedEvents: ["DRAM contract price", "DDR5 mix"],
  },
  equipmentOrder: {
    id: "sig-equipment-order",
    title: "후공정 본딩 장비 수주 모멘텀",
    segment: "equipment",
    score: 71,
    direction: "improving",
    confidence: "medium",
    summary:
      "HBM 스택 고단화로 TC 본더·하이브리드 본딩 수요가 확대되며 장비 수주가 누적된다.",
    rationale: [
      "HBM4 전환은 본딩·패키징 공정 강도를 높인다.",
      "수주 공시가 후공정 장비 사이클을 선반영한다.",
    ],
    relatedCompanies: ["한미반도체", "HPSP"],
    relatedEvents: ["TC bonder order", "advanced packaging capex"],
  },
  testSocket: {
    id: "sig-test-socket",
    title: "테스트 소켓 수요 견조",
    segment: "test-socket",
    score: 56,
    direction: "improving",
    confidence: "medium",
    summary:
      "HBM Known-Good-Die 테스트 강도 상승으로 소켓·프로브 소모가 늘어난다.",
    rationale: [
      "스택당 테스트 횟수 증가가 소모성 부품 수요를 견인한다.",
    ],
    relatedCompanies: ["ISC", "리노공업"],
    relatedEvents: ["KGD test", "HBM test intensity"],
  },
  exportPrint: {
    id: "sig-export-print",
    title: "5월 반도체 수출 +38% YoY",
    segment: "memory",
    score: 68,
    direction: "improving",
    confidence: "high",
    summary:
      "메모리 ASP 회복과 HBM 믹스가 수출 금액을 사상 최고 수준으로 끌어올렸다.",
    rationale: [
      "수출은 한국 메모리 실물 사이클의 프록시다.",
      "11개월 연속 YoY 증가로 추세가 확인된다.",
    ],
    relatedCompanies: ["삼성전자", "SK하이닉스"],
    relatedEvents: ["chip exports", "memory ASP"],
  },
  // — risks —
  memoryMomentum: {
    id: "risk-memory-momentum",
    title: "범용 메모리 가격 모멘텀 둔화",
    segment: "memory",
    score: -32,
    direction: "deteriorating",
    confidence: "medium",
    summary:
      "HBM은 강하지만 범용 DRAM/NAND 가격 모멘텀은 별도 확인이 필요하다.",
    rationale: ["HBM과 commodity memory의 사이클은 완전히 동일하지 않다."],
    relatedCompanies: ["삼성전자", "SK하이닉스"],
    relatedEvents: ["DRAM price", "NAND price"],
  },
  chinaSupply: {
    id: "risk-china-supply",
    title: "중국 레거시 공급 확대 압박",
    segment: "materials",
    score: -28,
    direction: "deteriorating",
    confidence: "medium",
    summary:
      "중국 내 레거시 DRAM/NAND 캐파 증설이 범용 가격에 하방 압력을 준다.",
    rationale: ["HBM/DDR5와의 직접 중첩은 낮지만 레거시 믹스 기업에는 부담."],
    relatedCompanies: ["솔브레인"],
    relatedEvents: ["China capacity", "commodity NAND"],
  },
  valuationRisk: {
    id: "risk-valuation",
    title: "고밸류·차익실현 압력",
    segment: "equipment",
    score: -22,
    direction: "deteriorating",
    confidence: "low",
    summary:
      "강한 랠리 이후 일부 후공정·장비주에서 변동성과 차익실현 압력이 커질 수 있다.",
    rationale: ["모멘텀 과열 구간에서는 단기 되돌림 확률이 상승한다."],
    relatedCompanies: ["한미반도체"],
    relatedEvents: ["momentum exhaustion"],
  },
  fxRate: {
    id: "risk-fx",
    title: "환율·금리 변수",
    segment: "memory",
    score: -14,
    direction: "neutral",
    confidence: "low",
    summary:
      "원/달러 환율과 미국 금리 경로는 외국인 수급과 밸류에이션에 양방향으로 작용한다.",
    rationale: ["매크로 변수는 펀더멘털과 별개로 수급을 흔들 수 있다."],
    relatedCompanies: ["삼성전자"],
    relatedEvents: ["USD/KRW", "US rates"],
  },
  foundrySoft: {
    id: "sig-foundry-soft",
    title: "파운드리 가동률 혼조",
    segment: "foundry",
    score: -8,
    direction: "neutral",
    confidence: "medium",
    summary:
      "선단 공정 수요는 견조하나 레거시 파운드리 가동률은 지역별로 엇갈린다.",
    rationale: ["메모리 강세가 종합 반도체 기업의 믹스를 방어한다."],
    relatedCompanies: ["삼성전자", "DB하이텍"],
    relatedEvents: ["foundry utilization"],
  },
};
