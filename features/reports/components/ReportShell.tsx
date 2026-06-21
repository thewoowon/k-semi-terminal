import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReportNav, type NavKey } from "./ReportNav";
import { REPORT_DISCLAIMER_SHORT } from "../constants/reportDisclaimers";

const FOOTER_LINKS = [
  { href: "/terminal", label: "Terminal" },
  { href: "/reports", label: "Reports" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export type Crumb = { label: string; href?: string };

type ReportShellProps = {
  active?: NavKey;
  breadcrumb?: Crumb[];
  right?: ReactNode;
  children: ReactNode;
  /** narrower reading column for long-form report bodies */
  narrow?: boolean;
};

/** Page chrome for the report surface (spec §10) — dark, dense, institutional. */
export function ReportShell({
  active,
  breadcrumb,
  right,
  children,
  narrow,
}: ReportShellProps) {
  return (
    <div className="min-h-screen bg-base bg-grid text-ink">
      <ReportNav active={active} />

      <div className="mx-auto max-w-[1440px] px-4 py-5">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-4 flex items-center gap-1.5 font-mono text-[11px] text-ink-faint">
            {breadcrumb.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-line-strong">/</span>}
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink-dim">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink-dim">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {right ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <main className={cn("min-w-0", narrow && "mx-auto w-full max-w-3xl")}>
              {children}
            </main>
            <aside className="hidden lg:block">
              <div className="sticky top-16 flex flex-col gap-3">{right}</div>
            </aside>
          </div>
        ) : (
          <main className={cn(narrow && "mx-auto w-full max-w-3xl")}>{children}</main>
        )}

        <footer className="mt-10 border-t border-line pt-5">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[11px] text-ink-dim hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-faint">
            © {new Date().getFullYear()} K-Semi Signal · {REPORT_DISCLAIMER_SHORT}
          </p>
        </footer>
      </div>
    </div>
  );
}
