import Link from "next/link";
import { cn } from "@/lib/utils";

const BENEFITS = [
  "매일 K-Semi Morning Brief 전문 수신",
  "주간 K-Semi Weekly Deep Dive 전문 수신",
  "유료화 이후 초기 독자 우대 혜택",
  "신규 기능 우선 접근",
];

type Variant = "hero" | "inline" | "footer";

/** Founding Reader CTA (spec §11). Visible but not annoying — exact copy. */
export function FoundingReaderCTA({
  variant = "inline",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hot/30 bg-hot/[0.06] px-4 py-3",
          className,
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px]">★</span>
            <span className="text-[13px] font-bold text-ink">
              Founding Reader Access
            </span>
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-dim">
            결제 기능 오픈 전까지 Pro급 리포트를 무료로 받아보세요.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/subscribe"
            className="rounded-md bg-hot px-3 py-2 text-[12px] font-semibold text-base hover:bg-hot/90"
          >
            Founding Reader로 등록하기
          </Link>
        </div>
      </div>
    );
  }

  const isHero = variant === "hero";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-hot/30 bg-gradient-to-b from-hot/[0.08] to-transparent p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[12px]">★</span>
        <h3 className="text-[15px] font-bold text-ink">Founding Reader Access</h3>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-dim">
        K-Semi Signal은 현재 초기 독자 모집 중입니다. 향후 Pro 플랜에 포함될
        Daily Brief와 Weekly Deep Dive를 결제 기능 오픈 전까지 무료로 제공합니다.
      </p>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-1.5 text-[12px] text-ink">
            <span className="mt-0.5 text-up">›</span>
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href="/subscribe"
          className="rounded-md bg-hot px-4 py-2.5 text-[13px] font-bold text-base hover:bg-hot/90"
        >
          Founding Reader로 등록하기
        </Link>
        {isHero && (
          <Link
            href="/reports/daily/latest"
            className="rounded-md border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-dim hover:border-line-strong hover:text-ink"
          >
            오늘 리포트만 먼저 보기
          </Link>
        )}
      </div>
    </div>
  );
}
