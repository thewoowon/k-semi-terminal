import type { Metadata } from "next";
import { LegalShell } from "@/features/reports/components/LegalShell";

export const metadata: Metadata = { title: "Privacy | K-Semi Signal" };

export default function PrivacyPage() {
  return (
    <LegalShell title="개인정보 처리방침 (Privacy)" updated="2026.06.21">
      <p>
        K-Semi Signal은 Founding Reader 서비스 제공에 필요한 최소한의 정보만
        수집합니다.
      </p>
      <h2>수집 항목</h2>
      <ul>
        <li>이메일 주소</li>
        <li>이름 (선택)</li>
        <li>관심 세그먼트 (선택)</li>
        <li>구독 / 수신거부 이력</li>
      </ul>
      <h2>사용 목적</h2>
      <ul>
        <li>리포트(Daily Brief / Weekly Deep Dive) 발송</li>
        <li>서비스 개선</li>
        <li>중요 공지 전달</li>
      </ul>
      <h2>보관 및 삭제</h2>
      <ul>
        <li>모든 이메일에는 수신거부(Unsubscribe) 링크가 포함됩니다.</li>
        <li>수신거부 시 발송 대상에서 즉시 제외됩니다.</li>
        <li>
          데이터 삭제를 원하시면{" "}
          <a href="/contact">문의</a> 페이지를 통해 요청하실 수 있습니다.
        </li>
      </ul>
      <p>
        결제 기능은 아직 제공하지 않으며, 결제·금융 정보는 일절 수집하지 않습니다.
      </p>
    </LegalShell>
  );
}
