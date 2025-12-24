export interface Trade {
    tradeId: string;
    symbol: string;
    side: "BUY" | "SELL";
    price: number;
    qty: number;
    timestamp: string;  // ISO
    commission: number;
    pnl?: number;       // Filled on exit
    exitPrice?: number;
    exitReason?: string;

    // Traceability & Audit
    aiDecisionId: string; // Links to data/logs/ai_decisions.jsonl
    onChainTxHash?: string; // Links to blockchain (or simulated proof)

    // Strategy State
    aiConfidence: number;
}

export interface AccountState {
    balance: number; // USDT
    equity: number;
    positions: Position[];
}

export interface Position {
    symbol: string;
    entryPrice: number;
    qty: number;
    side: "LONG" | "SHORT";
    unrealizedPnl: number;
}

export interface AIDecision {
    decisionId: string;
    symbol: string;
    timestamp: string;
    action: "BUY" | "SELL" | "HOLD";
    confidence: number;
    reasoning: string;
    featuresSnapshot: Record<string, number>;
}

export interface ComplianceProof {
    weexUid: string;
    kycStatus: "VERIFIED" | "PENDING";
    ipAddress: string;
    apiTestStatus: "PASSED" | "FAILED" | "PENDING_KEYS";
    apiTestTimestamp?: string;
}
