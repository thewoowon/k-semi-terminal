"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { DailySemiReport } from "../lib/reportTypes";
import {
  emailSubject,
  toEmailHtml,
  toEmailMarkdown,
} from "../lib/reportFormatter";

type Tab = "markdown" | "html" | "rendered";

/** Email-ready output preview + copy (spec §17.5, §22). */
export function EmailPreview({ report }: { report: DailySemiReport }) {
  const [tab, setTab] = useState<Tab>("markdown");
  const [copied, setCopied] = useState<string | null>(null);

  const subject = useMemo(() => emailSubject(report), [report]);
  const markdown = useMemo(() => toEmailMarkdown(report), [report]);
  const html = useMemo(() => toEmailHtml(report), [report]);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied("failed");
    }
  };

  return (
    <div className="rounded-lg border border-line bg-panel/70">
      {/* subject */}
      <div className="flex items-center gap-2 border-b border-line p-3">
        <span className="label-xs shrink-0">Subject</span>
        <span className="truncate text-[12px] text-ink">{subject}</span>
        <button
          onClick={() => copy("subject", subject)}
          className="ml-auto shrink-0 rounded border border-line px-2 py-1 font-mono text-[10px] text-ink-dim hover:text-ink"
        >
          {copied === "subject" ? "복사됨" : "복사"}
        </button>
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 border-b border-line p-2">
        {(["markdown", "html", "rendered"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors",
              tab === t ? "bg-elevated text-ink" : "text-ink-dim hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={() => copy("markdown", markdown)}
            className="rounded border border-line px-2 py-1 font-mono text-[10px] text-ink-dim hover:text-ink"
          >
            {copied === "markdown" ? "MD 복사됨" : "Copy MD"}
          </button>
          <button
            onClick={() => copy("html", html)}
            className="rounded border border-line px-2 py-1 font-mono text-[10px] text-ink-dim hover:text-ink"
          >
            {copied === "html" ? "HTML 복사됨" : "Copy HTML"}
          </button>
        </div>
      </div>

      {/* body */}
      <div className="max-h-[560px] overflow-auto scrollarea p-3">
        {tab === "rendered" ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-ink-dim">
            {tab === "markdown" ? markdown : html}
          </pre>
        )}
      </div>
    </div>
  );
}
