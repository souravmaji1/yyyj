"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Icons } from "@/src/core/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { createKyc, clearKyc } from '@/src/store/slices/kycSlice';
import { useRouter } from "next/navigation";
import { Loader2, QrCode } from "lucide-react";

interface KYCModalProps {
  open: boolean;
  onClose: () => void;
}

export function KYCModal({ open, onClose }: KYCModalProps) {

  const router = useRouter()
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user.profile?.id);
  const { kycData, loading, error } = useAppSelector((state) => state.kyc);

  // Auto-trigger createKyc API when modal opens
  useEffect(() => {
    if (open && userId && !kycData && !loading) {
      dispatch(createKyc(userId));
    }
  }, [open, userId, dispatch, kycData, loading]);

  // Reset KYC state when modal closes
  useEffect(() => {
    if (!open) {
      dispatch(clearKyc());
    }
  }, [open, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[var(--color-bg)]"
       onPointerDownOutside={(e) => e.preventDefault()}
       onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            KYC Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-gray-400 text-center leading-relaxed">
            {loading ? "Creating your KYC verification..." : "Scan this QR code or follow the link below to complete the next steps of your verification."}
          </p>
          
          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-500/10 rounded-lg">
              Error: {error}
            </div>
          )}

          {/* QR Code Display */}
          <div className="flex justify-center p-6 rounded-xl shadow-inner">
            {loading ? (
              <div style={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            ) : kycData?.qrCode ? (
              <img src={kycData.qrCode} alt="QR Code" style={{ width: 240, height: 240 }} />
            ) : !loading && !error ? (
              <div className="text-gray-400 text-center">No QR code available</div>
            ) : null}
          </div>

          {/* Verification URL */}
          {kycData?.verificationUrl && (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-400">
                Or open verification link
              </p>
              <Button
                onClick={() => window.open(kycData.verificationUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Open Verification Page
              </Button>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
