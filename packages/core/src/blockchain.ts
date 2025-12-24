import { ethers } from 'ethers';
import { logger } from './logger.js';
import * as dotenv from 'dotenv';

dotenv.config();

// Contract ABIs (simplified - only the functions we need)
const TRADE_VERIFIER_ABI = [
    "function submitTradeProof(bytes32 _tradeHash, bytes32 _aiDecisionHash, string memory _symbol, uint256 _price, uint256 _quantity, bool _isBuy, uint16 _aiConfidence) external",
    "function recordAIDecision(bytes32 _decisionHash, string memory _reasoning, uint16 _confidence) external",
    "function verifyTradeProof(bytes32 _tradeHash) external view returns (tuple(bytes32 tradeHash, bytes32 aiDecisionHash, string symbol, uint256 timestamp, address submitter, uint256 price, uint256 quantity, bool isBuy, uint16 aiConfidence))",
    "function getStats() external view returns (uint256 totalTrades, uint256 totalDecisions, uint256 totalSubmitters)",
    "function batchSubmitTradeProofs(bytes32[] memory _tradeHashes, bytes32[] memory _aiDecisionHashes, string[] memory _symbols, uint256[] memory _prices, uint256[] memory _quantities, bool[] memory _isBuy, uint16[] memory _aiConfidences) external"
];

const STRATEGY_REGISTRY_ABI = [
    "function registerStrategy(bytes32 _strategyHash, string memory _name, string memory _description) external",
    "function updateStrategyPerformance(bytes32 _strategyHash, uint256 _totalTrades, uint256 _winningTrades, int256 _totalPnL, uint16 _sharpeRatio, uint16 _maxDrawdown) external",
    "function getStrategy(bytes32 _strategyHash) external view returns (tuple(bytes32 strategyHash, string name, string description, address creator, uint256 createdAt, bool isActive, tuple(uint256 totalTrades, uint256 winningTrades, int256 totalPnL, uint256 lastUpdated, uint16 sharpeRatio, uint16 maxDrawdown) performance))",
    "function getWinRate(bytes32 _strategyHash) external view returns (uint16)"
];

export interface BlockchainConfig {
    network: 'sepolia' | 'baseSepolia';
    rpcUrl: string;
    privateKey: string;
    tradeVerifierAddress: string;
    strategyRegistryAddress: string;
}

export class BlockchainClient {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private tradeVerifier: ethers.Contract;
    private strategyRegistry: ethers.Contract;
    private config: BlockchainConfig;

    constructor(config: BlockchainConfig) {
        this.config = config;

        // Initialize provider
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

        // Initialize wallet
        this.wallet = new ethers.Wallet(config.privateKey, this.provider);

        // Initialize contracts
        this.tradeVerifier = new ethers.Contract(
            config.tradeVerifierAddress,
            TRADE_VERIFIER_ABI,
            this.wallet
        );

        this.strategyRegistry = new ethers.Contract(
            config.strategyRegistryAddress,
            STRATEGY_REGISTRY_ABI,
            this.wallet
        );

        logger.info(`Blockchain client initialized for ${config.network}`);
    }

    /**
     * Submit a trade proof to the blockchain
     */
    async submitTradeProof(trade: {
        tradeId: string;
        aiDecisionId: string;
        symbol: string;
        price: number;
        qty: number;
        side: 'BUY' | 'SELL';
        aiConfidence: number;
    }): Promise<string> {
        try {
            // Generate hashes
            const tradeHash = ethers.keccak256(ethers.toUtf8Bytes(trade.tradeId));
            const aiDecisionHash = ethers.keccak256(ethers.toUtf8Bytes(trade.aiDecisionId));

            // Convert values to blockchain format
            const priceScaled = Math.floor(trade.price * 1e8); // Scale to 8 decimals
            const qtyScaled = Math.floor(trade.qty * 1e8);
            const isBuy = trade.side === 'BUY';
            const confidenceScaled = Math.floor(trade.aiConfidence * 10000); // 0-1 to 0-10000

            logger.info(`Submitting trade proof for ${trade.tradeId} to blockchain...`);

            const tx = await this.tradeVerifier.submitTradeProof(
                tradeHash,
                aiDecisionHash,
                trade.symbol,
                priceScaled,
                qtyScaled,
                isBuy,
                confidenceScaled
            );

            logger.info(`Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            logger.info(`Trade proof confirmed in block ${receipt.blockNumber}`);

            return tx.hash;
        } catch (error: any) {
            logger.error(`Failed to submit trade proof: ${error.message}`);
            throw error;
        }
    }

    /**
     * Record an AI decision on-chain
     */
    async recordAIDecision(decision: {
        decisionId: string;
        reasoning: string;
        confidence: number;
    }): Promise<string> {
        try {
            const decisionHash = ethers.keccak256(ethers.toUtf8Bytes(decision.decisionId));
            const confidenceScaled = Math.floor(decision.confidence * 10000);

            logger.info(`Recording AI decision ${decision.decisionId} to blockchain...`);

            const tx = await this.tradeVerifier.recordAIDecision(
                decisionHash,
                decision.reasoning,
                confidenceScaled
            );

            const receipt = await tx.wait();
            logger.info(`AI decision confirmed in block ${receipt.blockNumber}`);

            return tx.hash;
        } catch (error: any) {
            logger.error(`Failed to record AI decision: ${error.message}`);
            throw error;
        }
    }

    /**
     * Batch submit multiple trade proofs (gas optimization)
     */
    async batchSubmitTradeProofs(trades: Array<{
        tradeId: string;
        aiDecisionId: string;
        symbol: string;
        price: number;
        qty: number;
        side: 'BUY' | 'SELL';
        aiConfidence: number;
    }>): Promise<string> {
        try {
            const tradeHashes = trades.map(t => ethers.keccak256(ethers.toUtf8Bytes(t.tradeId)));
            const aiDecisionHashes = trades.map(t => ethers.keccak256(ethers.toUtf8Bytes(t.aiDecisionId)));
            const symbols = trades.map(t => t.symbol);
            const prices = trades.map(t => Math.floor(t.price * 1e8));
            const quantities = trades.map(t => Math.floor(t.qty * 1e8));
            const isBuyArray = trades.map(t => t.side === 'BUY');
            const confidences = trades.map(t => Math.floor(t.aiConfidence * 10000));

            logger.info(`Batch submitting ${trades.length} trade proofs...`);

            const tx = await this.tradeVerifier.batchSubmitTradeProofs(
                tradeHashes,
                aiDecisionHashes,
                symbols,
                prices,
                quantities,
                isBuyArray,
                confidences
            );

            const receipt = await tx.wait();
            logger.info(`Batch submission confirmed in block ${receipt.blockNumber}`);

            return tx.hash;
        } catch (error: any) {
            logger.error(`Failed to batch submit trade proofs: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify a trade proof exists on-chain
     */
    async verifyTradeProof(tradeId: string): Promise<any> {
        try {
            const tradeHash = ethers.keccak256(ethers.toUtf8Bytes(tradeId));
            const proof = await this.tradeVerifier.verifyTradeProof(tradeHash);

            return {
                tradeHash: proof.tradeHash,
                aiDecisionHash: proof.aiDecisionHash,
                symbol: proof.symbol,
                timestamp: Number(proof.timestamp),
                submitter: proof.submitter,
                price: Number(proof.price) / 1e8,
                quantity: Number(proof.quantity) / 1e8,
                isBuy: proof.isBuy,
                aiConfidence: Number(proof.aiConfidence) / 10000
            };
        } catch (error: any) {
            logger.error(`Failed to verify trade proof: ${error.message}`);
            return null;
        }
    }

    /**
     * Get blockchain statistics
     */
    async getStats(): Promise<{ totalTrades: number; totalDecisions: number }> {
        try {
            const stats = await this.tradeVerifier.getStats();
            return {
                totalTrades: Number(stats.totalTrades),
                totalDecisions: Number(stats.totalDecisions)
            };
        } catch (error: any) {
            logger.error(`Failed to get stats: ${error.message}`);
            return { totalTrades: 0, totalDecisions: 0 };
        }
    }

    /**
     * Register a trading strategy
     */
    async registerStrategy(strategy: {
        name: string;
        description: string;
    }): Promise<string> {
        try {
            const strategyHash = ethers.keccak256(
                ethers.toUtf8Bytes(`${strategy.name}-${Date.now()}`)
            );

            logger.info(`Registering strategy "${strategy.name}" to blockchain...`);

            const tx = await this.strategyRegistry.registerStrategy(
                strategyHash,
                strategy.name,
                strategy.description
            );

            const receipt = await tx.wait();
            logger.info(`Strategy registered in block ${receipt.blockNumber}`);

            return ethers.hexlify(strategyHash);
        } catch (error: any) {
            logger.error(`Failed to register strategy: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update strategy performance metrics
     */
    async updateStrategyPerformance(
        strategyHash: string,
        performance: {
            totalTrades: number;
            winningTrades: number;
            totalPnL: number;
            sharpeRatio: number;
            maxDrawdown: number;
        }
    ): Promise<string> {
        try {
            const sharpeScaled = Math.floor(performance.sharpeRatio * 100);
            const drawdownScaled = Math.floor(performance.maxDrawdown * 100);
            const pnlScaled = Math.floor(performance.totalPnL * 1e8);

            const tx = await this.strategyRegistry.updateStrategyPerformance(
                strategyHash,
                performance.totalTrades,
                performance.winningTrades,
                pnlScaled,
                sharpeScaled,
                drawdownScaled
            );

            const receipt = await tx.wait();
            logger.info(`Strategy performance updated in block ${receipt.blockNumber}`);

            return tx.hash;
        } catch (error: any) {
            logger.error(`Failed to update strategy performance: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get current gas price
     */
    async getGasPrice(): Promise<string> {
        const feeData = await this.provider.getFeeData();
        return ethers.formatUnits(feeData.gasPrice || 0n, 'gwei');
    }

    /**
     * Get wallet balance
     */
    async getBalance(): Promise<string> {
        const balance = await this.provider.getBalance(this.wallet.address);
        return ethers.formatEther(balance);
    }
}

/**
 * Factory function to create blockchain client based on environment
 */
export function createBlockchainClient(network: 'sepolia' | 'baseSepolia'): BlockchainClient | null {
    try {
        const config: BlockchainConfig = {
            network,
            rpcUrl: network === 'sepolia'
                ? process.env.SEPOLIA_RPC_URL || ''
                : process.env.BASE_RPC_URL || '',
            privateKey: process.env.PRIVATE_KEY || '',
            tradeVerifierAddress: network === 'sepolia'
                ? process.env.SEPOLIA_TRADE_VERIFIER_ADDRESS || ''
                : process.env.BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS || '',
            strategyRegistryAddress: network === 'sepolia'
                ? process.env.SEPOLIA_STRATEGY_REGISTRY_ADDRESS || ''
                : process.env.BASE_SEPOLIA_STRATEGY_REGISTRY_ADDRESS || ''
        };

        // Validate configuration
        if (!config.rpcUrl || !config.privateKey) {
            logger.warn(`Blockchain client not configured for ${network}. Please set environment variables.`);
            return null;
        }

        if (!config.tradeVerifierAddress || !config.strategyRegistryAddress) {
            logger.warn(`Contract addresses not set for ${network}. Deploy contracts first.`);
            return null;
        }

        return new BlockchainClient(config);
    } catch (error: any) {
        logger.error(`Failed to create blockchain client: ${error.message}`);
        return null;
    }
}
