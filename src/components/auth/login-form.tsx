"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, QrCode, Smartphone, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Icons } from "@/src/core/icons";
import { SocialLoginButtons } from "./social-login-button";
import { OrDivider } from "./or-divider";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { getLocalData, getClientCookie, setLocalData } from "@/src/core/config/localStorage";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { io, Socket } from "socket.io-client";
import authAxiosClient from "@/src/app/apis/auth/axios";
import { setError } from "@/src/store/slices/appSlice";
import { isKioskInterface } from "@/src/core/utils";
import { useCustomSession } from "@/src/app/SessionProvider";



function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

interface LoginFormProps {
  isLoading: boolean;
  onSubmit: (event: React.SyntheticEvent) => Promise<void>;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export function LoginForm({
  isLoading,
  onSubmit,
  onForgotPassword,
  onSignUp,
}: LoginFormProps) {
  const { login, loading: authLoading, error: authError, user } = useAuth();
  const router = useRouter();
  const { showError } = useNotificationUtils();
  // ✅ ADD THIS: Get session data for social login handling
  const { session, status, isAuthenticated } = useCustomSession();



  // QR Code states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [socketConnected, setSocketConnected] = useState(false);
  const { handleAuthSuccess } = useAuth();
  const urlSessionId = searchParams?.get('sessionId');
  // Add refreshingQR state
  const [refreshingQR, setRefreshingQR] = useState(false);
  // Form states
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({
    email: false
  });

  useEffect(() => {
    if (isMobile() && urlSessionId) {
      router.replace(`/auth/qr-mobile-login?sessionId=${urlSessionId}`);
    }
  }, [urlSessionId, router]);



  // QR Toggle
  const [showQR, setShowQR] = useState(false);

  // Initialize QR session
  useEffect(() => {
    const initQrSession = async () => {
      try {
        const { data } = await authAxiosClient.post('/auth/qr/initiate', { isMachine: isKioskInterface() ? true : false });
        if (data.status) {
          console.log('QR session initialized successfully, sessionId:', data.data.sessionId);
          setSessionId(data.data.sessionId);
          setQrCode(data.data.qrCode);
        } else {
          const errorMsg = data.message || 'Failed to initialize QR session';
          console.error('QR session initialization failed:', data);
          setQrError(errorMsg);
          showError('QR Session Error', errorMsg);
        }
      } catch (err) {
        const errorMsg = (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to initialize QR session';
        console.error('QR session initialization error:', err);
        setQrError(errorMsg);
        showError('QR Session Error', errorMsg);
      }
    };

    initQrSession();
  }, [urlSessionId]);

  // WebSocket connection for QR code
  useEffect(() => {
    if ((isMobile() && urlSessionId) || !sessionId) return;

    // WebSocket connection URL
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    console.log('Initializing socket connection to:', wsUrl);

    // Initialize socket connection
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
      query: {
        sessionId: sessionId
      },
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    // Add connection state logging
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.log('Connection state:', socketInstance.connected);
      console.log('Transport:', socketInstance.io.engine.transport.name);
      setSocketConnected(false);
      const errorMsg = `Connection error: ${error.message}. Please check your internet connection and try again.`;
      setQrError(errorMsg);
      showError('Connection Error', errorMsg);
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      console.log('Transport:', socketInstance.io.engine.transport.name);
      setSocketConnected(true);
      setQrError(null); // Clear any QR-related errors when connected
      socketInstance.emit('joinQrSession', sessionId);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      console.log('Connection state:', socketInstance.connected);
      setSocketConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socketInstance.connect();
      }
    });

    // Add error event handlerQR 
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      console.log('Connection state:', socketInstance.connected);
      const errorMsg = 'WebSocket error occurred. Please try again.';
      setQrError(errorMsg);
      showError('WebSocket Error', errorMsg);
    });

    // Add reconnection event handlers
    socketInstance.io.on('reconnect_attempt', (attempt) => {
      console.log('Reconnection attempt:', attempt);
    });

    socketInstance.io.on('reconnect', (attempt) => {
      console.log('Reconnected after', attempt, 'attempts');
    });

    socketInstance.io.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socketInstance.io.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      const errorMsg = 'Failed to establish connection. Please try again.';
      setQrError(errorMsg);
      showError('Connection Failed', errorMsg);
    });

    socketInstance.on('qr:verified', async (data) => {
      console.log('QR verified event received:', data);
      console.log('session idddd', sessionId);
      try {
        // Add a delay before calling /complete
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        // Use correct Axios POST syntax
        const response = await authAxiosClient.post('/auth/qr/complete', { sessionId });
        const result = response.data;
        console.log('QR completion response:', result);

        if (result.status) {
          const success = await handleAuthSuccess(result.data, true);
          if (success) {
            router.push('/');
          } else {
            showError('Login Failed', 'Failed to finalize login');
          }
        } else {
          setQrError('Failed to complete login');
          showError('Login Failed', 'Failed to complete login');
        }
      } catch (err) {
        console.error('QR completion error:', err);
        setQrError('Failed to complete login');
        showError('Login Failed', 'Failed to complete login');
      }
    });

    socketInstance.on('qr:expired', () => {
      console.log('QR code expired');
      const errorMsg = 'QR code has expired. Please try again.';
      setQrError(errorMsg);
      showError('QR Expired', errorMsg);
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [sessionId, router, urlSessionId]);


  const handleRefreshQR = async () => {
    setQrError(null);
    setRefreshingQR(true); // Start loader
    try {
      // Clean up existing socket connection before creating new QR session
      if (socket) {
        console.log('Cleaning up existing socket connection before QR refresh');
        socket.disconnect();
        setSocket(null);
        setSocketConnected(false);
      }
      
      const { data } = await authAxiosClient.post('/auth/qr/initiate', { isMachine: isKioskInterface() ? true : false });
      if (data.status) {
        console.log('QR refresh successful, new sessionId:', data.data.sessionId);
        setSessionId(data.data.sessionId);
        setQrCode(data.data.qrCode);
      } else {
        const errorMsg = data.message || 'Failed to refresh QR code';
        console.error('QR refresh failed:', data);
        setQrError(errorMsg);
        showError('Refresh Failed', errorMsg);
      }
    } catch (err) {
      const errorMsg = (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to refresh QR code';
      console.error('QR refresh error:', err);
      setQrError(errorMsg);
      showError('Refresh Failed', errorMsg);
    } finally {
      setRefreshingQR(false); // Stop loader
    }
  };

  // Check for existing auth and saved credentials on mount
  useEffect(() => {
    const loadSavedCredentials = () => {
      const savedCredentials = sessionStorage.getItem("savedCredentials");
      const rememberMe = sessionStorage.getItem("rememberMe");

      if (savedCredentials && rememberMe === "true") {
        try {
          const credentials = JSON.parse(savedCredentials);
          // If we have saved credentials and remember me was enabled, pre-fill the form
          setEmail(credentials.email);
          setPassword(credentials.password);
          setRememberMe(true);
        } catch (error) {
          console.error("Error parsing saved credentials:", error);
        }
      } else {
        // Clear any saved credentials if remember me was not enabled
        sessionStorage.removeItem("savedCredentials");
        sessionStorage.removeItem("rememberMe");
      }
    };

    const existingUser = getLocalData("userAuthDetails");
    const authToken = getClientCookie("accessToken");

    if (existingUser && authToken) {
      const callbackUrl = sessionStorage.getItem("loginCallbackUrl");
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/");
      }
    } else {
      // Load saved credentials if no active session
      loadSavedCredentials();
    }
  }, [router]);

  // Add a separate effect to handle URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get("redirect");
    if (redirectUrl) {
      sessionStorage.setItem("loginCallbackUrl", redirectUrl);
    }
  }, []);

  // ✅ ADD THIS: Handle social login redirects
  useEffect(() => {
    console.log("🔍 LoginForm - Social login effect triggered:", {
      hasSession: !!session,
      hasUser: !!user,
      status,
      isAuthenticated,
      pathname: window.location.pathname
    });

    if (status === "authenticated" && session?.accessToken) {
      const isAlreadyRedirecting = sessionStorage.getItem("socialLoginRedirecting");
      if (isAlreadyRedirecting) {
        console.log("🔄 LoginForm - Redirect already in progress, skipping");
        return;
      }

      console.log("✅ LoginForm - User authenticated via social login, redirecting to home");
      sessionStorage.setItem("socialLoginRedirecting", "true");

      const callbackUrl = sessionStorage.getItem("loginCallbackUrl");
      if (callbackUrl) {
        sessionStorage.removeItem("loginCallbackUrl");
        console.log("🔄 LoginForm - Redirecting to callback URL:", callbackUrl);
        try {
          router.replace(callbackUrl);
        } catch (error) {
          console.log("🔄 LoginForm - Router failed, using window.location");
          window.location.href = callbackUrl;
        }
      } else {
        console.log("🔄 LoginForm - Redirecting to home page");
        try {
          router.replace("/");
        } catch (error) {
          console.log("🔄 LoginForm - Router failed, using window.location");
          window.location.href = "/";
        }
      }
      
      setTimeout(() => {
        console.log("🔍 LoginForm - Checking navigation result, current path:", window.location.pathname);
        sessionStorage.removeItem("socialLoginRedirecting");
      }, 1000);
    }
  }, [session, status, router]);

  // ✅ ADD THIS: Debug session changes
  useEffect(() => {
    console.log("🔍 LoginForm - Session state changed:", {
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      hasAccessToken: !!session?.accessToken,
      hasUser: !!session?.user,
      status,
      isAuthenticated
    });
  }, [session, status, isAuthenticated]);


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

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleEmailBlur = (value: string) => {
    setTouched(prev => ({ ...prev, email: true }));
    if (value.trim()) {
      setEmailError(validateEmail(value));
    }
  };

  const handleLogin = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setErrorMessage("");

    // Mark email field as touched on submit
    setTouched({ email: true });

    // Validate email and check for empty password
    const emailValidation = email.trim() ? validateEmail(email) : "Please enter your email address";
    const passwordValidation = !password.trim() ? "Please enter your password" : "";

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    try {
      // const [localPart, domainPart] = email.split('@');
      // const normalizedEmail = `${localPart.toLowerCase()}@${domainPart}`;

      const loginCredentials = {
        email: email.toLowerCase(), // Normalize email to lowercase
        password,
        rememberMe,
      };

      const result = await login(loginCredentials);

      if (result) {
        // Save credentials and remember me state if checked
        if (rememberMe) {
          sessionStorage.setItem("savedCredentials", JSON.stringify({ email, password }));
          sessionStorage.setItem("rememberMe", "true");
        } else {
          // Clear saved credentials and remember me state if unchecked
          sessionStorage.removeItem("savedCredentials");
          sessionStorage.removeItem("rememberMe");
        }

        // Handle redirect
        const callbackUrl = sessionStorage.getItem("loginCallbackUrl");
        if (callbackUrl) {
          sessionStorage.removeItem("loginCallbackUrl");
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
      }
      // Note: If result is null, the useAuth hook already handles the error and shows notification
    } catch (err: any) {
      const errorMessage = err?.message || "Login failed. Please try again.";
      setErrorMessage(errorMessage);
      showError('Login Failed', errorMessage);
    }
  };

  // Show auth error from useAuth hook
  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
    }
  }, [authError]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200" style={{ borderRadius: '30px' }}>
      {/* Header */}
      <div className="text-center py-4 px-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Log In</h1>
        <p className="text-gray-600">Welcome back! Please sign in to your account</p>
      </div>
      {/* Social Login Section */}
      <div className="px-2 sm:px-4">
        <SocialLoginButtons />
      </div>
      <OrDivider />
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 sm:p-6">
        {/* Left Column - Email Login */}
        <div className="space-y-4">
          <div className="text-center lg:text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Email Log In</h2>
            <p className="text-gray-600 text-sm">Use your email to log in</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={(e) => handleEmailBlur(e.target.value)}
                className={`h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 bg-white text-gray-900 placeholder-gray-400 ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                  }`}
              />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  maxLength={24}
                  className={`h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 bg-white text-gray-900 placeholder-gray-400 ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {!showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors ml-2"
              >
                Forgot password?
              </button>
            </div>
            {/* Login Button */}
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full h-12 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
            >
              {authLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Log In
            </Button>
          </form>
          {/* Sign Up Link */}
          <p className="text-start text-sm text-gray-600">
            {"Need an account? "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              onClick={() => router.push("/auth?mode=signup")}
            >
              Sign Up
            </button>
          </p>
        </div>
        {/* Right Column - QR Code */}
        <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-10 flex flex-col items-center justify-center">
          <div className="text-center">

            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-start">Scan to Log In</h2>
            <p className="text-gray-600 text-sm text-start">Use your mobile device to scan this QR code.</p>
          </div>
          {/* QR Code Display */}
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
                  <Icons.alertCircle className="w-8 h-8 text-red-500" />
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
                  <img src={qrCode || "/placeholder.svg"} alt="QR Code for Login" className="w-48 h-48 rounded-lg" />
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
          {/* QR Actions */}
          <div className="space-y-1 w-full">
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
            {isMobile() && (
              <Button
                onClick={() => router.push("/auth/qr-scan")}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan Desktop QR
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
