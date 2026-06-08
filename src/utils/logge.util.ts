// Inline ANSI helpers — avoids chalk's ESM-only v5+ incompatibility with CJS builds
const ANSI = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  white: (s: string) => `\x1b[37m${s}\x1b[0m`,
};

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const CURRENT_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || 'info';

class Logger {
  private namespace?: string;

  constructor(namespace?: string) {
    this.namespace = namespace;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[CURRENT_LEVEL];
  }

  private getColor(level: LogLevel): (s: string) => string {
    switch (level) {
      case 'error':
        return ANSI.red;
      case 'warn':
        return ANSI.yellow;
      case 'info':
        return ANSI.green;
      case 'debug':
        return ANSI.blue;
      default:
        return ANSI.white;
    }
  }

  private formatMessage(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();
    const ns = this.namespace ? `[${this.namespace}]` : '';
    return `[${timestamp}] ${level.toUpperCase()} ${ns} ${message}`;
  }

  private log(level: LogLevel, message: string, meta?: unknown) {
    if (!this.shouldLog(level)) return;

    const color = this.getColor(level);
    const formatted = this.formatMessage(level, message);

    console.log(color(formatted), meta ?? '');
  }

  error(message: string, meta?: unknown) {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: unknown) {
    this.log('info', message, meta);
  }

  debug(message: string, meta?: unknown) {
    this.log('debug', message, meta);
  }
}

export default Logger;
