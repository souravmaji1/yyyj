'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg mb-2">Redirecting...</div>
        <div className="text-sm text-gray-400">
          Chat functionality has moved to our AI Assistant
        </div>
      </div>
    </div>
  );
}
