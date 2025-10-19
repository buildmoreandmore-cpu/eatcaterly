import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust in production to reduce volume
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send errors if DSN is not configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Remove sensitive data from context
    if (event.request) {
      // Remove headers that might contain sensitive data
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }

    // Filter database connection strings from error messages
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map(exception => {
        if (exception.value) {
          exception.value = exception.value.replace(
            /postgresql:\/\/[^@]+@[^/]+/gi,
            'postgresql://***:***@***/***'
          );
        }
        return exception;
      });
    }

    return event;
  },
});
