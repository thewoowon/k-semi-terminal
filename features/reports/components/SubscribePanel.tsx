"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const INTEREST_SEGMENTS = [
  "삼성전자",
  "SK하이닉스",
  "HBM",
  "메모리 가격",
  "장비주",
  "소재/부품",
  "후공정",
  "수출/매크로",
];

/**
 * Founding Reader registration (spec §17.4). Phase 0: no real backend — the
 * submission is logged and a confirmation state is shown. Swap `onSubmit` for
 * an API/DB call at Phase 1.
 */
export function SubscribePanel() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<string[]>(["HBM", "SK하이닉스"]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (s: string) =>
    setInterests((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    setError(null);
    // Phase 0 — mock submission (no backend yet).
    console.log("[K-Semi Founding Reader]", { email, name, interests });
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-lg border border-up/30 bg-up/[0.06] p-6 text-center">
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-up/40 bg-up/10 text-up">
          ✓
        </div>
        <h3 className="text-[16px] font-bold text-ink">
          Founding Reader 등록이 접수되었습니다
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink-dim">
          {email} 으로 매일 아침 K-Semi Morning Brief와 주간 Deep Dive를 보내
          드릴 예정입니다. 결제 기능 오픈 이후에도 초기 독자 우대 혜택이
          제공됩니다.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setEmail("");
            setName("");
          }}
          className="mt-4 rounded-md border border-line px-3 py-1.5 text-[12px] text-ink-dim hover:text-ink"
        >
          다른 이메일로 등록
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-line bg-panel/70 p-5"
    >
      <div className="mb-4">
        <label className="label-xs mb-1.5 block">이메일 *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-10 w-full rounded-md border border-line bg-base px-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-hot/50 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="label-xs mb-1.5 block">이름 (선택)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="h-10 w-full rounded-md border border-line bg-base px-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-hot/50 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="label-xs mb-2 block">관심 세그먼트</label>
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_SEGMENTS.map((s) => {
            const on = interests.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-[12px] transition-colors",
                  on
                    ? "border-hot/50 bg-hot/10 text-hot"
                    : "border-line bg-base text-ink-dim hover:border-line-strong hover:text-ink",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="mb-3 text-[12px] text-down">{error}</p>}

      <button
        type="submit"
        className="h-11 w-full rounded-md bg-hot text-[13px] font-bold text-base hover:bg-hot/90"
      >
        Founding Reader로 등록하기
      </button>
      <p className="mt-2.5 text-center text-[10.5px] text-ink-faint">
        결제 기능 오픈 전까지 모든 핵심 리포트는 무료로 제공됩니다. 언제든
        수신을 해지할 수 있습니다.
      </p>
    </form>
  );
}
