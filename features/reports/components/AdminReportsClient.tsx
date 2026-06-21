"use client";

import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { dotDate, todayKst } from "@/lib/formatDate";
import type { DailySemiReport } from "../lib/reportTypes";
import { DailyReportView } from "./DailyReportView";
import { EmailPreview } from "./EmailPreview";
import {
  actionApprove,
  actionGenerate,
  actionGetReport,
  actionListReports,
  actionSendAll,
  actionStats,
  actionTest,
  type ReportSummary,
} from "@/app/admin/reports/actions";

type Modes = { ai: string; email: string };
type Stats = { backend: string; activeSubscribers: number; totalSubscribers: number };

const STATUS_TONE: Record<string, string> = {
  draft: "text-ink-dim border-line bg-elevated/60",
  generated: "text-memory border-memory/30 bg-memory/10",
  approved: "text-up border-up/30 bg-up/10",
  sent: "text-hbm border-hbm/30 bg-hbm/10",
  failed: "text-down border-down/30 bg-down/10",
};

export function AdminReportsClient({ modes }: { modes: Modes }) {
  const [date, setDate] = useState(todayKst());
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<DailySemiReport | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [preview, setPreview] = useState<"web" | "email">("web");
  const [testEmail, setTestEmail] = useState("");
  const [log, setLog] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function refresh() {
    const [list, s] = await Promise.all([actionListReports(), actionStats()]);
    setReports(list);
    setStats(s);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const [list, s] = await Promise.all([actionListReports(), actionStats()]);
      if (active) {
        setReports(list);
        setStats(s);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function openReport(slug: string) {
    setSelectedSlug(slug);
    setSelected(await actionGetReport(slug));
  }

  const run = (fn: () => Promise<string>) =>
    start(async () => {
      setLog(null);
      try {
        setLog(await fn());
        await refresh();
      } catch (e) {
        setLog(`✕ ${e instanceof Error ? e.message : String(e)}`);
      }
    });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-ink">
            Report Studio
          </h1>
          <p className="mt-1 text-[12px] text-ink-dim">
            생성 · 검수 · 발송 워크플로 (내부용). draft → generated → approved → sent
          </p>
        </div>
        {stats && (
          <div className="flex flex-wrap gap-2 font-mono text-[10px]">
            <Tag label="STORE" value={stats.backend} />
            <Tag label="ACTIVE" value={`${stats.activeSubscribers}`} />
            <Tag label="TOTAL" value={`${stats.totalSubscribers}`} />
            <Tag label="AI" value={modes.ai} />
            <Tag label="EMAIL" value={modes.email} />
          </div>
        )}
      </header>

      {/* generate */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-panel/70 p-3">
        <span className="label-xs">Generate</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 rounded-md border border-line bg-base px-2.5 text-[12px] text-ink focus:border-hot/50 focus:outline-none"
        />
        <button
          disabled={pending}
          onClick={() =>
            run(async () => {
              const r = await actionGenerate(date);
              return r.ok
                ? `✓ generated ${r.slug} · cycle ${r.cycleScore} · ${r.source}/${r.model}`
                : `✕ ${r.error}`;
            })
          }
          className="rounded-md bg-hot px-3 py-2 text-[12px] font-semibold text-base hover:bg-hot/90 disabled:opacity-50"
        >
          {pending ? "처리 중…" : "Generate Draft"}
        </button>
        {log && <span className="font-mono text-[11px] text-ink-dim">{log}</span>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* report list */}
        <div className="rounded-lg border border-line bg-panel/70">
          <div className="border-b border-line p-2.5">
            <span className="label-xs">Reports ({reports.length})</span>
          </div>
          <ul className="max-h-[70vh] divide-y divide-line/60 overflow-y-auto scrollarea">
            {reports.length === 0 && (
              <li className="p-4 text-center text-[12px] text-ink-faint">
                아직 생성된 리포트가 없습니다.
              </li>
            )}
            {reports.map((r) => (
              <li key={r.slug}>
                <button
                  onClick={() => openReport(r.slug)}
                  className={cn(
                    "w-full px-3 py-2.5 text-left hover:bg-elevated/50",
                    selectedSlug === r.slug && "bg-elevated/70",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-ink">{r.date}</span>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase",
                        STATUS_TONE[r.status] ?? STATUS_TONE.draft,
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-ink-dim">
                      cycle {r.cycleScore ?? "—"} · {r.source}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* preview + workflow */}
        <div className="min-w-0">
          {!selected ? (
            <div className="grid h-full place-items-center rounded-lg border border-dashed border-line p-10 text-center text-[12px] text-ink-faint">
              리포트를 선택하면 미리보기와 검수/발송 동작이 표시됩니다.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* workflow bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel/70 p-3">
                <a
                  href={`/reports/daily/${selectedSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-ink-dim hover:text-ink"
                >
                  웹 ↗
                </a>
                <a
                  href={`/reports/daily/${selectedSlug}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-ink-dim hover:text-ink"
                >
                  PDF ↗
                </a>
                <button
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      const r = await actionApprove(selectedSlug!);
                      return r.ok ? `✓ approved (${r.status})` : "✕ approve failed";
                    })
                  }
                  className="rounded-md border border-up/40 bg-up/10 px-2.5 py-1.5 text-[11px] font-semibold text-up hover:bg-up/15 disabled:opacity-50"
                >
                  Approve
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@email"
                    className="h-8 w-40 rounded-md border border-line bg-base px-2 text-[11px] text-ink focus:border-hot/50 focus:outline-none"
                  />
                  <button
                    disabled={pending || !testEmail}
                    onClick={() =>
                      run(async () => {
                        const r = await actionTest(selectedSlug!, testEmail);
                        return r.ok
                          ? `✓ test → ${testEmail} (${r.sent ? "sent" : "skipped"})`
                          : `✕ ${r.error}`;
                      })
                    }
                    className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-ink-dim hover:text-ink disabled:opacity-50"
                  >
                    Send Test
                  </button>
                </div>
                <button
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      const r = await actionSendAll(selectedSlug!);
                      return r.ok
                        ? `✓ sent ${r.sent}/${r.total} (failed ${r.failed}, skipped ${r.skipped})`
                        : `✕ ${r.error}`;
                    })
                  }
                  className="rounded-md border border-hot/40 bg-hot/10 px-2.5 py-1.5 text-[11px] font-semibold text-hot hover:bg-hot/15 disabled:opacity-50"
                >
                  Send to All
                </button>

                <div className="ml-auto flex items-center gap-1 rounded-md border border-line bg-base/60 p-1">
                  {(["web", "email"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPreview(m)}
                      className={cn(
                        "rounded px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
                        preview === m ? "bg-elevated text-ink" : "text-ink-dim hover:text-ink",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-line p-3">
                <div className="label-xs mb-2">
                  {preview === "web" ? "Web Preview" : "Email Preview"} ·{" "}
                  {dotDate(selected.date)}
                </div>
                {preview === "web" ? (
                  <DailyReportView report={selected} />
                ) : (
                  <EmailPreview report={selected} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-line bg-base/50 px-1.5 py-1 text-ink-dim">
      <span className="text-ink-faint">{label}</span>
      <span className="text-ink">{value}</span>
    </span>
  );
}
