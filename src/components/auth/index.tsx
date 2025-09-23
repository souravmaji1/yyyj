"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { AuthForm } from "./authform";
import "./auth.mobile.css";


export default function AuthPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mode = searchParams?.get("mode");

    useEffect(() => {
        // REMOVED: Forced redirect that was causing loops
        // Users can now access auth page without being forced to login mode
        
        // Only set default mode if none is specified, but don't force redirect
        if (!mode) {
            // Just update the URL without forcing navigation
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('mode', 'login');
            window.history.replaceState({}, '', newUrl.toString());
        }
    }, [mode]);

    return (
        <div className="flex min-h-screen w-full overflow-x-hidden auth-mobile-fix">
            <div className="hidden w-1/2 bg-[#171a21] lg:block relative overflow-hidden auth-video-section">
                <div className="absolute inset-0 w-full h-full">
                    <video
                        src="/videos/welcome.mp4"
                        autoPlay
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-contain"
                    />
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-2 bg-white overflow-hidden max-w-full auth-container">
                <AuthForm mode={mode || "login"} />
            </div>
        </div>
    );
}