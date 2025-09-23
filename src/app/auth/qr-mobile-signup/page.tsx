"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { getClientCookie, setClientCookie } from "@/src/core/config/localStorage";
import authAxiosClient from "@/src/app/apis/auth/axios";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { EmailOTPForm } from "@/src/components/auth/email-otp-form";
import { isKioskInterface } from "@/src/core/utils";
import { io } from "socket.io-client";

export default function QrMobileSignupPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");
  const router = useRouter();
  const { showSuccess, showError } = useNotificationUtils();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirmPassword: "", otp: "" });
  const [kioskMachineId, setKioskMachineId] = useState("");

  // Validation functions (reuse from signup-form)
  const validateName = (name: string) => {
    if (!name.trim()) return "Please enter your full name";
    if (name.trim().length < 2) return "Name must be at least 2 characters long";
    const specialCharRegex = /[#@%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (specialCharRegex.test(name)) return "Name cannot contain special characters like # @ % ^ & *";
    if (/\d/.test(name)) return "Name cannot contain numbers";
    return "";
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Please enter your email address";
    if (!emailRegex.test(email)) return "Please enter a valid email address (e.g., john@example.com)";
    return "";
  };
  const validatePassword = (password: string) => {
    if (!password) return "Please enter a password";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (password.length > 24) return "Password must be less than 24 characters long";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must include at least one number";
    if (!/[!@#$%^&*]/.test(password)) return "Password must include at least one special character (!@#$%^&*)";
    return "";
  };
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword.length > 24) return "Password must be less than 24 characters long";
    if (confirmPassword !== formData.password) return "Password and confirm password do not match";
    return "";
  };
  const validateOtp = (otp: string) => {
    if (!otp) return "Please enter the OTP";
    if (otp.length !== 6) return "OTP must be 6 digits";
    if (!/^\d+$/.test(otp)) return "OTP must contain only numbers";
    return "";
  };

  // Step 1: Initiate signup
  const handleSignupInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      name: formData.name.trim() ? validateName(formData.name) : "Please enter your full name",
      email: formData.email.trim() ? validateEmail(formData.email) : "Please enter your email address",
      password: formData.password.trim() ? validatePassword(formData.password) : "Please enter a password",
      confirmPassword: formData.confirmPassword.trim() ? validateConfirmPassword(formData.confirmPassword) : "Please confirm your password",
      otp: "",
      // kioskMachineId: isKioskInterface() && !kioskMachineId.trim() ? "Please enter your kiosk machine ID" : ""
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((err) => err !== "")) {
      showError(Object.values(newErrors).find((err) => err !== "") || "An error occurred");
      return;
    }
    setLoading(true);
    try {
      const nameParts = formData.name.trim().split(' ');
      const userName = `${formData.email.split('@')[0]}_${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        userName,
        role: "user",
        // ...(isKioskInterface() && kioskMachineId.trim() ? { macAddress: kioskMachineId.trim(), fromDevice: "machine" } : {})
      };
      // Only call /auth/signup/initiate here
      const res = await authAxiosClient.post("/auth/signup/initiate", payload);
      if (res.data.status) {
        localStorage.setItem("pendingSignupUser", JSON.stringify(payload));
        setStep(2);
        showSuccess("OTP Sent", res.data.message || "An OTP has been sent to your email.");
      } else {
        showError("Signup Failed", res.data.message || "Failed to initiate signup");
      }
    } catch (err: any) {
      showError("Signup Failed", err?.response?.data?.message || err?.message || "Failed to initiate signup");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete signup with OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpError = validateOtp(otp);
    setErrors((prev) => ({ ...prev, otp: otpError }));
    if (otpError) {
      showError(otpError);
      return;
    }
    setOtpLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("pendingSignupUser") || "{}");
      const payload = { ...user, otp };
      const res = await authAxiosClient.post("/auth/signup", payload);
      if (res.data.status) {
        localStorage.removeItem("pendingSignupUser");
        setSuccess(true);
        showSuccess("Signup Complete", res.data.message || "Your account is now active.");
        
        // // 🚀 EMIT KIOSK SIGNUP SUCCESS EVENT TO DESKTOP
        // if (sessionId && isKioskInterface()) {
        //   try {
        //     const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        //     const socket = io(wsUrl, {
        //       path: '/api/user/socket.io',
        //       transports: ['websocket', 'polling'],
        //       reconnection: false,
        //       timeout: 5000,
        //       autoConnect: true,
        //       withCredentials: true,
        //       query: { sessionId },
        //     });

        //     socket.on('connect', () => {
        //       console.log('🔗 Mobile connected to notify desktop of kiosk signup success');
        //       socket.emit('joinQrSession', sessionId);
              
        //       // Emit kiosk signup completion event
        //       socket.emit('kiosk:signup:completed', {
        //         sessionId,
        //         userId: res.data.user?.id,
        //         message: 'Mobile signup successful',
        //         timestamp: new Date().toISOString(),
        //         machineId: kioskMachineId || 'unknown'
        //       });
              
        //       console.log('✅ Kiosk signup success event emitted to desktop');
        //       setTimeout(() => socket.disconnect(), 1000);
        //     });
        //   } catch (socketError) {
        //     console.error('Failed to notify desktop:', socketError);
        //   }
        // }
        
        setTimeout(() => router.push("/kyc"), 1000);
      } else {
        showError("Verification Failed", res.data.message || "Failed to verify OTP");
      }
    } catch (err: any) {
      showError("Verification Failed", err?.response?.data?.message || err?.message || "Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
        {/* Video Background - Now shown on mobile too */}
        <div className="w-full h-48 sm:h-[250px] lg:w-1/2 lg:h-auto bg-[#171a21] relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full ">
            <video
              src="/videos/welcome.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover lg:object-contain"
            />
          </div>
          {/* Optional overlay for better text readability on mobile */}
          <div className="absolute inset-0 bg-black/20 lg:bg-transparent"></div>
        </div>
        {/* Form Content - Stacked below video on mobile, side by side on desktop */}
        <div className="flex-1 flex items-center justify-center p-2 bg-gray-50 lg:bg-white overflow-hidden max-w-full min-h-0 lg:min-h-screen">
          <div className="w-full max-w-md space-y-6 px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-2xl shadow-xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Invalid QR Code</h2>
              <p className="text-sm sm:text-base text-gray-600">The QR code link is invalid or expired.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
        {/* Video Background - Now shown on mobile too */}
        <div className="w-full h-48 sm:h-[250px] lg:w-1/2 lg:h-auto bg-[#171a21] relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full ">
            <video
              src="/videos/welcome.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover lg:object-contain"
            />
          </div>
          {/* Optional overlay for better text readability on mobile */}
          <div className="absolute inset-0 bg-black/20 lg:bg-transparent"></div>
        </div>
        {/* Form Content - Stacked below video on mobile, side by side on desktop */}
        <div className="flex-1 flex items-center justify-center p-2 bg-gray-50 lg:bg-white overflow-hidden max-w-full min-h-0 lg:min-h-screen">
          <div className="w-full max-w-md space-y-6 px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-2xl shadow-xl mx-auto">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Signup Complete!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                You can now return to your desktop. The signup will complete automatically.
              </p>
              <Button
                onClick={() => router.push("/kyc")}
                className="w-full h-10 sm:h-12 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
              >
                Go to KYC
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UI rendering
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
      {/* Video Background - Now shown on mobile too */}
      <div className="w-full h-48 sm:h-[250px] lg:w-1/2 lg:h-auto bg-[#171a21] relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full ">
          <video
            src="/videos/welcome.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover lg:object-contain"
          />
        </div>
        <div className="absolute inset-0 bg-black/20 lg:bg-transparent"></div>
      </div>
      <div className="flex-1 flex items-center justify-center p-2 bg-gray-50 lg:bg-white overflow-hidden max-w-full min-h-0 lg:min-h-screen">
        <div className="w-full max-w-md space-y-10 px-4 sm:px-6 py-2 sm:py-2 mt-[-10px] rounded-2xl shadow-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign Up to Verify QR</h2>
            <p className="text-sm sm:text-base text-gray-600">{step === 1 ? "Enter your details to sign up and verify the QR code" : "Please enter the OTP sent to your email"}</p>
          </div>
          {/* {isKioskInterface() && sessionId && (
            <Button
              className="w-full mb-4 h-10 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-[var(--color-secondary)] font-medium shadow-sm hover:shadow-md transition-all duration-150"
              type="button"
              onClick={() => router.push(`/auth/qr-mobile-login?sessionId=${encodeURIComponent(sessionId)}`)}
            >
              Are you a returning kiosk user?
            </Button>
          )} */}
          {step === 1 && (
            <form onSubmit={handleSignupInitiate} className="space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    maxLength={24}
                    className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 pr-10 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    maxLength={24}
                    className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 pr-10 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
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
              {/* {
                isKioskInterface() && (
                  <>
                    <div className="space-y-1 sm:space-y-2 mt-2">
                      <Label htmlFor="kioskMachineId" className="text-gray-700 font-medium">Enter your kiosk machine ID <span className="text-red-500">*</span></Label>
                      <Input
                        id="kioskMachineId"
                        placeholder="Enter your kiosk machine ID"
                        type="text"
                        value={kioskMachineId}
                        onChange={e => setKioskMachineId(e.target.value)}
                        className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.kioskMachineId ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
                      />
                      {errors.kioskMachineId && <p className="text-red-500 text-sm mt-1">{errors.kioskMachineId}</p>}
                    </div>
                  </>
                )
              }  */}

              <Button
                type="submit"
                className="w-full mt-4 h-10 sm:h-12 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up & Verify"}
              </Button>
            </form>
          )}
          {step === 2 && (
            <EmailOTPForm
              isLoading={otpLoading}
              onSubmit={async (e) => {
                e.preventDefault();
                // The EmailOTPForm already handles reading user info from localStorage and calling /auth/signup
                // So you can just let it handle everything, or optionally pass a custom handler if needed
              }}
              onBack={() => setStep(1)}
            />
          )}
          {/* {isKioskInterface() && sessionId && (
            <Button
              className="w-full mt-4 h-10 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-[var(--color-secondary)] font-medium shadow-sm hover:shadow-md transition-all duration-150"
              type="button"
              onClick={() => router.push(`/auth/qr-mobile-login?sessionId=${encodeURIComponent(sessionId)}`)}
            >
              Are you a returning kiosk user?
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );
} 