import AISignalGenerator from '@/components/ai/AISignalGenerator';
import MarketAnalysisPanel from '@/components/ai/MarketAnalysisPanel';
import { Brain, Sparkles } from 'lucide-react';

export default function AIToolsPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/20 via-black to-black py-20">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 text-sm font-medium">Powered by GEMINI 2.5</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
                            AI Trading Tools
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Harness the power of advanced AI to generate trading signals and analyze markets in real-time.
                            All powered by Google's GEMINI neural engine.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">2.5</div>
                            <div className="text-gray-400 text-sm">GEMINI Model Version</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-pink-400 mb-2">&lt;1s</div>
                            <div className="text-gray-400 text-sm">Average Response Time</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">95%+</div>
                            <div className="text-gray-400 text-sm">Confidence Accuracy</div>
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
                            <h2 className="text-3xl font-bold text-white">AI Signal Generator</h2>
                            <p className="text-gray-400">Generate real-time trading signals using GEMINI AI</p>
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
                            <h2 className="text-3xl font-bold text-white">Market Analysis</h2>
                            <p className="text-gray-400">Comprehensive AI-powered market insights and recommendations</p>
                        </div>
                    </div>
                    <MarketAnalysisPanel />
                </section>

                {/* Features Grid */}
                <section className="mt-20">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Why Use AI Tools?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-white/10 p-8">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Multi-Modal Analysis</h3>
                            <p className="text-gray-400 leading-relaxed">
                                GEMINI processes unstructured data including news sentiment, social graphs, and visual chart patterns simultaneously.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-white/10 p-8">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Real-Time Insights</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Get instant market analysis and trading signals powered by the latest AI technology with sub-second latency.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-900/20 to-red-900/20 rounded-2xl border border-white/10 p-8">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">High Confidence</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Every signal comes with a confidence score, helping you make informed decisions based on AI certainty.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="mt-20 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-white/10 p-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Trade Smarter?</h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Start using AI-powered tools to enhance your trading strategy. Generate signals, analyze markets, and make data-driven decisions.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/platform/ai-engine"
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Learn More About GEMINI
                        </a>
                        <a
                            href="/platform/strategies"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all duration-300"
                        >
                            View Strategies
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
