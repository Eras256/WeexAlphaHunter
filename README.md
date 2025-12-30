<p align="center">
  <img src="https://img.shields.io/badge/WEEX-Alpha%20Awakens-purple?style=for-the-badge" alt="WEEX Hackathon"/>
  <img src="https://img.shields.io/badge/AI-Council%20of%206-blue?style=for-the-badge" alt="AI"/>
  <img src="https://img.shields.io/badge/Blockchain-Base%20%2B%20Ethereum-cyan?style=for-the-badge" alt="Blockchain"/>
</p>

<h1 align="center">🦁 WAlphaHunter</h1>

<p align="center">
  <strong>The World's First Trading Proof-of-Work System</strong><br/>
  <em>Where AI Decisions Meet Blockchain Transparency</em>
</p>

<p align="center">
  <a href="https://weex-alphahunter.vercel.app">🌐 Live Demo</a> •
  <a href="#smart-contracts">📜 Contracts</a> •
  <a href="#the-council-of-6">🧠 AI Engine</a> •
  <a href="#quick-start">🚀 Quick Start</a>
</p>

---

## 🎯 The Problem

> *"Trust me bro, my AI trading bot made 500% returns"*

The crypto AI trading space is plagued by:
- 📉 **Unverifiable claims** — No proof of actual trades
- 🤖 **Black box algorithms** — No transparency in decision-making  
- 💀 **Single points of failure** — One API goes down, trading stops

## 💡 The Solution

**WAlphaHunter** creates an **immutable audit trail** for every AI trading decision:

```
📊 Market Data → 🧠 AI Consensus → ⚡ Trade Execution → 🔗 On-Chain Proof
```

Every trade is:
- ✅ Decided by **6 AI models** voting together
- ✅ Recorded on **Base L2** for speed
- ✅ Anchored to **Ethereum L1** for security
- ✅ **100% verifiable** by anyone, anytime

---

## 🧠 The Council of 6

Our proprietary **UNUM Consensus Engine** consults 6 AI models for every trading decision:

| Model | Role | Provider |
|-------|------|----------|
| 🔮 **DeepSeek V3** | Logic & Reasoning | OpenRouter |
| 🤖 **Gemini 2.0** | Context & Memory | Google |
| ⚡ **Llama 3.1** | Speed & Reflex | Groq |
| 🧪 **Mixtral 8x7b** | Generalist MoE | Groq |
| 🔬 **Qwen 2.5** | Backup Logic | OpenRouter |
| 🦁 **Titan HNN** | Local Fallback | **Self-Hosted** |

```
┌─────────────────────────────────────────────────────┐
│          MARKET: RSI=35, F&G=28, OFI=+15%          │
└───────────────────────┬─────────────────────────────┘
                        ▼
    ┌──────┬──────┬──────┬──────┬──────┬──────┐
    │  🔮  │  🤖  │  ⚡  │  🧪  │  🔬  │  🦁  │
    │ BUY  │ HOLD │ BUY  │ HOLD │ BUY  │ BUY  │
    └──────┴──────┴──────┴──────┴──────┴──────┘
                        ▼
              🎯 CONSENSUS: BUY (67%)
```

### 🦁 Titan Neural Engine

Our secret weapon. A **pure TypeScript neural network** that runs locally with:
- **0ms latency** — No API calls
- **100% uptime** — Works offline
- **Hybrid architecture** — Neural + Mathematical reasoning

> *If all cloud APIs fail, Titan decides. Trading never stops.*

---

## 🔗 Smart Contracts

All proofs are recorded on-chain for permanent verification:

### Base Sepolia (L2 - Primary)
| Contract | Address |
|----------|---------|
| **TradeVerifier** | [`0x9b8d4e3E7Ecf9Bb1F1039fc83E518069dB38281d`](https://sepolia.basescan.org/address/0x9b8d4e3E7Ecf9Bb1F1039fc83E518069dB38281d) |
| **StrategyRegistry** | [`0x074244A155ED76b8b6A4470D3a7864b546f6DefD`](https://sepolia.basescan.org/address/0x074244A155ED76b8b6A4470D3a7864b546f6DefD) |

### Ethereum Sepolia (L1 - Settlement)
| Contract | Address |
|----------|---------|
| **TradeVerifier** | [`0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC`](https://sepolia.etherscan.io/address/0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC) |

---

## 📊 Data Sources

Professional-grade market intelligence:

| Source | Type | Update Rate |
|--------|------|-------------|
| 📈 WEEX Futures API | Order Book L2 | Real-time |
| 😱 Fear & Greed Index | Macro Sentiment | 1 min |
| 🐦 X (Twitter) API | Social Sentiment | Real-time |
| 💎 WXT Token Price | Ecosystem Health | Real-time |

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white" alt="Solidity"/>
  <img src="https://img.shields.io/badge/Hardhat-FFF100?style=flat-square&logo=hardhat&logoColor=black" alt="Hardhat"/>
  <img src="https://img.shields.io/badge/Base-0052FF?style=flat-square&logo=coinbase&logoColor=white" alt="Base"/>
  <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=flat-square&logo=ethereum&logoColor=white" alt="Ethereum"/>
  <img src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14, React 18, TailwindCSS, ThirdWeb |
| **AI Engine** | Google Gemini, Groq (Llama/Mixtral), OpenRouter, Titan HNN |
| **Blockchain** | Solidity 0.8.20, Hardhat, ethers.js v6, Base, Ethereum |
| **Infrastructure** | pnpm workspaces, Turborepo, Vercel, Winston logging |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Eras256/WeexAlphaHunter.git
cd WeexAlphaHunter

# Install
pnpm install

# Configure
cp .env.example .env.local
# Add your API keys (GEMINI, GROQ, OPENROUTER, PRIVATE_KEY)

# Run frontend
pnpm run dev:web

# Test Titan AI + Blockchain
npx tsx scripts/titan-demo.ts
```

---

## 🎮 Developer Tools

### CLI Tool
```bash
npm install -g @wah/cli
wah ask BTC/USDT -p 95000
```

### MCP Server (for AI Agents)
Connect WAlphaHunter to Claude, Cursor, or any LLM:
```json
{
  "mcpServers": {
    "walphahunter": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"]
    }
  }
}
```

---

## 📈 Live Stats

| Metric | Value |
|--------|-------|
| 🔗 Trades Verified | **3+** (and counting) |
| 🧠 AI Decisions | **3+** |
| ⏱️ System Uptime | **100%** (Titan guarantee) |

---

## 🏆 WEEX Alpha Awakens Hackathon

This project was built for the [WEEX Alpha Awakens Hackathon](https://dorahacks.io/hackathon/weex-alpha-awakens).

**Key Innovations:**
1. **Trading Proof-of-Work** — First system to cryptographically prove AI trading decisions
2. **Council of 6** — Multi-model consensus eliminates single-AI bias
3. **Titan Neural Engine** — 100% uptime guarantee with local fallback
4. **Dual-Layer Architecture** — L2 speed + L1 security

---

## 📜 License

MIT © 2024 WAlphaHunter

---

<p align="center">
  <strong>Built with 🦁 by the WAlphaHunter Team</strong><br/>
  <em>"Every trade verified. Every decision transparent. Every proof permanent."</em>
</p>
