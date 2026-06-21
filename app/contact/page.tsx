import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/features/reports/components/LegalShell";

export const metadata: Metadata = { title: "Contact | K-Semi Signal" };

export default function ContactPage() {
  return (
    <LegalShell title="문의 (Contact)" updated="2026.06.21">
      <p>
        제휴, 데이터, 피드백, 개인정보 삭제 요청 등 모든 문의는 아래 이메일로
        보내주세요.
      </p>
      <p>
        <a href="mailto:hello@k-semi.app">hello@k-semi.app</a>
      </p>
      <h2>Founding Reader</h2>
      <p>
        리포트를 받아보고 싶으시면{" "}
        <Link href="/subscribe">Founding Reader 등록</Link> 페이지에서 이메일을
        남겨주세요. 결제 기능 오픈 전까지 모든 핵심 리포트는 무료로 제공됩니다.
      </p>
    </LegalShell>
  );
}
