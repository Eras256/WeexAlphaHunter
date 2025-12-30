const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting mock AI DECISION generation for Ethereum Sepolia...");

    // Hardcoded address to ensure we hit the correct contract
    const TRADE_VERIFIER_ADDRESS = "0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC";

    console.log(`📍 Connecting to TradeVerifier at: ${TRADE_VERIFIER_ADDRESS}`);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`✍️  Signing with: ${signer.address}`);

    // Get Contract Instance
    const TradeVerifier = await ethers.getContractFactory("TradeVerifier");
    const contract = TradeVerifier.attach(TRADE_VERIFIER_ADDRESS);

    // Generate 10 decisions
    const TX_COUNT = 10;

    console.log(`⚡ Sending ${TX_COUNT} AI Decisions...`);

    for (let i = 1; i <= TX_COUNT; i++) {
        try {
            // Create mock data
            // function recordAIDecision(bytes32 _decisionHash, string memory _modelId, string memory _pair, string memory _direction, uint256 _confidence, string memory _reasoning)

            const decisionHash = ethers.keccak256(ethers.toUtf8Bytes(`DECISION_ETH_${Date.now()}_${i}`));
            const modelId = i % 2 === 0 ? "GPT-4-Turbo" : "Claude-3-Opus";
            const pair = i % 2 === 0 ? "ETH/USDT" : "BTC/USDT";
            const direction = Math.random() > 0.5 ? "BUY" : "SELL";
            const confidence = Math.floor(Math.random() * 15) + 85; // 85-99%
            const reasoning = `AI Analysis for ${pair}: Strong ${direction} signal based on MACD convergence and RSI divergence. Market sentiment is bullish.`; // Mock reasoning

            console.log(`   [${i}/${TX_COUNT}] Recording decision: ${modelId} -> ${pair} ${direction} (${confidence}%)...`);

            // Send tx
            const tx = await contract.recordAIDecision(
                decisionHash,
                reasoning,
                confidence
            );

            console.log(`      ✅ Tx sent: ${tx.hash}. Waiting for confirmation...`);
            await tx.wait(1);
            console.log(`      🎉 Confirmed!`);

        } catch (error) {
            console.error(`      ❌ Failed transaction ${i}:`, error.message);
        }
    }

    console.log("✅ All mock AI DECISIONS completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
