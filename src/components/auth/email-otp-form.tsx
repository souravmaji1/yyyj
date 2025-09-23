"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Icons } from "@/src/core/icons";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { useRouter, useSearchParams } from "next/navigation";
import authAxiosClient from "@/src/app/apis/auth/axios";
import { isKioskInterface } from "@/src/core/utils";
import { io } from "socket.io-client";

interface EmailOTPFormProps {
  isLoading: boolean;
  onSubmit: (event: React.SyntheticEvent) => void;
  onBack: () => void;
}

export function EmailOTPForm({ isLoading, onSubmit, onBack }: EmailOTPFormProps) {
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");
  const { signup } = useAuth();
  const { showSuccess, showError } = useNotificationUtils();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateOtp = (otp: string) => {
    if (!otp) return "Please enter the OTP";
    if (otp.length !== 6) return "OTP must be 6 digits";
    if (!/^\d+$/.test(otp)) return "OTP must contain only numbers";
    return "";
  };

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    if (otpError) setOtpError("");
    if (hasError) setHasError(false);
  };

  const handleOtpBlur = (value: string) => {
    if (value.trim()) {
      setOtpError(validateOtp(value));
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      setIsResending(true);
      const user = JSON.parse(localStorage.getItem("pendingSignupUser") || "{}");
      const response = await authAxiosClient.post(
        "/auth/resend-email-verification",
        { email: user.email }
      );
      if (response.data.status) {
        showSuccess('OTP Resent', response.data.message || "A new OTP has been sent to your email.");
        setCountdown(60); // 60 second timer
      }
    } catch (error: any) {
      showError('Resend Failed', error || error?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const otpValidation = validateOtp(otpValue);
    if (otpValidation) {
      setOtpError(otpValidation);
      setHasError(true);
      return;
    }
    setIsVerifying(true);
    try {
      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem("pendingSignupUser") || "{}");
      // Get OTP from state
      const otp = otpValue;
      // Call signup with all info + otp
      const result = await signup({
        ...user,
        password: user.password, // if you store it, or ask user to re-enter
        otp,
      });
      if (result) {
        console.log('🎉 Signup successful, result:', result);
        showSuccess("Signup Complete", "Your email has been verified and your account is now active.");
        localStorage.removeItem("pendingSignupUser");
        
        // 🚀 EMIT KIOSK SIGNUP SUCCESS EVENT TO DESKTOP
        if (sessionId && isKioskInterface()) {
          console.log('🚀 Starting kiosk signup completion notification from EmailOTPForm');
          console.log('📋 Session ID:', sessionId);
          console.log('🔧 Kiosk interface detected:', isKioskInterface());
          
          try {
            const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
            console.log('🔌 Connecting to WebSocket:', wsUrl);
            
            const socket = io(wsUrl, {
              path: '/api/user/socket.io',
              transports: ['websocket', 'polling'],
              reconnection: false,
              timeout: 5000,
              autoConnect: true,
              withCredentials: true,
              query: { sessionId },
            });

            socket.on('connect', () => {
              console.log('✅ Mobile connected to notify desktop of kiosk signup success');
              socket.emit('joinQrSession', sessionId);
              console.log('📡 Mobile joined QR session:', sessionId);
              
              // Emit kiosk signup completion event
              const eventData = {
                sessionId,
                userId: result?.id || result?.userId || 'unknown',
                message: 'Mobile signup successful',
                timestamp: new Date().toISOString(),
                machineId: user.macAddress || 'unknown'
              };
              
              console.log('📤 Emitting kiosk:signup:completed event:', eventData);
              socket.emit('kiosk:signup:completed', eventData);
              
              console.log('✅ Kiosk signup success event emitted to desktop');
              setTimeout(() => {
                console.log('🔌 Disconnecting mobile socket');
                socket.disconnect();
              }, 1000);
            });
            
            socket.on('disconnect', () => {
              console.log('❌ Mobile socket disconnected');
            });
            
            socket.on('error', (error) => {
              console.error('❌ Mobile socket error:', error);
            });
            
          } catch (socketError) {
            console.error('❌ Failed to notify desktop:', socketError);
          }
        } else {
          console.log('⚠️ Not emitting kiosk event - conditions not met:');
          console.log('  - Session ID:', sessionId);
          console.log('  - Is Kiosk Interface:', isKioskInterface());
        }
        
        // Dispatch custom event to close QR modal if open
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('close-qr-modal'));
        }
        if (!isKioskInterface()) {
          router.push('/address-setup?redirect=kyc')
        } else {
          router.push('/')
        }
      } else {
        setOtpValue(""); // Clear OTP field on error
        setHasError(true);
      }
    } catch (error: any) {
      // Show the exact error message from the API if available
      let errorMessage = "Something went wrong";
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (error.response.data.error) {
          errorMessage += ` (${error.response.data.error})`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setOtpValue(""); // Clear OTP field on error
      setOtpError(errorMessage); // Highlight OTP field on error
      setHasError(true);
      showError("Verification Failed", errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            OTP Verification
          </h1>
          <p className="text-base text-gray-600">
            Please enter the OTP sent to your email
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-gray-700 font-medium block text-left">
              OTP <span className="text-red-500">*</span>
            </label>
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={handleOtpChange}
              onBlur={() => handleOtpBlur(otpValue)}
              className="gap-3"
            >
              <InputOTPGroup>
                {[0,1,2,3,4,5].map((idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx}
                    className={`w-12 h-12 text-lg font-semibold border-2 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
                    inputMode="numeric"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {otpError && <p className="text-red-500 text-sm mt-1 text-left w-full">{otpError}</p>}
            <div className="flex items-center justify-between mt-3">
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isResending}
                className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] p-0 h-auto text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  "Sending..."
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          disabled={isLoading || isVerifying}
        >
          {(isLoading || isVerifying) && <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />}
          Verify OTP
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-2 rounded-xl font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          onClick={onBack}
          disabled={isLoading || isVerifying}
        >
          Back
        </Button>
      </form>
    </div>
  );
}