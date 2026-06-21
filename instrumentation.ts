/**
 * Server instrumentation hook (Next.js). Initializes Sentry only on the Node.js
 * runtime and only when SENTRY_DSN is set. The import is hidden from webpack
 * (webpackIgnore + non-literal specifier) so @sentry/nextjs is never bundled in
 * either the node or edge runtime — required under Yarn PnP, where Sentry's
 * OpenTelemetry peers don't resolve through the bundler. When DSN is unset this
 * is a no-op; to fully activate Sentry, use the node-modules linker.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.SENTRY_DSN) return;
  try {
    const spec = "@sentry/nextjs";
    const Sentry = await import(/* webpackIgnore: true */ spec);
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  } catch (e) {
    console.warn("[instrumentation] Sentry init skipped:", e);
  }
}
