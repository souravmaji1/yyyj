"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamically import to avoid SSR issues
const QrReader = dynamic(() => import("react-qr-scanner").then(mod => mod?.default), { 
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
      <p className="text-center text-gray-500">Loading QR scanner...</p>
    </div>
  )
});

interface QrScannerProps {
  onResult: (text: string) => void;
  onError?: (err: Error) => void;
}

export function QrScanner({ onResult, onError }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isQrReaderLoaded, setIsQrReaderLoaded] = useState(false);

  useEffect(() => {
    // Check if camera access is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment"
        } 
      })
        .then(() => {
          setIsCameraReady(true);
          setIsQrReaderLoaded(true);
        })
        .catch((err) => {
          setError("Camera access denied. Please allow camera access to scan QR codes.");
          if (onError) onError(err);
        });
    } else {
      setError("Camera not available on this device");
    }
  }, [onError]);

  if (!isCameraReady || !isQrReaderLoaded) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        <p className="text-center text-gray-500">Initializing camera...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-square bg-gray-100">
        {isQrReaderLoaded && (
          <QrReader
            delay={300}
            constraints={{
              video: { 
                facingMode: "environment"
              }
            }}
            onScan={(result) => {
              if (result?.text) {
                // Prevent duplicate scans
                if (result.text !== lastScanned) {
                  setLastScanned(result.text);
                  console.log("QR Code detected:", result.text);
                  onResult(result.text);
                }
              }
            }}
            onError={(err) => {
              const errorMessage = err.message || "QR scanner error";
              console.error("QR Scanner error:", err);
              setError(errorMessage);
              if (onError) onError(err);
            }}
            style={{ 
              width: "100%", 
              height: "100%",
              objectFit: "cover"
            }}
          />
        )}
        {/* Scanner overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-dashed border-blue-500 m-8 rounded-lg"></div>
          <div className="absolute top-4 left-4 right-4 text-center text-white bg-black/50 p-2 rounded">
            Position QR code within the frame
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-center text-red-500 text-sm">{error}</p>
          <p className="text-center text-red-400 text-xs mt-2">
            Make sure you have granted camera permissions and are using a supported browser
          </p>
        </div>
      )}
    </div>
  );
}
