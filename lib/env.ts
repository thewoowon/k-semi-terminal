/**
 * Centralized environment access. Never throws at import/build time — every
 * value is optional so `next build` passes with no secrets present. Secrets are
 * read only inside server routes/jobs; `appUrl` is the one public value.
 *
 * Provider note: report generation uses Claude (Anthropic), server-only.
 */

const DEFAULT_MODEL = "claude-opus-4-8";

export const env = {
  // AI (server-only)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,

  // Email (server-only)
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM || "K-Semi Signal <brief@k-semi.signal>",

  // App
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000",
  adminSecret: process.env.ADMIN_SECRET,
  cronSecret: process.env.CRON_SECRET,

  // Database (server-only)
  databaseUrl: process.env.DATABASE_URL,

  // Observability
  sentryDsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

/** Feature-availability flags — drive graceful fallbacks across the app. */
export const features = {
  /** Real Claude generation available; otherwise fall back to mock generator. */
  ai: Boolean(env.anthropicApiKey),
  /** Real Resend sending available; otherwise log + mark delivery skipped. */
  email: Boolean(env.resendApiKey),
  /** Postgres/Prisma available; otherwise file-backed repository. */
  db: Boolean(env.databaseUrl),
  /** Sentry error capture available. */
  sentry: Boolean(env.sentryDsn),
} as const;

/** Constant-time-ish secret comparison for admin/cron guards. */
export function secretEquals(provided: string | null | undefined, expected: string | undefined): boolean {
  if (!expected) return false; // never authorize when no secret configured
  if (!provided) return false;
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
