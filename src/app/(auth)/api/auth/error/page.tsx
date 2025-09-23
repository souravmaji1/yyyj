// app/auth/error/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { useEffect } from "react";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const router = useRouter();
  const error = params?.get("error");
  const _provider = params?.get("provider");

  useEffect(() => {
    // If it's a timeout error, automatically retry after 3 seconds
    if (error?.includes("ETIMEDOUT") || error?.includes("timeout")) {
      const timer = setTimeout(() => {
        router.push("/auth?mode=login");
      }, 3000);
      return () => clearTimeout(timer);
    }
    // Return undefined for the else case to satisfy TypeScript
    return undefined;
  }, [error, router]);

  const getErrorMessage = () => {
    if (error?.includes("ETIMEDOUT") || error?.includes("timeout")) {
      return "Connection timed out. Please check your internet connection and try again.";
    }
    if (error?.includes("access_denied")) {
      return "Access was denied. Please try again and make sure to grant the necessary permissions.";
    }
    return "An error occurred during authentication. Please try again.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-[var(--color-surface)] rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">{getErrorMessage()}</p>
          
          {error?.includes("ETIMEDOUT") || error?.includes("timeout") ? (
            <div className="animate-pulse text-blue-600 mb-6">
              Retrying automatically in a few seconds...
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/auth?mode=login")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
