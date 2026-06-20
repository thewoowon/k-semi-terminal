import Link from "next/link";

/** Reports hub hero (spec §23 launch copy). */
export function ReportHero() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-b from-panel to-base p-6 sm:p-8">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-hot/30 bg-hot/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-hot" style={{ animation: "k-pulse 2s infinite" }} />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-hot">
            K-Semi Signal · Founding Period
          </span>
        </div>

        <h1 className="max-w-2xl text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
          Korea Semiconductor Signal Terminal
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-dim">
          글로벌 반도체 사이클, HBM 수요, 메모리 가격, 해외 벨웨더, 한국 반도체
          밸류체인을 하나의 신호 체계로 연결합니다. K-Semi Signal은 매일 아침
          반도체 시장의 핵심 변화를 해석하고, 이벤트가 한국 반도체 체인에 어떤
          영향을 줄 수 있는지 구조적으로 보여줍니다.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Link
            href="/subscribe"
            className="rounded-md bg-hot px-4 py-2.5 text-[13px] font-bold text-base hover:bg-hot/90"
          >
            Founding Reader로 무료 구독하기
          </Link>
          <Link
            href="/reports/daily/latest"
            className="rounded-md border border-line px-4 py-2.5 text-[13px] font-semibold text-ink hover:border-line-strong"
          >
            오늘의 Morning Brief 보기 →
          </Link>
          <Link
            href="/terminal"
            className="rounded-md px-4 py-2.5 text-[13px] font-medium text-ink-dim hover:text-ink"
          >
            라이브 터미널 열기
          </Link>
        </div>

        <p className="mt-4 max-w-2xl text-[11.5px] text-ink-faint">
          초기 독자 모집 기간 동안, 향후 Pro 플랜에 포함될 Daily Brief와 Weekly
          Deep Dive를 무료로 제공합니다.
        </p>
      </div>
    </section>
  );
}
