"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

// ABI for TradeVerifier (View-only functions)
const TRADE_VERIFIER_ABI = [
    "function getStats() external view returns (uint256 totalTrades, uint256 totalDecisions, uint256 totalSubmitters)",
    "function verifyTradeProof(bytes32 _tradeHash) external view returns (tuple(bytes32 tradeHash, bytes32 aiDecisionHash, string symbol, string exchangeOrderId, uint256 timestamp, address submitter, uint256 price, uint256 quantity, bool isBuy, uint16 aiConfidence))"
];

const STRATEGY_REGISTRY_ABI = [
    "function getStrategy(bytes32 _strategyHash) external view returns (tuple(bytes32 strategyHash, string name, string description, address creator, uint256 createdAt, bool isActive, tuple(uint256 totalTrades, uint256 winningTrades, int256 totalPnL, uint256 lastUpdated, uint16 sharpeRatio, uint16 maxDrawdown) performance))"
];

export interface BlockchainStats {
    totalTrades: number;
    totalDecisions: number;
    totalSubmitters: number;
    isConnected: boolean;
    network: string;
    sepoliaStats?: {
        totalTrades: number;
        totalDecisions: number;
        isConnected: boolean;
    }
}

export function useBlockchainStats() {
    const [stats, setStats] = useState<BlockchainStats>({
        totalTrades: 0,
        totalDecisions: 0,
        totalSubmitters: 0,
        isConnected: false,
        network: 'Unknown',
        sepoliaStats: { totalTrades: 0, totalDecisions: 0, isConnected: false }
    });

    useEffect(() => {
        const fetchStats = async () => {
            // 1. Fetch from Base Sepolia (Primary)
            let baseData = { totalTrades: 0, totalDecisions: 0, totalSubmitters: 0 };
            let baseConnected = false;
            try {
                const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org";
                const tradeVerifierAddress = process.env.NEXT_PUBLIC_BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS;
                if (tradeVerifierAddress) {
                    const provider = new ethers.JsonRpcProvider(rpcUrl);
                    const contract = new ethers.Contract(tradeVerifierAddress, TRADE_VERIFIER_ABI, provider);
                    const data = await contract.getStats();
                    baseData = {
                        totalTrades: Number(data.totalTrades),
                        totalDecisions: Number(data.totalDecisions),
                        totalSubmitters: Number(data.totalSubmitters)
                    };
                    baseConnected = true;
                }
            } catch (err) { console.error("Base fetch failed", err); }

            // 2. Fetch from Eth Sepolia (Secondary)
            let ethData = { totalTrades: 0, totalDecisions: 0 };
            let ethConnected = false;
            try {
                // USE ROBUST PUBLIC RPC & VALIDATED ADDRESS DIRECTLY
                const ethRpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
                const ethContractAddr = "0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC";

                if (ethRpcUrl && ethContractAddr) {
                    const provider = new ethers.JsonRpcProvider(ethRpcUrl);
                    const contract = new ethers.Contract(ethContractAddr, TRADE_VERIFIER_ABI, provider);
                    const data = await contract.getStats();
                    ethData = {
                        totalTrades: Number(data.totalTrades),
                        totalDecisions: Number(data.totalDecisions)
                    };
                    ethConnected = true;
                }
            } catch (err) { console.error("Eth fetch failed", err); }

            setStats({
                totalTrades: baseData.totalTrades,
                totalDecisions: baseData.totalDecisions,
                totalSubmitters: baseData.totalSubmitters,
                isConnected: baseConnected,
                network: 'Base Sepolia',
                sepoliaStats: {
                    totalTrades: ethData.totalTrades,
                    totalDecisions: ethData.totalDecisions,
                    isConnected: ethConnected
                }
            });
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, []);

    return stats;
}
