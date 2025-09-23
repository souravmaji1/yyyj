"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/src/components/ui/input-otp";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getLocalData, removeLocalItem } from "@/src/core/config/localStorage";
import { Eye, EyeOff } from "lucide-react";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import authAxiosClient from "@/src/app/apis/auth/axios";

interface NewPasswordFormProps {
  isLoading?: boolean;
  onSubmit?: () => void;
  onBack?: () => void;
}

export function NewPasswordForm({
  isLoading,
  onSubmit,
  onBack,
}: NewPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useNotificationUtils();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    code: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const storedEmail = getLocalData("resetPasswordEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push("/auth?mode=forgot-password");
    }
  }, [router]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      setIsResending(true);
      const response = await authAxiosClient.post(
        `/auth/forgot-password`,
        { email }
      );

      if (response.data.status) {
        showSuccess('OTP Resent', "A new OTP sent successfully on registered Email");
        setCountdown(60); // Start 60 second countdown
      } else {
        showError('Resend Failed', response.data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      showError('Resend Failed', error);
    } finally {
      setIsResending(false);
    }
  };

  const validateCode = (code: string) => {
    if (!code) {
      return "Please enter the OTP";
    }
    if (code.length !== 6) {
      return "OTP must be 6 digits";
    }
    if (!/^\d+$/.test(code)) {
      return "OTP must contain only numbers";
    }
    return "";
  };

  const validateNewPassword = (password: string) => {
    if (!password) {
      return "Please enter a new password";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password.length > 24) {
      return "Password must be less than 24 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must include at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must include at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must include at least one special character (!@#$%^&*)";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword.length > 24) {
      return "Password must be less than 24 characters long";
    }
    if (confirmPassword !== newPassword) {
      return "Password and confirm password do not match";
    }
    return "";
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    // Clear error when user starts typing
    if (errors.code) {
      setErrors(prev => ({ ...prev, code: "" }));
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    // Clear error when user starts typing
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: "" }));
    }
    // Also validate confirm password when new password changes
    if (confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword) }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Clear error when user starts typing
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleCodeBlur = (value: string) => {
    if (value.trim()) {
      setErrors(prev => ({ ...prev, code: validateCode(value) }));
    }
  };

  const handleNewPasswordBlur = (value: string) => {
    if (value.trim()) {
      setErrors(prev => ({ ...prev, newPassword: validateNewPassword(value) }));
    }
  };

  const handleConfirmPasswordBlur = (value: string) => {
    if (value.trim()) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value) }));
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    // Validate all fields and show required field errors
    const codeValidation = code.trim() ? validateCode(code) : "Please enter the OTP";
    const newPasswordValidation = newPassword.trim() ? validateNewPassword(newPassword) : "Please enter a new password";
    const confirmPasswordValidation = confirmPassword.trim() ? validateConfirmPassword(confirmPassword) : "Please confirm your password";

    setErrors({
      code: codeValidation,
      newPassword: newPasswordValidation,
      confirmPassword: confirmPasswordValidation
    });

    if (codeValidation || newPasswordValidation || confirmPasswordValidation) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authAxiosClient.post(
        `/auth/reset-password`,
        {
          email,
          code,
          newPassword,
        }
      );
      if (response.data.status) {
        showSuccess('Password Reset', response?.data?.message);
        removeLocalItem("resetPasswordEmail");
        router.push("/auth?mode=login");
      } else {
        setCode(""); // Clear OTP field on error
        showError('Reset Failed', response.data.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error.response?.data?.message?.includes("Invalid verification code")) {
        setCode(""); // Clear OTP field on error
        showError('Invalid Code', "Invalid verification code. Please enter a valid code.");
      } else {
        setCode(""); // Clear OTP field on error
        showError('Reset Failed', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-base text-gray-600">
            Please enter the OTP sent to your email and your new password
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">
              OTP <span className="text-red-500">*</span>
            </Label>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={handleCodeChange}
              onBlur={() => handleCodeBlur(code)}
              className="gap-3"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index: number) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={`w-12 h-12 text-lg font-semibold border-2 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 ${
                      errors.code ? 'border-red-500' : 'border-gray-200'
                    }`}
                    inputMode="numeric"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            
            {/* Resend OTP Section */}
            <div className="flex items-center justify-between mt-3">
              {/* <p className="text-sm text-gray-600">
               If you didn't receive the OTP click on resend OTP.
              </p> */}
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

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-gray-700 font-medium">
              New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                placeholder="Enter your new password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                onBlur={(e) => handleNewPasswordBlur(e.target.value)}
                maxLength={24}
                className={`h-12 rounded-xl border-2 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 ${
                  errors.newPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
              >
                {!showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-gray-700 font-medium"
            >
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={(e) => handleConfirmPasswordBlur(e.target.value)}
                maxLength={24}
                className={`h-12 rounded-xl border-2 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
              >
                {!showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white rounded-xl font-semibold"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full h-12 border-2 rounded-xl font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          disabled={isSubmitting || isLoading}
        >
          Back
        </Button>
      </form>
    </div>
  );
}
