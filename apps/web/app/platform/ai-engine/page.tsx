"use client";

import { Cpu, Zap, Brain, Activity, ShieldCheck, Database, Twitter, TrendingUp, Shield } from "lucide-react";
import { useBlockchainStats } from "@/hooks/useBlockchainStats";

export default function AIEnginePage() {
    const stats = useBlockchainStats();

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-20 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-mono tracking-wider mb-4">
                        THE COUNCIL OF 6 • 100% UPTIME GUARANTEE
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600">
                        Titan Neuro-Symbolic Engine
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        A Hybrid AI-Logic architecture. Six state-of-the-art AI models generate creative strategies, while a deterministic Symbolic Engine (Prolog) acts as an unbreakable safety guardrail.
                    </p>
                </div>

                {/* ... existing stats ... */}

                {/* Technical Deep Dive */}
                <div className="bg-gray-900 rounded-3xl p-8 md:p-12 border border-white/10">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <Database className="text-green-400" />
                        Live Inference Pipeline
                    </h2>
                    <div className="space-y-6 font-mono text-sm text-gray-300">
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">INPUT LAYER</span>
                            <span className="flex-1">WEEX Orderbook (L2) + X/Twitter Firehose + Fear & Greed API + WXT Price + On-Chain Volume</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">COGNITION</span>
                            <span className="flex-1">Mixture-of-Agents (MoA) Debate: DeepSeek (Logic) vs Mistral (Risk) vs Llama (Strategy)</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-cyan-500">VALIDATION</span>
                            <span className="flex-1 text-cyan-400 font-bold">Symbolic Guardrails (Prolog): Deterministic check of Trend, RSI, and Risk Limits. Blocks 100% of hallucinations.</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">OUTPUT</span>
                            <span className="flex-1 text-green-400">Trade Signal (Direction, Size, TP/SL) + OpML Proof Generation (Base L2) + X Post</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <span className="w-32 text-gray-500">SETTLEMENT</span>
                            <span className="flex-1 text-yellow-400">Final Verification Anchoring on Ethereum Sepolia L1</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
