'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

interface MarketAnalysis {
    summary: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    trendStrength: number;
    analysis: string;
    keyLevels: {
        support: number[];
        resistance: number[];
    };
    recommendations: string[];
    risks: string[];
    modelUsed: string;
    timestamp: string;
}

export default function MarketAnalysisPanel() {
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [symbol, setSymbol] = useState('BTC/USDT');

    const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];

    const analyzeMarket = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol,
                    timeframe: '24h',
                    includeRecommendations: true
                })
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.data);
            } else {
                setError(data.error || 'Failed to analyze market');
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'BULLISH': return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'BEARISH': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'NEUTRAL': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'BULLISH': return <TrendingUp className="w-6 h-6" />;
            case 'BEARISH': return <TrendingDown className="w-6 h-6" />;
            case 'NEUTRAL': return <Activity className="w-6 h-6" />;
            default: return null;
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 rounded-2xl border border-white/10 p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Market Analysis</h3>
                        <p className="text-gray-400 text-sm">AI-powered comprehensive market insights</p>
                    </div>
                </div>

                {/* Symbol Selector */}
                <div className="flex gap-2 flex-wrap">
                    {symbols.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSymbol(s)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${symbol === s
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Analyze Button */}
            <button
                onClick={analyzeMarket}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed mb-6"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing {symbol}...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Analyze Market
                    </span>
                )}
            </button>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm">⚠️ {error}</p>
                </div>
            )}

            {/* Analysis Result */}
            {analysis && (
                <div className="space-y-6 animate-fade-in">
                    {/* Sentiment & Trend */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-6 rounded-xl border ${getSentimentColor(analysis.sentiment)}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {getSentimentIcon(analysis.sentiment)}
                                <span className="text-sm opacity-80">Market Sentiment</span>
                            </div>
                            <p className="text-2xl font-bold">{analysis.sentiment}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-gray-400 text-sm mb-2">Trend Strength</p>
                            <p className="text-2xl font-bold text-white mb-2">
                                {(analysis.trendStrength * 100).toFixed(0)}%
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
                                    style={{ width: `${analysis.trendStrength * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-white font-bold mb-3">Summary</h4>
                        <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-white font-bold mb-3">Detailed Analysis</h4>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{analysis.analysis}</p>
                    </div>

                    {/* Key Levels */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
                            <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Support Levels
                            </h4>
                            <div className="space-y-2">
                                {analysis.keyLevels.support.map((level, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Level {i + 1}</span>
                                        <span className="text-green-400 font-bold">${level.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
                            <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5" />
                                Resistance Levels
                            </h4>
                            <div className="space-y-2">
                                {analysis.keyLevels.resistance.map((level, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Level {i + 1}</span>
                                        <span className="text-red-400 font-bold">${level.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            Recommendations
                        </h4>
                        <div className="space-y-3">
                            {analysis.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-green-400 text-xs font-bold">{i + 1}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risks */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            Risk Factors
                        </h4>
                        <div className="space-y-3">
                            {analysis.risks.map((risk, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{risk}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-gray-400 text-sm mb-1">Model Used</p>
                            <p className="text-white font-mono text-sm">{analysis.modelUsed}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-gray-400 text-sm mb-1">Generated At</p>
                            <p className="text-white font-mono text-sm">
                                {new Date(analysis.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
