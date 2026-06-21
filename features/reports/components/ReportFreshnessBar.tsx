import type { ReportFreshness } from "../lib/reportFreshness";
import { dotDate, kstTime } from "@/lib/formatDate";

function stamp(iso: string | null): string {
  if (!iso) return "—";
  const t = kstTime(iso);
  return t ? `${dotDate(iso)} ${t} KST` : dotDate(iso);
}

/** Data-freshness / provenance bar shown on every report (launch §13). */
export function ReportFreshnessBar({
  freshness,
  pdfHref,
}: {
  freshness: ReportFreshness;
  pdfHref?: string;
}) {
  const items: [string, string][] = [
    ["Generated", stamp(freshness.generatedAt)],
    ["Data Cutoff", stamp(freshness.dataCutoffAt)],
    ["Sources", freshness.sourceCount != null ? String(freshness.sourceCount) : "—"],
    ["Model", freshness.model],
    ["Status", freshness.status],
    ["Mode", freshness.mode],
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-line bg-panel/50 px-3 py-2">
      {items.map(([k, v]) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className="label-xs">{k}</span>
          <span className="font-mono text-[10.5px] text-ink-dim">{v}</span>
        </span>
      ))}
      {pdfHref && (
        <a
          href={pdfHref}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded border border-line px-2 py-1 font-mono text-[10px] text-ink-dim hover:border-line-strong hover:text-ink"
        >
          PDF ↓
        </a>
      )}
    </div>
  );
}
