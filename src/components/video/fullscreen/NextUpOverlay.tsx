"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useFullscreen } from "./FullscreenRoot";

interface NextUpOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  
  /** Next video information */
  nextVideo: {
    id: string;
    title: string;
    thumbnail: string;
    duration?: string;
  } | null;
  
  /** Countdown time in seconds */
  countdown: number;
  
  /** Called when user clicks play now */
  onPlayNow: () => void;
  
  /** Called when user cancels autoplay */
  onCancel: () => void;
  
  /** Whether countdown is paused (e.g., on hover) */
  isPaused?: boolean;
  
  /** Override container for portaling */
  portalContainer?: HTMLElement | null;
}

export function NextUpOverlay({
  isVisible,
  nextVideo,
  countdown,
  onPlayNow,
  onCancel,
  isPaused = false,
  portalContainer
}: NextUpOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fullscreen = useFullscreen();
  
  // Determine container: custom > fullscreen > body
  const container = portalContainer || 
    (fullscreen.isActive ? fullscreen.container : null) || 
    (typeof window !== "undefined" ? document.body : null);

  // Don't render if no next video or container
  if (!isVisible || !nextVideo || !container) {
    return null;
  }

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          fixed bottom-4 right-4 ${fullscreen.isActive ? 'fs-z-popups' : 'z-50'}
          mb-[env(safe-area-inset-bottom)] mr-[env(safe-area-inset-right)]
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`
          ${fullscreen.isActive ? 'fs-glass' : 'bg-black/80 backdrop-blur-sm border border-white/10'}
          rounded-lg p-4 max-w-sm text-white shadow-2xl
        `}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium opacity-90">Next up</span>
            <button
              onClick={onCancel}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Cancel autoplay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video Info */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <img
                src={nextVideo.thumbnail}
                alt=""
                className="w-16 h-12 rounded object-cover"
              />
              {nextVideo.duration && (
                <span className="absolute bottom-1 right-1 text-xs bg-black/80 px-1 rounded">
                  {nextVideo.duration}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 leading-snug">
                {nextVideo.title}
              </h4>
            </div>
          </div>

          {/* Countdown and Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">
              Playing in{" "}
              <span className="font-mono font-semibold">
                {isPaused || isHovered ? "∞" : countdown}s
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm rounded-md border border-white/20 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onPlayNow}
                className="px-3 py-1.5 text-sm rounded-md bg-white text-black hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Play now
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {!isPaused && !isHovered && (
            <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ 
                  duration: countdown, 
                  ease: "linear",
                  delay: 0.1 
                }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, container);
}

/**
 * Hook to manage next-up countdown logic
 */
export function useNextUpCountdown(
  initialCountdown: number = 10,
  onComplete?: () => void
) {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start countdown
  const start = (seconds: number = initialCountdown) => {
    setCountdown(seconds);
    setIsActive(true);
    setIsPaused(false);
  };

  // Stop countdown
  const stop = () => {
    setIsActive(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Pause/resume countdown
  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  // Handle countdown logic
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsActive(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    countdown,
    isActive,
    isPaused,
    start,
    stop,
    pause,
    resume
  };
}