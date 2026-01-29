/**
 * Logger utility with Playwright HTML report integration.
 * 
 * Usage:
 *   import { logger, annotations } from "../utils/logger";
 *   
 *   logger.info("Regular log message");         // Only logs to console/file
 *   annotations.info("Annotated message");      // Logs AND adds to HTML report
 */

import winston from 'winston';
import path from 'path';
import { test } from '@playwright/test';

const { combine, timestamp, printf, colorize } = winston.format;
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 1. Console logging with colors
    new winston.transports.Console({
      format: combine(colorize({ all: true }), logFormat),
    }),
    // 2. File logging for errors
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
    // 3. Combined file logging for everything
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
    }),
  ],
});

/**
 * Enhanced logger that also adds annotations to the Playwright HTML report
 */
export const annotations = {
  info: (message: string, metadata?: any) => {
    logger.info(message, metadata);
    try {
      test.info().annotations.push({
        type: 'info',
        description: message + (metadata ? ` ${JSON.stringify(metadata)}` : ''),
      });
    } catch (e) {
      // Ignore if called outside of a test context
    }
  },
  warn: (message: string, metadata?: any) => {
    logger.warn(message, metadata);
    try {
      test.info().annotations.push({
        type: 'warn',
        description: message + (metadata ? ` ${JSON.stringify(metadata)}` : ''),
      });
    } catch (e) {
      // Ignore
    }
  },
  error: (message: string, metadata?: any) => {
    logger.error(message, metadata);
    try {
      test.info().annotations.push({
        type: 'error',
        description: message + (metadata ? ` ${JSON.stringify(metadata)}` : ''),
      });
    } catch (e) {
      // Ignore
    }
  },
  debug: (message: string, metadata?: any) => {
    logger.debug(message, metadata);
  }
};
