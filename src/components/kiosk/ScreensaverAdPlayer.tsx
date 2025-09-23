"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Loader2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { AppDispatch, RootState } from '@/src/store';
import { fetchScreensaverAds } from '@/src/store/slices/adManagementSlice';

interface ScreensaverAdPlayerProps {
  machineId: string;
  onUserActivity: () => void;
  isVisible: boolean;
}

export default function ScreensaverAdPlayer({ 
  machineId, 
  onUserActivity, 
  isVisible 
}: ScreensaverAdPlayerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { screensaverAds, screensaverAdsLoading, screensaverAdsError } = useSelector(
    (state: RootState) => state.adManagement
  );

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [showReturnMessage, setShowReturnMessage] = useState(false);
  const [nextBatchAds, setNextBatchAds] = useState<any[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [isAutoplayInProgress, setIsAutoplayInProgress] = useState(false);
  const [currentAds, setCurrentAds] = useState<any[]>([]);
  const [isBatchComplete, setIsBatchComplete] = useState(false);
  const [isApiBlocked, setIsApiBlocked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const returnMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Constants for kiosk behavior
  const INACTIVITY_TIMEOUT = 30000; // 30 seconds to show screensaver

  // Enhanced autoplay function with multiple fallback strategies
  const attemptAutoplay = useCallback(async () => {
    if (!videoRef.current) {
      console.log('⚠️ Video ref not available, skipping autoplay');
      setIsAutoplayInProgress(false);
      return;
    }

    try {
      // Strategy 1: Direct play
      await videoRef.current.play();
      setIsPlaying(true);
      setIsAutoplayInProgress(false);
      console.log('✅ Direct autoplay successful');
    } catch (error) {
      console.log('⚠️ Direct autoplay failed, trying muted play...');
      
      try {
        // Strategy 2: Muted play (most browsers allow this)
        videoRef.current.muted = true;
        setIsMuted(true);
        await videoRef.current.play();
        setIsPlaying(true);
        setIsAutoplayInProgress(false);
        console.log('✅ Muted autoplay successful');
      } catch (mutedError) {
        console.log('⚠️ Muted autoplay failed, trying user interaction simulation...');
        
        // Strategy 3: Simulate user interaction
        if (videoRef.current) { // Double-check ref is still available
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                setIsAutoplayInProgress(false);
                console.log('✅ Simulated interaction autoplay successful');
              })
              .catch((simError) => {
                console.log('❌ All autoplay strategies failed:', simError);
                setIsPlaying(false);
                setIsAutoplayInProgress(false);
                
                // Show play button for manual start
                setTimeout(() => {
                  if (videoRef.current && !isPlaying) {
                    setShowReturnMessage(true);
                  }
                }, 2000);
              });
          }
        } else {
          setIsAutoplayInProgress(false);
        }
      }
    }
  }, [isPlaying]);

  // Function to start playing the next ad
  const startNextAd = useCallback(() => {
    if (isAutoplayInProgress) {
      console.log('⚠️ Autoplay already in progress, skipping...');
      return;
    }
    
    // Don't start next ad if current video is still playing
    if (isPlaying) {
      console.log('⚠️ Current video still playing, waiting for it to complete...');
      return;
    }
    
    console.log('🚀 Starting next ad playback...');
    setIsAutoplayInProgress(true);
    
    // Simple approach: just wait a bit for React to render, then try autoplay
    setTimeout(() => {
      if (videoRef.current) {
        console.log('✅ Video element found, attempting autoplay');
        attemptAutoplay();
      } else {
        console.log('⚠️ Video element still not available, will retry on video load event');
        setIsAutoplayInProgress(false); // Reset flag if video not available
      }
    }, 300); // Give React more time to render
  }, [attemptAutoplay, isAutoplayInProgress, isPlaying]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Start new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      console.log('🔄 Inactivity timeout reached, hiding screensaver...');
      
      // Pause video before hiding
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      // Just hide the screensaver, don't navigate away
      onUserActivity();
    }, INACTIVITY_TIMEOUT);
  }, [onUserActivity]);

  // Handle return to kiosk (separate from activity detection)
  const handleReturnToKiosk = useCallback(() => {
    // Pause the video when returning to kiosk
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    // First hide the screensaver, then redirect to home page
    console.log('🔘 Hide Screensaver button clicked, hiding screensaver and redirecting to home page...');
    onUserActivity();
    router.push('/');
  }, [router, onUserActivity]);

  // Fetch screensaver ads when component becomes visible
  useEffect(() => {
    if (isVisible && machineId && !screensaverAds) {
      dispatch(fetchScreensaverAds(machineId));
      
      // Show return message after 3 seconds
      returnMessageTimerRef.current = setTimeout(() => {
        setShowReturnMessage(true);
      }, 3000);
    }
  }, [isVisible, machineId, screensaverAds, dispatch]);

  // Initialize inactivity timer when component becomes visible
  useEffect(() => {
    // Don't start inactivity timer automatically - only start it for real user interactions
    // This prevents the timer from interfering with video playback
    
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Initialize current ads when screensaver ads are loaded
  useEffect(() => {
    if (screensaverAds && screensaverAds.length > 0) {
      console.log(`📺 New ads loaded: ${screensaverAds.length} advertisements`);
      
      // Only update current ads if we're not currently playing a video
      if (!isPlaying && !isAutoplayInProgress) {
        setCurrentAds(screensaverAds);
        setIsApiBlocked(true); // Block API calls for this batch
        
        // If this is a new batch (not the initial load), start playing
        if (cycleCount > 0) {
          setCurrentAdIndex(0);
          setCurrentTime(0);
          setIsBatchComplete(false); // Reset batch complete flag
          
          // Auto-play first ad of new batch
          setTimeout(() => {
            attemptAutoplay();
          }, 500);
        }
      } else {
        console.log('⚠️ Video currently playing, deferring ad update until video completes');
      }
    }
  }, [screensaverAds, cycleCount, attemptAutoplay, isPlaying, isAutoplayInProgress]);

  // Initialize currentAds with screensaverAds on first load
  useEffect(() => {
    if (screensaverAds && screensaverAds.length > 0 && currentAds.length === 0) {
      setCurrentAds(screensaverAds);
      setIsApiBlocked(true); // Block API calls for this initial batch
    }
  }, [screensaverAds, currentAds.length]);

  // Smart preloading: Start fetching next batch when we're halfway through current batch
  useEffect(() => {
    // Only preload if we have current ads, not preloading, not in autoplay, batch is not complete, and API is not blocked
    if (currentAds && currentAds.length > 0 && !isPreloading && !isAutoplayInProgress && !isBatchComplete && !isApiBlocked) {
      const halfwayPoint = Math.floor(currentAds.length / 2);
      
      // Only preload if we're actually halfway through and haven't already preloaded
      if (currentAdIndex >= halfwayPoint && nextBatchAds.length === 0 && !isPreloading) {
        console.log('🔄 Preloading next batch of ads...');
        setIsPreloading(true);
        
        // Fetch next batch in background
        dispatch(fetchScreensaverAds(machineId))
          .then((result) => {
            if (result.payload && Array.isArray(result.payload)) {
              setNextBatchAds(result.payload);
              console.log('✅ Next batch preloaded successfully');
            }
          })
          .catch((error) => {
            console.log('⚠️ Failed to preload next batch:', error);
          })
          .finally(() => {
            setIsPreloading(false);
          });
      }
    } else if (isApiBlocked) {
      console.log('🚫 API calls blocked - waiting for current batch to complete');
    }
  }, [currentAdIndex, currentAds, nextBatchAds, isPreloading, isAutoplayInProgress, isBatchComplete, isApiBlocked, machineId, dispatch]);

  // Handle video events
  const handleVideoLoad = () => {
    console.log('📹 Video loaded, duration:', videoRef.current?.duration);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Only attempt autoplay if no video is currently playing
      if (!isPlaying && !isAutoplayInProgress) {
        setTimeout(() => {
          console.log('🚀 Attempting autoplay after video load');
          if (videoRef.current && !isPlaying) {
            attemptAutoplay();
          }
        }, 100);
      } else {
        console.log('⚠️ Video already playing or autoplay in progress, skipping autoplay');
      }
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoEnd = () => {
    console.log('🎬 Video ended, current index:', currentAdIndex, 'total ads:', currentAds?.length);
    console.log('🎬 Screensaver should stay visible, playing next ad...');
    
    // Prevent multiple calls to this function
    if (isAutoplayInProgress || isBatchComplete) {
      console.log('⚠️ Autoplay in progress or batch complete, skipping video end handler');
      return;
    }
    
    if (currentAds && currentAds.length > 0) {
      const nextIndex = currentAdIndex + 1;
      
      // Check if we've completed all ads in current batch
      if (nextIndex >= currentAds.length) {
        // Completed current batch, switch to preloaded ads
        setCycleCount(prev => prev + 1);
        setIsBatchComplete(true); // Mark batch as complete
        setIsApiBlocked(false); // Unblock API calls for next batch
        console.log(`🔄 Completed batch ${cycleCount + 1}, switching to preloaded ads...`);
        
        // Switch to preloaded ads if available
        if (nextBatchAds.length > 0) {
          console.log('✅ Switching to preloaded batch');
          setCurrentAds(nextBatchAds);
          setNextBatchAds([]);
          setCurrentAdIndex(0);
          setCurrentTime(0);
          setIsBatchComplete(false); // Reset for new batch
          setIsApiBlocked(true); // Block API calls for this new batch
          
          // Start playing first ad of new batch
          setTimeout(() => {
            console.log('🚀 Starting first ad of new batch');
            startNextAd();
          }, 500); // Give more time for state update and video element to be ready
          
        } else {
          // Fallback: fetch new ads if preloading failed
          console.log('⚠️ No preloaded ads, fetching new batch...');
          setIsApiBlocked(true); // Block API calls for this new batch
          dispatch(fetchScreensaverAds(machineId));
          setCurrentAdIndex(0);
          setCurrentTime(0);
          setIsBatchComplete(false); // Reset for new batch
          
          // Start playing when new ads arrive
          setTimeout(() => {
            console.log('🚀 Starting first ad of fetched batch');
            startNextAd();
          }, 1000); // Give more time for API response and video element to be ready
        }
        
      } else {
        // Continue with next ad in current batch
        console.log(`▶️ Playing next ad: ${nextIndex + 1}/${currentAds.length}`);
        setCurrentAdIndex(nextIndex);
        setCurrentTime(0);
        
        // Start playing next ad in current batch
        setTimeout(() => {
          console.log('🚀 Starting next ad in current batch');
          startNextAd();
        }, 500); // Give more time for video element to be ready
      }
    } else {
      console.log('⚠️ No current ads available for next video');
    }
  };

  // Set up activity listeners
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    // Capture ALL possible user interactions including mouse movement
    const events = ['mousedown', 'mousemove', 'click', 'touchstart', 'touchmove', 'keydown', 'scroll', 'wheel'];
    
    const activityHandler = (event: Event) => {
      // User activity detected - hide screensaver and redirect to home page
      console.log('👆 User activity detected, hiding screensaver and redirecting to home page...');
      
      // Pause video immediately
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      // Clear all timers immediately
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (returnMessageTimerRef.current) {
        clearTimeout(returnMessageTimerRef.current);
      }
      
      // First hide the screensaver by calling the parent function
      onUserActivity();
      
      // Then redirect to home page
      router.push('/');
    };

    // Add comprehensive mouse movement detection
    const mouseMoveHandler = () => {
      console.log('🖱️ Mouse moved, hiding screensaver and redirecting to home page...');
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      // Clear timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (returnMessageTimerRef.current) {
        clearTimeout(returnMessageTimerRef.current);
      }
      
      // First hide the screensaver
      onUserActivity();
      
      // Then redirect
      router.push('/');
    };

    // Add touch movement detection for mobile
    const touchMoveHandler = () => {
      console.log('👆 Touch moved, hiding screensaver and redirecting to home page...');
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      // Clear timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (returnMessageTimerRef.current) {
        clearTimeout(returnMessageTimerRef.current);
      }
      
      // First hide the screensaver
      onUserActivity();
      
      // Then redirect
      router.push('/');
    };

    // Global click handler for any interaction anywhere
    const globalClickHandler = (event: Event) => {
      // Don't redirect for video control clicks
      if ((event.target as Element)?.closest('.video-controls')) {
        return;
      }
      
      console.log('🌐 Global click detected, hiding screensaver and redirecting to home page...');
      
      // Pause video
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      // Clear timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (returnMessageTimerRef.current) {
        clearTimeout(returnMessageTimerRef.current);
      }
      
      // First hide the screensaver
      onUserActivity();
      
      // Then redirect
      router.push('/');
    };

    // Add all event listeners
    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });

    // Add specific mouse and touch movement listeners
    document.addEventListener('mousemove', mouseMoveHandler, { passive: true });
    document.addEventListener('touchmove', touchMoveHandler, { passive: true });
    
    // Add global click handler
    document.addEventListener('click', globalClickHandler, { passive: true });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler);
      });

      // Add specific mouse and touch movement listeners
      document.addEventListener('mousemove', mouseMoveHandler, { passive: true });
      document.addEventListener('touchmove', touchMoveHandler, { passive: true });
      
      // Add global click handler
      document.addEventListener('click', globalClickHandler, { passive: true });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, activityHandler);
        });
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('touchmove', touchMoveHandler);
        document.removeEventListener('click', globalClickHandler);
      };
    }
    
    // Return empty cleanup function when not visible
    return () => {};
  }, [isVisible, router, onUserActivity]);

  // Auto-play when ads are loaded
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (currentAds && currentAds.length > 0 && isVisible) {
      timer = setTimeout(() => {
        startNextAd();
      }, 500);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [currentAds, isVisible, startNextAd]);

  // Monitor currentAdIndex changes to ensure proper video switching
  useEffect(() => {
    console.log('🔄 Ad index changed to:', currentAdIndex, 'Current ad:', currentAds[currentAdIndex]);
    
    if (currentAds[currentAdIndex]) {
      // Reset video state for new ad
      setCurrentTime(0);
      setDuration(0);
      
      // Don't call startNextAd here - let the video load event handle it
      // This prevents multiple autoplay attempts
    }
  }, [currentAdIndex, currentAds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (returnMessageTimerRef.current) {
        clearTimeout(returnMessageTimerRef.current);
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  if (screensaverAdsLoading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Card className="bg-[var(--color-bg)] border-slate-700/50 max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
            <p className="text-white text-lg">Loading screensaver ads...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (screensaverAdsError) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Card className="bg-[var(--color-bg)] border-slate-700/50 max-w-md">
          <CardContent className="p-8 text-center">
            <p className="red-400 text-lg mb-4">Failed to load screensaver ads</p>
            <p className="text-gray-400 text-sm mb-6">{screensaverAdsError}</p>
            <Button 
              onClick={() => dispatch(fetchScreensaverAds(machineId))}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:from-[#0298E8] hover:to-[#2726A0]"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!screensaverAds || screensaverAds.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Card className="bg-[var(--color-bg)] border-slate-700/50 max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-white text-lg mb-4">No screensaver ads available</p>
            <p className="text-gray-400 text-sm mb-6">Touch anywhere to hide screensaver</p>
            <Button 
              onClick={() => {
                console.log('🔘 No ads button clicked, hiding screensaver and redirecting to home page...');
                onUserActivity();
                router.push('/');
              }}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:from-[#0298E8] hover:to-[#2726A0]"
            >
              Hide Screensaver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAd = currentAds && currentAds.length > 0 ? currentAds[currentAdIndex] : null;

  // Don't render video if we don't have a valid current ad
  if (!currentAd || !currentAd.videoUrl) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Card className="bg-[var(--color-bg)] border-slate-700/50 max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
            <p className="text-white text-lg">Preparing advertisements...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Player */}
      <div className="relative w-full h-full">
        <video
          key={`${currentAdIndex}-${currentAd?.id || 'unknown'}`}
          ref={videoRef}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleVideoLoad}
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => console.error('❌ Video error:', e)}
          muted={isMuted}
          playsInline
          autoPlay
          preload="auto"
          loop={false}
        >
          {currentAd && currentAd.videoUrl && (
            <source src={currentAd.videoUrl} type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </video>

        {/* Inactivity Warning Overlay */}
        {/* Removed - no warning needed, just continuous ad play */}

        {/* Loading Overlay for New Ads */}
        {/* Removed - seamless preloading without loading screens */}

        {/* Minimal Video Controls Overlay - Hidden by default for kiosk */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 hover:opacity-100 transition-opacity duration-300 video-controls">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) {
                      videoRef.current.pause();
                    } else {
                      startNextAd();
                    }
                  }
                }}
                className="text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[#0298E8] hover:to-[#2726A0]"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="text-white hover:bg-[var(--color-primary-50)]/20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            <div className="text-sm">
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </div>
            
            {/* Cycle Indicator */}
            <div className="text-xs text-blue-300 bg-black/50 px-2 py-1 rounded">
              Cycle {cycleCount + 1} • Ad {currentAdIndex + 1}/{currentAds.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 h-1 mt-4 rounded-full overflow-hidden">
            <div 
              className="bg-[var(--color-primary)] h-full transition-all duration-100"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Ad Info Overlay - Minimal for kiosk */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6">
          <div className="text-white">
            <h2 className="text-xl font-bold mb-1">{currentAd.title}</h2>
            <p className="text-gray-300 text-sm">{currentAd.description}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
              <span>Ad {currentAdIndex + 1} of {currentAds.length}</span>
              <span>•</span>
              <span>{Math.floor(duration)}s</span>
            </div>
          </div>
        </div>

        {/* Return to Kiosk Button - Always visible */}
        <div className="absolute top-6 right-6">
          <Button
            onClick={handleReturnToKiosk}
            variant="outline"
            className="border-[var(--color-primary)]/30 text-white hover:bg-[var(--color-primary-50)]/20 bg-black/50 backdrop-blur-sm"
          >
            Hide Screensaver
          </Button>
          
          {/* Show helpful message after 3 seconds */}
          {showReturnMessage && (
            <div className="mt-3 text-center">
              <p className="text-white/80 text-sm bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                Touch anywhere or use the button above to hide screensaver
              </p>
            </div>
          )}
        </div>

        {/* Inactivity Countdown Indicator - Subtle */}
        {/* Removed - no warning needed, just continuous ad play */}
      </div>
    </div>
  );
}
