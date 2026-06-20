import { cn } from "@/lib/utils";
import type { ReportSource } from "../lib/reportTypes";
import { dotDate } from "@/lib/formatDate";

const TYPE_LABEL: Record<ReportSource["sourceType"], string> = {
  news: "NEWS",
  disclosure: "공시",
  "market-data": "DATA",
  company: "IR",
  research: "RESEARCH",
  manual: "K-SEMI",
};

/** Source list with type tags (spec §8.8). */
export function ReportSourceList({ sources }: { sources: ReportSource[] }) {
  if (!sources.length) return null;
  return (
    <ul className="flex flex-col divide-y divide-line/60">
      {sources.map((s) => {
        const inner = (
          <div className="flex items-center gap-2.5 py-2">
            <span className="w-16 shrink-0 font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-faint">
              {TYPE_LABEL[s.sourceType]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] text-ink">{s.title}</div>
              <div className="text-[10.5px] text-ink-faint">{s.publisher}</div>
            </div>
            {s.publishedAt && (
              <span className="shrink-0 font-mono text-[10px] text-ink-faint">
                {dotDate(s.publishedAt)}
              </span>
            )}
          </div>
        );
        return (
          <li key={s.id}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("block hover:bg-elevated/40")}
              >
                {inner}
              </a>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}
