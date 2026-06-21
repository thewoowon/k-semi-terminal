import type { ReactNode } from "react";
import { ReportShell } from "./ReportShell";

/** Shared chrome + typography for legal/trust pages (launch checklist §14). */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <ReportShell
      narrow
      breadcrumb={[{ label: "K-Semi Signal", href: "/reports" }, { label: title }]}
    >
      <article>
        <h1 className="text-[26px] font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 font-mono text-[11px] text-ink-faint">
          최종 업데이트 {updated}
        </p>
        <div className="mt-6 flex flex-col gap-5 text-[13px] leading-relaxed text-ink-dim [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_a]:text-up [&_a]:underline">
          {children}
        </div>
      </article>
    </ReportShell>
  );
}
