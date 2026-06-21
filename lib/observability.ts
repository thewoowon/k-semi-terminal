import { features } from "./env";

/** Capture an error to Sentry when configured; always logs (launch §16). */
export async function captureError(
  err: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  console.error("[error]", err, context ?? "");
  if (!features.sentry) return;
  try {
    // Hidden from webpack (see instrumentation.ts) — never bundled under PnP.
    const spec = "@sentry/nextjs";
    const Sentry = await import(/* webpackIgnore: true */ spec);
    Sentry.captureException(err, context ? { extra: context } : undefined);
  } catch {
    /* never let observability break the request */
  }
}
