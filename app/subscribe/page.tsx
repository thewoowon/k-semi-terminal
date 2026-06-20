import type { Metadata } from "next";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { SubscribePanel } from "@/features/reports/components/SubscribePanel";

export const metadata: Metadata = {
  title: "Founding Reader 등록 | K-Semi Signal",
  description:
    "K-Semi Signal Founding Reader로 등록하고 Daily Brief와 Weekly Deep Dive를 무료로 받아보세요.",
};

const BENEFITS = [
  "매일 K-Semi Morning Brief 전문 수신",
  "주간 K-Semi Weekly Deep Dive 전문 수신",
  "유료화 이후 초기 독자 우대 혜택",
  "신규 기능 우선 접근",
];

export default function SubscribePage() {
  return (
    <ReportShell
      active="subscribe"
      breadcrumb={[{ label: "Reports", href: "/reports" }, { label: "Subscribe" }]}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        {/* copy */}
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-hot/30 bg-hot/10 px-2.5 py-1">
            <span className="text-[10px]">★</span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-hot">
              Founding Reader Access
            </span>
          </div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">
            K-Semi Signal은 현재
            <br />
            초기 독자를 모집하고 있습니다
          </h1>
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-dim">
            향후 Pro 플랜에 포함될 Daily Brief와 Weekly Deep Dive를 결제 기능
            오픈 전까지 무료로 제공합니다. Founding Reader는 유료화 이후에도 초기
            독자 우대 혜택을 받습니다.
          </p>

          <ul className="mt-5 grid max-w-xl gap-2 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 rounded-md border border-line bg-panel/60 px-3 py-2.5 text-[12.5px] text-ink"
              >
                <span className="mt-0.5 text-up">›</span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-md border border-line/60 bg-base/30 p-3">
            <p className="text-[11px] leading-relaxed text-ink-faint">
              K-Semi Signal의 점수와 시나리오는 확률적 해석이며 미래 수익률을
              보장하지 않습니다. 본 서비스는 정보 제공을 목적으로 하며 특정
              금융투자상품의 매수·매도를 권유하지 않습니다.
            </p>
          </div>
        </div>

        {/* form */}
        <div className="lg:sticky lg:top-16">
          <SubscribePanel />
        </div>
      </div>
    </ReportShell>
  );
}
