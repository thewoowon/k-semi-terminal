import type { ReportSignal } from "../lib/reportTypes";
import { ReportSignalCard } from "./ReportSignalCard";

/** Risk Radar — list of deteriorating/risk signals (spec §8.6). */
export function ReportRiskPanel({ risks }: { risks: ReportSignal[] }) {
  if (!risks.length) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {risks.map((r) => (
        <ReportSignalCard key={r.id} signal={r} />
      ))}
    </div>
  );
}
