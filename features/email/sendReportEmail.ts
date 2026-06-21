import "server-only";
import { render } from "@react-email/components";
import { env, features } from "@/lib/env";
import { resend } from "./resend.client";
import { DailyReportEmail } from "./templates/DailyReportEmail";
import type { DailySemiReport } from "@/features/reports/lib/reportTypes";
import { emailSubject } from "@/features/reports/lib/reportFormatter";

export type SendOutcome = {
  status: "sent" | "skipped" | "failed";
  resendId?: string;
  error?: string;
};

/**
 * Send one daily report email (launch checklist §9.4). When Resend is not
 * configured, the send is logged and reported as "skipped" so the delivery
 * pipeline still records a row without failing.
 */
export async function sendDailyReportEmail(args: {
  to: string;
  report: DailySemiReport;
  unsubscribeUrl: string;
  slug: string;
}): Promise<SendOutcome> {
  const { to, report, unsubscribeUrl, slug } = args;
  const subject = emailSubject(report);
  const reportUrl = `${env.appUrl}/reports/daily/${slug}`;

  if (!features.email) {
    console.log(`[email:skipped] ${to} — "${subject}"`);
    return { status: "skipped" };
  }

  try {
    // Render the React email to HTML ourselves. Passing `react:` makes the
    // Resend SDK call @react-email/render internally, which Yarn PnP can't
    // resolve from inside the SDK ("render is not a function"). Rendering via
    // our own @react-email/components dependency sidesteps that.
    const html = await render(
      DailyReportEmail({
        title: report.title,
        subtitle: report.subtitle,
        summary: report.executiveSummary,
        cycleScore: report.cycleScore,
        cycleLabel: report.cycleLabel,
        reportUrl,
        unsubscribeUrl,
        disclaimer: report.disclaimer,
      }),
    );
    const res = await resend().emails.send({
      from: env.resendFrom,
      to,
      subject,
      html,
      headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
    });
    if (res.error) {
      return { status: "failed", error: res.error.message };
    }
    return { status: "sent", resendId: res.data?.id };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}
