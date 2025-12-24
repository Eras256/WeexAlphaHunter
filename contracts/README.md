# 🚀 Smart Contracts Deployment Guide

## 📋 Overview

WAlphaHunter includes two smart contracts for on-chain verification:

1. **TradeVerifier.sol** - Records trade proofs and AI decisions
2. **StrategyRegistry.sol** - Manages trading strategies and performance metrics

## 🛠️ Prerequisites

- Node.js >= 20.0.0
- Private key with testnet ETH/Base ETH
- API keys for Etherscan and BaseScan

## ⚙️ Setup

### 1. Configure Environment Variables

Update `.env.local` with your credentials:

```bash
# Ethereum Sepolia
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key

# Base Sepolia
BASE_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=WTS43U5S4M7N1XSB9V1NYJUBM318JU985J

# Deployment Wallet
PRIVATE_KEY=your_private_key_here
```

### 2. Get Testnet Funds

#### Ethereum Sepolia:
- Faucet: https://sepoliafaucet.com/
- Alternative: https://www.alchemy.com/faucets/ethereum-sepolia

#### Base Sepolia:
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Bridge from Sepolia: https://bridge.base.org/

## 🚀 Deployment

### Option A: Using npm scripts (Recommended)

```bash
# Compile contracts
npm run compile:contracts

# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Deploy to Ethereum Sepolia  
npm run deploy:sepolia

# Verify on Base Sepolia
npm run verify:base-sepolia

# Verify on Ethereum Sepolia
npm run verify:sepolia
```

### Option B: Manual Hardhat Commands

```bash
# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network baseSepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify
npx hardhat run scripts/verify.js --network baseSepolia
npx hardhat run scripts/verify.js --network sepolia
```

## 📝 After Deployment

The deployment script will automatically:

1. ✅ Deploy both contracts
2. ✅ Wait for 5 block confirmations
3. ✅ Save deployment info to `deployments/` folder
4. ✅ Update `.env.local` with contract addresses
5. ✅ Display verification commands

## 🔍 Verification

After deployment, verify your contracts on block explorers:

### Base Sepolia:
```bash
npx hardhat verify --network baseSepolia <TRADE_VERIFIER_ADDRESS>
npx hardhat verify --network baseSepolia <STRATEGY_REGISTRY_ADDRESS>
```

### Ethereum Sepolia:
```bash
npx hardhat verify --network sepolia <TRADE_VERIFIER_ADDRESS>
npx hardhat verify --network sepolia <STRATEGY_REGISTRY_ADDRESS>
```

## 📊 Contract Addresses

After deployment, addresses will be stored in:
- `.env.local` (for backend)
- `deployments/<network>-<timestamp>.json` (deployment record)

Example:
```
BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS=0x...
BASE_SEPOLIA_STRATEGY_REGISTRY_ADDRESS=0x...
```

## 🧪 Testing Contracts

### Using Hardhat Console:

```bash
npx hardhat console --network baseSepolia
```

```javascript
const TradeVerifier = await ethers.getContractFactory("TradeVerifier");
const verifier = await TradeVerifier.attach("YOUR_CONTRACT_ADDRESS");

// Get stats
const stats = await verifier.getStats();
console.log("Total trades:", stats.totalTrades.toString());
```

### Using the Backend Integration:

```typescript
import { createBlockchainClient } from '@wah/core';

const client = createBlockchainClient('baseSepolia');

// Submit a trade proof
const txHash = await client.submitTradeProof({
  tradeId: "trade-123",
  aiDecisionId: "decision-456",
  symbol: "BTC/USDT",
  price: 95000,
  qty: 0.1,
  side: "BUY",
  aiConfidence: 0.92
});

console.log("Trade proof submitted:", txHash);
```

## 🔧 Troubleshooting

### "Insufficient funds" error:
- Get testnet ETH from faucets listed above
- Check your wallet balance: `await ethers.provider.getBalance(address)`

### "Nonce too high" error:
- Reset your account nonce in MetaMask
- Or wait a few minutes and try again

### Compilation errors:
- Ensure you have the correct Solidity version (0.8.20)
- Run `npm install` to install all dependencies
- Clear cache: `npx hardhat clean`

### Verification fails:
- Wait 1-2 minutes after deployment
- Ensure API keys are correct in `.env.local`
- Check constructor arguments match deployment

## 📚 Contract Functions

### TradeVerifier

**Write Functions:**
- `submitTradeProof()` - Submit a single trade proof
- `batchSubmitTradeProofs()` - Submit multiple proofs (gas efficient)
- `recordAIDecision()` - Record an AI decision
- `authorizeSubmitter()` - Add authorized address (owner only)

**Read Functions:**
- `verifyTradeProof()` - Get trade proof details
- `getAIDecision()` - Get AI decision details
- `getStats()` - Get total trades and decisions
- `isAuthorized()` - Check if address is authorized

### StrategyRegistry

**Write Functions:**
- `registerStrategy()` - Register a new strategy
- `updateStrategyPerformance()` - Update metrics
- `setStrategyStatus()` - Activate/deactivate strategy

**Read Functions:**
- `getStrategy()` - Get strategy details
- `getPerformance()` - Get performance metrics
- `getWinRate()` - Calculate win rate percentage
- `getAllStrategies()` - Get all strategies (paginated)

## 🌐 Block Explorers

### Base Sepolia:
- Explorer: https://sepolia.basescan.org/
- API: https://api-sepolia.basescan.org/api

### Ethereum Sepolia:
- Explorer: https://sepolia.etherscan.io/
- API: https://api-sepolia.etherscan.io/api

## 📖 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Base Documentation](https://docs.base.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)

## ⚠️ Security Notes

1. **Never commit private keys** to version control
2. Use environment variables for sensitive data
3. Test thoroughly on testnets before mainnet
4. Consider using a hardware wallet for mainnet deployments
5. Audit contracts before production use

## 🎯 Next Steps

After deployment:

1. ✅ Update frontend with contract addresses
2. ✅ Test contract interactions
3. ✅ Integrate with backend trading engine
4. ✅ Monitor gas costs and optimize if needed
5. ✅ Document contract addresses in project documentation
