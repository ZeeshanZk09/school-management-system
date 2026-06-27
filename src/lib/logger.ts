/**
 * Supported log levels.
 */
type LogLevel = "debug" | "error" | "info" | "warn";

/**
 * Structured log context for additional metadata.
 */
type LogContext = {
  userId?: string;
  requestId?: string;
  ip?: string;
  path?: string;
  durationMs?: number;
  [key: string]: unknown;
};

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel: LogLevel = (() => {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return "info";
})();

/**
 * Checks if a log level should be emitted based on current configuration.
 */
function shouldLog(level: LogLevel): boolean {
  return levelWeight[level] >= levelWeight[configuredLevel];
}

/**
 * Redacts sensitive information from log objects.
 */
function redactValue(value: unknown): unknown {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  const output: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (/password|secret|token|key|hash/i.test(key)) {
      output[key] = "[REDACTED]";
    } else {
      output[key] = redactValue(nestedValue);
    }
  }

  return output;
}

/**
 * Core logging function that handles formatting, redaction, and output.
 */
function writeLog(level: LogLevel, message: string, context: LogContext = {}): void {
  if (!shouldLog(level)) {
    return;
  }

  const logRecord = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const payload = JSON.stringify(redactValue(logRecord));

  // In production environments, stdout/stderr is usually captured by a logging agent.
  switch (level) {
    case "error":
      console.error(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    case "debug":
      console.debug(payload);
      break;
    default:
      console.info(payload);
      break;
  }
}

/**
 * Production-ready logger with support for structured context and sensitive data redaction.
 */
export const logger = {
  /**
   * Log a debug message (lowest priority).
   */
  debug(message: string, context?: LogContext): void {
    writeLog("debug", message, context);
  },
  /**
   * Log an informational message.
   */
  info(message: string, context?: LogContext): void {
    writeLog("info", message, context);
  },
  /**
   * Log a warning message.
   */
  warn(message: string, context?: LogContext): void {
    writeLog("warn", message, context);
  },
  /**
   * Log an error message (highest priority).
   */
  error(message: string, context?: LogContext): void {
    writeLog("error", message, context);
  },
};
