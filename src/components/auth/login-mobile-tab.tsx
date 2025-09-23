"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Smartphone, QrCode } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";
import authAxiosClient from "@/src/app/apis/auth/axios";


export function LoginMobileTab() {
  // QR Code states
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [refreshingQR, setRefreshingQR] = useState(false);

  useEffect(() => {
    if (qrCode) {
      console.log("QR Code set:", qrCode);
    }
  }, [qrCode]);

  // Initialize QR session
  useEffect(() => {
    const initQrSession = async () => {
      try {
        const { data } = await authAxiosClient.post('/auth/qr/generate-session-qr');
        console.log("QR API Response:", data);
        if (data.status) {
          setQrCode(data.data.qrCode);
          console.log("QR Code set:", data.data.qrCode ? "QR Code received" : "No QR Code");
        } else {
          setQrError('Failed to initialize QR session');
        }
      } catch (err) {
        console.error("QR API Error:", err);
        setQrError('Failed to initialize QR session');
      }
    };

    initQrSession();
  }, []);

  const handleRefreshQR = async () => {
    setQrError(null);
    setRefreshingQR(true);
    try {
      const { data } = await authAxiosClient.post('/auth/qr/generate-session-qr');
      if (data.status) {
        setQrCode(data.data.qrCode);
      } else {
        setQrError('Failed to refresh QR code');
      }
    } catch (err) {
      setQrError('Failed to refresh QR code');
    } finally {
      setRefreshingQR(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile Login</h2>
        <p className="text-gray-600 text-sm">Scan this QR code with your mobile device to log in</p>
      </div>

      {/* QR Code Section */}
      <div className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          {refreshingQR ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <p className="text-gray-500 text-sm">Generating QR code...</p>
            </div>
          ) : qrError && !qrCode ? (
            <div className="text-center p-6 bg-red-50 border border-red-200 rounded-2xl max-w-xs">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.alertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 text-sm font-medium mb-4">{qrError}</p>
              <Button
                onClick={handleRefreshQR}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                disabled={refreshingQR}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : qrCode && qrCode.startsWith('data:image') ? (
            <div className="relative">
              <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
                <img
                  src={qrCode}
                  alt="QR Code for Mobile Login"
                  className="w-80 h-80 rounded-lg"
                  onError={(e) => {
                    console.error("QR Image failed to load:", e);
                    setQrError('Failed to load QR code image');
                  }}
                />
              </div>
              {/* Success indicator */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-80 h-80 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <p className="text-gray-500 text-sm">
                {qrCode ? 'Invalid QR code format' : 'Generating QR code...'}
              </p>
              {qrCode && (
                <p className="text-xs text-gray-400 mt-2 max-w-xs text-center">
                  Debug: {qrCode.substring(0, 50)}...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">How to use:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Open your mobile app</p>
            <p>2. Go to the QR scanner</p>
            <p>3. Point your camera at this code</p>
            <p>4. Complete login on your mobile device</p>
          </div>
        </div>

        {/* QR Actions */}
        <div className="space-y-3 p-4">
          <Button
            onClick={handleRefreshQR}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-blue-300 bg-blue-50 text-gray-700 text-blue-700 transition-all duration-200"
            disabled={refreshingQR}
          >
            {refreshingQR ? (
              <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {refreshingQR ? "Refreshing..." : "Refresh QR Code"}
          </Button>

        </div>
      </div>
    </div>
  );
} 