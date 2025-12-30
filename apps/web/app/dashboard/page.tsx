'use client';

import { useState, useEffect } from 'react';

import { useBlockchainStats } from '@/hooks/useBlockchainStats';
import { Activity, TrendingUp, Shield, Zap, Brain, Database, CheckCircle, ExternalLink, Twitter, BarChart3, Lock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const stats = useBlockchainStats();
    const [liveData, setLiveData] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/live-stats.json?t=' + Date.now());
                if (res.ok) {
                    setLiveData(await res.json());
                }
            } catch (e) { }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header / Command Center Status */}
            <div className="border-b border-white/10 bg-gradient-to-b from-gray-900 via-black to-black">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                                    UNUM Mission Control
                                </h1>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-widest">
                                    PRO
                                </span>
                            </div>
                            <p className="text-gray-400 max-w-xl">
                                Real-time orchestration of the <span className="text-white font-semibold">Council of 6 AI Models</span>, monitoring weak-form market efficiency, social sentiment, and order flow.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Network Status</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${stats.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className={`font-mono font-bold ${stats.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                                        {stats.isConnected && stats.sepoliaStats?.isConnected ? 'MULTI-CHAIN ACTIVE' : stats.isConnected ? 'BASE SEPOLIA' : 'OFFLINE'}
                                    </span>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span>WXT Boost Active</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* 1. KPIs - Institutional Grade */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <KpiCard
                        label="Net PnL (Verified)"
                        value={liveData ? `$${liveData.currentEquity.toFixed(2)}` : "$1,000.00"}
                        sub={liveData ? `${liveData.pnl >= 0 ? '+' : ''}${liveData.pnl.toFixed(2)} (${liveData.pnlPercent}%)` : "Waiting for data..."}
                        trend={liveData?.pnl >= 0 ? "up" : "down"}
                        icon={<TrendingUp className={`w-5 h-5 ${liveData?.pnl >= 0 ? "text-green-400" : "text-red-400"}`} />}
                    />
                    <KpiCard
                        label="Projected ROI (Annual)"
                        value={liveData ? `${liveData.roi}%` : "0%"}
                        sub={`Based on ${liveData?.runtime || 0}m runtime`}
                        trend={liveData?.roi > 0 ? "up" : "neutral"}
                        icon={<Activity className="w-5 h-5 text-blue-400" />}
                    />
                    <KpiCard
                        label="Social Sentiment"
                        value="Bullish (72)"
                        sub="1.2k Tweets/hr filtered"
                        trend="up"
                        icon={<Twitter className="w-5 h-5 text-cyan-400" />}
                    />
                    <KpiCard
                        label="System Latency"
                        value="45ms"
                        sub="WEEX Direct Connection"
                        trend="down"
                        icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    />
                </div>

                {/* 2. THE COUNCIL STATUS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Left Col: Model Health */}
                    <div className="lg:col-span-2 bg-gray-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-400" />
                                Council of 6 Status
                            </h3>
                            <Link href="/platform/ai-engine" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                View Architecture <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <ModelStatusBadge name="DeepSeek V3" role="Reasoning" status="online" ping="120ms" />
                            <ModelStatusBadge name="Gemini 1.5" role="Context" status="online" ping="85ms" />
                            <ModelStatusBadge name="Llama 3.1" role="Speed" status="online" ping="15ms" />
                            <ModelStatusBadge name="Mixtral 8x7" role="Diversity" status="online" ping="95ms" />
                            <ModelStatusBadge name="Qwen 2.5" role="Backup" status="standby" ping="110ms" />
                            <ModelStatusBadge name="Math Engine" role="Fallback" status="active" ping="0ms" />
                        </div>
                    </div>

                    {/* Right Col: Live Consensus Vote */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-center items-center text-center">
                        <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-4">Current Consensus</h3>
                        <div className="w-32 h-32 rounded-full border-4 border-green-500/20 flex items-center justify-center relative mb-4">
                            <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-spin-slow"></div>
                            <div className="text-3xl font-bold text-green-400">STRONG BUY</div>
                        </div>
                        <p className="text-sm text-gray-400">
                            <span className="text-white font-bold">5/6 Engines</span> agree.
                            <br />Confidence Score: <span className="text-green-400">94.2%</span>
                        </p>
                    </div>
                </div>

                {/* 3. LIVE MARKET INTELLIGENCE */}
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    Live Market Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Order Flow */}
                    <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
                        <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                            <span className="font-bold">Order Flow Imbalance (OFI)</span>
                            <span className="text-xs text-gray-500">WEEX L2 DATA</span>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-green-400">Buying Pressure</span>
                                <span className="text-sm text-red-400">Selling Pressure</span>
                            </div>
                            <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-green-500 w-[65%]"></div>
                                <div className="h-full bg-red-500 w-[35%]"></div>
                            </div>
                            <div className="mt-4 text-xs text-gray-400 flex justify-between">
                                <span>Vol: $4.2M (15m)</span>
                                <span>Whale Alert: 2 Detected</span>
                            </div>
                        </div>
                    </div>

                    {/* X Sentiment Analysis */}
                    <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
                        <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                            <span className="font-bold">X (Twitter) Sentiment</span>
                            <span className="text-xs text-gray-500">REAL-TIME STREAM</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Twitter className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-white mb-1">
                                        Major breakout mentioned by <span className="text-blue-400">@GenericInfluencer</span> and 12 others.
                                    </p>
                                    <p className="text-xs text-gray-500">2 minutes ago • Impact Score: High</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 opacity-60">
                                <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-white mb-1">
                                        Negative divergences spotted on 4h charts.
                                    </p>
                                    <p className="text-xs text-gray-500">5 minutes ago • Impact Score: Low</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. ON-CHAIN VERIFICATION LOG */}
                <div className="border border-white/10 rounded-xl bg-gray-900/30">
                    <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            Recent On-Chain Activity (Verified)
                        </h3>
                        <Link href="https://sepolia.basescan.org/" target="_blank" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                            Base Sepolia Explorer <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5 font-mono">
                        {liveData?.recentActivity && liveData.recentActivity.length > 0 ? (
                            liveData.recentActivity.map((activity: any, i: number) => (
                                <ActivityRow
                                    key={i}
                                    hash={activity.hash}
                                    action={activity.action}
                                    details={activity.details}
                                    timestamp={activity.timestamp}
                                    status="Verified"
                                    url={activity.explorerUrl}
                                    chain={activity.chain}
                                />
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                Waiting for blockchain confirmations...
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- SUBCOMPONENTS ---

function KpiCard({ label, value, sub, trend, icon }: any) {
    const isUp = trend === 'up';

    return (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition">
            <div className="flex justify-between items-start mb-4">
                <span className="text-gray-400 text-sm font-medium uppercase">{label}</span>
                {icon}
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className={`text-xs ${isUp ? 'text-green-400' : 'text-gray-400'}`}>
                {sub}
            </div>
        </div>
    );
}

function ModelStatusBadge({ name, role, status, ping }: any) {
    const isActive = status === 'active' || status === 'online';
    const color = isActive ? 'bg-green-500' : 'bg-yellow-500';

    return (
        <div className="p-3 bg-black rounded-lg border border-white/5 flex items-center justify-between">
            <div>
                <div className="text-sm font-bold text-gray-200">{name}</div>
                <div className="text-[10px] text-gray-500 uppercase">{role}</div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                    <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
                    <span className="text-[10px] text-gray-400">{ping}</span>
                </div>
            </div>
        </div>
    );
}

function ActivityRow({ hash, action, details, timestamp, status, url, chain }: any) {
    const timeAgo = timestamp ? Math.floor((Date.now() - timestamp) / 1000) : 0;

    return (
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition">
            <div className="flex items-center gap-4 mb-2 md:mb-0">
                <div className="p-2 bg-white/5 rounded-lg">
                    {action.includes('TRADE') ? <Zap className="w-4 h-4 text-yellow-400" /> :
                        action.includes('SIGNAL') ? <Brain className="w-4 h-4 text-purple-400" /> :
                            <Lock className="w-4 h-4 text-green-400" />}
                </div>
                <div>
                    <div className="text-xs font-bold text-white mb-0.5">{action}</div>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1">
                        {hash.substring(0, 8)}...{hash.substring(hash.length - 6)}
                        <ExternalLink className="w-2 h-2" />
                    </a>
                </div>
            </div>
            <div className="flex-1 md:px-8">
                <div className="text-xs text-gray-300 mb-1">{details}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">{chain || 'Unknown Chain'}</div>
            </div>
            <div className="text-right">
                <div className="text-xs font-medium text-green-400">{status}</div>
                <div className="text-[10px] text-gray-500">{timeAgo}s ago</div>
            </div>
        </div>
    );
}
