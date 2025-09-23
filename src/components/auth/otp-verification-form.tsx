"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Icons } from "@/src/core/icons";


interface OTPVerificationFormProps {
  isLoading: boolean;
  onSubmit: (event: React.SyntheticEvent) => void;
  onBack: () => void;
}

export function OTPVerificationForm({ isLoading, onSubmit, onBack }: OTPVerificationFormProps) {
  const [otpValue, setOtpValue] = useState("");

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <div className="w-full max-w-md space-y-10 p-8 bg-white rounded-2xl shadow-lg">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">OTP Verification</h1>
        <p className="text-base text-gray-600">Please enter the OTP sent to your registered email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
        <div className="flex justify-center">
            <InputOTP 
              maxLength={6} 
              className="gap-3"
              value={otpValue}
              onChange={handleOtpChange}
            >                                                                           
            <InputOTPGroup>
                <InputOTPSlot className="w-12 h-12 text-lg font-semibold border-2 border-[var(--color-border-light)] rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-colors" index={0} />
                <InputOTPSlot className="w-12 h-12 text-lg font-semibold border-2 border-[var(--color-border-light)] rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-colors" index={1} />
                <InputOTPSlot className="w-12 h-12 text-lg font-semibold border-2 border-[var(--color-border-light)] rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-colors" index={2} />
                <InputOTPSlot className="w-12 h-12 text-lg font-semibold border-2 border-[var(--color-border-light)] rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-colors" index={3} />
                <InputOTPSlot className="w-12 h-12 text-lg font-semibold border-2 border-[var(--color-border-light)] rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-colors" index={4} />
                <InputOTPSlot className="w-12 h-12 text-lg font-semibold border-2 border-[var(--color-border-light)] rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 motion-colors" index={5} />
            </InputOTPGroup>
          </InputOTP>
          </div>
        </div>

        <Button
          className="w-full h-14 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg motion-hover-brand"
          type="submit"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />}
          Verify OTP
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full h-12 text-[var(--color-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary)] font-medium transition-colors duration-200"
          onClick={onBack}
        >
          Back
        </Button>
      </form>
    </div>
  );
}