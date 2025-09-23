"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { setClientCookie, setLocalData } from "@/src/core/config/localStorage"
import authAxiosClient from "@/src/app/apis/auth/axios"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/src/store"
import { fetchUserProfile, fetchUserAddresses } from "@/src/store/slices/userSlice"

export default function QrMobileSessionPage() {
  const searchParams = useSearchParams()
  const refreshToken = searchParams?.get("refreshToken")
  const idpUsername = searchParams?.get("idpUsername")
  const router = useRouter()
  const { showSuccess, showError } = useNotificationUtils()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showManualLogin, setShowManualLogin] = useState(false)

  const processQRCode = useCallback(async () => {
    if (!refreshToken || !idpUsername) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Call the refresh token API directly with both parameters
      console.log('Calling refresh token API with:', { refreshToken, idpUsername });
      
      const response = await authAxiosClient.post('/auth/refresh-token', {
        refreshToken: refreshToken
      }, {
        params: {
          'idp-username': idpUsername
        }
      });

      console.log('Refresh token API response:', response.data);

      if (response.data?.status && response.data?.data?.accessToken) {
        // Successfully got access token, set cookies and log user in
        console.log('Setting cookies with:', response.data.data);
        
        setClientCookie("accessToken", response.data.data.accessToken, { path: "/" });
        if (response.data.data.refreshToken) {
          setClientCookie("refreshToken", response.data.data.refreshToken, { path: "/" });
        }
        if (response.data.data.idToken) {
          setClientCookie("idToken", response.data.data.idToken, { path: "/" });
        }
        
        // Set user auth details in localStorage
        if (response.data.data.user) {
          setLocalData("userAuthDetails", {
            ...response.data.data.user,
            userId: response.data.data.user.id,
          });
        }
        
        // Fetch user profile and addresses like regular login
        try {
          await dispatch(fetchUserProfile());
          await dispatch(fetchUserAddresses());
        } catch (fetchError) {
          console.error("Failed to fetch user data:", fetchError);
          // Continue with login even if fetch fails
        }
        
        setSuccess(true);
        showSuccess("Login Successful", "You have been automatically logged in via QR code!");
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error("No access token received from refresh API");
      }
    } catch (refreshError: any) {
      console.error("Refresh token API error:", refreshError);
      console.error("Error response:", refreshError.response?.data);
      console.error("Error status:", refreshError.response?.status);
      
      // If refresh token API fails, fall back to manual login
      setShowManualLogin(true);
      setError(`Failed to automatically login with QR code: ${refreshError.response?.data?.message || refreshError.message}. Please login manually to continue.`);
    } finally {
      setLoading(false)
    }
  }, [refreshToken, idpUsername, dispatch, router, showSuccess, showError])

  // Process QR code when component mounts - only once
  useEffect(() => {
    if (refreshToken && idpUsername && !success && !loading) {
      console.log('Starting QR code processing...');
      processQRCode();
    }
  }, [refreshToken, idpUsername, success, loading, processQRCode])

  const handleRetry = () => {
    setError(null)
    setShowManualLogin(false)
    processQRCode()
  }

  const handleManualLogin = () => {
    router.push("/auth?mode=login")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  if (!refreshToken || !idpUsername) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 px-6 py-8 bg-[var(--color-surface)] rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h2>
            <p className="text-gray-600 mb-6">The QR code link is missing required parameters (refreshToken or idpUsername).</p>
            <Button
              onClick={handleManualLogin}
              className="w-full h-12 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-medium"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 px-6 py-8 bg-[var(--color-surface)] rounded-2xl shadow-xl">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing QR Code</h2>
            <p className="text-gray-600">Please wait while we process your QR code login request...</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 px-6 py-8 bg-[var(--color-surface)] rounded-2xl shadow-xl">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Login Successful!</h2>
            <p className="text-gray-600 mb-6">
              You have been automatically logged in via QR code!
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the home page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (showManualLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 px-6 py-8 bg-[var(--color-surface)] rounded-2xl shadow-xl">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Detected</h2>
            <p className="text-gray-600 mb-6">
              We detected a QR code with a refresh token, but the current system requires additional user information to complete the login automatically.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This is a security feature to ensure proper user authentication. Please login manually to continue.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleManualLogin}
                className="w-full h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-medium"
              >
                Login Manually
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-[var(--color-primary)] text-gray-700 hover:text-[var(--color-primary)] font-medium"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 px-6 py-8 bg-[var(--color-surface)] rounded-2xl shadow-xl">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Processing Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-medium"
              >
                Try Again
              </Button>
              <Button
                onClick={handleManualLogin}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-[var(--color-primary)] text-gray-700 hover:text-[var(--color-primary)] font-medium"
              >
                Login Manually
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 px-6 py-8 bg-[var(--color-surface)] rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initializing...</h2>
          <p className="text-gray-600">Setting up QR code processing...</p>
        </div>
      </div>
    </div>
  )
}
