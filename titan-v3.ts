
import { TitanGuardian } from './packages/guardian/index.js'; // Requires build
import { NeuralCortex, MarketSnapshot } from './packages/neural/inference.mjs';
import { ImmutableLedger } from './packages/audit/ledger.js';
import * as dotenv from 'dotenv';

dotenv.config();

class TitanV3Orchestrator {
    private guardian: TitanGuardian;
    private cortex: NeuralCortex;
    private ledger: ImmutableLedger;
    private isRunning = false;

    // Internal State
    private lastRSI = 50.0;
    private lastVol = 0.5;

    constructor() {
        console.log("🦁 TITAN V3 [Production-Grade] Initializing...");

        // 1. Initialize Symbolic Core (Rust)
        this.guardian = new TitanGuardian();
        console.log("✅ [Symbolic] Titan Guardian (NAPI-RS) loaded.");

        // 2. Initialize Neural Core (System 2)
        this.cortex = new NeuralCortex();

        // 3. Initialize Audit
        this.ledger = new ImmutableLedger();
    }

    public async start() {
        await this.cortex.init();
        this.isRunning = true;
        console.log("🚀 TITAN V3 Engine Started. Watching Orderbook...");

        // Simulate WebSocket Feed
        this.mockExchangeFeed();
    }

    private async onTick(tick: MarketSnapshot) {
        if (!this.isRunning) return;
        const t0 = performance.now();

        // =========================================================
        // STEP 1: RUST NATIVE METRICS (AVX-512)
        // =========================================================
        const ofiScore = this.guardian.calculateOfi(
            JSON.stringify(tick.bids),
            JSON.stringify(tick.asks)
        );
        tick.ofi = ofiScore; // Enrich snapshot

        // =========================================================
        // STEP 2: NEURAL INFERENCE (Async System 2)
        // =========================================================
        // Only trigger heavy inference if simple conditions align
        const neuralOutput = await this.cortex.infer(tick);

        if (neuralOutput.action === 'HOLD') {
            // Log but don't validate
            // console.log(`💤 Brain HOLD (${neuralOutput.confidence.toFixed(2)})`);
            return;
        }

        // =========================================================
        // STEP 3: SYMBOLIC VALIDATION (The Silicon Guardian)
        // =========================================================
        const marketTrend = tick.price > 3300 ? "BULLISH" : "BEARISH";

        // Article 14 Safety Check
        const validationJson = this.guardian.validateIntent(
            neuralOutput.action,
            0.1, // Fixed size for demo
            this.lastVol,
            ofiScore,
            marketTrend,
            20.0, // ADX default (moderate trend)
            tick.rsi || this.lastRSI, // RSI from tick or simulation
            0 // Position count (default for demo)
        );

        const validation = JSON.parse(validationJson);
        const t1 = performance.now();
        const totalLatency = t1 - t0;

        // =========================================================
        // STEP 4: EXECUTION & AUDIT
        // =========================================================
        if (validation.allowed) {
            console.log(`⚡ [EXECUTE] ${neuralOutput.action} ${tick.symbol} | OFI: ${ofiScore.toFixed(3)} | Latency: ${totalLatency.toFixed(2)}ms`);
            console.log(`   🧠 Reasoning: ${neuralOutput.reasoning}`);
        } else {
            console.warn(`🛡️ [VETO] Guardian Blocked ${neuralOutput.action}: ${validation.reason}`);
        }

        // Audit everything
        this.ledger.log({
            timestamp: Date.now(),
            symbol: tick.symbol,
            action: neuralOutput.action,
            confidence: neuralOutput.confidence,
            reasoning: neuralOutput.reasoning,
            guardianDecision: validation.allowed ? "APPROVED" : validation.reason
        });

        // Sim updates
        this.updateSim();
    }

    private updateSim() {
        this.lastVol = Math.random(); // 0-1
        this.lastRSI += (Math.random() - 0.5) * 5;
    }

    private mockExchangeFeed() {
        setInterval(() => {
            // console.log('💓 Tick'); // Uncomment to debug heartbeat
            const price = 3300 + Math.random() * 50;
            const snapshot: MarketSnapshot = {
                symbol: 'ETH/USDT',
                price,
                bids: [[price - 0.1, 10], [price - 0.5, 20]],
                asks: [[price + 0.1, 10], [price + 0.5, 20]],
                ofi: 0,
                rsi: this.lastRSI
            };
            this.onTick(snapshot);
        }, 1000);
    }
}

// Start
new TitanV3Orchestrator().start();
