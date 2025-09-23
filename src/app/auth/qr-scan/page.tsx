"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getClientCookie } from "@/src/core/config/localStorage";
import { Button } from "@/src/components/ui/button";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { FF_DYNAMIC_CHARTS } from "@/src/lib/flags";

// Dynamic import for QR scanner to reduce initial bundle size
const QrScanner = dynamic(
  () => import("@/src/components/auth/qr-scanner").then(mod => ({ default: mod.QrScanner })),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading camera...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

export default function QrScanPage() {
  const token = getClientCookie("accessToken");
  const router = useRouter();
  const { showSuccess, showError } = useNotificationUtils();
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResult = async (text: string) => {
    if (!token) return;
    try {
      const url = new URL(text);
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) {
        showError('Invalid QR Code', "Invalid QR code");
        return;
      }
      setVerifying(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_USER_BASE_URL}/auth/qr/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.status) {
        showSuccess('Login Verified', "Desktop login verified");
        setSuccess(true);
      } else {
        showError('Verification Failed', data.message || "Failed to verify QR code");
      }
    } catch (err) {
      showError('Verification Failed', "Failed to verify QR code");
    } finally {
      setVerifying(false);
    }
  };

  if (!token) {
    return <div className="p-8 text-center">You need to be logged in on mobile to scan the QR code.</div>;
  }

  if (success) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Verified!</h2>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <QrScanner onResult={handleResult} />
      </div>
      {verifying && <p>Verifying...</p>}
      <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
    </div>
  );
}

