'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { log } from '@/src/lib/log';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical global errors
    log.error('global_error', {
      message: error.message,
      digest: error.digest,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center border-2 border-red-200">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Critical Error
              </h1>
              <p className="text-gray-600 mb-6">
                A critical error occurred and the application needs to be restarted.
                Our team has been automatically notified.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Restart the application"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Restart Application
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                aria-label="Return to home page"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}