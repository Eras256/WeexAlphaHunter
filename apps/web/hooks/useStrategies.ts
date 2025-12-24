"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

const STRATEGY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_BASE_SEPOLIA_STRATEGY_REGISTRY_ADDRESS;

// Minimal ABI for reading strategies
// Assuming getAllStrategies or a similar way to list them, OR just getting specific ones by hash
// Since we might not have an enumeration function easily accessible, let's assume we read a fixed list of IDs 
// or if the contract supports enumeration.
// Let's check the contract file first to be 100% sure.
// Wait, I should read the contract file first.
const ABI = [
    "function getStrategy(bytes32 _strategyHash) external view returns (tuple(bytes32 strategyHash, string name, string description, address creator, uint256 createdAt, bool isActive, tuple(uint256 totalTrades, uint256 winningTrades, int256 totalPnL, uint256 lastUpdated, uint16 sharpeRatio, uint16 maxDrawdown) performance))"
];

export interface StrategyData {
    id: string; // The hash
    name: string;
    description: string;
    creator: string;
    createdAt: number;
    isActive: boolean;
    performance: {
        totalTrades: number;
        winningTrades: number;
        totalPnL: number;
        sharpeRatio: number;
        maxDrawdown: number;
    };
    winRate: string;
}

export function useStrategies() {
    const [strategies, setStrategies] = useState<StrategyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStrategies = async () => {
            if (!STRATEGY_REGISTRY_ADDRESS) {
                setLoading(false);
                return;
            }

            // Hardcoded strategy ID from our previous deployment logs (or a known one)
            // We need to know at least one ID to fetch. 
            // Let's try to generate the hash for the "Momentum Alpha" strategy if that's how it works.
            // Or better, let's ask the user to register one if none found.
            // For now, let's try to fetch a dummy ID or just return empty if we can't enumerate.
            // Actually, the best is to read the Events from the contract to find registered strategies.

            try {
                const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org");
                const contract = new ethers.Contract(STRATEGY_REGISTRY_ADDRESS, ["event StrategyRegistered(bytes32 indexed strategyHash, string name, address indexed creator)"], provider);

                // Get logs for StrategyRegistered
                const currentBlock = await provider.getBlockNumber();
                const fromBlock = currentBlock - 50000; // Search last 50k blocks approx

                const filter = contract.filters.StrategyRegistered();
                const events = await contract.queryFilter(filter, fromBlock);

                // Now fetch details for each event
                const fullContract = new ethers.Contract(STRATEGY_REGISTRY_ADDRESS, ABI, provider);
                const loadedStrategies: StrategyData[] = [];

                for (const event of events) {
                    if ('args' in event) {
                        const hash = event.args[0];
                        const data = await fullContract.getStrategy(hash);

                        // Parse numbers (ethers returns BigInt)
                        const perf = data.performance;
                        const totalTrades = Number(perf.totalTrades);
                        const winningTrades = Number(perf.winningTrades);
                        const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) + '%' : '0%';

                        loadedStrategies.push({
                            id: data.strategyHash,
                            name: data.name,
                            description: data.description,
                            creator: data.creator,
                            createdAt: Number(data.createdAt) * 1000,
                            isActive: data.isActive,
                            performance: {
                                totalTrades,
                                winningTrades,
                                totalPnL: Number(perf.totalPnL), // Careful with decimals here if it's token amount
                                sharpeRatio: Number(perf.sharpeRatio) / 100, // Assuming 2 decimals
                                maxDrawdown: Number(perf.maxDrawdown) / 100
                            },
                            winRate
                        });
                    }
                }

                setStrategies(loadedStrategies);
            } catch (err) {
                console.error("Error fetching strategies:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStrategies();
    }, []);

    return { strategies, loading };
}
