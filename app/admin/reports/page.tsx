import type { Metadata } from "next";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { AdminReportsClient } from "@/features/reports/components/AdminReportsClient";
import { env, features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Report Studio | K-Semi Signal (internal)",
  robots: { index: false, follow: false },
};

// Internal tool — hidden from main nav (spec §17.5). No auth in Phase 0.
export default function AdminReportsPage() {
  const modes = {
    ai: features.ai ? `Claude · ${env.anthropicModel}` : "Rule-based (mock)",
    email: features.email ? "Resend" : "Console (skipped)",
  };
  return (
    <ReportShell breadcrumb={[{ label: "Internal" }, { label: "Report Studio" }]}>
      <AdminReportsClient modes={modes} />
    </ReportShell>
  );
}
