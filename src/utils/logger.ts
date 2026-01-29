/**
 * Logger utility with Playwright HTML report integration.
 *
 * Usage:
 *   import { logger, annotations } from "../utils/logger";
 *
 *   logger.info("Regular log message");         // Only logs to console/file
 *   annotations.info("Annotated message");      // Logs AND adds to HTML report
 */

import winston from "winston";
import path from "path";
import { test } from "@playwright/test";

type LogMetadata = Record<string, unknown>;

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
    let msg = `${ts} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    transports: [
        new winston.transports.Console({
            format: combine(colorize({ all: true }), logFormat),
        }),
        new winston.transports.File({
            filename: path.join("logs", "error.log"),
            level: "error",
        }),
        new winston.transports.File({
            filename: path.join("logs", "combined.log"),
        }),
    ],
});

function formatAnnotationDescription(
    message: string,
    metadata?: LogMetadata
): string {
    return message + (metadata ? ` ${JSON.stringify(metadata)}` : "");
}

function addAnnotation(
    type: string,
    message: string,
    metadata?: LogMetadata
): void {
    try {
        test.info().annotations.push({
            type,
            description: formatAnnotationDescription(message, metadata),
        });
    } catch {
        logger.error("Error adding annotation", { type, message, metadata });
    }
}

/**
 * Enhanced logger that also adds annotations to the Playwright HTML report
 */
export const annotations = {
    info: (message: string, metadata?: LogMetadata): void => {
        logger.info(message, metadata);
        addAnnotation("info", message, metadata);
    },

    warn: (message: string, metadata?: LogMetadata): void => {
        logger.warn(message, metadata);
        addAnnotation("warn", message, metadata);
    },

    error: (message: string, metadata?: LogMetadata): void => {
        logger.error(message, metadata);
        addAnnotation("error", message, metadata);
    },

    debug: (message: string, metadata?: LogMetadata): void => {
        logger.debug(message, metadata);
    },
};
