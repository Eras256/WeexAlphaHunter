
// Mock Gemini Client to avoid needing API key for basic test
class MockGemini {
    async generateTradingSignal() {
        return {
            action: 'BUY',
            confidence: 0.88,
            reasoning: 'Mock Gemini says moon',
            modelUsed: 'gemini-pro-mock'
        };
    }
}

// Import consensus engine (we can use direct relative path to bypass package resolution issues in test)
import { ConsensusEngine } from '../packages/core/src/consensus';
import { localAI } from '../packages/core/src/local-ai';

// Mock fetching for OpenRouter/Groq to avoid keys
global.fetch = async (url: any) => {
    return {
        ok: true,
        json: async () => ({
            choices: [{
                message: {
                    content: JSON.stringify({
                        action: 'HOLD',
                        confidence: 0.6,
                        reasoning: 'Mock External AI says wait'
                    })
                }
            }]
        })
    } as any;
};

async function main() {
    console.log("🦁 TEST: THE COUNCIL OF 6 CONSENSUS ENGINE");

    // 1. Initialize
    const gemini = new MockGemini() as any;
    const engine = new ConsensusEngine(gemini);

    // Inject fake keys to trigger logic branches
    (engine as any).groqKey = 'mock-key';
    (engine as any).openRouterKey = 'mock-key';

    console.log("🧠 Generating consensus...");

    const marketData = {
        symbol: 'BTC/USDT',
        price: 90000,
        indicators: { RSI: 75, Trend: 1, OrderImbalance: 0.2 }
    };

    const consensus = await engine.generateConsensusSignal(marketData);

    console.log("\n✅ CONSENSUS REACHED:");
    console.log(`Action: ${consensus.action}`);
    console.log(`Score:  ${consensus.consensusScore.toFixed(0)}%`);
    console.log(`Models: ${consensus.modelUsed}`);
    console.log(`Details:`, consensus.details);
}

main();
