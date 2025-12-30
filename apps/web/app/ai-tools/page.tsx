'use client';

import AISignalGenerator from '@/components/ai/AISignalGenerator';
import MarketAnalysisPanel from '@/components/ai/MarketAnalysisPanel';
import { Brain, Sparkles, Zap, Cpu, Network } from 'lucide-react';

export default function AIToolsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 via-black to-black py-20">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-full mb-6">
                            <Network className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 text-sm font-medium">Council of 6 • Live Consensus</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
                            AI Trading Lab
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Interact directly with the Council. Generate signals, backtest strategies, and analyze market sentiment using the combined intelligence of DeepSeek, Gemini, Llama, and more.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">6</div>
                            <div className="text-gray-400 text-sm">Active Neural Models</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-pink-400 mb-2">~450ms</div>
                            <div className="text-gray-400 text-sm">Consensus Latency</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
                            <div className="text-gray-400 text-sm">System Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* AI Signal Generator Section */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">Signal Generator</h2>
                            <p className="text-gray-400">Request a trade analysis from the full Council</p>
                        </div>
                    </div>
                    <AISignalGenerator />
                </section>

                {/* Market Analysis Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Sparkles className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">Deep Market Analysis</h2>
                            <p className="text-gray-400">Macro-trends, sentiment parsing, and comprehensive reports</p>
                        </div>
                    </div>
                    <MarketAnalysisPanel />
                </section>

                {/* Features Grid */}
                <section className="mt-20">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">The UNUM Advantage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-white/10 p-8">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Cpu className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Logic + Creativity</h3>
                            <p className="text-gray-400 leading-relaxed">
                                We combine DeepSeek's rigorous logic with Gemini's massive context window to see patterns others miss.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-white/10 p-8">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Speed where it matters</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Llama 3.1 runs on Groq hardware for millisecond-level execution, while slower models verify the logic asynchronously.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-900/20 to-red-900/20 rounded-2xl border border-white/10 p-8">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Network className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Consensus Voting</h3>
                            <p className="text-gray-400 leading-relaxed">
                                No single model makes a trade decision. 5/6 models must agree before any capital is deployed.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="mt-20 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-white/10 p-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Automate?</h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Deploy these tools as automated strategies via our Engine CLI.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/platform/ai-engine"
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Explore Architecture
                        </a>
                        <a
                            href="/dashboard"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all duration-300"
                        >
                            Go to Dashboard
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
