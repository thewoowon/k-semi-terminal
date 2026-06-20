import type { Metadata } from "next";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { AdminReportsClient } from "@/features/reports/components/AdminReportsClient";

export const metadata: Metadata = {
  title: "Report Studio | K-Semi Signal (internal)",
  robots: { index: false, follow: false },
};

// Internal tool — hidden from main nav (spec §17.5). No auth in Phase 0.
export default function AdminReportsPage() {
  return (
    <ReportShell
      breadcrumb={[{ label: "Internal" }, { label: "Report Studio" }]}
    >
      <AdminReportsClient />
    </ReportShell>
  );
}
