import type { Metadata } from "next";
import Link from "next/link";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { unsubscribe } from "@/features/subscribers/unsubscribe";

export const metadata: Metadata = {
  title: "수신거부 | K-Semi Signal",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await unsubscribe(token)
    : ({ ok: false, reason: "not_found" } as const);

  return (
    <ReportShell narrow breadcrumb={[{ label: "K-Semi Signal", href: "/reports" }, { label: "Unsubscribe" }]}>
      <div className="rounded-lg border border-line bg-panel/70 p-8 text-center">
        {result.ok ? (
          <>
            <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-up/40 bg-up/10 text-up">
              ✓
            </div>
            <h1 className="text-[18px] font-bold text-ink">수신거부가 완료되었습니다</h1>
            <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink-dim">
              <span className="font-mono text-ink">{result.email}</span> 으로의
              K-Semi Signal 리포트 발송이 중단되었습니다. 언제든 다시 등록하실 수
              있습니다.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-line text-ink-faint">
              ?
            </div>
            <h1 className="text-[18px] font-bold text-ink">유효하지 않은 링크입니다</h1>
            <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink-dim">
              수신거부 토큰을 확인할 수 없습니다. 이메일의 최신 수신거부 링크를
              사용하거나 문의해 주세요.
            </p>
          </>
        )}
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href="/reports"
            className="rounded-md border border-line px-3 py-2 text-[12px] text-ink-dim hover:text-ink"
          >
            리포트 보기
          </Link>
          <Link
            href="/subscribe"
            className="rounded-md border border-hot/40 bg-hot/10 px-3 py-2 text-[12px] font-semibold text-hot hover:bg-hot/15"
          >
            다시 등록
          </Link>
        </div>
      </div>
    </ReportShell>
  );
}
