"use client";

import { Twitter, TrendingUp, MessageCircle, Share2, BarChart3, Zap } from "lucide-react";

export default function SocialPage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-20 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-mono tracking-wider mb-4">
                        SOCIAL INTELLIGENCE • REAL-TIME SENTIMENT
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-600">
                        X (Twitter) Integration
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Harness the power of Crypto Twitter. Our AI analyzes social sentiment in real-time, detecting trends before they hit mainstream news. Every profitable trade is automatically shared for full transparency.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/50 transition duration-300">
                        <TrendingUp className="w-12 h-12 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Real-Time Sentiment Analysis</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Monitor Crypto Twitter 24/7 to detect bullish or bearish sentiment shifts before they impact price. Our AI processes thousands of tweets per minute, identifying key opinion leaders and viral trends.
                        </p>
                        <ul className="text-gray-400 space-y-2">
                            <li>• Sentiment scoring (0-100 scale)</li>
                            <li>• Influencer tracking & weighting</li>
                            <li>• Viral trend detection (pre-pump alerts)</li>
                            <li>• Multi-language support</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition duration-300">
                        <MessageCircle className="w-12 h-12 text-purple-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Automated Trade Posting</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Every profitable trade is automatically posted to X with full transparency. Build trust with the community by showing real, verifiable results backed by on-chain proofs.
                        </p>
                        <ul className="text-gray-400 space-y-2">
                            <li>• Auto-post winning trades</li>
                            <li>• Include P&L and entry/exit prices</li>
                            <li>• Link to Base Sepolia proof</li>
                            <li>• Customizable posting rules</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/50 transition duration-300">
                        <Share2 className="w-12 h-12 text-cyan-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Community Signal Aggregation</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Leverage the wisdom of the crowd. Our system aggregates trading signals from verified crypto traders on X, creating a powerful consensus indicator.
                        </p>
                        <ul className="text-gray-400 space-y-2">
                            <li>• Track verified trader accounts</li>
                            <li>• Aggregate buy/sell signals</li>
                            <li>• Weight by historical accuracy</li>
                            <li>• Detect coordinated pump schemes</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-2xl p-8 hover:border-green-500/50 transition duration-300">
                        <Zap className="w-12 h-12 text-green-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Speed Advantage</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Social sentiment often moves faster than traditional news. By monitoring X in real-time, we capture alpha before it's priced in by the broader market.
                        </p>
                        <ul className="text-gray-400 space-y-2">
                            <li>• Sub-second tweet processing</li>
                            <li>• Faster than Bloomberg Terminal</li>
                            <li>• Direct API access (no scraping)</li>
                            <li>• Integrated with UNUM AI voting</li>
                        </ul>
                    </div>
                </div>

                {/* Technical Implementation */}
                <div className="bg-gray-900 rounded-3xl p-8 md:p-12 border border-white/10">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <BarChart3 className="text-blue-400" />
                        How It Works
                    </h2>
                    <div className="space-y-6">
                        <div className="border-l-4 border-blue-500 pl-6">
                            <h4 className="text-xl font-bold text-blue-400 mb-2">1. Data Collection</h4>
                            <p className="text-gray-400">
                                Using X's official API (OAuth 2.0), we stream tweets containing crypto-related keywords ($BTC, $ETH, etc.) in real-time. No rate limits, no scraping—just pure, authorized data.
                            </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-6">
                            <h4 className="text-xl font-bold text-purple-400 mb-2">2. NLP Processing</h4>
                            <p className="text-gray-400">
                                Each tweet is analyzed by our UNUM AI models (DeepSeek, Gemini, Llama) to extract sentiment, detect sarcasm, and identify actionable signals. We filter out noise and focus on high-signal accounts.
                            </p>
                        </div>
                        <div className="border-l-4 border-cyan-500 pl-6">
                            <h4 className="text-xl font-bold text-cyan-400 mb-2">3. Signal Integration</h4>
                            <p className="text-gray-400">
                                Social sentiment is combined with technical indicators (RSI, Order Flow) and macro data (Fear & Greed) to generate a final trading decision. Social data acts as a "tie-breaker" when models disagree.
                            </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-6">
                            <h4 className="text-xl font-bold text-green-400 mb-2">4. Transparency Loop</h4>
                            <p className="text-gray-400">
                                After a profitable trade, our bot automatically posts the results to X with a link to the on-chain proof on Base Sepolia. This creates a public, auditable track record.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Preview */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <Twitter className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <span className="text-3xl font-bold block">1,000+</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Tweets Analyzed/Hour</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <span className="text-3xl font-bold block">15s</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Avg. Signal Latency</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                        <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <span className="text-3xl font-bold block">100%</span>
                        <span className="text-sm text-gray-400 uppercase tracking-widest">Transparency Rate</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
