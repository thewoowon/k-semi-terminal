/**
 * KRX trading-session state, computed from the wall-clock in Asia/Seoul.
 *
 * This is deterministic and needs no external feed: the session boundaries are
 * fixed by exchange rules and Korea has no DST, so KST = UTC+9 year-round.
 *
 * Session boundaries (KRX regular market):
 *   08:30–09:00  pre-open call auction  → "PRE"
 *   09:00–15:30  continuous + closing call auction → "OPEN"
 *   otherwise / weekend / holiday        → "CLOSED"
 *
 * NOTE: the holiday list below is the *fallback* truth used when no live index
 * feed is connected. Once the real index API is wired, prefer the feed's own
 * freshness (a quote whose timestamp is not from today's session ⇒ CLOSED),
 * because that handles ad-hoc closures and unverified lunar holidays for free.
 * Verify this list annually against the official KRX 휴장일 announcement.
 */

export type KrxSession = "PRE" | "OPEN" | "CLOSED";

/** KRX full-day closures (market closed). Format: "MM-DD". Verify annually. */
const KRX_HOLIDAYS_2026 = new Set<string>([
  "01-01", // 신정
  "02-16", // 설 연휴
  "02-17", // 설날
  "02-18", // 설 연휴
  "03-01", // 삼일절
  "03-02", // 삼일절 대체공휴일
  "05-05", // 어린이날
  "05-25", // 부처님오신날 대체공휴일
  "06-06", // 현충일
  "08-15", // 광복절
  "09-24", // 추석 연휴
  "09-25", // 추석
  "10-03", // 개천절
  "10-09", // 한글날
  "12-25", // 성탄절
  "12-31", // 연말 휴장
]);

type KstParts = {
  year: number;
  month: number;
  day: number;
  weekday: number; // 0 = Sunday … 6 = Saturday
  hour: number;
  minute: number;
};

/** Decompose an instant into Asia/Seoul calendar/clock fields. */
export function kstParts(at: Date = new Date()): KstParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(at).map((p) => [p.type, p.value]),
  );
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  // Intl emits "24" for midnight under hour12:false; normalize to 0.
  const hour = Number(parts.hour) % 24;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: weekdayMap[parts.weekday as string],
    hour,
    minute: Number(parts.minute),
  };
}

/** True when the given KST date is a weekend or a known KRX holiday. */
function isMarketHoliday(p: KstParts): boolean {
  if (p.weekday === 0 || p.weekday === 6) return true;
  const key = `${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  return KRX_HOLIDAYS_2026.has(key);
}

/** Compute the KRX session state for an instant (defaults to now). */
export function krxSession(at: Date = new Date()): KrxSession {
  const p = kstParts(at);
  if (isMarketHoliday(p)) return "CLOSED";
  const minutes = p.hour * 60 + p.minute;
  const PRE_OPEN = 8 * 60 + 30; // 08:30
  const REGULAR_OPEN = 9 * 60; // 09:00
  const REGULAR_CLOSE = 15 * 60 + 30; // 15:30
  if (minutes >= PRE_OPEN && minutes < REGULAR_OPEN) return "PRE";
  if (minutes >= REGULAR_OPEN && minutes < REGULAR_CLOSE) return "OPEN";
  return "CLOSED";
}

/** HH:MM:SS wall-clock string in Asia/Seoul, independent of browser locale. */
export function kstClock(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(at);
}
