'use client';
import { TrendingUp, BarChart3, ArrowRightLeft, ShieldAlert, Cpu, Activity, AlertCircle } from "lucide-react";
import { useStrategies } from "@/hooks/useStrategies";

export default function StrategiesPage() {
    const { strategies, loading } = useStrategies();

    const blueprints = [
        {
            name: "Momentum Alpha",
            icon: <TrendingUp className="w-8 h-8 text-blue-400" />,
            description: "Captures strong directional moves following major news events or volume spikes. Optimized for high-volatility pairs.",
            risk: "Medium",
            // return: "+142% APY" // Removed static return to be honest
        },
        {
            name: "Mean Reversion",
            icon: <ArrowRightLeft className="w-8 h-8 text-purple-400" />,
            description: "Identifies overbought/oversold conditions using statistical deviations. Best for ranging markets.",
            risk: "Low",
            // return: "+45% APY"
        },
        {
            name: "Sentiment Arbitrage",
            icon: <BarChart3 className="w-8 h-8 text-pink-400" />,
            description: "Leverages GEMINI sentiment analysis to predict price action before order flow confirms the move.",
            risk: "High",
            // return: "+210% APY"
        }
    ];

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Trading Strategies</h1>
                    <p className="text-xl text-gray-400 max-w-3xl">
                        Execution engines powered by GEMINI and verified on Base Sepolia.
                    </p>
                </div>

                {/* REAL ON-CHAIN STRATEGIES */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <h2 className="text-2xl font-bold">Live On-Chain Registry</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center border border-white/10 rounded-xl animate-pulse">
                            <p className="text-gray-400">Scanning Base Sepolia for strategies...</p>
                        </div>
                    ) : strategies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {strategies.map((strat) => (
                                <div key={strat.id} className="bg-gradient-to-br from-green-900/10 to-blue-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-4 right-4 text-xs font-mono text-green-400 border border-green-500/30 px-2 py-1 rounded">
                                        ACTIVE
                                    </div>
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
                                    <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-gray-600 truncate">
                                        ID: {strat.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-300 mb-2">No Active Strategies Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                There are currently no strategies registered in the Base Sepolia contract.
                                Deploy a strategy using the Engine CLI to see it here.
                            </p>
                            <div className="inline-block px-4 py-2 bg-gray-800 rounded text-xs font-mono text-gray-400">
                                pnpm engine:deploy-strategy
                            </div>
                        </div>
                    )}
                </div>

                {/* ARCHITECTURE BLUEPRINTS */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-purple-400" />
                        Supported Architectures
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {blueprints.map((strat) => (
                            <div key={strat.name} className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition opacity-80 hover:opacity-100">
                                <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                    {strat.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{strat.name}</h3>
                                <p className="text-gray-400 mb-6 min-h-[80px]">{strat.description}</p>

                                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Risk Level</div>
                                        <div className="text-sm font-semibold text-gray-300">{strat.risk}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                                        <div className="text-sm font-bold text-blue-400">Blueprint</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-24 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-lg mb-2">Automated Risk Management</h4>
                        <p className="text-gray-400 text-sm">
                            Every strategy is wrapped with a global risk engine that enforces maximum drawdown limits, dynamic position sizing based on volatility (ATR), and circuit breakers to protect capital during flash crashes.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
