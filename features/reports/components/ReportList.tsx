import { cn } from "@/lib/utils";
import type { AnyReport } from "../lib/reportTypes";
import { ReportCard } from "./ReportCard";

/** Responsive grid of report cards. */
export function ReportList({
  reports,
  cols = 3,
  className,
}: {
  reports: AnyReport[];
  cols?: 2 | 3;
  className?: string;
}) {
  if (!reports.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-panel/40 p-8 text-center text-[12px] text-ink-faint">
        No reports yet.
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2",
        cols === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {reports.map((r) => (
        <ReportCard key={r.id} report={r} />
      ))}
    </div>
  );
}
