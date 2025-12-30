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
                        UNUM Consensus Engine
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Six state-of-the-art AI models vote on every trade using institutional order flow, social sentiment from X (Twitter), Fear & Greed Index, and WXT ecosystem strength. If all cloud models fail, our local Math Engine guarantees a signal.
                    </p>
                </div>

                {/* Live Blockchain Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {/* BASE STATS */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-blue-400">BASE SEPOLIA</span>
                        </div>
                        <Activity className="w-8 h-8 text-blue-400 mb-2 mt-4" />
                        <span className="text-3xl font-bold">{stats.isConnected ? stats.totalTrades : "---"}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Base Trades</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-purple-400">BASE SEPOLIA</span>
                        </div>
                        <Brain className="w-8 h-8 text-purple-400 mb-2 mt-4" />
                        <span className="text-3xl font-bold">{stats.isConnected ? stats.totalDecisions : "---"}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Base AI Decisions</span>
                    </div>

                    {/* ETHEREUM STATS */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-gray-500/10 px-2 py-0.5 rounded border border-gray-500/20">
                            <span className={`w-1.5 h-1.5 rounded-full ${stats.sepoliaStats?.isConnected ? 'bg-gray-300 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] font-bold text-gray-300">ETH SEPOLIA</span>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-gray-300 mb-2 mt-4" />
                        <span className="text-3xl font-bold">{stats.sepoliaStats?.isConnected ? stats.sepoliaStats.totalTrades : "---"}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Eth Trades</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-gray-500/10 px-2 py-0.5 rounded border border-gray-500/20">
                            <span className={`w-1.5 h-1.5 rounded-full ${stats.sepoliaStats?.isConnected ? 'bg-gray-300 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-[10px] font-bold text-gray-300">ETH SEPOLIA</span>
                        </div>
                        <Brain className="w-8 h-8 text-gray-300 mb-2 mt-4" />
                        <span className="text-3xl font-bold">{stats.sepoliaStats?.isConnected ? stats.sepoliaStats.totalDecisions : "---"}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Eth Decisions</span>
                    </div>
                </div>

                {/* THE COUNCIL OF 6 */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">The Council of 6 AI Models</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* DeepSeek */}
                        <div className="bg-gradient-to-b from-gray-900 to-black border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Cpu className="text-emerald-500 w-10 h-10" /></div>
                            <h3 className="text-lg font-bold text-emerald-400 mb-1">DeepSeek</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">LOGIC & REASONING</p>
                            <p className="text-gray-400 text-sm mb-4">Analyzes complex math, order book depth, and funding rates. The "Left Brain".</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-emerald-500">ONLINE • 120ms</span>
                            </div>
                        </div>

                        {/* Gemini */}
                        <div className="bg-gradient-to-b from-gray-900 to-black border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Database className="text-blue-500 w-10 h-10" /></div>
                            <h3 className="text-lg font-bold text-blue-400 mb-1">Gemini</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">CONTEXT & DATA</p>
                            <p className="text-gray-400 text-sm mb-4">Processes vast context windows, historical patterns, and macro sentiment. The "Memory".</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-blue-500">ONLINE • 85ms</span>
                            </div>
                        </div>

                        {/* Llama */}
                        <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Zap className="text-purple-500 w-10 h-10" /></div>
                            <h3 className="text-lg font-bold text-purple-400 mb-1">Llama</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">SPEED & REFLEX</p>
                            <p className="text-gray-400 text-sm mb-4">Ultra-low latency execution triggers. Reacts to sudden price spikes instantly. The "Reflex".</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-purple-500">ONLINE • 15ms</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Mixtral */}
                        <div className="bg-gradient-to-b from-gray-900 to-black border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Brain className="text-orange-500 w-10 h-10" /></div>
                            <h3 className="text-lg font-bold text-orange-400 mb-1">Mixtral</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">THE GENERALIST</p>
                            <p className="text-gray-400 text-sm mb-4">Mixture-of-Experts architecture provides diverse perspectives and reduces bias.</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-orange-500">ONLINE • 95ms</span>
                            </div>
                        </div>

                        {/* Qwen */}
                        <div className="bg-gradient-to-b from-gray-900 to-black border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><TrendingUp className="text-cyan-500 w-10 h-10" /></div>
                            <h3 className="text-lg font-bold text-cyan-400 mb-1">Qwen</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">BACKUP LOGIC</p>
                            <p className="text-gray-400 text-sm mb-4">Fallback reasoning engine if DeepSeek is rate-limited. Ensures continuous operation.</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-cyan-500">STANDBY • 110ms</span>
                            </div>
                        </div>

                        {/* Local Math Engine */}
                        <div className="bg-gradient-to-b from-gray-900 to-black border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Shield className="text-yellow-500 w-10 h-10" /></div>
                            <h3 className="text-lg font-bold text-yellow-400 mb-1">Math Engine</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">LOCAL FALLBACK</p>
                            <p className="text-gray-400 text-sm mb-4">Deterministic CPU-based engine. 100% uptime guarantee even if all cloud APIs fail.</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-yellow-500">ALWAYS ON • 0ms</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Sources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                        <Database className="w-12 h-12 text-purple-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Institutional Data Feeds</h3>
                        <ul className="text-gray-400 leading-relaxed space-y-2">
                            <li>• <strong>Order Flow Imbalance (OFI):</strong> Real-time L2 orderbook depth analysis</li>
                            <li>• <strong>Fear & Greed Index:</strong> Macro market sentiment (0-100 scale)</li>
                            <li>• <strong>WXT Ecosystem Price:</strong> Platform health indicator</li>
                            <li>• <strong>Funding Rates:</strong> Perpetual contract arbitrage signals</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition duration-300">
                        <Twitter className="w-12 h-12 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">X (Twitter) Social Intelligence</h3>
                        <ul className="text-gray-400 leading-relaxed space-y-2">
                            <li>• <strong>Real-time Sentiment:</strong> Crypto Twitter analysis faster than news</li>
                            <li>• <strong>Trend Detection:</strong> Identify viral tokens before price pumps</li>
                            <li>• <strong>Auto-Posting:</strong> Share profitable trades for transparency</li>
                            <li>• <strong>Community Signals:</strong> Aggregate wisdom of the crowd</li>
                        </ul>
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
                            <span className="flex-1">WEEX Orderbook (L2) + X/Twitter Firehose + Fear & Greed API + WXT Price + On-Chain Volume</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">PROCESSING</span>
                            <span className="flex-1">6 AI Models Vote → Consensus Algorithm → Risk Scoring → Position Sizing</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 border-b border-white/5 pb-4">
                            <span className="w-32 text-gray-500">OUTPUT</span>
                            <span className="flex-1 text-green-400">Trade Signal (Direction, Size, TP/SL) + ZK Proof Generation + X Post (if profitable)</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <span className="w-32 text-gray-500">UPTIME</span>
                            <span className="flex-1 text-yellow-400">100% Guaranteed (Local Math Engine activates if all cloud APIs fail)</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
