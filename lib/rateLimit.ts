/**
 * In-memory fixed-window rate limiter (launch checklist §15 — subscribe spam
 * protection). Per-process; fine for Phase 0. Swap for Upstash/Redis when
 * running multiple instances.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  entry.count++;
  const ok = entry.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - entry.count),
    retryAfter: ok ? 0 : Math.ceil((entry.reset - now) / 1000),
  };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
