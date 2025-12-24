import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), simple()) // Human readable on console
        }),
        new winston.transports.File({
            filename: 'data/logs/app.log'
        })
    ],
});

export const aiLogger = winston.createLogger({
    level: 'info',
    format: json(),
    defaultMeta: { service: 'ai-engine' },
    transports: [
        new winston.transports.File({
            filename: 'data/logs/ai_decisions.jsonl'
        })
    ]
});

// Helper for structured auditing
export function auditLog(type: string, payload: any) {
    logger.info(`AUDIT:${type}`, payload);
}
