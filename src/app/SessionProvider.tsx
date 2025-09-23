"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { setClientCookie, setLocalData, getClientCookie } from "@/src/core/config/localStorage";

type SessionProviderProps = {
  children: React.ReactNode;
  session?: any;
};

const SessionContext = createContext<null | any>(null);

export function CustomSessionProvider({
  session: initialSession = null,
  children,
}: SessionProviderProps) {
  const [session, setSession] = useState<any>(initialSession);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const { data: nextAuthSession, status } = useSession();

  // Initialize session from cookies if available
  useEffect(() => {
    if (isInitialized) return;

    const accessToken = getClientCookie("accessToken");
    const userDetails = localStorage.getItem("userAuthDetails");
    
    if (accessToken && userDetails) {
      try {
        const parsedUserDetails = JSON.parse(userDetails);
        const sessionData = {
          ...parsedUserDetails,
          accessToken,
          refreshToken: getClientCookie("refreshToken"),
          idToken: getClientCookie("idToken"),
        };
        console.log("🔍 Initializing session from storage:", sessionData);
        setSession(sessionData);
      } catch (error) {
        console.error("❌ Error parsing user details:", error);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  // Handle NextAuth session changes - FIXED VERSION
  useEffect(() => {
    console.log("🔍 NextAuth Session Status:", status);
    console.log("🔍 NextAuth Session Data:", nextAuthSession);
    console.log("🔍 Current Session State:", session);

    if (status === "authenticated" && nextAuthSession) {
      console.log("✅ Setting session from NextAuth");
      
      // Create session data with all tokens
      const sessionData = {
        ...nextAuthSession,
        accessToken: nextAuthSession.accessToken,
        refreshToken: nextAuthSession.refreshToken,
        idToken: nextAuthSession.idToken,
        user: nextAuthSession.user,
        provider: nextAuthSession.provider,
      };
      
      // Update local state
      setSession(sessionData);
      
      // Store the session data in cookies and localStorage
      const expirySeconds = 30 * 24 * 60 * 60; // 30 days
      
      try {
        // Store tokens in cookies
        if (nextAuthSession.accessToken) {
          setClientCookie("accessToken", nextAuthSession.accessToken, {
            path: "/",
            maxAge: expirySeconds,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }
        
        if (nextAuthSession.refreshToken) {
          setClientCookie("refreshToken", nextAuthSession.refreshToken, {
            path: "/",
            maxAge: expirySeconds,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }
        
        if (nextAuthSession.idToken) {
          setClientCookie("idToken", nextAuthSession.idToken, {
            path: "/",
            maxAge: expirySeconds,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }
        
        // Store user details in localStorage
        if (nextAuthSession.user) {
          setLocalData("userAuthDetails", {
            ...nextAuthSession.user,
            accessToken: nextAuthSession.accessToken,
            idToken: nextAuthSession.idToken,
            refreshToken: nextAuthSession.refreshToken,
            provider: nextAuthSession.provider,
          });
        }
        
        console.log("✅ Session established and stored successfully");
        
      } catch (error) {
        console.error("❌ Error storing session data:", error);
      }
      
    } else if (status === "unauthenticated") {
      console.log("🔍 NextAuth status is unauthenticated");
      
      // IMPORTANT: Don't immediately clear session if we have stored tokens
      const accessToken = getClientCookie("accessToken");
      const refreshToken = getClientCookie("refreshToken");
      const userDetails = localStorage.getItem("userAuthDetails");
      
      if (accessToken && refreshToken && userDetails) {
        console.log("✅ Found stored tokens, keeping session alive");
        // Keep the existing session from storage
        return;
      }
      
      // Only clear if we truly have no stored data
      if (!accessToken && !refreshToken && !userDetails) {
        console.log("❌ No stored tokens found, clearing session");
        setSession(null);
        
        // Clear all stored data
        try {
          setClientCookie("accessToken", "", { path: "/", maxAge: 0 });
          setClientCookie("refreshToken", "", { path: "/", maxAge: 0 });
          setClientCookie("idToken", "", { path: "/", maxAge: 0 });
          localStorage.removeItem("userAuthDetails");
        } catch (error) {
          console.error("❌ Error clearing stored data:", error);
        }
      }
    }
  }, [nextAuthSession, status]);

  // Check if we have a valid session - FIXED LOGIC
  const isAuthenticated = Boolean(
    session?.accessToken || 
    (status === "authenticated" && nextAuthSession?.accessToken)
  );

  // Don't show loading if we have a stored session
  const isLoading = !isInitialized && status === "loading";

  console.log("🔍 SessionProvider State:", {
    hasSession: !!session,
    hasNextAuthSession: !!nextAuthSession,
    status,
    isAuthenticated,
    isLoading
  });

  return (
    <SessionContext.Provider value={{ 
      session: session || nextAuthSession, // Use NextAuth session as fallback
      status: status,
      isAuthenticated,
      isLoading
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useCustomSession = () => useContext(SessionContext);
