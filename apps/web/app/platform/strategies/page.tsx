'use client';
import { TrendingUp, BarChart3, ArrowRightLeft, ShieldAlert, Cpu, Activity, AlertCircle, Zap, Brain, Globe, Database } from "lucide-react";
import { useStrategies } from "@/hooks/useStrategies";

export default function StrategiesPage() {
    const { strategies, loading } = useStrategies();

    const blueprints = [
        {
            name: "Llama HFT Scalper",
            icon: <Zap className="w-8 h-8 text-purple-400" />,
            description: "Ultra-low latency scalping powered by Llama (Groq). Exploits micro-inefficiencies in WEEX order books with sub-50ms execution.",
            model: "Llama",
            risk: "High",
            type: "Market Making"
        },
        {
            name: "DeepSeek Statistical Arb",
            icon: <Brain className="w-8 h-8 text-emerald-400" />,
            description: "Long/Short neutral strategy. DeepSeek analyzes funding rates and cross-exchange spreads to capture risk-free yield.",
            model: "DeepSeek",
            risk: "Low",
            type: "Delta Neutral"
        },
        {
            name: "Gemini Macro Trend",
            icon: <Globe className="w-8 h-8 text-blue-400" />,
            description: "Swing trading engine using Gemini to process global news, sentiment (Fear & Greed), and macro indicators.",
            model: "Gemini",
            risk: "Medium",
            type: "Trend Following"
        },
        {
            name: "Mixtral Sentiment Shift",
            icon: <Activity className="w-8 h-8 text-orange-400" />,
            description: "Detects sudden sentiment reversals on X (Twitter). Mixtral aggregates thousands of tweets to predict volatility spikes.",
            model: "Mixtral",
            risk: "High",
            type: "Event Driven"
        },
        {
            name: "Qwen Order Flow",
            icon: <Database className="w-8 h-8 text-cyan-400" />,
            description: "Analyzes L2 Order Flow Imbalance (OFI) to predict immediate price direction based on whale wall movements.",
            model: "Qwen",
            risk: "Medium",
            type: "Quant Analysis"
        },
        {
            name: "Math Engine Fallback",
            icon: <ShieldAlert className="w-8 h-8 text-yellow-400" />,
            description: "Deterministic Mean Reversion algorithm running locally. Guarantees 100% uptime and capital protection if cloud APIs fail.",
            model: "Local CPU",
            risk: "Low",
            type: "Defensive"
        }
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        Trading Strategies
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Six specialized execution engines matched to the unique strengths of the "Council of 6" AI models.
                    </p>
                </div>

                {/* ARCHITECTURE BLUEPRINTS */}
                <div className="mb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blueprints.map((strat) => (
                            <div key={strat.name} className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-purple-500/30 transition group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {strat.icon}
                                    </div>
                                    <span className="text-xs font-mono py-1 px-2 rounded bg-white/5 border border-white/10 text-gray-400">
                                        {strat.type}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{strat.name}</h3>
                                <p className="text-sm font-semibold text-purple-400 mb-4">Powered by {strat.model}</p>
                                <p className="text-gray-400 mb-6 min-h-[60px] text-sm leading-relaxed">{strat.description}</p>

                                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Risk Profile</div>
                                        <div className={`text-sm font-semibold ${strat.risk === 'High' ? 'text-red-400' :
                                            strat.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                                            }`}>{strat.risk}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                                        <div className="text-sm font-bold text-blue-400 flex items-center gap-1 justify-end">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                            Ready
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* REAL ON-CHAIN STRATEGIES */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <h2 className="text-2xl font-bold">Live On-Chain Registry</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center border border-white/10 rounded-xl animate-pulse">
                            <p className="text-gray-400">Scanning Base Sepolia for active strategy contracts...</p>
                        </div>
                    ) : strategies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {strategies.map((strat) => (
                                <div key={strat.id} className="bg-gradient-to-br from-green-900/10 to-blue-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden group">
                                    {strat.audited ? (
                                        <div className="absolute top-4 right-4 text-xs font-mono text-green-400 border border-green-500/30 px-2 py-1 rounded flex items-center gap-1">
                                            <ShieldAlert className="w-3 h-3" /> AUDITED
                                        </div>
                                    ) : (
                                        <div className="absolute top-4 right-4 text-xs font-mono text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded">
                                            LIVE (UNAUDITED)
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold mb-2">{strat.name}</h3>
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{strat.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mt-4 border-t border-white/10 pt-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase">Trades</div>
                                            <div className="text-lg font-mono">{strat.performance.totalTrades}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase">Win Rate</div>
                                            <div className="text-lg font-mono text-green-400">{strat.winRate}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase">Sharpe</div>
                                            <div className="text-lg font-mono text-blue-400">{strat.performance.sharpeRatio}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase">Drawdown</div>
                                            <div className="text-lg font-mono text-red-400">{strat.performance.maxDrawdown}%</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-gray-600 truncate flex items-center gap-2">
                                        <ShieldAlert className="w-3 h-3 text-green-500" />
                                        Contract: {strat.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-300 mb-2">No Active Strategies Deployed</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                The registry on Base Sepolia is currently empty. Initialize the backtest engine to deploy and register a new strategy.
                            </p>
                            <div className="inline-block px-4 py-2 bg-gray-800 rounded text-xs font-mono text-gray-400 border border-white/10">
                                Waiting for Contract Interaction...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <ShieldAlert className="w-12 h-12 text-purple-400 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-xl mb-2">Institutional-Grade Risk Engine</h4>
                        <p className="text-gray-400">
                            Safety is paramount. Every strategy is wrapped with a global risk controller that enforcing maximum drawdown limits (5%), Volatility-Adjusted Sizing (ATR), and automatic "kill switches" during flash crashes.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
