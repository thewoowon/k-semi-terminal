import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ReportSectionProps = {
  title: string;
  /** small uppercase tag shown above/left of the title */
  tag?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
};

/** Titled content block used throughout reports. Thin border, dense header. */
export function ReportSection({
  title,
  tag,
  subtitle,
  right,
  children,
  id,
  className,
}: ReportSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-16 rounded-lg border border-line bg-panel/70 p-4",
        className,
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-3 border-b border-line pb-2.5">
        <div className="min-w-0">
          {tag && <div className="label-xs mb-1">{tag}</div>}
          <h2 className="text-[15px] font-bold tracking-tight text-ink">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[12px] text-ink-dim">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </header>
      {children}
    </section>
  );
}
