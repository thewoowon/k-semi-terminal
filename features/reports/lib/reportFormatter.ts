/**
 * Email-ready output (spec §22). Converts a daily report into newsletter
 * markdown / HTML for Phase 0 manual sending (copy-paste into Buttondown,
 * Beehiiv, Substack, etc.). No email provider integration yet.
 */
import type { DailySemiReport, ReportSignal } from "./reportTypes";
import { dotDate } from "@/lib/formatDate";

function deltaStr(delta?: string | number): string {
  if (delta === undefined || delta === "") return "";
  const n = typeof delta === "number" ? delta : Number(delta);
  if (Number.isFinite(n)) return ` (${n >= 0 ? "+" : ""}${n})`;
  return ` (${delta})`;
}

function signalLine(s: ReportSignal): string {
  const sign = s.score >= 0 ? "+" : "";
  return `- **${s.title}** · ${s.segment} · score ${sign}${s.score} · ${s.confidence}\n  ${s.summary}`;
}

export function emailSubject(report: DailySemiReport): string {
  return `[K-Semi Morning Brief] ${dotDate(report.date)} — ${report.subtitle}`;
}

/** Newsletter markdown body (spec §22 structure). */
export function toEmailMarkdown(report: DailySemiReport): string {
  const lines: string[] = [];
  lines.push(`# ${report.title}`);
  lines.push("");
  lines.push(`> ${report.subtitle}`);
  lines.push("");
  lines.push(`**K-Semi Cycle Score: ${report.cycleScore} / 100 — ${report.cycleLabel}**`);
  lines.push("");
  lines.push("## One-line Thesis");
  lines.push(report.executiveSummary);
  lines.push("");

  lines.push("## Cycle Snapshot");
  for (const m of report.metrics) {
    lines.push(`- ${m.label}: **${m.value}**${deltaStr(m.delta)}`);
  }
  lines.push("");

  lines.push("## Top Signals");
  for (const s of report.topChanges.slice(0, 3)) lines.push(signalLine(s));
  lines.push("");

  if (report.chainImpacts[0]) {
    const c = report.chainImpacts[0];
    lines.push("## Chain Impact");
    lines.push(`**${c.title}** — ${c.summary}`);
    lines.push("");
    lines.push("```");
    lines.push(c.nodes.map((n) => n.label).join("  →  "));
    lines.push("```");
    lines.push("");
  }

  lines.push("## Risk Radar");
  for (const r of report.risks) lines.push(`- ${r.title} — ${r.summary}`);
  lines.push("");

  lines.push("## Scenarios");
  for (const sc of report.scenarios) {
    lines.push(`- **${sc.type.toUpperCase()} ${sc.probability}%** · ${sc.title}: ${sc.summary}`);
  }
  lines.push("");

  lines.push("---");
  lines.push("**전체 리포트 보기 →**  /reports/daily/" + report.date);
  lines.push("**Founding Reader로 등록하기 →**  /subscribe");
  lines.push("");
  lines.push(`_${report.disclaimer}_`);

  return lines.join("\n");
}

/** Minimal inline-styled HTML for email clients. */
export function toEmailHtml(report: DailySemiReport): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const metric = report.metrics
    .map(
      (m) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#8b949e">${esc(m.label)}</td><td style="padding:4px 0;font-weight:600;color:#e6edf3">${esc(String(m.value))}${esc(deltaStr(m.delta))}</td></tr>`,
    )
    .join("");
  const signals = report.topChanges
    .slice(0, 3)
    .map(
      (s) =>
        `<li style="margin-bottom:8px"><strong style="color:#e6edf3">${esc(s.title)}</strong> <span style="color:#59636e">· ${esc(s.segment)} · ${s.score >= 0 ? "+" : ""}${s.score}</span><br/><span style="color:#8b949e">${esc(s.summary)}</span></li>`,
    )
    .join("");
  const risks = report.risks
    .map((r) => `<li style="color:#8b949e;margin-bottom:4px">${esc(r.title)} — ${esc(r.summary)}</li>`)
    .join("");

  return `<div style="background:#05070a;color:#e6edf3;font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px">
  <div style="font-size:12px;letter-spacing:.12em;color:#ff6b00;text-transform:uppercase">K-Semi Signal</div>
  <h1 style="font-size:20px;margin:6px 0 2px">${esc(report.title)}</h1>
  <p style="color:#8b949e;margin:0 0 16px">${esc(report.subtitle)}</p>
  <div style="border:1px solid rgba(148,163,184,.2);border-radius:8px;padding:12px 16px;margin-bottom:16px">
    <span style="font-size:28px;font-weight:700;color:#ffb000">${report.cycleScore}</span>
    <span style="color:#59636e"> / 100 · ${esc(report.cycleLabel)}</span>
  </div>
  <p style="color:#e6edf3;line-height:1.6">${esc(report.executiveSummary)}</p>
  <h2 style="font-size:13px;color:#59636e;text-transform:uppercase;letter-spacing:.1em;margin-top:20px">Cycle Snapshot</h2>
  <table style="border-collapse:collapse;font-size:13px">${metric}</table>
  <h2 style="font-size:13px;color:#59636e;text-transform:uppercase;letter-spacing:.1em;margin-top:20px">Top Signals</h2>
  <ul style="padding-left:18px;font-size:13px">${signals}</ul>
  <h2 style="font-size:13px;color:#59636e;text-transform:uppercase;letter-spacing:.1em;margin-top:20px">Risk Radar</h2>
  <ul style="padding-left:18px;font-size:13px">${risks}</ul>
  <div style="margin-top:24px">
    <a href="/reports/daily/${report.date}" style="display:inline-block;background:#ff6b00;color:#05070a;font-weight:600;text-decoration:none;padding:10px 16px;border-radius:6px">전체 리포트 보기 →</a>
    <a href="/subscribe" style="display:inline-block;color:#e6edf3;text-decoration:none;padding:10px 16px;border:1px solid rgba(148,163,184,.28);border-radius:6px;margin-left:8px">Founding Reader로 등록하기 →</a>
  </div>
  <p style="color:#59636e;font-size:11px;line-height:1.6;margin-top:24px">${esc(report.disclaimer)}</p>
</div>`;
}
