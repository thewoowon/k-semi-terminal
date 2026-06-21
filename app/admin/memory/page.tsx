import type { Metadata } from "next";
import { ReportShell } from "@/features/reports/components/ReportShell";
import { AdminMemoryClient } from "@/features/terminal/components/AdminMemoryClient";

export const metadata: Metadata = {
  title: "Memory Prices | K-Semi Signal (internal)",
  robots: { index: false, follow: false },
};

// Internal tool — hidden from main nav. No auth in Phase 0.
export default function AdminMemoryPage() {
  return (
    <ReportShell breadcrumb={[{ label: "Internal" }, { label: "Memory Prices" }]}>
      <AdminMemoryClient />
    </ReportShell>
  );
}
