"use client";

import { Cpu, Zap, Brain, Activity, ShieldCheck, Database } from "lucide-react";
import { useBlockchainStats } from "@/hooks/useBlockchainStats";

export default function AIEnginePage() {
    const stats = useBlockchainStats();

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-20">
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-mono tracking-wider mb-4">
                        POWERED BY GOOGLE DEEPMIND
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        GEMINI Neural Engine
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        The core intelligence of WAlphaHunter. Our proprietary engine leverages multi-modal AI to synthesize market data, sentiment analysis, and on-chain metrics into actionable high-frequency alphas.
                    </p>
                </div>

                {/* Live Blockchain Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center">
                        <Activity className="w-8 h-8 text-blue-400 mb-2" />
                        <span className="text-3xl font-bold">{stats.isConnected ? stats.totalTrades : "---"}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Total Trades</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center">
                        <Brain className="w-8 h-8 text-purple-400 mb-2" />
                        <span className="text-3xl font-bold">{stats.isConnected ? stats.totalDecisions : "---"}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">AI Decisions</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center">
                        <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
                        <span className="text-xs font-mono text-gray-500 mb-1">{stats.network}</span>
                        <span className="text-sm font-bold text-green-400">{stats.isConnected ? "LIVE ON-CHAIN" : "CONNECTING..."}</span>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                        <Brain className="w-12 h-12 text-purple-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Multi-Modal Analysis</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Unlike traditional quant models, GEMINI processes unstructured data including news sentiment, social graphs, and visual chart patterns simultaneously with price action.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                        <Zap className="w-12 h-12 text-yellow-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Sub-Second Latency</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Optimized for WEEX execution, our inference pipeline delivers signals in under 50ms, capturing arbitrage opportunities before the market reacts.
                        </p>
                    </div>
                </div>

                {/* Technical Deep Dive */}
                <div className="bg-gray-900 rounded-3xl p-8 md:p-12 border border-white/10">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <Database className="text-green-400" />
                        Live Inference Pipeline
                    </h2>
                    <div className="space-y-6 font-mono text-sm text-gray-300">
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">INPUT LAYER</span>
                            <span className="flex-1">WEEX Orderbook (L2) + Twitter Firehose + On-Chain Volume</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">PROCESSING</span>
                            <span className="flex-1">Transformer-based feature extraction &rarr; LSTM temporal analysis &rarr; Risk scoring model</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">OUTPUT</span>
                            <span className="flex-1 text-green-400">Trade Signal (Direction, Size, Leverage) + ZK Proof Generation</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
