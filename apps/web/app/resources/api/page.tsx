import { Server } from "lucide-react";

export default function ApiReferencePage() {
    return (
        <div className="bg-black text-white min-h-screen pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">API Reference</h1>
                    <p className="text-gray-400">Endpoints for interacting with the WAlphaHunter Backend Service.</p>
                </div>

                <div className="space-y-12">

                    {/* Endpoint 1 */}
                    <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                        <div className="bg-gray-800 px-6 py-4 flex items-center gap-4">
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold uppercase border border-green-500/30">GET</span>
                            <span className="font-mono text-sm text-gray-300">/v1/market/tickers</span>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-400 mb-4">Retrieves the latest price tickers for all supported pairs on WEEX.</p>
                            <h4 className="font-bold text-sm mb-2 text-gray-500">Response Example</h4>
                            <pre className="bg-black p-4 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto">
                                {`{
  "data": [
    {
      "symbol": "BTC/USDT",
      "price": "95,234.50",
      "volume_24h": "12034.22"
    }
  ],
  "timestamp": 1709234234
}`}
                            </pre>
                        </div>
                    </div>

                    {/* Endpoint 2 */}
                    <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                        <div className="bg-gray-800 px-6 py-4 flex items-center gap-4">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase border border-blue-500/30">POST</span>
                            <span className="font-mono text-sm text-gray-300">/v1/orders/create</span>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-400 mb-4">Places a new algorithmic order. Requires WXT signature.</p>
                            <h4 className="font-bold text-sm mb-2 text-gray-500">Body Parameters</h4>
                            <table className="w-full text-sm text-left mb-6">
                                <thead className="text-gray-500 border-b border-white/10">
                                    <tr><th className="pb-2">Field</th><th className="pb-2">Type</th><th className="pb-2">Description</th></tr>
                                </thead>
                                <tbody className="text-gray-300">
                                    <tr className="border-b border-white/5"><td className="py-2">symbol</td><td>string</td><td>Trading pair (e.g. BTC/USDT)</td></tr>
                                    <tr className="border-b border-white/5"><td className="py-2">side</td><td>enum</td><td>BUY or SELL</td></tr>
                                    <tr className="border-b border-white/5"><td className="py-2">quantity</td><td>float</td><td>Amount to trade</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
