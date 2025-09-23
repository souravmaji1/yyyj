"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { getClientCookie, setClientCookie } from "@/src/core/config/localStorage"
import authAxiosClient from "@/src/app/apis/auth/axios"
import { useNotificationUtils } from "@/src/core/utils/notificationUtils"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import { isKioskInterface } from "@/src/core/utils";

export default function QrMobileLoginPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get("sessionId")
  const router = useRouter()
  const { showSuccess, showError } = useNotificationUtils()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [machineId, setMachineId] = useState("");
  const [machineIdError, setMachineIdError] = useState("");

  // Try to verify QR if already logged in
  useEffect(() => {
    const token = getClientCookie("accessToken")
    if (token && sessionId && !success) {
      verifyToken(token)
    }
    // eslint-disable-next-line
  }, [sessionId, success])

  // Function to verify QR session
  const verifyToken = async (token: string) => {
    try {
      setLoading(true)
      const res = await authAxiosClient.post(
        "/auth/qr/verify",
        { sessionId },
        { headers: { Authorization: "Bearer " + token } },
      )
      if (res.data.status) {
        setSuccess(true)
        showSuccess("QR Verified", "QR code verified! You can return to your desktop.")
      } else {
        alert("Verification failed: " + (res.data.message || "Failed to verify QR code"))
        showError("Verification Failed", res.data.message || "Failed to verify QR code")
      }
    } catch (err) {
      const errorMsg = err instanceof Error && err.message ? err.message : String(err)
      showError("Verification Failed", "Failed to verify QR code")
    } finally {
      setLoading(false)
    }
  }

  // Handle login form submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMachineIdError("");
    
    // Only validate machine ID for kiosk interfaces
    // if (isKioskInterface() && !machineId.trim()) {
    //   setMachineIdError("Please enter your kiosk machine ID");
    //   return;
    // }
    
    setLoading(true)
    try {
      const loginRes = await authAxiosClient.post(
        "/auth/login",
        {
          email,
          password,
          // ...(isKioskInterface() && machineId.trim() ? { macAddress: machineId.trim(), fromDevice: "machine" } : {})
        }
      )
      const loginData = loginRes.data
      const token = loginData.data?.token || loginData.data?.accessToken
      if (!token) {
        showError("Login Failed", "Login failed: " + (loginData.message || "No token received"))
        setLoading(false)
        return
      }
      setClientCookie("accessToken", token, { path: "/" })
      await verifyToken(token)
    } catch (err) {
      showError("Login Failed", "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (!sessionId) {
      return (
        <div className="w-full max-w-md space-y-6 px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-2xl shadow-xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Invalid QR Code</h2>
            <p className="text-sm sm:text-base text-gray-600">The QR code link is invalid or expired.</p>
          </div>
        </div>
      )
    }

    if (success) {
      return (
        <div className="w-full max-w-md space-y-6 px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-2xl shadow-xl mx-auto">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">QR Code Verified!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              You can now return to your desktop. The login will complete automatically.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="w-full h-10 sm:h-12 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
            >
              Go to Home
            </Button>
          </div>
        </div>
      )
    }

    const token = getClientCookie("accessToken")
    if (!token) {
      return (
        <div className="w-full max-w-md space-y-10 px-4 sm:px-6 py-2 sm:py-2 mt-[-10px]  rounded-2xl shadow-md  mx-auto ">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Login to Verify QR</h2>
            <p className="text-sm sm:text-base text-gray-600">Enter your credentials to verify the QR code</p>
          </div>

          {/* {sessionId &&  isKioskInterface() && (
            <Button
              className="w-full mb-4 h-10 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-[var(--color-secondary)] font-medium shadow-sm hover:shadow-md transition-all duration-150"
              type="button"
              onClick={() => router.push(`/auth/qr-mobile-signup?sessionId=${encodeURIComponent(sessionId)}`)}
            >
              Are you a new kiosk user?
            </Button>
          )} */}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
              />
            </div>

            <div className="space-y-1 sm:space-y-4 mb-4">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 pr-10 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 border-gray-200"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* {isKioskInterface() && (
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="machineId" className="text-gray-700 font-medium">
                  Enter your kiosk machine ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="machineId"
                  placeholder="Enter your kiosk machine ID"
                  type="text"
                  value={machineId}
                  onChange={e => setMachineId(e.target.value)}
                  className={`mt-1 h-10 sm:h-12 rounded-xl border-2 transition-all duration-200 focus:border-blue-500 hover:border-blue-300 focus-visible:ring-0 focus-visible:ring-offset-0 ${machineIdError ? 'border-red-500 focus:border-red-500' : 'border-gray-200'}`}
                />
                {machineIdError && <p className="text-red-500 text-sm mt-1">{machineIdError}</p>}
              </div>
            )} */}

            <Button
              type="submit"
              className="w-full mt-4 h-10 sm:h-12 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Login & Verify"}
            </Button>
          </form>

          {/* {sessionId && isKioskInterface() && (
            <Button
              className="w-full mt-4 h-10 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-[var(--color-secondary)] font-medium shadow-sm hover:shadow-md transition-all duration-150"
              type="button"
              onClick={() => router.push(`/auth/qr-mobile-signup?sessionId=${encodeURIComponent(sessionId)}`)}
            >
              Are you a new kiosk user?
            </Button>
          )} */}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="w-full max-w-md space-y-6 px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-2xl shadow-xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-secondary)] mx-auto mb-4"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Verifying QR Code</h2>
            <p className="text-sm sm:text-base text-gray-600">Please wait while we verify your QR code...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full max-w-md space-y-6 px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-2xl shadow-xl mx-auto">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-12 w-12 bg-[var(--color-secondary)] mx-auto mb-4"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Waiting for Verification</h2>
          <p className="text-sm sm:text-base text-gray-600">Please wait while we process your request...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-x-hidden">
      {/* Video Background - Now shown on mobile too */}
      <div className="w-full h-48 sm:h-[250px] lg:w-1/2 lg:h-auto bg-[#171a21] relative overflow-hidden">
        <div className="absolute inset-0 w-full h-ful ">
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
        {renderContent()}
      </div>
    </div>
  )
}

