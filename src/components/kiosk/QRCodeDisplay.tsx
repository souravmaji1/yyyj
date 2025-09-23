"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Download, Share2, QrCode } from 'lucide-react';
import { useNotification } from '@/src/contexts/NotificationContext';
import { AppDispatch, RootState } from '@/src/store';
import { generateMachineQRCode } from '@/src/store/slices/adManagementSlice';

interface QRCodeDisplayProps {
  machineId?: string;
  onMachineIdChange?: (machineId: string) => void;
}

export default function QRCodeDisplay({ machineId: initialMachineId, onMachineIdChange }: QRCodeDisplayProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { qrCodeData, qrCodeLoading, qrCodeError } = useSelector((state: RootState) => state.adManagement);

  const [machineId, setMachineId] = useState(initialMachineId || '');
  const [error, setError] = useState<string>('');
  const { showNotification } = useNotification();

  useEffect(() => {
    if (machineId) {
      generateQRCode();
    }
  }, [machineId]);

  // Handle Redux errors
  useEffect(() => {
    if (qrCodeError) {
      setError(qrCodeError);
    }
  }, [qrCodeError]);

  const generateQRCode = async () => {
    if (!machineId.trim()) {
      setError('Please enter a machine ID');
      return;
    }

    setError('');

    try {
      // Generate the redirect URL for the ad management page with machine filtering
      const redirectUrl = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || window.location.origin}/ad-management?machine_id=${encodeURIComponent(machineId.trim())}`;
      console.log('🔗 Generated QR redirect URL:', redirectUrl);
      console.log('🌐 Environment variable NEXT_PUBLIC_FRONTEND_BASE_URL:', process.env.NEXT_PUBLIC_FRONTEND_BASE_URL);
      console.log('🏠 Window origin:', window.location.origin);

      // Use Redux to call backend API
      await dispatch(generateMachineQRCode(machineId.trim()));

      if (onMachineIdChange) {
        onMachineIdChange(machineId.trim());
      }
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('Error generating QR code:', err);
    }
  };

  const handleDownload = () => {
    if (qrCodeData?.qrCode) {
      const link = document.createElement('a');
      link.href = qrCodeData.qrCode;
      link.download = `qr-code-${machineId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification({
        type: "success",
        title: "Downloaded",
        message: "QR code downloaded successfully!",
      });
    }
  };

  const handleShare = async () => {
    if (qrCodeData?.qrCode && navigator.share) {
      try {
        const redirectUrl = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || window.location.origin}/ad-management?machine_id=${encodeURIComponent(machineId.trim())}`;
        await navigator.share({
          title: `QR Code for Machine ${machineId}`,
          text: `Scan this QR code to access ad management for machine ${machineId}`,
          url: redirectUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const redirectUrl = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || window.location.origin}/ad-management?machine_id=${encodeURIComponent(machineId.trim())}`;
      await navigator.clipboard.writeText(redirectUrl);

      showNotification({
        type: "success",
        title: "Copied",
        message: "Machine URL copied to clipboard!",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-[var(--color-bg)] border-slate-700/50">
        <CardContent className="space-y-6 pt-6">
          {/* QR Code Display */}
          {qrCodeData?.qrCode && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  QR Code for Machine: {machineId}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Scan this branded QR code from your mobile device to access ad management for this machine
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
                  Intelliverse Branded QR Code
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <img
                    src={qrCodeData.qrCode}
                    alt={`QR Code for Machine ${machineId}`}
                    className="w-64 h-64"
                  />
                </div>
              </div>


            </div>
          )}

          {/* Loading State */}
          {qrCodeLoading && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-gray-400 mb-2">
                Generating branded QR code for machine: {machineId}
              </p>
              <p className="text-xs text-[var(--color-primary)]">
                Creating custom Intelliverse branded QR code...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl">!</span>
              </div>
              <p className="text-red-400">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

