/** Date helpers for reports — display in KST, dot-separated (2026.06.20). */

const KST_OPTS: Intl.DateTimeFormatOptions = { timeZone: "Asia/Seoul" };

/** YYYY-MM-DD or ISO → "2026.06.20". */
export function dotDate(input: string): string {
  const d = new Date(input.length === 10 ? `${input}T00:00:00+09:00` : input);
  if (Number.isNaN(d.getTime())) return input;
  const y = d.toLocaleString("en-US", { ...KST_OPTS, year: "numeric" });
  const m = d.toLocaleString("en-US", { ...KST_OPTS, month: "2-digit" });
  const day = d.toLocaleString("en-US", { ...KST_OPTS, day: "2-digit" });
  return `${y}.${m}.${day}`;
}

/** "2026.06.20 (금)" with Korean weekday. */
export function dotDateWithDay(input: string): string {
  const d = new Date(input.length === 10 ? `${input}T00:00:00+09:00` : input);
  if (Number.isNaN(d.getTime())) return input;
  const wd = d.toLocaleString("ko-KR", { ...KST_OPTS, weekday: "short" });
  return `${dotDate(input)} (${wd})`;
}

/** Compact range "06.16 – 06.22". */
export function dotRange(start: string, end: string): string {
  const s = dotDate(start).slice(5);
  const e = dotDate(end).slice(5);
  return `${s} – ${e}`;
}

/** HH:MM KST from an ISO timestamp. */
export function kstTime(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ko-KR", {
    ...KST_OPTS,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
