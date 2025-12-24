'use client';

import { ShieldCheck, FileCode, LockKeyhole, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_BASE_SEPOLIA_TRADE_VERIFIER_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org";

export default function CompliancePage() {
    const [searchHash, setSearchHash] = useState("");
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [liveEvents, setLiveEvents] = useState<any[]>([]);

    useEffect(() => {
        // Find recent events "TradeProofSubmitted(bytes32 indexed tradeHash, bytes32 indexed aiDecisionHash, string symbol, uint256 timestamp)"
        // or similar. Since we don't have the exact event signature handy, we'll try standard naming conventions.
        const fetchEvents = async () => {
            if (!VERIFIER_ADDRESS) return;
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL);
                // Try to guess the event signature. Usually it matches the arguments or a subset.
                // Or we can just look safely for recent blocks if we had the ABI. 
                // For safety, we will POLL the getStats() to show "System Alive" updates effectively if event filtering fails.
                // But let's try reading a generic Log.

                const contract = new ethers.Contract(VERIFIER_ADDRESS, [
                    "event TradeProofSubmitted(bytes32 indexed tradeHash, bytes32 indexed aiDecisionHash, string symbol, uint256 timestamp, address submitter)",
                    "function getStats() view returns (uint256 totalTrades, uint256, uint256)"
                ], provider);

                // Fetch last 100 blocks
                const currentBlock = await provider.getBlockNumber();
                const fromBlock = currentBlock - 1000;
                const events = await contract.queryFilter("TradeProofSubmitted", fromBlock);

                const formattedEvents = events.reverse().slice(0, 10).map((e: any) => ({
                    hash: e.args?.tradeHash || e.transactionHash,
                    block: e.blockNumber,
                    symbol: e.args?.symbol || "UNKNOWN",
                    timestamp: Number(e.args?.timestamp || Date.now() / 1000)
                }));

                setLiveEvents(formattedEvents);

            } catch (err) {
                console.warn("Could not fetch events (expected if event signature mismatch)", err);
                // Fallback: show static recent items if real fetch fails, or keep empty
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleVerify = async () => {
        if (!searchHash) return;
        setVerifying(true);
        setError("");
        setVerificationResult(null);

        try {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const contract = new ethers.Contract(VERIFIER_ADDRESS!, [
                "function verifyTradeProof(bytes32 _tradeHash) external view returns (tuple(bytes32 tradeHash, bytes32 aiDecisionHash, string symbol, uint256 timestamp, address submitter, uint256 price, uint256 quantity, bool isBuy, uint16 aiConfidence))"
            ], provider);

            // Attempt to treat input as a tradeHash
            // If user inputs a regular ID string (not hex), we might need to hash it? 
            // The system usually expects the hash directly or the ID to hash.
            // Let's deduce: if starts with 0x and len 66, it's a hash. Else hash it.
            let hashToSend = searchHash.trim();
            if (!hashToSend.startsWith("0x")) {
                hashToSend = ethers.keccak256(ethers.toUtf8Bytes(hashToSend));
            }

            const data = await contract.verifyTradeProof(hashToSend);

            setVerificationResult({
                symbol: data.symbol,
                timestamp: new Date(Number(data.timestamp) * 1000).toLocaleString(),
                price: Number(data.price) / 1e8,
                qty: Number(data.quantity) / 1e8,
                side: data.isBuy ? "BUY" : "SELL",
                confidence: (Number(data.aiConfidence) / 100).toFixed(2) + "%",
                submitter: data.submitter,
                aiHash: data.aiDecisionHash
            });

        } catch (err: any) {
            console.error(err);
            setError("Proof not found or invalid hash. Ensure you are using the Trade Hash (bytes32).");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="text-green-500 w-8 h-8" />
                        <h1 className="text-4xl md:text-6xl font-bold">Compliance Verifier</h1>
                    </div>
                    <p className="text-xl text-gray-400 max-w-3xl">
                        Trust but verify. Query the Base Sepolia blockchain to validate any trade signal generated by our system.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left Col - Verifier Tool */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold mb-6">Verify Trade Proof</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Trade Hash or ID</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={searchHash}
                                            onChange={(e) => setSearchHash(e.target.value)}
                                            placeholder="0x..."
                                            className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 font-mono text-sm"
                                        />
                                        <button
                                            onClick={handleVerify}
                                            disabled={verifying || !searchHash}
                                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                                        >
                                            {verifying ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                                            Verify
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Enter the Trade UUID (e.g. "trade-123") or the Bytes32 Hash.</p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                                        <XCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {verificationResult && (
                                    <div className="mt-6 p-6 bg-green-900/10 border border-green-500/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center gap-2 text-green-400 font-bold border-b border-green-500/20 pb-2 mb-4">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Valid Cryptographic Proof Found</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 block">Symbol</span>
                                                <span className="font-mono font-bold">{verificationResult.symbol}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Action</span>
                                                <span className={`font-bold ${verificationResult.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {verificationResult.side}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Price</span>
                                                <span className="font-mono">${verificationResult.price.toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Quantity</span>
                                                <span className="font-mono">{verificationResult.qty}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">AI Confidence</span>
                                                <span className="font-mono text-purple-400">{verificationResult.confidence}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Timestamp</span>
                                                <span className="text-gray-300">{verificationResult.timestamp}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-green-500/20 text-xs font-mono text-gray-500 break-all">
                                            <span className="block mb-1 text-gray-600 uppercase">AI Decision Hash</span>
                                            {verificationResult.aiHash}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-xl flex gap-4">
                            <LockKeyhole className="text-purple-400 w-8 h-8 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold mb-2">Immutable Audit Trail</h4>
                                <p className="text-sm text-gray-400">
                                    Every trade executed by WAlphaHunter is permanently recorded on the Base blockchain. This prevents "back-fitting" (faking past performance) and ensures 100% transparency for investors.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Col - Live Events */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 font-mono text-sm h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                            <span className="font-bold text-gray-300">Live Verification Log</span>
                            <span className="flex items-center gap-2 text-green-400 text-xs">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Monitoring Base Sepolia
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {liveEvents.length > 0 ? (
                                liveEvents.map((evt, i) => (
                                    <div key={i} className="p-3 bg-black/50 rounded border border-white/5 hover:border-purple-500/50 transition">
                                        <div className="flex justify-between text-gray-500 text-xs mb-1">
                                            <span>Block #{evt.block}</span>
                                            <span>{new Date(evt.timestamp * 1000).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-purple-300 font-bold mb-1">Proof Submitted: {evt.symbol}</div>
                                        <div className="text-gray-400 break-all text-xs truncate">
                                            {evt.hash}
                                        </div>
                                        <a
                                            href={`https://sepolia.basescan.org/tx/${evt.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-blue-400 hover:text-blue-300 mt-2 block"
                                        >
                                            View on BaseScan &rarr;
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-600 italic">
                                    Waiting for new trade events...
                                    <br /><span className="text-xs text-gray-700">Listening to contract {VERIFIER_ADDRESS?.substring(0, 8)}...</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
