const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting mock transaction generation for Ethereum Sepolia...");

    // Get contract address from env or use the one we just deployed
    const TRADE_VERIFIER_ADDRESS = process.env.SEPOLIA_TRADE_VERIFIER_ADDRESS || "0x15a9e9e91DfF2e9065e113b0Fc6CD585Fd95AbE2";

    if (!TRADE_VERIFIER_ADDRESS) {
        throw new Error("TradeVerifier address not found!");
    }

    console.log(`📍 Connecting to TradeVerifier at: ${TRADE_VERIFIER_ADDRESS}`);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`✍️  Signing with: ${signer.address}`);

    // Get Contract Instance
    const TradeVerifier = await ethers.getContractFactory("TradeVerifier");
    const contract = TradeVerifier.attach(TRADE_VERIFIER_ADDRESS);

    // Generate 20 transactions
    const TX_COUNT = 20;

    console.log(`⚡ Sending ${TX_COUNT} transactions...`);

    for (let i = 1; i <= TX_COUNT; i++) {
        try {
            // Create mock data
            const tradeHash = ethers.keccak256(ethers.toUtf8Bytes(`TRADE_${Date.now()}_${i}`));
            const aiDecisionHash = ethers.keccak256(ethers.toUtf8Bytes(`DECISION_${Date.now()}_${i}`));
            const symbol = i % 2 === 0 ? "ETH/USDT" : "BTC/USDT";
            const exchangeOrderId = `MOCK-ETH-L1-${Date.now()}-${i}`;
            const price = ethers.parseUnits((Math.random() * 3000 + 2000).toFixed(2), 6); // Mock price 2000-5000
            const quantity = ethers.parseUnits((Math.random() * 0.1 + 0.01).toFixed(4), 18); // Mock quantity
            const isBuy = Math.random() > 0.5;
            const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%

            console.log(`   [${i}/${TX_COUNT}] Submitting trade: ${symbol} ${isBuy ? 'BUY' : 'SELL'}...`);

            // Send tx
            const tx = await contract.submitTradeProof(
                tradeHash,
                aiDecisionHash,
                symbol,
                exchangeOrderId,
                price,
                quantity,
                isBuy,
                confidence
            );

            console.log(`      ✅ Tx sent: ${tx.hash}. Waiting for confirmation...`);
            await tx.wait(1); // Wait for 1 block to ensure sequence/nonce is correct and avoid congestion errors if rapid firing
            console.log(`      🎉 Confirmed!`);

        } catch (error) {
            console.error(`      ❌ Failed transaction ${i}:`, error.message);
        }
    }

    console.log("✅ All mock transactions completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
