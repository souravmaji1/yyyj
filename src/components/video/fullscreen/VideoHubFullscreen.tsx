"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletBalance } from './WalletBalance';
import { AutoplayControl } from './AutoplayControl';
import { CoinParticles } from './CoinParticles';
import { FullscreenRoot, FullscreenProvider } from './FullscreenRoot';
import { NextUpOverlay, useNextUpCountdown } from './NextUpOverlay';
import { AIAssistantDock, useAIAssistant } from './AIAssistantDock';
import { FS } from '@/src/utils/fullscreen';

interface VideoTopBarProps {
  onBack: () => void;
  isVideoAlreadyWatched?: boolean;
  isAutoPlayEnabled: boolean;
  onToggleAutoPlay: () => void;
  hasNextVideo: boolean;
  isVisible: boolean;
}

const VideoTopBar: React.FC<VideoTopBarProps> = ({ 
  onBack, 
  isVideoAlreadyWatched,
  isAutoPlayEnabled,
  onToggleAutoPlay,
  hasNextVideo,
  isVisible
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent"
        >
          <div className="flex items-center justify-between">
            {/* Left side - Back Button and AutoPlay */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={onBack}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors px-4 py-2 rounded-full bg-black/50 hover:bg-black/70"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </motion.button>

              {/* AutoPlay Control next to Back button */}
              <AutoplayControl
                isEnabled={isAutoPlayEnabled}
                onToggle={onToggleAutoPlay}
                hasNextVideo={hasNextVideo}
                className="shadow-lg"
              />
            </div>

            {/* Right side content */}
            <div className="flex items-center gap-3">
              {/* Already Watched Indicator */}
              {isVideoAlreadyWatched && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Already Watched
                </motion.div>
              )}

              {/* Wallet Balance */}
              <WalletBalance />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface VideoHubFullscreenProps {
  isOpen: boolean;
  videoId: string | null;
  onClose: () => void;
  children: React.ReactNode;
  isAutoPlayEnabled: boolean;
  onToggleAutoPlay: () => void;
  hasNextVideo: boolean;
  isVideoAlreadyWatched?: boolean;
  onRewardEarned?: (amount: number) => void;
}

export const VideoHubFullscreen: React.FC<VideoHubFullscreenProps> = ({
  isOpen,
  videoId,
  onClose,
  children,
  isAutoPlayEnabled,
  onToggleAutoPlay,
  hasNextVideo,
  isVideoAlreadyWatched = false,
  onRewardEarned
}) => {
  const walletRef = useRef<{ animateAdd: (delta: number) => Promise<void> }>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [autoplayRect, setAutoplayRect] = useState<DOMRect | null>(null);
  const [walletRect, setWalletRect] = useState<DOMRect | null>(null);
  const autoplayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Netflix-like UI visibility state
  const [isUIVisible, setIsUIVisible] = useState(true);
  const mouseActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Next-up countdown
  const nextUpCountdown = useNextUpCountdown(10, () => {
    // Auto-play next video
    console.log('Auto-playing next video...');
  });
  
  // AI Assistant
  const aiAssistant = useAIAssistant();

  // Handle fullscreen changes
  useEffect(() => {
    const cleanup = FS.onChange(() => {
      const isActive = FS.isActive();
      setIsFullscreen(isActive);
      
      // If exiting fullscreen, also close the video hub
      if (!isActive && isOpen) {
        onClose();
      }
    });
    
    return cleanup;
  }, [isOpen, onClose]);

  // Enter fullscreen when component opens - delayed to ensure user gesture
  useEffect(() => {
    if (isOpen && videoContainerRef.current && FS.isSupported()) {
      // Add a small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        if (videoContainerRef.current) {
          FS.enter(videoContainerRef.current).catch((error) => {
            console.warn('Fullscreen request failed (user gesture required):', error);
            // Fullscreen failed but component still works as overlay
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [isOpen]);

  // Exit fullscreen when component closes
  useEffect(() => {
    if (!isOpen && isFullscreen) {
      FS.exit().catch(console.warn);
    }
  }, [isOpen, isFullscreen]);
    
  // Mouse activity detection for Netflix-like behavior
  const handleMouseActivity = useCallback(() => {
    setIsUIVisible(true);
    
    // Clear existing timeout
    if (mouseActivityTimeoutRef.current) {
      clearTimeout(mouseActivityTimeoutRef.current);
    }
    
    // Set new timeout to hide UI after 5 seconds of inactivity (increased from 3s)
    mouseActivityTimeoutRef.current = setTimeout(() => {
      setIsUIVisible(false);
    }, 5000);
  }, []);

  // Force UI visibility when entering fullscreen to ensure controls are visible initially
  useEffect(() => {
    if (isFullscreen) {
      handleMouseActivity();
    }
  }, [isFullscreen, handleMouseActivity]);

  // Setup mouse activity listeners - attach to correct element based on fullscreen state
  useEffect(() => {
    if (!isOpen) return;

    // Use videoContainerRef when in fullscreen mode, containerRef otherwise
    const targetElement = isFullscreen ? videoContainerRef.current : containerRef.current;
    if (!targetElement) return;

    const events = ['mousemove', 'mouseenter', 'click', 'keydown', 'touchstart', 'touchmove'];
    
    events.forEach(event => {
      targetElement.addEventListener(event, handleMouseActivity, { passive: true });
    });

    // Initial timeout
    handleMouseActivity();

    return () => {
      events.forEach(event => {
        targetElement.removeEventListener(event, handleMouseActivity);
      });
      
      if (mouseActivityTimeoutRef.current) {
        clearTimeout(mouseActivityTimeoutRef.current);
      }
    };
  }, [isOpen, isFullscreen, handleMouseActivity]); // Added isFullscreen dependency

  // Enhanced keyboard shortcuts for Netflix-like experience
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          if (aiAssistant.isOpen) {
            aiAssistant.toggle(false);
          } else if (nextUpCountdown.isActive) {
            nextUpCountdown.stop();
          } else {
            onClose();
          }
          break;
        case ' ':
        case 'k':
          event.preventDefault();
          setIsVideoPlaying(prev => !prev);
          // Trigger play/pause on video element
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          if (videoContainerRef.current) {
            FS.toggle(videoContainerRef.current);
          }
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          // Trigger mute/unmute
          break;
        case 'c':
        case 'C':
          event.preventDefault();
          // Toggle captions
          break;
        case 'ArrowLeft':
          event.preventDefault();
          // Seek backward 10s
          break;
        case 'ArrowRight':
          event.preventDefault();
          // Seek forward 10s
          break;
        case 'ArrowUp':
          event.preventDefault();
          // Volume up
          break;
        case 'ArrowDown':
          event.preventDefault();
          // Volume down
          break;
        case 'a':
        case 'A':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            aiAssistant.toggle();
          }
          break;
        case 'n':
        case 'N':
          if (hasNextVideo) {
            event.preventDefault();
            nextUpCountdown.start(10);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }

    return () => {
      // No cleanup needed when not open
    };
  }, [isOpen, onClose, hasNextVideo, aiAssistant, nextUpCountdown]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Handle reward animation with fullscreen support
  const handleRewardAnimation = async (rewardAmount: number) => {
    if (!walletRef.current) return;

    // Temporarily ensure UI is visible for animation positioning
    const wasUIVisible = isUIVisible;
    if (!wasUIVisible) {
      setIsUIVisible(true);
    }

    // Wait a frame to ensure DOM updates with visible UI
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Get current element positions
    // If in fullscreen, look within the fullscreen container
    const searchRoot = isFullscreen ? videoContainerRef.current : document;
    const autoplayElement = searchRoot?.querySelector('[aria-label*="AutoPlay"]');
    const walletElement = searchRoot?.querySelector('[aria-live="polite"]')?.closest('div');
    
    if (autoplayElement && walletElement) {
      setAutoplayRect(autoplayElement.getBoundingClientRect());
      setWalletRect(walletElement.getBoundingClientRect());
      
      // Start coin animation
      setShowCoinAnimation(true);
      
      // Trigger wallet balance animation immediately for optimistic UI
      try {
        await walletRef.current.animateAdd(rewardAmount);
      } catch (error) {
        console.error('Wallet animation failed:', error);
      }
    } else {
      // Fallback: If elements not found, still trigger wallet animation
      console.warn('Could not find DOM elements for coin animation, using fallback');
      try {
        await walletRef.current.animateAdd(rewardAmount);
      } catch (error) {
        console.error('Wallet animation failed:', error);
      }
    }

    // Restore original UI visibility state after a delay
    if (!wasUIVisible) {
      setTimeout(() => {
        setIsUIVisible(false);
      }, 4000); // Keep UI visible for 4 seconds to show the full animation
    }

    // Call the external handler if provided
    if (onRewardEarned) {
      onRewardEarned(rewardAmount);
    }
  };

  const handleCoinAnimationComplete = () => {
    setShowCoinAnimation(false);
    setAutoplayRect(null);
    setWalletRect(null);
  };

  // Listen for reward events from the video player
  // This ensures animations are triggered regardless of mouse activity or UI visibility
  useEffect(() => {
    const handleRewardEvent = (event: CustomEvent) => {
      const rewardAmount = event.detail.rewardAmount;
      if (rewardAmount > 0) {
        console.log('🎉 Reward earned event received:', rewardAmount, 'XUT');
        handleRewardAnimation(rewardAmount);
      }
    };

    window.addEventListener('rewardEarned', handleRewardEvent as EventListener);
    
    return () => {
      window.removeEventListener('rewardEarned', handleRewardEvent as EventListener);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black cursor-none"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          cursor: isUIVisible ? 'default' : 'none'
        }}
      >
        {/* Video Container - this becomes the fullscreen element */}
        <div ref={videoContainerRef} className="w-full h-full relative">
          {/* Fullscreen Provider wraps everything */}
          <FullscreenProvider videoContainerRef={videoContainerRef} isActive={isFullscreen}>
            
            {/* Top Bar with Back button and AutoPlay control */}
            <VideoTopBar 
              onBack={onClose} 
              isVideoAlreadyWatched={isVideoAlreadyWatched}
              isAutoPlayEnabled={isAutoPlayEnabled}
              onToggleAutoPlay={onToggleAutoPlay}
              hasNextVideo={hasNextVideo}
              isVisible={isUIVisible}
            />

            {/* Video Player Area */}
            <div className="w-full h-full">
              {children}
            </div>

            {/* Fullscreen Overlays Portal */}
            <FullscreenRoot videoContainerRef={videoContainerRef} isActive={isFullscreen}>
              
              {/* Next-Up Countdown Overlay */}
              <NextUpOverlay
                isVisible={nextUpCountdown.isActive && hasNextVideo}
                nextVideo={{
                  id: 'next-video-id',
                  title: 'Next Video Title',
                  thumbnail: '/api/placeholder/160/120'
                }}
                countdown={nextUpCountdown.countdown}
                onPlayNow={() => {
                  nextUpCountdown.stop();
                  console.log('Playing next video immediately');
                }}
                onCancel={() => nextUpCountdown.stop()}
                isPaused={nextUpCountdown.isPaused}
              />

              {/* AI Assistant Dock */}
              <AIAssistantDock
                isOpen={aiAssistant.isOpen}
                onToggle={aiAssistant.toggle}
                isVideoPlaying={isVideoPlaying}
                avoidSubtitleRegion={true}
              />

              {/* Coin Animation for Rewards - render in fullscreen context */}
              <CoinParticles
                isActive={showCoinAnimation}
                startRect={autoplayRect}
                endRect={walletRect}
                count={12}
                onComplete={handleCoinAnimationComplete}
              />

            </FullscreenRoot>

          </FullscreenProvider>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};