import { createHash } from 'crypto';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function generateUUID() {
    return crypto.randomUUID();
}

/**
 * Creates a deterministic hash of the AI decision for auditability.
 * This simulates the "On-Chain Commit" hash.
 */
export function hashDecision(decisionId: string, timestamp: string, action: string): string {
    const payload = `${decisionId}:${timestamp}:${action}`;
    return createHash('sha256').update(payload).digest('hex');
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function getEnv(key: string, defaultVal?: string): string {
    const val = process.env[key];
    if (!val && defaultVal === undefined) {
        // throw new Error(`Missing ENV: ${key}`);
        return ""; // Soft fail for now to allow Mock mode
    }
    return val || defaultVal || "";
}
