export interface LogContext {
  userId?: string;
  route?: string;
  [key: string]: any;
}

export function logError(error: unknown, context: LogContext = {}) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[ERROR] [${new Date().toISOString()}] ${errorMessage}`, {
    ...context,
    stack: errorStack,
  });

  // If Sentry environment variable is configured, send exception
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== "undefined") {
    // Sentry client integration payload
  }
}

export function logInfo(message: string, context: LogContext = {}) {
  console.log(`[INFO] [${new Date().toISOString()}] ${message}`, context);
}
