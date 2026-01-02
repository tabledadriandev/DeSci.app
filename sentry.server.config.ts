/**
 * Sentry Server Configuration
 * Runs on the server
 */

// Optional dependency - gracefully handles when @sentry/nextjs is not installed
(function() {
  let Sentry: unknown = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Sentry = require('@sentry/nextjs');
  } catch {
    // Sentry not installed - server-side error tracking disabled
    return;
  }

  if (Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Sentry as any).init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
    integrations: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (Sentry as any).Integrations.Http({ tracing: true }),
    ],
    });
  }
})();
