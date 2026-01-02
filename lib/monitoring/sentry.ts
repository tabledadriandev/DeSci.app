/**
 * Sentry Error Tracking Integration
 * Monitors errors and performance in production
 * Optional dependency - gracefully handles when @sentry/nextjs is not installed
 */

let Sentry: { init?: (config: unknown) => void; captureException?: (error: Error, options?: unknown) => void; captureMessage?: (message: string, level?: string) => void; setUser?: (user: unknown) => void; addBreadcrumb?: (breadcrumb: unknown) => void; BrowserTracing?: new () => unknown; Replay?: new () => unknown } | null = null;

// Try to load Sentry (optional dependency)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require('@sentry/nextjs');
} catch {
  // Sentry not installed - functions will be no-ops
  console.warn('@sentry/nextjs not installed - error tracking disabled');
}

/**
 * Initialize Sentry
 */
export function initSentry() {
  if (!Sentry) {
    console.warn('Sentry not available - error tracking disabled');
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  if (Sentry.init) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.BrowserTracing ? new Sentry.BrowserTracing() : undefined,
        Sentry.Replay ? new Sentry.Replay() : undefined,
      ].filter(Boolean),
    });
  }
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!Sentry || !Sentry.captureException) return;
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' | 'fatal' | 'debug' = 'info') {
  if (!Sentry || !Sentry.captureMessage) return;
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  if (!Sentry || !Sentry.setUser) return;
  Sentry.setUser(user);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error' | 'fatal' | 'debug') {
  if (!Sentry || !Sentry.addBreadcrumb) return;
  Sentry.addBreadcrumb({
    message,
    category,
    level: level || 'info',
  });
}
