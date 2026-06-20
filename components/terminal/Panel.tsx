import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
  /** removes inner padding so children control their own spacing */
  flush?: boolean;
};

/** Base terminal surface — consistent border, radius, density (spec §20). */
export function Panel({ children, className, flush }: PanelProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-col rounded-lg border border-line bg-panel/80",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset,0_8px_24px_-12px_rgba(0,0,0,0.6)]",
        !flush && "p-3",
        className,
      )}
    >
      {children}
    </section>
  );
}

type PanelHeaderProps = {
  title: string;
  /** small mono caption left of the title */
  tag?: string;
  right?: ReactNode;
  accent?: string;
  className?: string;
};

export function PanelHeader({
  title,
  tag,
  right,
  accent,
  className,
}: PanelHeaderProps) {
  return (
    <header
      className={cn(
        "mb-2 flex shrink-0 items-center justify-between gap-2",
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {accent && (
          <span
            className="h-3 w-[3px] shrink-0 rounded-full"
            style={{ background: accent }}
          />
        )}
        {tag && <span className="label-xs">{tag}</span>}
        <h2 className="truncate text-[12px] font-semibold tracking-wide text-ink">
          {title}
        </h2>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}
