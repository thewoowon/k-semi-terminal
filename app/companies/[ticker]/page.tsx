import Link from "next/link";
import { notFound } from "next/navigation";
import { companies } from "@/features/terminal/data/mockCompanies";
import { chainNodes } from "@/features/terminal/data/mockTerminalData";
import { fetchDomesticDaily } from "@/features/terminal/lib/kis";
import { features } from "@/lib/env";
import { Sparkline } from "@/components/terminal/Sparkline";
import { DeltaPill, ScoreChip } from "@/components/terminal/StatusBadge";
import {
  directionForDelta,
  krw,
  pct,
  trillion,
} from "@/features/terminal/lib/format";

// Live KIS quotes — render on demand rather than statically.
export const dynamic = "force-dynamic";

// Next.js 16: `params` is a Promise and must be awaited.
export default async function CompanyPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const base = companies.find((c) => c.ticker === ticker);
  if (!base) notFound();

  // Overlay live price/momentum/spark; signalScore + marketCap stay model/mock.
  const live = features.marketData ? await fetchDomesticDaily(base.ticker) : null;
  const company = live
    ? {
        ...base,
        price: live.price,
        change1d: live.change1d,
        change5d: live.change5d,
        change20d: live.change20d,
        spark: live.spark,
      }
    : base;

  const node = chainNodes.find((n) => n.id === company.chainNodeId);
  const changes: [string, number][] = [
    ["1D", company.change1d],
    ["5D", company.change5d],
    ["20D", company.change20d],
  ];

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col gap-5 p-6">
      <Link
        href="/terminal"
        className="font-mono text-[11px] text-ink-dim hover:text-ink"
      >
        ‹ K-SEMI TERMINAL
      </Link>

      <header className="flex items-start justify-between gap-4 rounded-lg border border-line bg-panel p-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-mono text-[12px] text-ink-faint">{company.ticker}</span>
            <ScoreChip score={company.signalScore} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{company.name}</h1>
          <p className="mt-1 text-[12px] uppercase tracking-wide text-ink-dim">
            {company.segment} · {trillion(company.marketCap)} mktcap
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-ink">
            ₩{krw(company.price)}
          </div>
          <div className="mt-1 flex justify-end">
            <Sparkline
              data={company.spark}
              width={160}
              height={44}
              area
              dot
              color={company.change20d >= 0 ? "var(--color-up)" : "var(--color-down)"}
            />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3">
        {changes.map(([label, v]) => (
          <div key={label} className="rounded-lg border border-line bg-panel p-4">
            <div className="label-xs mb-2">{label} CHANGE</div>
            <DeltaPill direction={directionForDelta(v)}>{pct(v)}</DeltaPill>
          </div>
        ))}
      </section>

      {node && (
        <section className="rounded-lg border border-line bg-panel p-5">
          <div className="label-xs mb-2">Chain Linkage</div>
          <p className="text-[13px] text-ink-dim">
            Mapped to{" "}
            <span className="font-semibold text-ink">{node.label}</span> in the
            signal chain. Open the terminal to trace its upstream drivers and
            downstream effects.
          </p>
          <Link
            href="/terminal"
            className="mt-3 inline-flex rounded-md border border-line bg-elevated px-3 py-2 text-[12px] font-semibold text-ink hover:border-line-strong"
          >
            Inspect in Terminal →
          </Link>
        </section>
      )}

      <p className="text-[10px] text-ink-faint">
        {live ? "Live price (KIS)" : "Mock data"} · signalScore is a model
        observation, not investment advice.
      </p>
    </main>
  );
}
