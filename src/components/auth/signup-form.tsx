"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, QrCode } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { OrDivider } from "./or-divider";
import { SocialLoginButtons } from "./social-login-button";
import { Icons } from "@/src/core/icons";

import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import authAxiosClient from "@/src/app/apis/auth/axios";
import { io, Socket } from "socket.io-client";
import { isKioskInterface } from "@/src/core/utils";

interface SignUpFormProps {
  isLoading: boolean;
  onSubmit: (event: React.SyntheticEvent) => Promise<void>;
  onLogin: () => void;
  onOtpRequired?: () => void; // <-- Add this
}

export function SignUpForm({ onLogin, onOtpRequired }: SignUpFormProps) {
  const { loading: authLoading, signupInitiate } = useAuth();
  const router = useRouter();
  const { showError, showSuccess } = useNotificationUtils();

  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // QR Code states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { handleAuthSuccess } = useAuth();
  const searchParams = useSearchParams();
  const urlSessionId = searchParams?.get('sessionId');
  // Add refreshingQR state
  const [refreshingQR, setRefreshingQR] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    const initQrSession = async () => {
      try {
        const { data } = await authAxiosClient.post('/auth/qr/initiate', { type: 'signup', isMachine: isKioskInterface() ? true : false });
        if (data.status) {
          setSessionId(data.data.sessionId);
          setQrCode(data.data.qrCode); // Use backend-generated QR code image
        } else {
          setQrError('Failed to initialize QR session');
        }
      } catch (err) {
        setQrError('Failed to initialize QR session');
      }
    };
    initQrSession();
  }, [urlSessionId]);

  useEffect(() => {
    const pendingUser = localStorage.getItem("pendingSignupUser");
    if (pendingUser) {
      const user = JSON.parse(pendingUser);
      setFormData({
        name: user.firstName + (user.lastName ? " " + user.lastName : ""),
        email: user.email,
        password: "",
        confirmPassword: ""
      });
    }
  }, []);

  // WebSocket connection for QR code signup
  useEffect(() => {
    if (!sessionId) return;
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    const socketInstance = io(wsUrl, {
      path: '/api/user/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
      withCredentials: true,
      query: { sessionId },
      extraHeaders: { 'Access-Control-Allow-Origin': '*' }
    });
    socketInstance.on('connect', () => {
      setSocketConnected(true);
      setQrError(null);
      socketInstance.emit('joinQrSession', sessionId);
    });
    socketInstance.on('disconnect', () => {
      setSocketConnected(false);
    });
    console.log("465768724546")

    socketInstance.on('qr:verified', async (data) => {
      try {
        console.log("4657687")
        await new Promise(resolve => setTimeout(resolve, 500));
        const response = await authAxiosClient.post('/auth/qr/complete', { sessionId });
        const result = response.data;
        if (result.status) {
          const success = await handleAuthSuccess(result.data, true);
          if (success) {
            router.push('/');
          } else {
            showError('Signup Failed', 'Failed to finalize signup');
          }
        } else {
          setQrError('Failed to complete signup');
          showError('Signup Failed', 'Failed to complete signup');
        }
      } catch (err) {
        setQrError('Failed to complete signup');
        showError('Signup Failed', 'Failed to complete signup');
      }
    });
    socketInstance.on('qr:expired', () => {
      setQrError('QR code has expired. Please try again.');
      showError('QR Expired', 'QR code has expired. Please try again.');
    });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, [sessionId, router]);

  const handleRefreshQR = async () => {
    setQrError(null);
    setRefreshingQR(true); // Start loader
    try {
      const { data } = await authAxiosClient.post('/auth/qr/initiate', { type: 'signup', isMachine: isKioskInterface() ? true : false });
      if (data.status) {
        setSessionId(data.data.sessionId);
        setQrCode(data.data.qrCode); // Use backend-generated QR code image
      } else {
        setQrError('Failed to refresh QR code');
      }
    } catch (err) {
      setQrError('Failed to refresh QR code');
    } finally {
      setRefreshingQR(false); // Stop loader
    }
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Please enter your full name";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    // Check for special characters
    const specialCharRegex = /[#@%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (specialCharRegex.test(name)) {
      return "Name cannot contain special characters like # @ % ^ & *";
    }
    // Check for numbers
    if (/\d/.test(name)) {
      return "Name cannot contain numbers";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Please enter your email address";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., john@example.com)";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Please enter a password";
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
    if (confirmPassword !== formData.password) {
      return "Password and confirm password do not match";
    }
    return "";
  };

  // Handle field blur
  const handleBlur = (field: string, value: string) => {
    // Only validate if the user has actually typed something
    if (value.trim()) {
      let error = "";
      switch (field) {
        case "name":
          error = validateName(value);
          break;
        case "email":
          error = validateEmail(value);
          break;
        case "password":
          error = validatePassword(value);
          break;
        case "confirmPassword":
          error = validateConfirmPassword(value);
          break;
      }
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleSignUp = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    // Validate all fields and show required field errors
    const newErrors = {
      name: formData.name.trim() ? validateName(formData.name) : "Please enter your full name",
      email: formData.email.trim() ? validateEmail(formData.email) : "Please enter your email address",
      password: formData.password.trim() ? validatePassword(formData.password) : "Please enter a password",
      confirmPassword: formData.confirmPassword.trim() ? validateConfirmPassword(formData.confirmPassword) : "Please confirm your password"
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== "")) {
      showError(Object.values(newErrors).find(error => error !== "") || "An error occurred");
      return;
    }

    try {
      const nameParts = formData.name.trim().split(' ');
      const signupCredentials = {
        email: formData.email,
        password: formData.password,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        userName: `${formData.email.split('@')[0]}_${Math.random().toString(36).slice(2, 8)}`
      };

      const response = await signupInitiate(signupCredentials);

      if (response) {
        showSuccess('Signup Successful', response?.message || 'Welcome! Your account has been created successfully.');
        if (
          response?.message === "User already registered but email not verified. Please verify your email to complete registration." ||
          response?.message === "User registered successfully. Please verify your email to complete registration."
        ) {
          // Store user info for OTP verification (localStorage, context, or state)
          localStorage.setItem("pendingSignupUser", JSON.stringify({
            email: signupCredentials.email,
            firstName: signupCredentials.firstName,
            lastName: signupCredentials.lastName,
            userName: signupCredentials.userName,
            password: signupCredentials.password,
          }));
          // Use the callback instead of window.location.href
          onOtpRequired?.();
          return;
        }
        
        // Clear pendingSignupUser after successful signup (not OTP flow)
        localStorage.removeItem("pendingSignupUser");
        
        // Redirect to address setup page after successful signup
        router.push('/address-setup?redirect=kyc');
      }
      // Clear pendingSignupUser after successful signup (not OTP flow)
      localStorage.removeItem("pendingSignupUser");
    } catch (error: any) {
      showError('Signup Failed', error?.message || "Failed to sign up. Please try again.");
    }
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200" style={{ borderRadius: '30px' }}>
        {/* Centered Header and Social Login */}
        <div className="text-center py-4 px-3">
          <h1 className="text-3xl sm:text-3xl font-bold text-gray-900 mb-2">Sign Up With</h1>
          <p className="text-sm sm:text-base text-gray-600">Create your account to get started</p>
          <div className="mt-4">
            <SocialLoginButtons />
          </div>
          <OrDivider />
        </div>
        {/* Main Content: Form and QR */}
        <div className="w-full flex flex-col lg:flex-row lg:items-stretch lg:justify-center gap-8">
          {/* Left: Signup Form */}
          <div className="w-full max-w-md space-y-6 px-4 sm:px-8  sm:py-8 mx-auto lg:mx-0">
            {/* Remove header and social login from here */}
            <div className="text-center lg:text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Email Sign Up</h2>
              <p className="text-gray-600 text-sm">Use your email to sign up</p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={(e) => handleBlur("name", e.target.value)}
                  className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="text"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={(e) => handleBlur("password", e.target.value)}
                    maxLength={24}
                    className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 pr-10 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                    maxLength={24}
                    className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 pr-10 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button
                className="w-full h-10 sm:h-12 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
                type="submit"
                disabled={authLoading}
              >
                {authLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </form>

            <p className="text-start text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                onClick={onLogin}
              >
                Log In
              </button>
            </p>
          </div>

          {/* Right: QR Code Section (Desktop only) */}
          <div className="hidden lg:flex flex-col justify-center w-full max-w-md p-8 lg:border-l border-gray-200 lg:pl-10">
            <div className="space-y-4  pt-8 ">
              <div className="text-start">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Scan to Sign Up</h2>
                <p className="text-gray-600 text-sm">Use your mobile device to scan this QR code and sign up on your phone.</p>
              </div>
              <div className="flex justify-center">
                {refreshingQR ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                    <p className="text-gray-500 text-sm">Refreshing QR code...</p>
                  </div>
                ) : qrError && !qrCode ? (
                  <div className="text-center p-8 bg-red-50 border border-red-200 rounded-2xl max-w-xs">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-8 h-8 text-red-500" />
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
                ) : qrCode ? (
                  <div className="relative">
                    <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
                      <img src={qrCode || "/placeholder.svg"} alt="QR Code for Signup" className="w-48 h-48 rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                    <p className="text-gray-500 text-sm">Generating QR code...</p>
                  </div>
                )}
              </div>
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
      </div>
      {/* <KYCModal open={showKYC} onClose={() => setShowKYC(false)} /> */}
    </>
  );
}
