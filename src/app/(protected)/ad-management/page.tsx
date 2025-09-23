"use client";
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdManagement from '@/src/components/ad-management/AdManagement';

export default function AdManagementPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if machine_id is in URL params (from QR code scan)
    const machineId = searchParams?.get('machine_id');
    console.log('🔍 AdManagement page - machine_id from URL:', machineId);
    
    if (machineId) {
      console.log('✅ Machine ID detected in URL:', machineId);
      // Machine ID saving is handled by ClientAuthCheck in the layout
      // This page only needs to log the detection for debugging
    } else {
      console.log('ℹ️ No machine_id found in URL params');
    }
  }, [searchParams]);

  // Authentication is handled by ClientAuthCheck in the layout
  // This page only focuses on its business logic
  return <AdManagement />;
} 