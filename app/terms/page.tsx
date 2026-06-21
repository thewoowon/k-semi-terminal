import type { Metadata } from "next";
import { LegalShell } from "@/features/reports/components/LegalShell";

export const metadata: Metadata = { title: "Terms | K-Semi Signal" };

export default function TermsPage() {
  return (
    <LegalShell title="이용약관 (Terms)" updated="2026.06.21">
      <h2>1. 서비스의 성격</h2>
      <p>
        K-Semi Signal(이하 “서비스”)은 반도체 산업 데이터와 자체 산출 지표를
        해석해 제공하는 정보 제공 서비스입니다. 서비스는 투자자문업·투자일임업에
        해당하지 않으며, 특정 금융투자상품의 매매를 권유하지 않습니다.
      </p>
      <h2>2. Founding Reader</h2>
      <p>
        초기 독자 모집 기간 동안 Daily Brief와 Weekly Deep Dive를 무료로
        제공합니다. 유료화 이후에도 초기 독자 우대 혜택이 제공될 예정이며, 혜택의
        구체적 내용은 별도 공지됩니다.
      </p>
      <h2>3. 책임의 한계</h2>
      <ul>
        <li>서비스의 점수·시나리오·AI 분석은 확률적 해석이며 정확성을 보장하지 않습니다.</li>
        <li>투자 판단과 그 결과에 대한 책임은 전적으로 사용자에게 있습니다.</li>
        <li>서비스는 데이터 출처의 오류나 지연에 대해 책임을 지지 않습니다.</li>
      </ul>
      <h2>4. 수신 및 해지</h2>
      <p>
        사용자는 언제든지 이메일의 수신거부 링크 또는 문의를 통해 구독을 해지할 수
        있습니다.
      </p>
      <p>
        자세한 내용은 <a href="/disclaimer">투자 유의 고지</a> 및{" "}
        <a href="/privacy">개인정보 처리방침</a>을 참고하세요.
      </p>
    </LegalShell>
  );
}
