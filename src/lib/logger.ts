type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return 'info';
})();

function shouldLog(level: LogLevel): boolean {
  return levelWeight[level] >= levelWeight[configuredLevel];
}

function redactValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (/password|secret|token|key|hash/i.test(key)) {
        output[key] = '[REDACTED]';
      } else {
        output[key] = redactValue(nestedValue);
      }
    }

    return output;
  }

  return value;
}

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

  if (level === 'error') {
    console.error(payload);
    return;
  }

  if (level === 'warn') {
    console.warn(payload);
    return;
  }

  if (level === 'debug') {
    console.debug(payload);
    return;
  }

  console.info(payload);
}

export const logger = {
  debug(message: string, context?: LogContext) {
    writeLog('debug', message, context);
  },
  info(message: string, context?: LogContext) {
    writeLog('info', message, context);
  },
  warn(message: string, context?: LogContext) {
    writeLog('warn', message, context);
  },
  error(message: string, context?: LogContext) {
    writeLog('error', message, context);
  },
};
