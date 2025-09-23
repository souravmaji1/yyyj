'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthState } from '@/src/hooks/useAuthState';
import { getRawCookie } from '@/src/core/config/localStorage';

interface ClientAuthCheckProps {
  children: React.ReactNode;
}

export function ClientAuthCheck({ children }: ClientAuthCheckProps) {
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isProcessingMachineId, setIsProcessingMachineId] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, token } = useAuthState();

  // Check if we have machine_id parameter that needs to be processed
  const hasMachineId = searchParams?.get('machine_id');

  // Function to save machine ID to localStorage
  const saveMachineIdToStorage = (machineId: string) => {
    try {
      console.log('🔍 ClientAuthCheck: Saving machine_id to localStorage:', machineId);
      
      // Clean the machine ID first (remove any URL path contamination)
      if (!machineId) {
        console.error('❌ ClientAuthCheck: No machine_id provided');
        return false;
      }
      
      const slashIndex = machineId.indexOf('/');
      const cleanMachineId = slashIndex >= 0 ? machineId.slice(0, slashIndex) : machineId;
      
      if (cleanMachineId) {
        // Store machine_id in localStorage
        localStorage.setItem('machine_id', cleanMachineId);
        
        // Also store in sessionStorage as backup
        sessionStorage.setItem('kioskMachineId', cleanMachineId);
      }
      
      // Verify the save was successful
      const savedMachineId = localStorage.getItem('machine_id');
      const savedSessionId = sessionStorage.getItem('kioskMachineId');
      
      if (savedMachineId === cleanMachineId && savedSessionId === cleanMachineId) {
        console.log('✅ ClientAuthCheck: Machine ID successfully saved to both storages:', cleanMachineId);
        return true;
      } else {
        console.error('❌ ClientAuthCheck: Failed to save machine_id to storage');
        return false;
      }
    } catch (error) {
      console.error('❌ ClientAuthCheck: Error saving machine_id to storage:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('ClientAuthCheck - Path:', pathname);
    console.log('ClientAuthCheck - Loading:', isLoading);
    console.log('ClientAuthCheck - Authenticated:', isAuthenticated);
    console.log('ClientAuthCheck - Token exists:', !!token);
    console.log('ClientAuthCheck - Has redirected:', hasRedirected);
    console.log('ClientAuthCheck - Has machine_id:', hasMachineId);
    console.log('ClientAuthCheck - Is processing machine_id:', isProcessingMachineId);
    
    // Additional debugging
    const rawCookie = getRawCookie('accessToken');
    console.log('ClientAuthCheck - Raw cookie value:', rawCookie);
    console.log('ClientAuthCheck - All cookies:', document.cookie);
  }, [pathname, isLoading, isAuthenticated, token, hasRedirected, hasMachineId, isProcessingMachineId]);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) {
      return;
    }

    // If we have a machine_id parameter and user is not authenticated,
    // save the machine_id to localStorage FIRST, then redirect
    if (!isLoading && !isAuthenticated && hasMachineId && !isProcessingMachineId) {
      console.log('ClientAuthCheck - Not authenticated with machine_id, saving to localStorage first...');
      
      setIsProcessingMachineId(true);
      
      // Save machine ID to localStorage immediately
      const saveSuccess = saveMachineIdToStorage(hasMachineId);
      
      if (saveSuccess) {
        // Give a small delay to ensure storage operations complete, then redirect
        setTimeout(() => {
          console.log('ClientAuthCheck - Machine ID saved successfully, now redirecting to login');
          setHasRedirected(true);
          router.replace('/auth?mode=login');
        }, 200); // 200ms delay to ensure storage operations complete
      } else {
        // Even if save fails, still redirect (but log the issue)
        console.error('ClientAuthCheck - Machine ID save failed, redirecting anyway');
        setHasRedirected(true);
        router.replace('/auth?mode=login');
      }
      
      return;
    }

    // REMOVED: Aggressive redirect for authenticated users
    // This was causing redirect loops with social login
    // Users can now stay on any page without forced redirects
    
    // Only redirect if user is completely unauthenticated AND trying to access protected content
    if (!isLoading && !isAuthenticated && !hasMachineId && pathname !== '/auth') {
      console.log('ClientAuthCheck - Not authenticated on protected route, redirecting to login');
      setHasRedirected(true);
      router.replace('/auth?mode=login');
    }
  }, [isAuthenticated, isLoading, hasRedirected, hasMachineId, isProcessingMachineId, router, pathname]);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    setHasRedirected(false);
    setIsProcessingMachineId(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show loading while processing machine_id
  if (!isAuthenticated && hasMachineId && isProcessingMachineId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-white text-lg">Saving Machine ID...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we save your machine information to local storage</p>
          <div className="mt-4 text-xs text-blue-300 bg-blue-900/20 p-3 rounded-lg">
            <p>Machine ID: <strong>{hasMachineId}</strong></p>
            <p>Status: Saving to localStorage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
} 