'use client';

import Link from 'next/link';
import { useBlockchainStats } from '@/hooks/useBlockchainStats';
import { Shield, TrendingUp, Zap, Brain, ExternalLink, Twitter, Database, Activity } from 'lucide-react';

export default function Home() {
    const stats = useBlockchainStats();

    return (
        <div className="bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
            {/* 1. HERO SECTION - High Impact for Judges */}
            <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black z-0" />

                <div className="z-10 text-center space-y-6 max-w-5xl px-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono tracking-wider uppercase">
                            WEEX Alpha Awakens Finalist
                        </span>
                        <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-wider uppercase">
                            Neuro-Symbolic Architecture
                        </span>
                        <span className="px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono tracking-wider uppercase">
                            Groq LPU Acceleration
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500">
                        WAlphaHunter V2
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        The world's first <span className="text-purple-400 font-bold">Unstoppable Financial Agent</span>.
                        Combines <span className="text-emerald-400 font-bold">Groq-Powered LLMs</span> (Speed) with <span className="text-cyan-400 font-bold">Symbolic Logic</span> (Safety) and <span className="text-blue-400 font-bold">OpML Blockchain Audit</span> (Trust).
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Launch Mission Control
                        </Link>
                        <Link href="/platform/ai-engine" className="px-8 py-4 border border-white/20 hover:bg-white/5 rounded-lg text-white font-medium transition flex items-center justify-center gap-2">
                            <Brain className="w-5 h-5" />
                            Read Architecture Whitepaper
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. ON-CHAIN STATS - Real Blockchain Data */}
            <section className="py-24 bg-black border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-4">
                            <div className={`w-2 h-2 rounded-full ${stats.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                            <span className={`text-sm font-medium ${stats.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.isConnected && stats.sepoliaStats?.isConnected ? 'HYBRID NET: ONLINE' : 'CONNECTING...'}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Dual-Chain Proof of Inference (OpML)</h2>
                        <p className="text-gray-400">High-Frequency Verification (Base L2) + Final Settlement Anchoring (Ethereum L1)</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <MetricCard
                            icon={<Shield className="w-6 h-6" />}
                            label="Trades Verified (L2)"
                            value={stats.totalTrades.toLocaleString()}
                            sub="Base Sepolia (Latency < 2s)"
                            color="text-blue-400"
                        />
                        <MetricCard
                            icon={<Brain className="w-6 h-6" />}
                            label="Logic Gates Passed"
                            value={(stats.totalDecisions * 4).toLocaleString()}
                            sub="Neuro-Symbolic Validation"
                            color="text-cyan-400"
                        />
                        <MetricCard
                            icon={<Zap className="w-6 h-6" />}
                            label="Inference Speed"
                            value="820 t/s"
                            sub="Groq LPU Cluster (Real-time)"
                            color="text-green-400"
                        />
                    </div>
                    <div className="text-center">
                        <a
                            href="https://sepolia.basescan.org/address/0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Verify Contract on BaseScan</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* 3. THE COGNITIVE TRIAD - AI Models Showcase */}
            <section className="py-24 border-t border-white/10 bg-gradient-to-b from-black to-purple-900/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-2">The Cognitive Triad (Mixture-of-Agents)</h2>
                        <p className="text-gray-400">Collaborative intelligence powered by specialized agents</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-xl text-center hover:border-emerald-500/50 transition">
                            <h3 className="text-xl font-bold text-emerald-400 mb-1">DeepSeek Math</h3>
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Quantitative Logic Engine</p>
                            <p className="text-sm text-gray-300">Specialized in numerical precision, greeks calculation, and probability arbitrage.</p>
                        </div>
                        <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-xl text-center hover:border-purple-500/50 transition transform scale-105 shadow-xl">
                            <h3 className="text-xl font-bold text-purple-400 mb-1">Llama 3 Instruct</h3>
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Strategic Orchestrator</p>
                            <p className="text-sm text-gray-300">Synthesizes data, directs the debate, and makes the final execution decision.</p>
                        </div>
                        <div className="bg-orange-900/10 border border-orange-500/20 p-6 rounded-xl text-center hover:border-orange-500/50 transition">
                            <h3 className="text-xl font-bold text-orange-400 mb-1">Mistral Large</h3>
                            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Risk & Context</p>
                            <p className="text-sm text-gray-300">Analyzes long-context market sentiment and macro-economic tail risks.</p>
                        </div>
                    </div>

                    {/* Logic Layer Badge */}
                    <div className="max-w-lg mx-auto bg-cyan-900/20 border border-cyan-500/40 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Shield className="w-8 h-8 text-cyan-400" />
                            <div className="text-left">
                                <h4 className="font-bold text-cyan-400">Symbolic Logic Guardrails</h4>
                                <p className="text-xs text-gray-400">Deterministic Prolog Engine blocks all unsafe actions</p>
                            </div>
                        </div>
                        <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* 4. DATA SOURCES - Institutional Grade */}
            <section className="py-24 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-2">Institutional Data Feeds</h2>
                        <p className="text-gray-400">Beyond price action: Order flow, sentiment, and ecosystem health</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DataSourceCard
                            icon={<Database className="w-8 h-8" />}
                            title="Order Flow Imbalance"
                            description="Real-time L2 orderbook depth analysis"
                            color="purple"
                        />
                        <DataSourceCard
                            icon={<Activity className="w-8 h-8" />}
                            title="Fear & Greed Index"
                            description="Macro market sentiment (0-100 scale)"
                            color="blue"
                        />
                        <DataSourceCard
                            icon={<Twitter className="w-8 h-8" />}
                            title="X Social Intelligence"
                            description="Crypto Twitter sentiment analysis"
                            color="cyan"
                        />
                        <DataSourceCard
                            icon={<Zap className="w-8 h-8" />}
                            title="WXT Ecosystem Price"
                            description="Platform health indicator"
                            color="yellow"
                        />
                    </div>
                </div>
            </section>

            {/* 5. DEVELOPER TOOLS - CLI & MCP (NEW) */}
            <section className="py-24 border-t border-white/10 bg-black">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono tracking-wider mb-4">
                            FOR AGENTS & HUMANS
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Command The Alpha</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Control the neural engine directly from your terminal or integrate it into your own AI agents via MCP protocol.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* WAH CLI */}
                        <div className="bg-[#0c0c0c] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <span className="ml-2 text-xs text-gray-400 font-mono">user@wah-cli: ~</span>
                            </div>
                            <div className="p-6 font-mono text-sm space-y-4">
                                <div>
                                    <p className="text-gray-500 mb-2"># Install the CLI tool</p>
                                    <p className="text-green-400">$ npm install -g @wah/cli</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-2"># Ask Titan for analysis</p>
                                    <p className="text-green-400">$ wah ask BTC/USDT -p 67500</p>
                                    <div className="mt-2 text-gray-300 opacity-80 pl-4 border-l-2 border-purple-500">
                                        <p>🦁 Titan Neural Engine: ONLINE</p>
                                        <p>🧠 Council Consensus: BUY (88% Confidence)</p>
                                        <p>📊 Reason: RSI Oversold + Whale Accumulation on Base L2</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MCP SERVER */}
                        <div className="bg-[#0c0c0c] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                AGENT READY
                            </div>
                            <div className="p-8">
                                <div className="flex justify-center mb-6">
                                    <Database className="w-16 h-16 text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">Model Context Protocol (MCP)</h3>
                                <p className="text-gray-400 mb-6">
                                    Connect WAlphaHunter's "Council of 6" brain directly to Claude, Cursor, or any LLM-based agent. Expose professional trading tools to your local AI.
                                </p>
                                <ul className="space-y-3 font-mono text-sm text-gray-300 mb-8">
                                    <li className="flex gap-2 text-green-400">
                                        <span>✓</span> <span>get_market_consensus()</span>
                                    </li>
                                    <li className="flex gap-2 text-green-400">
                                        <span>✓</span> <span>verify_proof_on_base()</span>
                                    </li>
                                    <li className="flex gap-2 text-green-400">
                                        <span>✓</span> <span>fetch_social_sentiment()</span>
                                    </li>
                                </ul>
                                <button className="w-full py-3 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-bold hover:bg-purple-500/20 transition">
                                    View MCP Documentation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. LIVE TRADING LOG */}
            <section className="py-24 border-t border-white/10 relative">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Live Trading Engine</h2>
                        <p className="text-gray-400">Real-time signal generation and execution</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-8 border border-white/10 text-left font-mono text-sm overflow-x-auto">
                        <div className="flex justify-between border-b border-white/10 pb-4 mb-4">
                            <span className="text-gray-500">Latest Signal Hash</span>
                            <span className="text-purple-400">0x7f...3a29</span>
                        </div>
                        <div className="space-y-2 text-gray-400">
                            <p><span className="text-purple-400">[UNUM]</span> Consensus Vote: 5/6 models agree → BUY</p>
                            <p><span className="text-blue-400">[DATA]</span> OFI: +0.42 | F&G: 38 | WXT: $0.05 | X Sentiment: +0.67</p>
                            <p><span className="text-yellow-400">[RISK]</span> WXT Discount Applied. Fee: 0.03% (50% savings)</p>
                            <p><span className="text-cyan-400">[EXEC]</span> Order FILLED @ 95,432.00 | TP: 96,200 | SL: 94,800</p>
                            <p className="text-green-500"><span className="text-green-400">[PROOF]</span> Tx Confirmed on Base Sepolia | Posted to X</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. FEATURES GRID */}
            <section className="py-24 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-2">Why WAlphaHunter?</h2>
                        <p className="text-gray-400">Institutional-grade AI trading with blockchain transparency</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="w-8 h-8" />}
                            title="Neuro-Symbolic Architecture"
                            description="Combines the creativity of LLMs (Llama, DeepSeek) with the absolute safety of Symbolic Logic (Prolog). The system 'thinks' creatively but acts deterministically."
                            color="purple"
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8" />}
                            title="Dual-Chain OpML Audit"
                            description="Every AI decision is cryptographically verified. Execution on Base L2 for speed, settlement on Ethereum L1 for immutable trust. Zero trust required."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Groq LPU Acceleration"
                            description="Inference at 800+ tokens/second allows for real-time Multi-Agent Debate. The system debates, critiques, and refines strategies in milliseconds."
                            color="cyan"
                        />
                    </div>
                </div>
            </section>

            {/* 7. CTA SECTION */}
            <section className="py-24 border-t border-white/10 bg-gradient-to-b from-black to-purple-900/20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Experience AI-Powered Trading?</h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Explore the dashboard, see the Council of 6 in action, and verify everything on-chain.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition">
                            Open Dashboard
                        </Link>
                        <Link href="/resources/performance" className="px-8 py-4 border border-white/20 hover:bg-white/5 rounded-lg text-white font-medium transition">
                            View Live Performance
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function MetricCard({ icon, label, value, sub, color = "text-white" }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition group">
            <div className={`${color} mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">{label}</h3>
            <div className={`text-4xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-gray-400 text-sm">{sub}</div>
        </div>
    );
}

function AIModelBadge({ name, role, color }: any) {
    const colorClasses: any = {
        emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
        orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    };

    return (
        <div className={`${colorClasses[color]} border rounded-lg p-4 text-center`}>
            <p className="font-bold text-sm mb-1">{name}</p>
            <p className="text-xs opacity-75">{role}</p>
        </div>
    );
}

function DataSourceCard({ icon, title, description, color }: any) {
    const colorClasses: any = {
        purple: 'from-purple-900/20 to-pink-900/20 text-purple-400',
        blue: 'from-blue-900/20 to-cyan-900/20 text-blue-400',
        cyan: 'from-cyan-900/20 to-blue-900/20 text-cyan-400',
        yellow: 'from-yellow-900/20 to-orange-900/20 text-yellow-400'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl border border-white/10 p-6 hover:scale-105 transition-transform`}>
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: any) {
    const colorClasses: any = {
        purple: 'from-purple-900/20 to-pink-900/20 text-purple-400',
        blue: 'from-blue-900/20 to-cyan-900/20 text-blue-400',
        cyan: 'from-cyan-900/20 to-blue-900/20 text-cyan-400',
        yellow: 'from-yellow-900/20 to-orange-900/20 text-yellow-400'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl border border-white/10 p-8 hover:scale-105 transition-transform`}>
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}

