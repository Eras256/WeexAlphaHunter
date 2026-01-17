import { createWalletClient, http, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
dotenv.config();

const BLACK_HOLE_ADDRESS = "0x00000000000000000000000000000000TITANLOG";

export interface LogEntry {
    timestamp: number;
    symbol: string;
    action: string;
    confidence: number;
    reasoning: string;
    guardianDecision: string;
}

export class ImmutableLedger {
    private client;
    private buffer: LogEntry[] = [];
    private BATCH_SIZE = 50;

    constructor() {
        if (!process.env.PRIVATE_KEY) {
            console.warn("⚠️ [Audit] No PRIVATE_KEY. Ledger is disabled.");
            return;
        }
        try {
            const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
            this.client = createWalletClient({
                account,
                chain: baseSepolia,
                transport: http()
            });
        } catch (e) {
            console.error("⚠️ [Audit] Init failed:", e);
        }
    }

    public log(entry: LogEntry) {
        this.buffer.push(entry);
        if (this.buffer.length >= this.BATCH_SIZE) {
            this.flush();
        }
    }

    public async flush() {
        if (!this.client || this.buffer.length === 0) return;

        const batch = [...this.buffer];
        this.buffer = [];

        try {
            // Compress: Just pure JSON stringify for now (zlib would be next step)
            // Minify JSON to save gas
            const payload = JSON.stringify(batch.map(l => [l.timestamp, l.symbol, l.action, l.confidence, l.guardianDecision]));
            const calldata = toHex(payload);

            console.log(`📝 [Ledger] Anchoring batch of ${batch.length} logs to Base L2...`);

            const hash = await this.client.sendTransaction({
                to: BLACK_HOLE_ADDRESS,
                value: 0n,
                data: calldata
            });

            console.log(`✅ [Ledger] Anchored: ${hash}`);
        } catch (e) {
            console.error("❌ [Ledger] Anchor failed:", e);
            // Retry logic
            this.buffer.unshift(...batch);
        }
    }
}
