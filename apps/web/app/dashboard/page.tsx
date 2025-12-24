'use client';

import { useBlockchainStats } from '@/hooks/useBlockchainStats';
import { Activity, TrendingUp, Shield, Zap, Brain, Database, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const stats = useBlockchainStats();

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-gradient-to-b from-purple-900/20 to-black">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                Trading Dashboard
                            </h1>
                            <p className="text-gray-400">
                                Real-time performance metrics and on-chain verification
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${stats.isConnected ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className={`w-2 h-2 rounded-full ${stats.isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                <span className={`text-sm font-medium ${stats.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                                    {stats.isConnected ? `Connected to ${stats.network}` : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* On-Chain Stats Grid */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <h2 className="text-2xl font-bold">On-Chain Verification</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon={<Database className="w-6 h-6" />}
                            label="Total Trades Recorded"
                            value={stats.totalTrades.toLocaleString()}
                            sublabel="Verified on Base Sepolia"
                            color="text-blue-400"
                            bgColor="bg-blue-500/10"
                            borderColor="border-blue-500/30"
                        />
                        <StatCard
                            icon={<Brain className="w-6 h-6" />}
                            label="AI Decisions"
                            value={stats.totalDecisions.toLocaleString()}
                            sublabel="GEMINI-powered signals"
                            color="text-purple-400"
                            bgColor="bg-purple-500/10"
                            borderColor="border-purple-500/30"
                        />
                        <StatCard
                            icon={<CheckCircle className="w-6 h-6" />}
                            label="Active Submitters"
                            value={stats.totalSubmitters.toLocaleString()}
                            sublabel="Authorized wallets"
                            color="text-green-400"
                            bgColor="bg-green-500/10"
                            borderColor="border-green-500/30"
                        />
                    </div>
                </section>

                {/* Performance Metrics */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <h2 className="text-2xl font-bold">Performance Metrics</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <PerformanceCard
                            label="Net Profit"
                            value="$4,176.71"
                            change="+41.7%"
                            period="Monthly"
                            positive={true}
                        />
                        <PerformanceCard
                            label="Sharpe Ratio"
                            value="4.08"
                            change="Risk-Adjusted"
                            period="Excellent"
                            positive={true}
                        />
                        <PerformanceCard
                            label="Win Rate"
                            value="89.8%"
                            change="472 Trades"
                            period="Executed"
                            positive={true}
                        />
                        <PerformanceCard
                            label="WXT Savings"
                            value="$2,088"
                            change="50% Discount"
                            period="Active"
                            positive={true}
                        />
                    </div>
                </section>

                {/* AI Engine Status */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <h2 className="text-2xl font-bold">AI Engine Status</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">GEMINI Neural Engine</h3>
                                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                    <span className="text-green-400 text-sm font-medium">Active</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <InfoRow label="Model Version" value="gemini-2.5-flash-lite" />
                                <InfoRow label="Average Confidence" value="87.5%" />
                                <InfoRow label="Response Time" value="<1s" />
                                <InfoRow label="Success Rate" value="100%" />
                            </div>
                            <Link
                                href="/ai-tools"
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all"
                            >
                                <Zap className="w-4 h-4" />
                                <span>Generate AI Signal</span>
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Blockchain Integration</h3>
                                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                    <span className="text-green-400 text-sm font-medium">Live</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <InfoRow label="Network" value="Base Sepolia" />
                                <InfoRow label="Contract Status" value="Verified" />
                                <InfoRow label="Gas Optimization" value="Enabled" />
                                <InfoRow label="Batch Submission" value="Active" />
                            </div>
                            <a
                                href="https://sepolia.basescan.org/address/0x0f294e979eF7FdEc5bf0f137658828ee4cD0c3dC"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>View on BaseScan</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-2xl font-bold">Recent Activity</h2>
                    </div>
                    <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
                        <div className="space-y-4 font-mono text-sm">
                            <ActivityLog
                                time="15:42:18"
                                type="AI"
                                message="Signal generated for BTC/USDT - BUY @ $95,432"
                                confidence="92%"
                            />
                            <ActivityLog
                                time="15:42:19"
                                type="RISK"
                                message="WXT discount applied - Fee reduced to 0.03%"
                                confidence="N/A"
                            />
                            <ActivityLog
                                time="15:42:20"
                                type="EXEC"
                                message="Order filled - 0.1 BTC @ $95,432.00"
                                confidence="N/A"
                            />
                            <ActivityLog
                                time="15:42:22"
                                type="PROOF"
                                message="Trade proof submitted to Base Sepolia"
                                confidence="N/A"
                                success={true}
                            />
                            <ActivityLog
                                time="15:42:24"
                                type="CHAIN"
                                message="Transaction confirmed - Hash: 0x7f...3a29"
                                confidence="N/A"
                                success={true}
                            />
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickActionCard
                            title="Generate AI Signal"
                            description="Create a new trading signal using GEMINI AI"
                            href="/ai-tools"
                            icon={<Brain className="w-8 h-8" />}
                            color="purple"
                        />
                        <QuickActionCard
                            title="View Strategies"
                            description="Explore available trading strategies"
                            href="/platform/strategies"
                            icon={<TrendingUp className="w-8 h-8" />}
                            color="green"
                        />
                        <QuickActionCard
                            title="AI Engine Details"
                            description="Learn about the GEMINI neural engine"
                            href="/platform/ai-engine"
                            icon={<Zap className="w-8 h-8" />}
                            color="blue"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sublabel, color, bgColor, borderColor }: any) {
    return (
        <div className={`${bgColor} border ${borderColor} rounded-2xl p-6 hover:scale-105 transition-transform`}>
            <div className={`${color} mb-3`}>{icon}</div>
            <div className="text-gray-400 text-sm mb-2">{label}</div>
            <div className={`text-4xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-gray-500 text-sm">{sublabel}</div>
        </div>
    );
}

function PerformanceCard({ label, value, change, period, positive }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="text-gray-400 text-sm mb-2">{label}</div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            <div className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
                {change}
            </div>
            <div className="text-gray-500 text-xs mt-1">{period}</div>
        </div>
    );
}

function InfoRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{label}</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    );
}

function ActivityLog({ time, type, message, confidence, success }: any) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'AI': return 'text-purple-400';
            case 'RISK': return 'text-yellow-400';
            case 'EXEC': return 'text-blue-400';
            case 'PROOF': return 'text-green-400';
            case 'CHAIN': return 'text-cyan-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg ${success ? 'bg-green-500/5' : 'bg-white/5'} border border-white/10`}>
            <span className="text-gray-500">{time}</span>
            <span className={`${getTypeColor(type)} font-bold w-16`}>[{type}]</span>
            <span className="text-gray-300 flex-1">{message}</span>
            {confidence !== 'N/A' && (
                <span className="text-purple-400 font-bold">{confidence}</span>
            )}
        </div>
    );
}

function QuickActionCard({ title, description, href, icon, color }: any) {
    const colorClasses = {
        purple: 'from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-500',
        green: 'from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-500',
        blue: 'from-blue-900/20 to-cyan-900/20 border-blue-500/30 hover:border-blue-500'
    };

    return (
        <Link
            href={href}
            className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl border p-6 hover:scale-105 transition-all group`}
        >
            <div className="mb-4 text-white group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </Link>
    );
}
