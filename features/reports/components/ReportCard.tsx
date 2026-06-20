import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AnyReport } from "../lib/reportTypes";
import { REPORT_TYPE_META } from "../constants/reportLabels";
import { cycleTone } from "../lib/reportScoring";
import { dotDate, dotRange } from "@/lib/formatDate";
import { AccessBadge } from "./ReportBadges";

const TONE_VAR: Record<string, string> = {
  hot: "var(--color-hot)",
  warm: "var(--color-warm)",
  up: "var(--color-up)",
  flat: "var(--color-flat)",
  memory: "var(--color-memory)",
};

function reportHref(r: AnyReport): string {
  return r.type === "daily"
    ? `/reports/daily/${r.date}`
    : `/reports/weekly/${r.slug}`;
}

function reportDateText(r: AnyReport): string {
  return r.type === "daily"
    ? dotDate(r.date)
    : dotRange(r.weekStart, r.weekEnd);
}

/** Card for a report in hubs/lists. `feature` makes it a larger hero card. */
export function ReportCard({
  report,
  feature,
  className,
}: {
  report: AnyReport;
  feature?: boolean;
  className?: string;
}) {
  const typeMeta = REPORT_TYPE_META[report.type];
  const color = TONE_VAR[cycleTone(report.cycleScore)];

  return (
    <Link
      href={reportHref(report)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-line bg-panel/70 transition-colors hover:border-line-strong hover:bg-panel",
        feature ? "p-5" : "p-4",
        className,
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: typeMeta.cssVar }}
      />
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: typeMeta.cssVar }}
        >
          {typeMeta.label}
        </span>
        <AccessBadge level={report.accessLevel} />
      </div>

      <h3
        className={cn(
          "font-bold leading-tight text-ink",
          feature ? "text-[19px]" : "text-[14px]",
        )}
      >
        {report.title}
      </h3>
      <p
        className={cn(
          "mt-1 text-ink-dim",
          feature ? "text-[13px] leading-relaxed line-clamp-3" : "text-[11.5px] line-clamp-2",
        )}
      >
        {report.subtitle}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <span className="font-mono text-[10.5px] text-ink-faint">
          {reportDateText(report)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="label-xs">Cycle</span>
          <span
            className="text-[15px] font-bold tabular-nums"
            style={{ color }}
          >
            {report.cycleScore}
          </span>
        </span>
      </div>
    </Link>
  );
}
