'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Brain, Zap } from 'lucide-react';

interface AISignal {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    modelUsed: string;
    timestamp: string;
}

interface AISignalGeneratorProps {
    symbol?: string;
    price?: number;
}

export default function AISignalGenerator({
    symbol = 'BTC/USDT',
    price = 95000
}: AISignalGeneratorProps) {
    const [signal, setSignal] = useState<AISignal | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSignal = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol,
                    price,
                    volume: 1500000000,
                    indicators: {
                        rsi: 30 + Math.random() * 40,
                        macd: -0.5 + Math.random() * 1.0,
                        volume_ratio: 0.8 + Math.random() * 0.4
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setSignal(data.data);
            } else {
                setError(data.error || 'Failed to generate signal');
            }
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'BUY': return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'SELL': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'HOLD': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'BUY': return <TrendingUp className="w-6 h-6" />;
            case 'SELL': return <TrendingDown className="w-6 h-6" />;
            case 'HOLD': return <Minus className="w-6 h-6" />;
            default: return null;
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-white/10 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">GEMINI AI Signal</h3>
                        <p className="text-gray-400 text-sm">Real-time trading signal generation</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium">Powered by Gemini 2.5</span>
                </div>
            </div>

            {/* Market Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Symbol</p>
                    <p className="text-white text-xl font-bold">{symbol}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-gray-400 text-sm mb-1">Current Price</p>
                    <p className="text-white text-xl font-bold">${price.toLocaleString()}</p>
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateSignal}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed mb-6"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating AI Signal...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Brain className="w-5 h-5" />
                        Generate AI Signal
                    </span>
                )}
            </button>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm">⚠️ {error}</p>
                </div>
            )}

            {/* Signal Result */}
            {signal && (
                <div className="space-y-4 animate-fade-in">
                    {/* Action Badge */}
                    <div className={`flex items-center justify-between p-6 rounded-xl border ${getActionColor(signal.action)}`}>
                        <div className="flex items-center gap-4">
                            {getActionIcon(signal.action)}
                            <div>
                                <p className="text-sm opacity-80">AI Recommendation</p>
                                <p className="text-3xl font-bold">{signal.action}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-80">Confidence</p>
                            <p className="text-3xl font-bold">{(signal.confidence * 100).toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Confidence Level</span>
                            <span className="text-white font-bold">{(signal.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${signal.confidence > 0.8 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                        signal.confidence > 0.6 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                                            'bg-gradient-to-r from-red-500 to-pink-400'
                                    }`}
                                style={{ width: `${signal.confidence * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            AI Reasoning
                        </h4>
                        <p className="text-gray-300 leading-relaxed">{signal.reasoning}</p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-gray-400 text-sm mb-1">Model Used</p>
                            <p className="text-white font-mono text-sm">{signal.modelUsed}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-gray-400 text-sm mb-1">Generated At</p>
                            <p className="text-white font-mono text-sm">
                                {new Date(signal.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Footer */}
            {!signal && !loading && !error && (
                <div className="text-center text-gray-500 text-sm mt-6">
                    Click the button above to generate an AI-powered trading signal
                </div>
            )}
        </div>
    );
}
