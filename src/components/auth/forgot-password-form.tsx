"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import axios from "axios";
import { setLocalData } from "@/src/core/config/localStorage";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import authAxiosClient from "@/src/app/apis/auth/axios";

interface ForgotPasswordFormProps {
  isLoading?: boolean;
  onSubmit?: () => void;
  onBack?: () => void;
}

export function ForgotPasswordForm({
  isLoading,
  onSubmit,
  onBack,
}: ForgotPasswordFormProps) {
  const { showSuccess, showError } = useNotificationUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Please enter your email address";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const handleEmailBlur = (value: string) => {
    if (value.trim()) {
      setEmailError(validateEmail(value));
    }
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    
    // Validate email
    const emailValidation = email.trim() ? validateEmail(email) : "Please enter your email address";
    setEmailError(emailValidation);

    if (emailValidation) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authAxiosClient.post(
        `/auth/forgot-password`,
        { email: email.toLowerCase() }  // Normalize email to lowercase
      );

      if (response.data.status) {
        showSuccess('Reset Token Sent', "OTP sent successfully on registered Email");
        setLocalData("resetPasswordEmail", email.toLowerCase());  // Store normalized email
        onSubmit?.();
      } else {
        showError('Reset Failed', response.data.message || "Failed to send reset token");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      showError('Failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-lg">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Forgot Password
        </h1>
        <p className="text-base text-gray-600">
          Please enter your registered email to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="text"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={(e) => handleEmailBlur(e.target.value)}
            className={`mt-1 h-12 rounded-xl border-2 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 ${
              emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
            }`}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white rounded-xl font-semibold"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Sending..." : "Send OTP"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full h-12 border-2 rounded-xl font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          disabled={isSubmitting || isLoading}
        >
          Back to Log In
        </Button>
      </form>
    </div>
  );
}
