"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { setClientCookie, setLocalData } from "@/src/core/config/localStorage";
import { useDispatch } from "react-redux";
import {
  fetchUserProfile,
  fetchUserAddresses,
} from "@/src/store/slices/userSlice";
import { AppDispatch } from "@/src/store";
import { useCustomSession } from "@/src/app/SessionProvider";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function SocialLoginButtons() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { session, status, isAuthenticated, isLoading } = useCustomSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showError, showInfo } = useNotificationUtils();

  const handleCallProvider = async (provider: string) => {
    try {
      setSelectedProvider(provider);
      setRetryCount(0);

      // ✅ ADD: Strategic debugging for Apple login (production monitoring)
      if (provider === 'apple') {
        console.log('[APPLE_LOGIN] 🍎 Apple Sign-In process...');
        console.log('[APPLE_LOGIN] 🍎 NextAuth signIn function check:', {
          hasSignIn: !!signIn,
          signInType: typeof signIn
        });
        
        // ✅ ADD: Environment variable validation
        console.log('[APPLE_LOGIN] 🍎 Environment check (client-side):', {
          hasAppleClientId: !!process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
          hasAppleClientSecret: !!process.env.NEXT_PUBLIC_APPLE_CLIENT_SECRET,
          note: 'Note: Server-side variables (APPLE_CLIENT_ID, APPLE_CLIENT_SECRET) are required for NextAuth to work'
        });
        
      }

      console.log("Starting social login with provider:", provider);

      let result;
      try {
        // ✅ ADD: Debug the signIn call
        console.log('[SOCIAL_LOGIN] Calling signIn with:', {
          provider,
          redirect: true, // ✅ FIX: Change from false to true for Apple OAuth redirect
          callbackUrl: "/"
        });
        
        result = await signIn(provider, {
          redirect: true, // ✅ FIX: Change from false to true for Apple OAuth redirect
          callbackUrl: "/",
        });
      } catch (signInError) {
        console.error("SignIn function error:", signInError);
        throw signInError;
      }

      console.log("SignIn Result:", result);

      // ✅ ADD: Strategic debugging for Apple login result (production monitoring)
      if (provider === 'apple') {
        console.log('[APPLE_LOGIN] 🍎 Apple SignIn result received:', {
          hasResult: !!result,
          resultType: typeof result,
          isOk: result?.ok,
          hasError: !!result?.error,
          error: result?.error
        });
        
        // ✅ ADD: Specific Apple OAuth error handling
        if (result?.error) {
          console.error('[APPLE_LOGIN] 🍎 Apple OAuth error details:', {
            error: result.error,
            errorType: typeof result.error,
            isOAuthError: result.error.includes('OAuth') || result.error.includes('apple'),
            isRedirectError: result.error.includes('redirect'),
            isPopupError: result.error.includes('popup')
          });
          
          // ✅ ADD: User-friendly Apple error messages
          if (result.error.includes('popup')) {
            showError("Apple Login Failed", "Please allow popups for Apple Sign-In to work");
            return;
          } else if (result.error.includes('redirect')) {
            showError("Apple Login Failed", "Apple Sign-In redirect failed. Please try again");
            return;
          } else if (result.error.includes('OAuth')) {
            showError("Apple Login Failed", "Apple OAuth configuration issue. Please contact support");
            return;
          }
        }
      }

      if (result?.error) {
        console.error("SignIn error:", result.error);

        if (
          result.error.includes("ETIMEDOUT") ||
          result.error.includes("timeout")
        ) {
          if (retryCount < MAX_RETRIES) {
            setRetryCount((prev) => prev + 1);
            showInfo(
              "Connection timeout",
              `Connection timeout. Retrying... (${retryCount + 1}/${MAX_RETRIES})`
            );
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return handleCallProvider(provider);
          }
          showError(
            "Connection failed",
            "Connection failed after multiple attempts. Please try again later."
          );
          return;
        }

        showError("Login Failed", result.error);
        return;
      }

      if (result?.ok) {
        console.log("SignIn successful, waiting for session update...");
      }
      
      // ✅ SIMPLIFY: Handle undefined result (same for all providers)
      if (result === undefined) {
        console.error("SignIn returned undefined - authentication configuration issue");
        
        // ✅ ADD: Apple-specific undefined result handling
        if (provider === 'apple') {
          console.error('[APPLE_LOGIN] 🍎 Apple SignIn returned undefined - this indicates a configuration issue');
          console.error('[APPLE_LOGIN] 🍎 Possible causes:');
          console.error('[APPLE_LOGIN] 🍎 1. Missing environment variables (APPLE_CLIENT_ID, APPLE_CLIENT_SECRET)');
          console.error('[APPLE_LOGIN] 🍎 2. Incorrect Apple Developer account configuration');
          console.error('[APPLE_LOGIN] 🍎 3. NextAuth not properly initialized');
          
          // showError("Apple Login Failed", "Apple Sign-In configuration error. Please check your Apple Developer account setup and environment variables.");
        } else {
          console.log("Authentication configuration error. Please contact support")
          // showError("Login Failed", "Authentication configuration error. Please contact support.");
        }
        return;
      }
    } catch (error) {
      console.error("Social login error:", error);

      if (
        error instanceof Error &&
        (error.message.includes("ETIMEDOUT") ||
          error.message.includes("timeout"))
      ) {
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          showInfo(
            "Connection timeout",
            `Connection timeout. Retrying... (${retryCount + 1}/${MAX_RETRIES})`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return handleCallProvider(provider);
        }
        showError(
          "Connection failed",
          "Connection failed after multiple attempts. Please try again later."
        );
        return;
      }

      showError("Login Failed", error instanceof Error ? error.message : "Failed to login. Please try again.");
    }
  };

  const handleAuthSuccess = async (response: any) => {
    console.log("Auth Success Response:", response);

    if (!response?.accessToken) {
      console.error("No access token in response");
      showError("Authentication Failed", "Authentication failed: No access token received");
      return false;
    }

    try {
      const expirySeconds = 30 * 24 * 60 * 60;

      // Save auth tokens
      setClientCookie("accessToken", response.accessToken, {
        path: "/",
        maxAge: expirySeconds,
      });

      if (response.refreshToken) {
        setClientCookie("refreshToken", response.refreshToken, {
          path: "/",
          maxAge: expirySeconds,
        });
      }

      if (response.idToken) {
        setClientCookie("idToken", response.idToken, {
          path: "/",
          maxAge: expirySeconds,
        });
      }

      // Fetch user data
      await dispatch(fetchUserProfile());
      await dispatch(fetchUserAddresses());

      // Save user information only
      setLocalData("userAuthDetails", {
        ...response.user,
      });

      router.push("/");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error?.message || "Login failed";
      showError("Login Failed", errorMessage);
      return false;
    }
  };

  // Watch for session changes - REMOVED auto-redirect to prevent loops
  useEffect(() => {
    console.log("Session status changed:", {
      status,
      isAuthenticated,
      isLoading,
      session,
    });

    // REMOVED: Auto-redirect that was causing loops
    // Let the login form handle redirects instead
    console.log("Session updated, waiting for manual redirect handling");
  }, [session, status, isAuthenticated, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center gap-4">
      {/* <Button
        variant="outline"
        className="w-16 h-16 rounded-2xl border-2 hover:bg-gray-50"
        onClick={() => handleCallProvider("facebook")}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <path
            d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
            fill="#1877F2"
          />
        </svg>
      </Button> */}
      <Button
        variant="outline"
        className="w-16 h-16 rounded-2xl border-2 hover:bg-gray-50"
        onClick={() => handleCallProvider("google")}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8"
          style={{ transform: "scale(0.8)" }}
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </Button>
      <Button
        variant="outline"
        className="w-16 h-16 rounded-2xl border-2 hover:bg-gray-50"
        onClick={() => handleCallProvider("apple")}
      >
        <svg viewBox="0 0 24 24" className="w-10 h-10">
          <path
            d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.07-.47-2.05-.48-3.18 0-1.42.61-2.16.44-3.04-.41C4.26 16.76 3.97 12.09 6.92 9.87c1.36-1.03 2.91-.74 3.89-.19.64.36 1.22.34 1.92 0 .88-.42 1.84-.91 3.11-.49 2.29.76 3.31 2.69 2.77 4.91-2.29.18-3.3 1.87-2.56 4.18zm-1.8-15.7c-1.21 1.07-2.88.83-3.58.61.04-1.77 1.49-2.88 3.22-3.19 1.26 1.36 1.55 2.73 1.36 2.58z"
            fill="#000000"
          />
        </svg>
      </Button>
    </div>
  );
}
