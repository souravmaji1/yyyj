"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store';
import {
  initiatePhoneVerification,
  verifyPhoneCode,
  resendPhoneVerification,
  clearPhoneVerification,
} from '@/src/store/slices/phoneVerificationSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Icons } from '@/src/core/icons';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phoneNumberUser: string;
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  phoneNumberUser,
}: PhoneVerificationModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotificationUtils();

  const {
    sessionId,
    isVerifying,
    isVerified,
    loading,
    error,
    resendLoading,
    resendError,
  } = useSelector((state: RootState) => state.phoneVerification);

  const [phoneNumber, setPhoneNumber] = useState(phoneNumberUser);
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Clear verification state when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearPhoneVerification());
      setVerificationCode('');
      setCountdown(0);
    }
  }, [isOpen, dispatch]);

  // Remove the success handling useEffect that was causing issues

  const handleInitiateVerification = async () => {
    if (!phoneNumber.trim()) {
      showError('Validation Error', 'Please enter a phone number');
      return;
    }

    try {
      await dispatch(initiatePhoneVerification(phoneNumber.trim())).unwrap();
      showSuccess('Verification Initiated', 'Verification code sent to your phone');
      setCountdown(60); // 60 seconds countdown
    } catch (error: any) {
      showError('Verification Error', error || 'Failed to send verification code');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || !sessionId) {
      showError('Validation Error', 'Please enter the verification code');
      return;
    }

    try {
      const result = await dispatch(verifyPhoneCode({
        sessionId,
        verificationCode: verificationCode.trim(),
      })).unwrap();

      // Handle success directly here
      showSuccess('Phone Verification', 'Phone number verified successfully!');
      onSuccess(); // Call onSuccess prop
      onClose(); // Close the modal
    } catch (error: any) {
      // Handle error directly here
      showError('Verification Failed', error || 'Invalid verification code');
    }
  };

  const handleResendCode = async () => {
    if (!sessionId) {
      showError('Error', 'No active verification session');
      return;
    }

    try {
      await dispatch(resendPhoneVerification(sessionId)).unwrap();
      showSuccess('Code Resent', 'New verification code sent to your phone');
      setCountdown(60); // Reset countdown
    } catch (error: any) {
      showError('Resend Error', error || 'Failed to resend verification code');
    }
  };

  const handleClose = () => {
    dispatch(clearPhoneVerification());
    onClose();
  };

  useEffect(() => {
    setPhoneNumber(phoneNumberUser);
  }, [phoneNumberUser])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[var(--color-surface)]/90 border-[#667085]/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Icons.phone className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
            Phone Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Show phone number being verified */}
          <div className="text-center">
            <p className="text-gray-300 text-sm">Verifying phone number:</p>
            <p className="text-white font-semibold">{phoneNumber}</p>
          </div>

          {/* OTP Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationCode" className="text-gray-300 text-sm font-medium">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-[var(--color-panel)] border-[#667085]/30 text-white mt-1 focus:border-[var(--color-primary)] text-center text-lg tracking-widest"
                placeholder="123456"
                maxLength={6}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleVerifyCode}
                disabled={loading || !verificationCode.trim() || verificationCode.length !== 6}
                className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90"
              >
                {loading && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>

            <div className="text-center">
              <Button
                onClick={handleResendCode}
                disabled={resendLoading || countdown > 0}
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-white"
              >
                {resendLoading && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 