import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust in production to reduce volume
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send errors if DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Filter out specific error messages or patterns
    const error = hint.originalException;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message);

      // Ignore common development errors
      if (message.includes('ResizeObserver loop')) {
        return null;
      }
    }

    return event;
  },

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and images
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
