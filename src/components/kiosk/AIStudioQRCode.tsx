"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Download, Share2, QrCode, Smartphone } from 'lucide-react';
import { useNotification } from '@/src/contexts/NotificationContext';
import { getKioskMacFromLocalStorage } from '@/src/core/utils';

interface AIStudioQRCodeProps {
  machineId?: string;
}

export default function AIStudioQRCode({ machineId: propMachineId }: AIStudioQRCodeProps) {
  const [machineId, setMachineId] = useState(propMachineId || '');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const { showNotification } = useNotification();

  // Get machine ID from props or localStorage
  useEffect(() => {
    if (propMachineId) {
      setMachineId(propMachineId);
    } else {
      const storedMachineId = getKioskMacFromLocalStorage();
      if (storedMachineId) {
        setMachineId(storedMachineId);
      }
    }
  }, [propMachineId]);

  // Generate QR code when machine ID is available
  useEffect(() => {
    if (machineId) {
      generateAIStudioQRCode();
    }
  }, [machineId]);

  const generateAIStudioQRCode = async () => {
    if (!machineId.trim()) {
      setError('Machine ID not available');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Generate the redirect URL for AI Studio in kiosk mode
      const baseUrl = process.env.NEXT_PUBLIC_KIOSK_BASE_URL || 'https://kiosk.intelliverse-x.ai';
      const redirectUrl = `${baseUrl}/ai-studio?machine_id=${encodeURIComponent(machineId.trim())}`;

      console.log('🔗 Generated AI Studio QR redirect URL:', redirectUrl);
      console.log('🌐 Kiosk base URL:', baseUrl);

      // For now, we'll create a simple QR code using a service
      // In production, you might want to use a proper QR code generation library
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(redirectUrl)}`;

      setQrCodeData(qrCodeUrl);

      showNotification({
        type: "success",
        title: "QR Code Generated",
        message: "AI Studio QR code generated successfully!",
      });
    } catch (err) {
      setError('Failed to generate AI Studio QR code');
      console.error('Error generating AI Studio QR code:', err);

      showNotification({
        type: "error",
        title: "QR Generation Failed",
        message: "Failed to generate AI Studio QR code. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeData) {
      const link = document.createElement('a');
      link.href = qrCodeData;
      link.download = `ai-studio-qr-${machineId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification({
        type: "success",
        title: "Downloaded",
        message: "AI Studio QR code downloaded successfully!",
      });
    }
  };

  const handleShare = async () => {
    if (qrCodeData && navigator.share) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_KIOSK_BASE_URL || 'https://kiosk.intelliverse-x.ai';
        const redirectUrl = `${baseUrl}/ai-studio?machine_id=${encodeURIComponent(machineId.trim())}`;

        await navigator.share({
          title: `AI Studio QR Code - Machine ${machineId}`,
          text: `Scan this QR code to access AI Studio features and create kiosk ads for machine ${machineId}`,
          url: redirectUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to clipboard copy
        await handleCopyToClipboard();
      }
    } else {
      // Fallback: copy to clipboard
      await handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_KIOSK_BASE_URL || 'https://kiosk.intelliverse-x.ai';
      const redirectUrl = `${baseUrl}/ai-studio?machine_id=${encodeURIComponent(machineId.trim())}`;

      await navigator.clipboard.writeText(redirectUrl);

      showNotification({
        type: "success",
        title: "Copied to Clipboard",
        message: "AI Studio URL copied to clipboard!",
      });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      showNotification({
        type: "error",
        title: "Copy Failed",
        message: "Failed to copy URL to clipboard.",
      });
    }
  };

  const handleRefreshQR = () => {
    generateAIStudioQRCode();
  };

  if (!machineId) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-[var(--color-bg)] border-slate-700/50">
          <CardContent className="space-y-6 pt-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-400 mb-2">
                Machine ID not available
              </p>
              <p className="text-sm text-gray-500">
                Please ensure you're accessing this from a kiosk machine
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-[var(--color-bg)] border-slate-700/50">
        <CardContent className="space-y-6 pt-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              AI Studio Access
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Scan this QR code from your mobile device to access AI Studio features and create kiosk advertisements
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
              Machine: {machineId}
            </div>
          </div>

          {/* QR Code Display */}
          {qrCodeData && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg">
                  <img
                    src={qrCodeData}
                    alt={`AI Studio QR Code for Machine ${machineId}`}
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleRefreshQR}
                  variant="outline"
                  className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-gray-400 mb-2">
                Generating AI Studio QR code...
              </p>
              <p className="text-sm text-gray-500">
                Please wait while we create your QR code
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <div className="text-red-500 text-2xl">⚠️</div>
              </div>
              <p className="text-red-400 mb-2">
                {error}
              </p>
              <Button
                onClick={handleRefreshQR}
                variant="outline"
                className="mt-2 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg p-4">
            <h4 className="font-semibold text-[var(--color-primary)] mb-2">How to Use:</h4>
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. Open your mobile device's camera app</li>
              <li>2. Point it at the QR code above</li>
              <li>3. Tap the notification to open AI Studio</li>
              <li>4. Generate images/videos and submit as kiosk ads</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
