'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold mb-2">System Error</h2>
                <p className="text-gray-400 mb-8">
                    An unexpected error occurred in the WAlphaHunter dashboard. Our team has been notified.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 py-3 px-6 rounded-lg font-medium transition-colors border border-white/10"
                    >
                        <Home className="w-4 h-4" />
                        Return Home
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-6 border-t border-white/10 text-left">
                        <p className="text-xs text-red-400 font-mono break-all">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
