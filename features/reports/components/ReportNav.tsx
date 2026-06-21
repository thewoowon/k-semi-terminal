import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

export type NavKey =
  | "terminal"
  | "reports"
  | "archive"
  | "weekly"
  | "subscribe";

const LINKS: { key: NavKey; label: string; href: string }[] = [
  { key: "terminal", label: "Terminal", href: "/terminal" },
  { key: "reports", label: "Reports", href: "/reports" },
  { key: "weekly", label: "Weekly", href: "/reports/archive?tab=weekly" },
  { key: "archive", label: "Archive", href: "/reports/archive" },
];

/** Shared top navigation for the report surface. */
export function ReportNav({ active }: { active?: NavKey }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-4 px-4">
        <Link href="/reports" className="flex items-center gap-2">
          <div className=" relative grid h-7 w-7 place-items-center bg-hot/10">
            <Image
              src="/k-semi-logo.png"
              alt="Picture of the author"
              fill
              className="object-contain"
              sizes="28px"
            />
          </div>
          <span className="text-[13px] font-bold tracking-tight text-ink">
            K-Semi
            <span className="ml-1 text-ink-dim">Signal</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                active === l.key
                  ? "bg-elevated text-ink"
                  : "text-ink-dim hover:bg-elevated/50 hover:text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/subscribe"
          className={cn(
            "ml-auto rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors",
            active === "subscribe"
              ? "border-hot/50 bg-hot/15 text-hot"
              : "border-hot/40 bg-hot/10 text-hot hover:bg-hot/15"
          )}
        >
          Founding Reader 등록
        </Link>
      </div>
    </header>
  );
}
