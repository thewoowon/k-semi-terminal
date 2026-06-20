"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { generateMockDailyReport } from "../lib/reportGenerator";
import { mockDailyReports } from "../data/mockDailyReports";
import { DailyReportView } from "./DailyReportView";
import { EmailPreview } from "./EmailPreview";

type Mode = "web" | "email";

const QUICK_DATES = mockDailyReports.map((r) => r.date);

/** Internal report preview tool (spec §17.5). No auth in Phase 0. */
export function AdminReportsClient() {
  const [date, setDate] = useState("2026-06-21");
  const [mode, setMode] = useState<Mode>("web");

  const report = useMemo(() => generateMockDailyReport(date), [date]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-ink">
            Report Studio
          </h1>
          <p className="mt-1 text-[12px] text-ink-dim">
            Mock 리포트 생성 · 웹/이메일 프리뷰 · 마크다운/HTML 복사 (내부용)
          </p>
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-panel/70 p-3">
        <div className="flex items-center gap-2">
          <span className="label-xs">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-md border border-line bg-base px-2.5 text-[12px] text-ink focus:border-hot/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          {QUICK_DATES.map((d) => (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={cn(
                "rounded border px-2 py-1.5 font-mono text-[10px]",
                date === d
                  ? "border-hot/50 bg-hot/10 text-hot"
                  : "border-line text-ink-dim hover:text-ink",
              )}
            >
              {d.slice(5)}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-md border border-line bg-base/60 p-1">
          {(["web", "email"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider",
                mode === m ? "bg-elevated text-ink" : "text-ink-dim hover:text-ink",
              )}
            >
              {m === "web" ? "Web Preview" : "Email"}
            </button>
          ))}
        </div>
      </div>

      {mode === "web" ? (
        <div className="rounded-lg border border-dashed border-line p-3">
          <div className="label-xs mb-2">Web Report Preview · {date}</div>
          <DailyReportView report={report} />
        </div>
      ) : (
        <EmailPreview report={report} />
      )}
    </div>
  );
}
