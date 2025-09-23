'use client';

import { Button } from '@/src/components/ui/button';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-brand-600" aria-hidden="true" />
          </div>
        </div>
        
        <div>
          <h1 className="text-6xl font-bold text-neutral-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-neutral-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-neutral-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              Return to Home
            </Button>
          </Link>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}