import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private minLevel: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  constructor() { }

  private logWithLevel(level: LogLevel, message: string, ...data: any[]): void {
    if (level < this.minLevel) {
      return;
    }

    const formattedDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const prefix = `[${formattedDate}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...data);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...data);
        break;
    }
  }

  setLogLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(message: string, ...data: any[]): void {
    this.logWithLevel(LogLevel.DEBUG, message, ...data);
  }

  info(message: string, ...data: any[]): void {
    this.logWithLevel(LogLevel.INFO, message, ...data);
  }

  warn(message: string, ...data: any[]): void {
    this.logWithLevel(LogLevel.WARN, message, ...data);
  }

  error(message: string, ...data: any[]): void {
    this.logWithLevel(LogLevel.ERROR, message, ...data);
  }

  log(message: string, ...data: any[]): void {
    this.info(message, ...data);
  }

  logException(message: string, error: Error): void {
    this.error(message, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }

  logWithTime<T>(label: string, operation: () => T): T {
    const start = performance.now();
    try {
      const result = operation();
      const duration = performance.now() - start;
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed after ${duration.toFixed(2)}ms`);
      throw error;
    }
  }
}