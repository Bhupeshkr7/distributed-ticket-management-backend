import chalk from 'chalk';

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

  private getColor(level: LogLevel) {
    switch (level) {
      case 'error':
        return chalk.red;
      case 'warn':
        return chalk.yellow;
      case 'info':
        return chalk.green;
      case 'debug':
        return chalk.blue;
      default:
        return chalk.white;
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
