"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./signup-form";
// import { OTPVerificationForm } from "./otp-verification-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { NewPasswordForm } from "./new-password-form";
import { AuthStep } from "@/src/constants/auth";
import { EmailOTPForm } from "./email-otp-form";

interface AuthFormProps {
  mode?: string;
}

export function AuthForm({ mode = "login" }: AuthFormProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(mode as AuthStep);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Update the page title based on the current step
    const titles = {
      login: "Login - Intelliverse X",
      signup: "Sign Up - Intelliverse X",
      "forgot-password": "Forgot Password - Intelliverse X",
      "new-password": "Set New Password - Intelliverse X",
      "email-otp": "Verify OTP - Intelliverse X",
    };
    document.title = titles[currentStep] || titles.login;
  }, [currentStep]);

  useEffect(() => {
    setCurrentStep(mode as AuthStep);
  }, [mode]);

  async function onSubmit() {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (currentStep === "forgot-password") {
        setCurrentStep("new-password");
        router.push("/auth?mode=new-password");
      }
    }, 2000);
  }

  const forms = {
    login: (
      <LoginForm
        isLoading={isLoading}
        onSubmit={onSubmit}
        onForgotPassword={() => {
          setCurrentStep("forgot-password");
          router.push("/auth?mode=forgot-password");
        }}
        onSignUp={() => {
          setCurrentStep("signup");
          router.push("/auth?mode=signup");
        }}
      />
    ),
    signup: (
      <SignUpForm
        isLoading={isLoading}
        onSubmit={onSubmit}
        onLogin={() => {
          setCurrentStep("login");
          router.push("/auth?mode=login");
        }}
        onOtpRequired={() => {
          setCurrentStep("email-otp");
          router.push("/auth?mode=email-otp");
        }}
      />
    ),
    "forgot-password": (
      <ForgotPasswordForm
        isLoading={isLoading}
        onSubmit={onSubmit}
        onBack={() => {
          setCurrentStep("login");
          router.push("/auth?mode=login");
        }}
      />
    ),
    "new-password": (
      <NewPasswordForm
        isLoading={isLoading}
        onSubmit={onSubmit}
        onBack={() => {
          setCurrentStep("forgot-password");
          router.push("/auth?mode=forgot-password");
        }}
      />
    ),
    "email-otp": (
      <EmailOTPForm
        isLoading={isLoading}
        onSubmit={onSubmit}
        onBack={() => {
          setCurrentStep("signup");
          router.push("/auth?mode=signup");
        }}
      />
    ),
  };

  return forms[currentStep] || forms.login;
}
