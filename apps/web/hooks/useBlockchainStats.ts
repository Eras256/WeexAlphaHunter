"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

// ABI for TradeVerifier (View-only functions)
const TRADE_VERIFIER_ABI = [
    "function getStats() external view returns (uint256 totalTrades, uint256 totalDecisions, uint256 totalSubmitters)",
    "function verifyTradeProof(bytes32 _tradeHash) external view returns (tuple(bytes32 tradeHash, bytes32 aiDecisionHash, string symbol, uint256 timestamp, address submitter, uint256 price, uint256 quantity, bool isBuy, uint16 aiConfidence))"
];

const STRATEGY_REGISTRY_ABI = [
    "function getStrategy(bytes32 _strategyHash) external view returns (tuple(bytes32 strategyHash, string name, string description, address creator, uint256 createdAt, bool isActive, tuple(uint256 totalTrades, uint256 winningTrades, int256 totalPnL, uint256 lastUpdated, uint16 sharpeRatio, uint16 maxDrawdown) performance))"
];

interface BlockchainStats {
    totalTrades: number;
    totalDecisions: number;
    totalSubmitters: number;
    isConnected: boolean;
    network: string;
}

export function useBlockchainStats() {
    const [stats, setStats] = useState<BlockchainStats>({
        totalTrades: 0,
        totalDecisions: 0,
        totalSubmitters: 0,
        isConnected: false,
        network: 'Unknown'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine which network to use based on env (prefer Base Sepolia for now)
                const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org";
                const tradeVerifierAddress = process.env.NEXT_PUBLIC_BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS;

                if (!tradeVerifierAddress) {
                    console.warn("TradeVerifier address not found in env");
                    return;
                }

                const provider = new ethers.JsonRpcProvider(rpcUrl);
                const contract = new ethers.Contract(tradeVerifierAddress, TRADE_VERIFIER_ABI, provider);

                const data = await contract.getStats();

                setStats({
                    totalTrades: Number(data.totalTrades),
                    totalDecisions: Number(data.totalDecisions),
                    totalSubmitters: Number(data.totalSubmitters),
                    isConnected: true,
                    network: 'Base Sepolia'
                });
            } catch (error) {
                console.error("Failed to fetch blockchain stats:", error);
                setStats(s => ({ ...s, isConnected: false }));
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, []);

    return stats;
}
