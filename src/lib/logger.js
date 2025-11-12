/**
 * Centralized Logging System for TomaTurno
 *
 * Production-ready logger with support for different log levels,
 * structured logging, and environment-based configuration.
 *
 * Usage:
 *   import logger from '@/lib/logger';
 *   logger.info('User logged in', { userId: 123 });
 *   logger.error('Database error', { error: err.message });
 *   logger.debug('Debug information', { data: someData });
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    this.level = this.#getLogLevel();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  #getLogLevel() {
    const envLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    return LOG_LEVELS[envLevel] ?? LOG_LEVELS.INFO;
  }

  #shouldLog(level) {
    return LOG_LEVELS[level] <= this.level;
  }

  #formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();

    if (this.isProduction) {
      // Production: JSON format for log aggregation systems
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context,
      });
    } else {
      // Development: Human-readable format
      const contextStr = Object.keys(context).length > 0
        ? ` | ${JSON.stringify(context)}`
        : '';
      return `[${timestamp}] [${level}] ${message}${contextStr}`;
    }
  }

  error(message, context = {}) {
    if (this.#shouldLog('ERROR')) {
      console.error(this.#formatMessage('ERROR', message, context));
    }
  }

  warn(message, context = {}) {
    if (this.#shouldLog('WARN')) {
      console.warn(this.#formatMessage('WARN', message, context));
    }
  }

  info(message, context = {}) {
    if (this.#shouldLog('INFO')) {
      console.log(this.#formatMessage('INFO', message, context));
    }
  }

  debug(message, context = {}) {
    if (this.#shouldLog('DEBUG')) {
      console.log(this.#formatMessage('DEBUG', message, context));
    }
  }

  // Security-specific logging
  security(message, context = {}) {
    console.warn(this.#formatMessage('SECURITY', message, {
      ...context,
      _security: true,
    }));
  }

  // Performance logging
  performance(message, context = {}) {
    if (this.#shouldLog('INFO')) {
      console.log(this.#formatMessage('PERFORMANCE', message, {
        ...context,
        _performance: true,
      }));
    }
  }

  // Database operation logging
  database(message, context = {}) {
    if (this.#shouldLog('DEBUG')) {
      console.log(this.#formatMessage('DATABASE', message, {
        ...context,
        _database: true,
      }));
    }
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
