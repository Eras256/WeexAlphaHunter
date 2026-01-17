
import { createWalletClient, http, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import { deflateSync } from 'zlib'; // For compression

dotenv.config();

// "Black Hole" audit address
const AUDIT_ADDRESS = "0x00000000000000000000000000000000TITANLOG";

export interface DecisionLog {
    timestamp: number;
    symbol: string;
    action: string;
    confidence: number;
    reasoning: string;
    guardianHash: string;
}

export class AuditService {
    private client;
    private buffer: DecisionLog[] = [];
    private readonly BATCH_SIZE = 50;
    private account;

    constructor() {
        const pk = process.env.PRIVATE_KEY;
        if (!pk || !pk.startsWith('0x')) {
            console.warn("⚠️ [Audit] No valid PRIVATE_KEY found. Audit logs will be simulated.");
            this.account = null;
        } else {
            this.account = privateKeyToAccount(pk as `0x${string}`);
            this.client = createWalletClient({
                account: this.account,
                chain: baseSepolia,
                transport: http() // Uses default public RPC for Base Sepolia
            });
        }
    }

    public async log(decision: DecisionLog) {
        this.buffer.push(decision);
        if (this.buffer.length >= this.BATCH_SIZE) {
            await this.flush();
        }
    }

    public async flush() {
        if (this.buffer.length === 0) return;

        const batch = [...this.buffer];
        this.buffer = []; // Clear buffer immediately

        console.log(`📦 [Audit] Compressing and batching ${batch.length} logs to Base L2...`);

        if (!this.account || !this.client) {
            console.log(`📝 [Audit] (Simulated) Sent batch ${batch.length} logs to ${AUDIT_ADDRESS}`);
            return;
        }

        try {
            // 1. Compress Payload
            const jsonPayload = JSON.stringify(batch);
            const compressed = deflateSync(jsonPayload); // Gzip/Deflate compression
            const calldata = toHex(compressed);

            // 2. Send Transaction (Self-transfer with calldata or to Null Address)
            const hash = await this.client.sendTransaction({
                to: AUDIT_ADDRESS as `0x${string}`,
                value: 0n,
                data: calldata
            });

            console.log(`✅ [Audit] Batch anchored on Blockchain! Tx: ${hash}`);
        } catch (error) {
            console.error(`❌ [Audit] Failed to anchor batch:`, error);
            // In prod: Re-queue batch or save to disk
        }
    }
}
