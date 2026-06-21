import type { Metadata } from "next";
import { LegalShell } from "@/features/reports/components/LegalShell";

export const metadata: Metadata = { title: "Disclaimer | K-Semi Signal" };

export default function DisclaimerPage() {
  return (
    <LegalShell title="투자 유의 고지 (Disclaimer)" updated="2026.06.21">
      <p>
        K-Semi Signal은 정보 제공 목적의 콘텐츠입니다. 본 서비스는 특정
        금융투자상품의 매수, 매도, 보유를 권유하지 않습니다.
      </p>
      <p>
        리포트, 점수, 시나리오, AI 분석은 공개 데이터 및 자체 산출 지표를 기반으로
        한 확률적 해석이며, 미래 수익률이나 가격을 보장하지 않습니다.
      </p>
      <p>투자 판단과 그 결과에 대한 책임은 사용자 본인에게 있습니다.</p>
      <h2>점수와 시나리오의 성격</h2>
      <ul>
        <li>K-Semi Cycle Score 및 세그먼트/시그널 점수는 투명한 가중치 기반의 해석 지표입니다.</li>
        <li>Bull/Base/Bear 시나리오의 확률은 절대적 예측이 아니라 상대적 가능성의 표현입니다.</li>
        <li>이벤트-영향 체인은 인과의 “가능성”을 구조화한 것이며 확정된 사실이 아닙니다.</li>
      </ul>
      <p>
        본 콘텐츠는 어떠한 경우에도 매수/매도/목표가/급등주/수익 보장과 같은 표현을
        사용하지 않습니다.
      </p>
    </LegalShell>
  );
}
