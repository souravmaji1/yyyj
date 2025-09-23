"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IVXStoreProvider } from "@/state/IVXStoreProvider";
import { IVXVideoAttach } from "@/components/ivx/video/IVXVideoAttach";
import { CategoryCarousel } from "@/src/components/video/category-carousel";
import { SearchBar } from "@/src/components/video/search-bar";
import { ShortsRow } from "@/src/components/video/shorts-row";
import { PlayEarnBanner } from "@/src/components/video/play-earn-banner";
import { VideoGrid } from "@/src/components/video/video-grid";
import authAxiosClient, { paymentAxiosClient } from "@/src/app/apis/auth/axios";
import { getLocalData, getClientCookie } from "@/src/core/config/localStorage";
import { useRewardPerVideo } from "@/src/hooks/useRewardPerVideo";
import { useVideoQueue, VideoData } from "@/src/hooks/useVideoQueue";
import { UpNextCountdown } from "@/src/components/video/up-next-countdown";
import { VideoHubFullscreen } from "@/src/components/video/fullscreen";
import fallbackData from "@/src/data/youtubeFallback.json";

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

type Channel = { id: string; name: string };

const CHANNELS: Channel[] = [
  {
    id: "UCveoU1itJ3ebR407GqOHF-g",
    name: "IntelliVerse TechX",
  },
  {
    id: "UCnLlEM4afVxkQMaS9GQk7oQ",
    name: "Health X",
  },
  {
    id: "UCu_yvCOjtt5OPSC6NKVB6kw",
    name: "Autocriod",
  },
  {
    id: "UCWs5zf-UMq-zhJMmKYnnDrA",
    name: "PlayX",
  },
  {
    id: "UCNN0HSSPL_89KYz0M3XSiCg",
    name: "Luxury Vibes",
  },
];

// Utility functions
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] || "0");
  const minutes = parseInt(match?.[2] || "0");
  const seconds = parseInt(match?.[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

// Check if user is authenticated
function isUserAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  
  const accessToken = getClientCookie("accessToken");
  const nextAuthToken = getClientCookie("next-auth.session-token");
  const userAuthDetails = getLocalData("userAuthDetails");
  
  return !!(accessToken || nextAuthToken || userAuthDetails);
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] || "0");
  const minutes = parseInt(match?.[2] || "0");
  const seconds = parseInt(match?.[3] || "0");
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatViews(views: string): string {
  const n = Number(views);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
}

// Anti-cheat types
interface AntiCheatFlags {
  seekDetected: boolean;
  speedChanged: boolean;
  tabSwitched: boolean;
  refreshDetected: boolean;
  pauseDetected: boolean;
}

// Confirmation toast types
interface ConfirmationToast {
  id: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Anti-cheat warning types
interface AntiCheatWarning {
  id: string;
  type: 'seek' | 'speed' | 'tab' | 'refresh' | 'pause';
  title: string;
  message: string;
  primaryLabel: string; // primary action (keep watching & earn)
  secondaryLabel: string; // secondary action (proceed anyway)
  onPrimary: () => void;
  onSecondary: () => void;
}

// VideoData interface is now imported from useVideoQueue hook

export default function VideoHub() {
  // ==================== HOOKS ====================
  const router = useRouter();
  const { rewardPerVideo } = useRewardPerVideo();
  const {
    queueState,
    isTransitioning,
    showCountdown,
    countdown,
    initializeQueues,
    setCurrentVideo,
    getNextVideo,
    startAutoPlayCountdown,
    cancelAutoPlayCountdown,
    playNextVideo,
    skipToNext,
    hasNextVideo,
    getCurrentVideoInfo,
    toggleAutoPlay
  } = useVideoQueue();

  // Debug: Log when rewardPerVideo changes
  useEffect(() => {
    console.log('🔄 rewardPerVideo changed to:', rewardPerVideo, 'XUT');
  }, [rewardPerVideo]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isUserAuthenticated();
      setIsAuthenticated(authenticated);
      console.log('🔒 Authentication status:', authenticated);
    };
    
    checkAuth();
    
    // Re-check authentication status when storage changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // State management
  const [selectedChannel, setSelectedChannel] = useState<Channel>(CHANNELS[0]!);
  const [channelInfo, setChannelInfo] = useState<any[]>([]);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [shorts, setShorts] = useState<VideoData[]>([]);
  const [longs, setLongs] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(8);
  const [showCountLong, setShowCountLong] = useState(8);
  const [modalOpen, setModalOpen] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [youTubeAPIReady, setYouTubeAPIReady] = useState(false);
  const [functionsReady, setFunctionsReady] = useState(true);
  const [showVideoDetails, setShowVideoDetails] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error' | 'info', message: string } | null>(null);
  const [confirmationToast, setConfirmationToast] = useState<ConfirmationToast | null>(null);
  const [antiCheatWarning, setAntiCheatWarning] = useState<AntiCheatWarning | null>(null);
  const [isVideoAlreadyWatched, setIsVideoAlreadyWatched] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Auto-play state (simplified)

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return () => {}; // Return empty cleanup function when no timer is set
  }, [toastMessage]);

  // Auto-hide video details after 4 seconds when modal opens
  useEffect(() => {
    if (modalOpen) {
      setShowVideoDetails(true); // Show details initially
      const timer = setTimeout(() => {
        setShowVideoDetails(false);
      }, 4000); // Hide after 4 seconds

      return () => clearTimeout(timer);
    }
    return () => {}; // Return empty cleanup function when modal is not open
  }, [modalOpen]);

  // Anti-cheat state
  const [antiCheatFlags, setAntiCheatFlags] = useState<AntiCheatFlags>({
    seekDetected: false,
    speedChanged: false,
    tabSwitched: false,
    refreshDetected: false,
    pauseDetected: false
  });

  // Videos watched count
  const [videosWatched, setVideosWatched] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("videosWatched");
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  // Refs for tracking
  const playerRef = useRef<any>(null);
  const watchProgressRef = useRef(0);
  const lastTimeRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchStartTimeRef = useRef<Date | null>(null);
  const antiCheatFlagsRef = useRef<AntiCheatFlags>({
    seekDetected: false,
    speedChanged: false,
    tabSwitched: false,
    refreshDetected: false,
    pauseDetected: false
  });

  // Pause detection refs
  const pauseStartTimeRef = useRef<number | null>(null);
  const totalPauseTimeRef = useRef(0);
  const pauseCountRef = useRef(0);
  const lastPauseTimeRef = useRef<number | null>(null);
  const isVideoAlreadyWatchedRef = useRef(false);

  // Anti-cheat functions
  const resetAntiCheatFlags = useCallback(() => {
    const initialFlags = {
      seekDetected: false,
      speedChanged: false,
      tabSwitched: false,
      refreshDetected: false,
      pauseDetected: false
    };
    setAntiCheatFlags(initialFlags);
    antiCheatFlagsRef.current = initialFlags;
  }, []);

  const detectSeek = useCallback((currentTime: number, duration: number) => {
    if (duration > 0 && currentTime > 0) {
      const timeDiff = Math.abs(currentTime - lastTimeRef.current);
      // If time jump is more than 5 seconds and forward, it's likely a seek
      if (timeDiff > 5 && currentTime > lastTimeRef.current + 2) {
        if (!antiCheatFlagsRef.current.seekDetected) {
          antiCheatFlagsRef.current.seekDetected = true;
          setAntiCheatFlags(prev => ({ ...prev, seekDetected: true }));

          // Store the safe time before showing warning
          const safeTime = lastTimeRef.current;

          // Pause video to show warning (don't revert yet - let user choose)
          try {
            const player = playerRef.current;
            if (player && typeof player.pauseVideo === 'function') {
              player.pauseVideo();
              console.log('⏸️ Video paused for seek warning at:', currentTime, 's (last safe time:', safeTime, 's)');
            }
          } catch { }

          // Show immediate warning dialog (Skip Ahead?) - only if video not already watched
          console.log('🔍 Seek detected - isVideoAlreadyWatched:', isVideoAlreadyWatchedRef.current);
          if (!isVideoAlreadyWatchedRef.current) {
          setAntiCheatWarning({
            id: Date.now().toString(),
            type: 'seek',
            title: 'Skip Ahead?',
              message: `If you skip forward, this video won't count for rewards. You skipped ~${Math.round(timeDiff)}s. Do you still want to skip?`,
              primaryLabel: 'Stay Here & Earn Rewards',
            secondaryLabel: 'Skip Anyway',
            onPrimary: () => {
              setAntiCheatWarning(null);
                resetAntiCheatFlagsForRewards(); // Reset flags so user can earn rewards
              // Revert to the safe time that was captured before the seek
              try {
                const player = playerRef.current;
                if (player && typeof player.seekTo === 'function') {
                  player.seekTo(Math.max(0, safeTime), true);
                  console.log('🔄 Reverted to safe time:', Math.max(0, safeTime), 's');
                  // Update lastTimeRef to the safe time
                  lastTimeRef.current = safeTime;
                }
                if (player && typeof player.playVideo === 'function') {
                  player.playVideo();
                  console.log('▶️ Resumed from safe time');
                }
              } catch { }
            },
            onSecondary: () => {
              setAntiCheatWarning(null);
              // User proceeds with skip: seek to new position and resume
              try {
                const player = playerRef.current;
                if (player && typeof player.seekTo === 'function') {
                  player.seekTo(currentTime, true);
                  console.log('⏭️ Proceeding to skipped time:', currentTime, 's');
                }
                if (player && typeof player.playVideo === 'function') {
                  player.playVideo();
                  console.log('▶️ Resumed from skipped time');
                }
              } catch { }
            }
          });
          }

          console.log('Seek detected:', { currentTime, lastTime: lastTimeRef.current, diff: timeDiff });
        }
      }
      // Only update lastTimeRef if no seek was detected
      if (!antiCheatFlagsRef.current.seekDetected) {
      lastTimeRef.current = currentTime;
      }
    }
  }, [rewardPerVideo]);

  const detectSpeedChange = useCallback((playbackRate: number) => {
    if (playbackRate > 1) {
      if (!antiCheatFlagsRef.current.speedChanged) {
        antiCheatFlagsRef.current.speedChanged = true;
        setAntiCheatFlags(prev => ({ ...prev, speedChanged: true }));

        // Pause video and force back to normal speed immediately
        try {
          const player = playerRef.current;
          if (player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
            console.log('⏸️ Video paused for speed change warning');
          }
          if (player && typeof player.setPlaybackRate === 'function') {
            player.setPlaybackRate(1);
            console.log('🔄 Speed forced back to 1.0x');
          }
        } catch { }

        // Show immediate warning dialog (Change Speed?) - only if video not already watched
        if (!isVideoAlreadyWatchedRef.current) {
        setAntiCheatWarning({
          id: Date.now().toString(),
          type: 'speed',
          title: 'Change Speed?',
          message: 'Watching at a different speed will disable rewards for this video. Do you still want to change the speed?',
            primaryLabel: 'Stay Here & Earn Rewards',
          secondaryLabel: 'Change Anyway',
          onPrimary: () => {
            setAntiCheatWarning(null);
              resetAntiCheatFlagsForRewards(); // Reset flags so user can earn rewards
            // Already forced rate to 1; ensure play continues
            try {
              const player = playerRef.current;
              if (player && typeof player.setPlaybackRate === 'function') player.setPlaybackRate(1);
              if (player && typeof player.playVideo === 'function') player.playVideo();
            } catch { }
          },
          onSecondary: () => {
            setAntiCheatWarning(null);
            // User insists; allow speed change and resume video
            try {
              const player = playerRef.current;
              if (player && typeof player.setPlaybackRate === 'function') {
                // Allow the user to set their desired speed (they can change it manually)
                console.log('⚠️ User chose to proceed with speed change - reward disabled');
              }
              if (player && typeof player.playVideo === 'function') {
                player.playVideo();
                console.log('▶️ Video resumed after speed change acknowledgment');
              }
            } catch { }
          }
        });
        }

        console.log('Speed change detected:', playbackRate);
      }
    }
  }, [rewardPerVideo]);

  // Pause detection and anti-cheat logic
  const detectPause = useCallback((playerState: number, currentTime: number) => {
    const YT = (window as any).YT;

    if (playerState === YT.PlayerState.PAUSED) {
      // Video is paused
      if (pauseStartTimeRef.current === null) {
        // Starting a new pause
        pauseStartTimeRef.current = Date.now();
        pauseCountRef.current++;
        lastPauseTimeRef.current = currentTime;
        console.log('⏸️ Video paused at:', currentTime, 's');
      }
    } else if (playerState === YT.PlayerState.PLAYING && pauseStartTimeRef.current !== null) {
      // Video resumed from pause
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      totalPauseTimeRef.current += pauseDuration;
      pauseStartTimeRef.current = null;

      console.log('▶️ Video resumed after pause of:', Math.round(pauseDuration / 1000), 's');

      // Check for suspicious pause patterns
      const pauseThreshold = 30000; // 30 seconds
      const pauseCountThreshold = 5; // 5 pauses
      const totalPauseThreshold = 120000; // 2 minutes total

      if (pauseDuration > pauseThreshold ||
        pauseCountRef.current > pauseCountThreshold ||
        totalPauseTimeRef.current > totalPauseThreshold) {

        if (!antiCheatFlagsRef.current.pauseDetected) {
          antiCheatFlagsRef.current.pauseDetected = true;
          setAntiCheatFlags(prev => ({ ...prev, pauseDetected: true }));

          // Pause video to show warning
          try {
            const player = playerRef.current;
            if (player && typeof player.pauseVideo === 'function') {
              player.pauseVideo();
            }
          } catch { }

          // Show pause warning dialog - only if video not already watched
          if (!isVideoAlreadyWatchedRef.current) {
          setAntiCheatWarning({
            id: Date.now().toString(),
            type: 'pause',
            title: 'Excessive Pausing Detected',
            message: `You've paused the video ${pauseCountRef.current} times for a total of ${Math.round(totalPauseTimeRef.current / 1000)}s. Excessive pausing may affect reward eligibility.`,
              primaryLabel: 'Stay Here & Earn Rewards',
            secondaryLabel: 'Acknowledge & Continue',
            onPrimary: () => {
              setAntiCheatWarning(null);
                resetAntiCheatFlagsForRewards(); // Reset flags so user can earn rewards
              // Resume video
              try {
                const player = playerRef.current;
                if (player && typeof player.playVideo === 'function') {
                  player.playVideo();
                }
              } catch { }
            },
            onSecondary: () => {
              setAntiCheatWarning(null);
              // Resume video but keep flag for reward calculation
              try {
                const player = playerRef.current;
                if (player && typeof player.playVideo === 'function') {
                  player.playVideo();
                }
              } catch { }
            }
          });
          }

          console.log('⚠️ Excessive pausing detected:', {
            pauseCount: pauseCountRef.current,
            totalPauseTime: totalPauseTimeRef.current,
            lastPauseDuration: pauseDuration
          });
        }
      }
    }
  }, []);

  const isEligibleForRewards = useCallback((): boolean => {
    return !Object.values(antiCheatFlagsRef.current).some(flag => flag === true);
  }, []);

  // Reset anti-cheat flags when user chooses to stay and earn rewards
  const resetAntiCheatFlagsForRewards = useCallback(() => {
    antiCheatFlagsRef.current = {
      seekDetected: false,
      speedChanged: false,
      tabSwitched: false,
      refreshDetected: false,
      pauseDetected: false
    };  
    setAntiCheatFlags({
      seekDetected: false,
      speedChanged: false,
      tabSwitched: false,
      refreshDetected: false,
      pauseDetected: false
    });
  }, []);

  // Check if video is already watched by checking user's video history
  const checkIfVideoAlreadyWatched = useCallback(async (videoId: string) => {
    // If user is not authenticated, always return false (not watched)
    if (!isAuthenticated) {
      console.log('🔓 User not authenticated - treating video as not watched');
      return false;
    }
    
    try {
      console.log('🔍 Checking if video is already watched:', videoId);
      
      // Get user's video history to check if this video is already watched
      const response = await authAxiosClient.get('/video-rewards/history?page=1&limit=100');
      const history = response.data;
      
      if (history && history.logs) {
        // Check if the video ID exists in the user's watch history
        const alreadyWatched = history.logs.some((log: any) => log.videoId === videoId);
        
        if (alreadyWatched) {
          console.log('✅ Video already watched - found in history');
          return true;
        } else {
          console.log('✅ Video not watched yet - not in history');
          return false;
        }
      }
      
      // If no history data, assume not watched
      console.log('⚠️ No history data, assuming not watched');
      return false;
    } catch (error: any) {
      console.log('🔍 Error checking video history:', error?.response?.data);
      
      // If history check fails, fallback to test API call
      try {
        console.log('🔄 Fallback: trying test API call');
        const testResponse = await authAxiosClient.post('/video-rewards/watch', {
          videoId: videoId,
          videoTitle: 'Test Check',
          channelId: 'test',
          channelName: 'test',
          videoDuration: 'PT1S',
          watchStartedAt: new Date().toISOString(),
          watchCompletedAt: new Date().toISOString(),
          validationFlags: {
            seekDetected: false,
            speedChanged: false,
            tabSwitched: false,
            refreshDetected: false,
            videoPaused: false
          }
        });
        
        // If we get here, video is not watched
        console.log('✅ Video not watched yet (fallback)');
        return false;
      } catch (testError: any) {
        // Check if the error is "already watched"
        const serverMessage = testError?.response?.data?.message || '';
        if (
          serverMessage === 'User has already watched this video' ||
          serverMessage.toLowerCase().includes('already watched')
        ) {
          console.log('✅ Video already watched - setting flag (fallback)');
          return true;
        }
        
        // For other errors, assume not watched
        console.log('⚠️ All checks failed, assuming not watched');
        return false;
      }
    }
  }, [isAuthenticated]);

  // Watch session management
  const startWatchSession = useCallback(async (video: VideoData) => {
    console.log('Starting watch session:', video.snippet.title);
    resetAntiCheatFlags();
    watchProgressRef.current = 0;
    lastTimeRef.current = 0;
    watchStartTimeRef.current = new Date();

    // Reset pause detection refs
    pauseStartTimeRef.current = null;
    totalPauseTimeRef.current = 0;
    pauseCountRef.current = 0;
    lastPauseTimeRef.current = null;

    // Check if video is already watched
    try {
      const alreadyWatched = await checkIfVideoAlreadyWatched(video.id);
      setIsVideoAlreadyWatched(alreadyWatched);
      isVideoAlreadyWatchedRef.current = alreadyWatched;
      
      if (alreadyWatched) {
        console.log('📺 Video already watched - anti-cheat disabled');
      } else {
        console.log('📺 Video not watched yet - anti-cheat enabled');
      }
    } catch (error) {
      console.error('Error checking if video is already watched:', error);
      // If check fails, assume not watched (safer default)
      setIsVideoAlreadyWatched(false);
      isVideoAlreadyWatchedRef.current = false;
    }

    // Clear any pending warnings when starting new video
    setAntiCheatWarning(null);
    setConfirmationToast(null);
  }, [resetAntiCheatFlags, checkIfVideoAlreadyWatched]);

  const endWatchSession = useCallback(() => {
    console.log('Ending watch session');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Don't set watchStartTimeRef.current to null here as it's needed for the watch log
  }, []);

  const createWatchLog = useCallback(async (watchData: any) => {
    // If user is not authenticated, don't create watch log
    if (!isAuthenticated) {
      console.log('🔓 User not authenticated - skipping watch log creation');
      return { success: false, error: 'not_authenticated' };
    }
    
    try {
      console.log('Creating watch log:', watchData);

      // Debug: Log what we're sending
      console.log('🔍 Debug - watchStartedAt:', watchData.watchStartedAt);
      console.log('🔍 Debug - watchCompletedAt:', watchData.watchCompletedAt);
      console.log('🔍 Debug - rewardAmount:', watchData.rewardAmount);
      console.log('🔍 Debug - rewardPerVideo from hook:', rewardPerVideo);

      // Use authenticated axios client to call the video rewards API
      const response = await authAxiosClient.post('/video-rewards/watch', {
        videoId: watchData.videoId,
        videoTitle: watchData.videoTitle,
        channelId: watchData.channelId,
        channelName: watchData.channelName,
        videoDuration: watchData.videoDuration,
        watchStartedAt: watchData.watchStartedAt,
        watchCompletedAt: watchData.watchCompletedAt,
        rewardAmount: watchData.rewardAmount,
        validationFlags: watchData.validationFlags,
        watchData: watchData.watchData
      });

      console.log('Watch log created successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error creating watch log:', error);

      // Normalize server message (covers Axios, string errors, and unknowns)
      const serverMessage: string =
        error?.response?.data?.message ||
        error?.message ||
        (typeof error === 'string' ? error : '');

      // Treat any form of "already watched" as informational, not error
      if (
        (error?.response?.status === 400 &&
          error?.response?.data?.message === 'User has already watched this video') ||
        serverMessage.toLowerCase().includes('already watched')
      ) {
        setIsVideoAlreadyWatched(true);
        isVideoAlreadyWatchedRef.current = true;
        setToastMessage({
          type: 'info',
          message: 'ℹ️ You have already watched this video and earned rewards for it!'
        });
        return Promise.resolve({ success: false, error: 'already_watched' });
      }

      // Handle other 400 errors with specific messages
      if (error?.response?.status === 400 && error?.response?.data?.message) {
        setToastMessage({
          type: 'warning',
          message: `⚠️ ${error.response.data.message}`
        });
        return Promise.resolve({ success: false, error: { message: error.response.data.message } });
      }

      // Show generic error toast for other errors
      setToastMessage({
        type: 'error',
        message: '❌ Failed to save watch log. Please try again.'
      });

      return Promise.resolve({ success: false, error });
    }
  }, [rewardPerVideo, isAuthenticated]);

  // Persist videos watched count
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("videosWatched", videosWatched.toString());
    }
  }, [videosWatched]);

  // YouTube API initialization
  useEffect(() => {
    const initializeYouTubeAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onload = () => {
          console.log('YouTube API script loaded');
        };
        document.body.appendChild(tag);

        (window as any).onYouTubeIframeAPIReady = () => {
          console.log('YouTube API ready');
          setYouTubeAPIReady(true);
        };
      } else {
        console.log('YouTube API already loaded');
        setYouTubeAPIReady(true);
      }
    };

    if (typeof window !== "undefined") {
      initializeYouTubeAPI();
    }
  }, []);

  // Tab switching and refresh detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && modalOpen && playerRef.current) {
        if (!antiCheatFlagsRef.current.tabSwitched) {
          antiCheatFlagsRef.current.tabSwitched = true;
          setAntiCheatFlags(prev => ({ ...prev, tabSwitched: true }));

          // Pause immediately
          try { 
            playerRef.current.pauseVideo?.(); 
          } catch { }

          // Show immediate warning dialog (Switch Tab?) - only if video not already watched
          if (!isVideoAlreadyWatchedRef.current) {
          setAntiCheatWarning({
            id: Date.now().toString(),
            type: 'tab',
            title: 'Switch Tab?',
              message: 'If you switch to another tab while the video is playing, you won\'t earn rewards for this video. Do you still want to switch?',
            primaryLabel: 'Stay Here & Earn Rewards',
            secondaryLabel: 'Switch Anyway',
            onPrimary: () => {
              setAntiCheatWarning(null);
                resetAntiCheatFlagsForRewards(); // Reset flags so user can earn rewards
              try { playerRef.current.playVideo?.(); } catch { }
            },
            onSecondary: () => {
              setAntiCheatWarning(null);
              // Keep paused; user can choose to continue but reward remains disabled
            }
          });
          }

          console.log('Tab switch detected');
        }
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (modalOpen && !videoCompleted) {
        if (!antiCheatFlagsRef.current.refreshDetected) {
          antiCheatFlagsRef.current.refreshDetected = true;
          setAntiCheatFlags(prev => ({ ...prev, refreshDetected: true }));

          // Pause immediately
          try { playerRef.current?.pauseVideo?.(); } catch { }

          // Show immediate warning dialog (Refresh Page?) - only if video not already watched
          if (!isVideoAlreadyWatchedRef.current) {
          setAntiCheatWarning({
            id: Date.now().toString(),
            type: 'refresh',
            title: 'Refresh Page?',
            message: 'If you refresh now, this video will stop and you won\'t earn any rewards for it.\nDo you still want to refresh?',
              primaryLabel: 'Stay Here & Earn Rewards',
            secondaryLabel: 'Refresh Anyway',
            onPrimary: () => {
              setAntiCheatWarning(null);
                resetAntiCheatFlagsForRewards(); // Reset flags so user can earn rewards
              try { playerRef.current?.playVideo?.(); } catch { }
            },
            onSecondary: () => {
              setAntiCheatWarning(null);
              cleanupAndCloseModal();
            }
          });
          }
        }
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? You will lose your reward progress.';
        return event.returnValue;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [modalOpen, videoCompleted, rewardPerVideo]);

  // Auto-dismiss toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
    return () => {}; // Return empty cleanup function when no timer is set
  }, [toastMessage]);



  // YouTube Player initialization
  useEffect(() => {
    if (modalOpen && selectedVideo && youTubeAPIReady) {
      console.log('Initializing player for:', selectedVideo.snippet.title);

      const initializePlayer = () => {
        // Clean up existing player
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (error) {
            console.error('Error destroying previous player:', error);
          }
          playerRef.current = null;
        }

        // Start watch session
        startWatchSession(selectedVideo).catch(error => {
          console.error('Error starting watch session:', error);
        });

        const YT = (window as any).YT;
        if (YT && YT.Player) {
          try {
            playerRef.current = new YT.Player("yt-player", {
              videoId: selectedVideo.id,
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                fs: 1,
                cc_load_policy: 0,
                iv_load_policy: 3,
                autohide: 0
              },
              events: {
                onReady: (event: any) => {
                  console.log('Player ready');
                  event.target.playVideo();
                },
                onStateChange: handlePlayerStateChange,
                onError: (event: any) => {
                  console.error('YouTube player error:', event.data);
                }
              },
            });
          } catch (error) {
            console.error('Error creating YouTube player:', error);
          }
        }
      };

      const handlePlayerStateChange = (event: any) => {
        const player = event.target;
        const YT = (window as any).YT;

        try {
          if (event.data === YT.PlayerState.PLAYING) {
            console.log('Video started playing');

            // Clear existing interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            // Start tracking interval
            intervalRef.current = setInterval(() => {
              try {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();

                if (duration > 0) {
                  watchProgressRef.current = currentTime / duration;

                  // Anti-cheat detection
                  detectSeek(currentTime, duration);

                  try {
                    const playbackRate = player.getPlaybackRate();
                    detectSpeedChange(playbackRate);
                  } catch (e) {
                    // Playback rate might not be available
                  }
                }
              } catch (error) {
                console.error('Error in tracking interval:', error);
              }
            }, 1000);
          }

          if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }

          // Anti-cheat pause detection
          detectPause(event.data, player.getCurrentTime?.() || 0);

          if (event.data === YT.PlayerState.ENDED) {
            handleVideoEnded(player);
          }
        } catch (error) {
          console.error('Error in state change handler:', error);
        }
      };

      const handleVideoEnded = async (player: any) => {
        console.log('Video ended, checking eligibility...');
        endWatchSession();

        const watchPercentage = watchProgressRef.current;
        const isEligible = isEligibleForRewards() && watchPercentage >= 0.9;

        if (isEligible) {
          const tokens = rewardPerVideo;

          // Debug: Log the reward amount being used
          console.log('🎯 Video completed - Reward amount:', tokens, 'XUT (from hook:', rewardPerVideo, ')');

          // Update videos watched count
          setVideosWatched(prev => prev + 1);
          setVideoCompleted(true);

          // Only create watch log and give rewards for authenticated users
          if (isAuthenticated) {
            // Create watch log
            const watchLogResult = await createWatchLog({
              videoId: selectedVideo.id,
              videoTitle: selectedVideo.snippet.title,
              channelId: selectedVideo.snippet.channelId,
              channelName: selectedVideo.snippet.channelTitle,
              videoDuration: selectedVideo.contentDetails.duration,
              watchStartedAt: watchStartTimeRef.current,
              watchCompletedAt: new Date(),
              watchPercentage,
              validationFlags: antiCheatFlagsRef.current,
              isValidated: true,
              rewardAmount: tokens
            });

            console.log('🔍 Debug - watchLogResult:', watchLogResult);

            if (watchLogResult.success) {
              console.log('Watch log saved successfully to backend');

              // Trigger reward animation instead of toast
              // Dispatch reward earned event for the fullscreen component to handle
              window.dispatchEvent(new CustomEvent('rewardEarned', {
                detail: { rewardAmount: tokens }
              }));

              // Try to get updated balance from payment service with retry mechanism
              try {
                const userAuthDetails = getLocalData("userAuthDetails") || {};
                const userId = userAuthDetails.id || userAuthDetails.userId;

              if (userId) {
                // Wait a moment for blockchain transaction to be processed
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Try to get updated balance with retry
                let retryCount = 0;
                const maxRetries = 3;

                while (retryCount < maxRetries) {
                  try {
                    const walletResponse = await paymentAxiosClient.get(`/getUserWalletBalance/${userId}`);
                    if (walletResponse && walletResponse.data && walletResponse.data.success) {
                      const currentBalance = walletResponse.data.data.balance;
                      console.log('📊 Current wallet balance from payment service:', currentBalance, 'XUT');
                      console.log('✅ Balance updated successfully!');

                      // Immediately dispatch the wallet balance update event
                      window.dispatchEvent(new CustomEvent('walletBalanceUpdated', {
                        detail: { balance: currentBalance }
                      }));

                      break;
                    }
                  } catch (retryError) {
                    retryCount++;
                    console.log(`🔄 Retry ${retryCount}/${maxRetries} - Could not fetch balance, retrying...`);
                    if (retryCount < maxRetries) {
                      await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                  }
                }

                if (retryCount >= maxRetries) {
                  console.log('ℹ️ Could not fetch updated balance after retries - blockchain might be slow');

                  // Fallback: Update balance based on the reward earned
                  try {
                    console.log('🔄 Using fallback balance update: +', tokens, 'XUT');

                    // Dispatch a special event for reward earned
                    window.dispatchEvent(new CustomEvent('rewardEarned', {
                      detail: { rewardAmount: tokens }
                    }));
                  } catch (fallbackError) {
                    console.error('❌ Fallback balance update failed:', fallbackError);
                  }
                }
              }
            } catch (error) {
              console.log('ℹ️ Could not fetch current wallet balance (payment service might be down)');
            }
          } else if ('error' in watchLogResult && watchLogResult.error === 'already_watched') {
            // Already watched - don't show error, just log it
            console.log('Video already watched - no duplicate reward');
            // Don't increment videos watched count for duplicate
            setVideosWatched(prev => Math.max(0, prev - 1));
          } else if (
            'error' in watchLogResult &&
            typeof watchLogResult.error === 'string' &&
            watchLogResult.error.toLowerCase().includes('already watched')
          ) {
            // Fallback: tolerate string error from upstream without showing failure
            console.log('Video already watched (string message) - no duplicate reward');
            setVideosWatched(prev => Math.max(0, prev - 1));
          } else {
            console.error('Failed to save watch log to backend');
            // Show specific error message if available
            if ('error' in watchLogResult && watchLogResult.error?.message) {
              setToastMessage({
                type: 'error',
                message: `❌ ${watchLogResult.error.message}`
              });
            }
          }

          // Check if auto-play should start for successful completion (YouTube-style countdown)
          if (watchLogResult.success && hasNextVideo() && queueState.isAutoPlayEnabled) {
            console.log('🎬 Starting YouTube-style countdown for next video (successful completion)');
            startAutoPlayCountdown((nextVideo) => {
              console.log('🎬 Auto-playing next video:', nextVideo.snippet.title);
              setSelectedVideo(nextVideo);
              setVideoCompleted(false);
              // Reset anti-cheat flags for new video
              antiCheatFlagsRef.current = {
                seekDetected: false,
                speedChanged: false,
                tabSwitched: false,
                refreshDetected: false,
                pauseDetected: false
              };
            });
          } else if (watchLogResult.success && (!hasNextVideo() || !queueState.isAutoPlayEnabled)) {
            console.log('🎬 No more videos or auto-play disabled, closing modal after success');
            // No more videos or auto-play disabled, close modal after delay
            setTimeout(() => {
              cleanupAndCloseModal();
            }, 3000);
          }
          } else {
            // Unauthenticated user - show message about signing up for rewards
            console.log('🔓 Video completed by unauthenticated user');
            setToastMessage({
              type: 'info',
              message: `🎬 Video completed! Sign up to earn ${tokens} XUT tokens for watching videos.`
            });
            
            // Auto-play next video if available and enabled (without rewards)
            if (hasNextVideo() && queueState.isAutoPlayEnabled) {
              console.log('🎬 Starting countdown for next video (unauthenticated user)');
              startAutoPlayCountdown((nextVideo) => {
                console.log('🎬 Auto-playing next video:', nextVideo.snippet.title);
                setSelectedVideo(nextVideo);
                setVideoCompleted(false);
              });
            } else {
              console.log('🎬 No more videos or auto-play disabled, closing modal');
              setTimeout(() => {
                cleanupAndCloseModal();
              }, 3000);
            }
          }
        } else {
          // Show violation reasons
          const violations = Object.entries(antiCheatFlagsRef.current)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => {
              switch (key) {
                case 'seekDetected': return 'Video seeking detected';
                case 'speedChanged': return 'Playback speed changed';
                case 'tabSwitched': return 'Tab switching detected';
                case 'refreshDetected': return 'Page refresh detected';
                case 'pauseDetected': return 'Excessive pausing detected';
                default: return 'Unknown violation';
              }
            });

          if (violations.length > 0) {
            setToastMessage({
              type: 'error',
              message: `❌ No rewards earned. Violations detected: ${violations.join(', ')}`
            });
          } else if (watchPercentage < 0.9) {
            setToastMessage({
              type: 'warning',
              message: `⚠️ Please watch at least 90% of the video to earn tokens. You watched ${Math.round(watchPercentage * 100)}%.`
            });
          } else {
            setToastMessage({
              type: 'error',
              message: "❌ No rewards earned. Please watch the video completely without violations."
            });
          }

          setVideoCompleted(false);

          // Check if auto-play should start (YouTube-style countdown)
          if (hasNextVideo() && queueState.isAutoPlayEnabled) {
            console.log('🎬 Starting YouTube-style countdown for next video');
            startAutoPlayCountdown((nextVideo) => {
              console.log('🎬 Auto-playing next video:', nextVideo.snippet.title);
              setSelectedVideo(nextVideo);
              setVideoCompleted(false);
              // Reset anti-cheat flags for new video
              antiCheatFlagsRef.current = {
                seekDetected: false,
                speedChanged: false,
                tabSwitched: false,
                refreshDetected: false,
                pauseDetected: false
              };
            });
          } else {
            console.log('🎬 No more videos or auto-play disabled, closing modal');
            // No more videos or auto-play disabled, close modal after delay
            setTimeout(() => {
              cleanupAndCloseModal();
            }, 3000);
          }

          // Still log the attempt
          const failedWatchLogResult = await createWatchLog({
            videoId: selectedVideo.id,
            videoTitle: selectedVideo.snippet.title,
            channelId: selectedVideo.snippet.channelId,
            channelName: selectedVideo.snippet.channelTitle,
            videoDuration: selectedVideo.contentDetails.duration,
            watchStartedAt: watchStartTimeRef.current,
            watchCompletedAt: new Date(),
            watchPercentage,
            validationFlags: antiCheatFlagsRef.current,
            isValidated: false,
            rewardAmount: 0,
            rejectionReasons: violations
          });

          if (failedWatchLogResult.success) {
            console.log('Failed attempt logged successfully to backend');
          } else {
            console.error('Failed to log failed attempt to backend');
          }
        }
      };

      // Initialize with a small delay to ensure DOM is ready
      setTimeout(initializePlayer, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying player in cleanup:', error);
        }
        playerRef.current = null;
      }
    };
  }, [modalOpen, selectedVideo, youTubeAPIReady, startWatchSession, endWatchSession, createWatchLog, detectSeek, detectSpeedChange, detectPause, isEligibleForRewards, rewardPerVideo]);

  // Fetch channel info
  useEffect(() => {
    async function fetchChannelInfo() {
      try {
        const ids = CHANNELS.map((c) => c.id).join(",");
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?key=${YOUTUBE_API_KEY}&id=${ids}&part=snippet,statistics`
        );
        const data = await res.json();

        if (data?.items?.length > 0) {
          const sortedChannels = data.items.sort((a: any, b: any) =>
            Number(b.statistics.subscriberCount) - Number(a.statistics.subscriberCount)
          );
          setChannelInfo(sortedChannels);

          if (sortedChannels.length > 0) {
            const topChannel = CHANNELS.find((c) => c.id === sortedChannels[0].id);
            if (topChannel) setSelectedChannel(topChannel);
          }
        }
      } catch (error) {
        console.error('Error fetching channel info:', error);
        setChannelInfo(fallbackData.channels);
        const topChannel = CHANNELS.find((c) => c.id === fallbackData.channels[0]?.id);
        if (topChannel) setSelectedChannel(topChannel);
      }
    }

    if (YOUTUBE_API_KEY) {
      fetchChannelInfo();
    } else {
      setChannelInfo(fallbackData.channels);
      const topChannel = CHANNELS.find((c) => c.id === fallbackData.channels[0]?.id);
      if (topChannel) setSelectedChannel(topChannel);
    }
  }, []);

  // Fetch videos for selected channel
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setVideos([]);
      setShorts([]);
      setLongs([]);

      try {
        if (!YOUTUBE_API_KEY) {
          throw new Error("Missing API key");
        }

        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${selectedChannel.id}&part=snippet,id&order=date&maxResults=50&type=video`
        );
        const searchData = await searchRes.json();

        const videoIds = searchData?.items
          ?.filter((item: any) => item.id?.kind === "youtube#video")
          ?.map((item: any) => item.id.videoId)
          ?.join(",");

        if (!videoIds) {
          throw new Error("No videos");
        }

        const detailsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=snippet,contentDetails,statistics`
        );
        const detailsData = await detailsRes.json();

        if (!detailsRes.ok) {
          throw new Error(detailsData?.error?.message || "YouTube API error");
        }

        if (detailsData?.items) {
          const validVideos = detailsData.items.filter((video: any) =>
            video?.snippet?.title && video?.contentDetails?.duration && video?.id
          );

          const shortsArr: VideoData[] = [];
          const longsArr: VideoData[] = [];

          validVideos.forEach((video: VideoData) => {
            const seconds = parseDuration(video.contentDetails.duration);
            if (seconds < 60 || video.snippet.title.toLowerCase().includes("short")) {
              shortsArr.push(video);
            } else {
              longsArr.push(video);
            }
          });

          setVideos(validVideos);
          setShorts(shortsArr);
          setLongs(longsArr);

          // Initialize video queues for auto-play
          initializeQueues(shortsArr, longsArr);

          const firstVideo = validVideos[0];
          if (firstVideo) {
            setSelectedVideo(firstVideo);
            setCurrentVideo(firstVideo);
          }
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        const validVideos = fallbackData.videos.filter((video: any) => video.snippet.channelId === selectedChannel.id);
        const shortsArr: VideoData[] = [];
        const longsArr: VideoData[] = [];
        validVideos.forEach((video: VideoData) => {
          const seconds = parseDuration(video.contentDetails.duration);
          if (seconds < 60 || video.snippet.title.toLowerCase().includes("short")) {
            shortsArr.push(video);
          } else {
            longsArr.push(video);
          }
        });
        setVideos(validVideos);
        setShorts(shortsArr);
        setLongs(longsArr);
        
        // Initialize video queues for auto-play (fallback)
        initializeQueues(shortsArr, longsArr);
        
        const firstVideo = validVideos[0];
        if (firstVideo) {
          setSelectedVideo(firstVideo);
          setCurrentVideo(firstVideo);
        }
      } finally {
        setLoading(false);
        setShowCount(8);
        setShowCountLong(8);
      }
    }

    fetchVideos();
  }, [selectedChannel]);

  // Data transformation functions
  const transformShortsData = (youtubeShorts: VideoData[]) => {
    return youtubeShorts
      .filter(video => video?.snippet?.title && video?.id)
      .map(video => ({
        id: video.id,
        title: video.snippet.title,
        desc: video.snippet.description || 'No description available',
        img: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || '',
        duration: formatDuration(video.contentDetails.duration),
        views: formatViews(video.statistics.viewCount || '0'),
        publishedAt: timeAgo(video.snippet.publishedAt)
      }));
  };

  const transformVideosData = (youtubeVideos: VideoData[]) => {
    return youtubeVideos
      .filter(video => video?.snippet?.title && video?.id)
      .map(video => ({
        id: video.id,
        title: video.snippet.title,
        desc: video.snippet.description || 'No description available',
        img: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || '',
        duration: formatDuration(video.contentDetails.duration),
        views: formatViews(video.statistics.viewCount || '0'),
        publishedAt: timeAgo(video.snippet.publishedAt)
      }));
  };

  const transformChannelsData = (youtubeChannels: any[]) => {
    return youtubeChannels
      .filter(channel => channel?.snippet?.title && channel?.id)
      .map(channel => ({
        id: channel.id,
        name: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url || '',
        subscriberCount: Number(channel.statistics?.subscriberCount || 0).toLocaleString() + " subscribers"
      }));
  };

  // Event handlers
  const handleVideoClick = (video: any) => {
    const originalVideo = videos.find(v => v.id === video.id);
    if (originalVideo && originalVideo.snippet?.title) {
      console.log('Video clicked:', originalVideo.snippet.title);
      setSelectedVideo(originalVideo);
      setCurrentVideo(originalVideo);
      setVideoCompleted(false);
      setModalOpen(true);

      // Clear any pending warnings when opening new video
      setAntiCheatWarning(null);
      setConfirmationToast(null);
      
      // Cancel any active auto-play countdown
      cancelAutoPlayCountdown();
    } else {
      console.error('Invalid video data:', video);
      setToastMessage({
        type: 'error',
        message: '❌ Error: Invalid video data. Please try again.'
      });
    }
  };

  const closeModal = () => {
    if (!videoCompleted && modalOpen) {
      // Show confirmation toast instead of window.confirm
      setConfirmationToast({
        id: Date.now().toString(),
        message: `Are you sure you want to leave watching the video midway and lose the chance to earn ${rewardPerVideo} XUT tokens?`,
        onConfirm: () => {
          setConfirmationToast(null);
          // User confirmed, proceed with closing
          cleanupAndCloseModal();
        },
        onCancel: () => {
          setConfirmationToast(null);
          // User cancelled, keep modal open
        }
      });
      return;
    }

    // If video is completed or no confirmation needed, close directly
    cleanupAndCloseModal();
  };

  // Function to manually update wallet balance (fallback)
  const updateWalletBalanceManually = (newBalance: number) => {
    console.log('🔄 Manually updating wallet balance to:', newBalance, 'XUT');
    window.dispatchEvent(new CustomEvent('walletBalanceUpdated', {
      detail: { balance: newBalance }
    }));
  };

  // Separate function for actual cleanup and closing
  const cleanupAndCloseModal = async () => {
    // Clean up player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.error('Error destroying player:', error);
      }
      playerRef.current = null;
    }

    endWatchSession();
    setModalOpen(false);
    setSelectedVideo(null);
    setVideoCompleted(false);
    resetAntiCheatFlags();

    // Clear any pending warnings
    setAntiCheatWarning(null);
    setConfirmationToast(null);

    // Refresh wallet balance when modal closes
    try {
      const userAuthDetails = getLocalData("userAuthDetails") || {};
      const userId = userAuthDetails.id || userAuthDetails.userId;

      if (userId) {
        console.log('🔄 Refreshing wallet balance for user:', userId);

        // Wait a moment for any pending blockchain transactions
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to get updated balance with retry
        let retryCount = 0;
        const maxRetries = 3;
        let currentBalance = null;

        while (retryCount < maxRetries && !currentBalance) {
          try {
            console.log(`🔄 Attempt ${retryCount + 1} to fetch wallet balance...`);

            const walletResponse = await paymentAxiosClient.get(`/getUserWalletBalance/${userId}`);
            console.log('📊 Wallet response:', walletResponse);

            if (walletResponse && walletResponse.data && walletResponse.data.success) {
              currentBalance = walletResponse.data.data.balance;
              console.log('💰 Wallet balance refreshed on modal close:', currentBalance, 'XUT');

              // Trigger a custom event to update the balance display
              window.dispatchEvent(new CustomEvent('walletBalanceUpdated', {
                detail: { balance: currentBalance }
              }));

              break; // Success, exit retry loop
            } else {
              console.warn('⚠️ Wallet response not successful:', walletResponse?.data);
            }
          } catch (error) {
            console.error(`❌ Attempt ${retryCount + 1} failed:`, error);
            retryCount++;

            if (retryCount < maxRetries) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }

        if (!currentBalance) {
          console.error('❌ Failed to fetch wallet balance after all retries');

          // Fallback: Try to get balance from local storage or use a default update
          try {
            const localBalance = getLocalData("userTokenBalance") || 0;
            console.log('🔄 Using fallback balance from local storage:', localBalance);
            updateWalletBalanceManually(localBalance);
          } catch (fallbackError) {
            console.error('❌ Fallback balance update also failed:', fallbackError);
          }
        }
      } else {
        console.warn('⚠️ No user ID found for wallet balance refresh');
      }
    } catch (error) {
      console.error('❌ Error in wallet balance refresh:', error);
    }

    // Navigate to /video-hub
    router.push('/video-hub');
  };

  // Filter videos by search
  const filteredShorts = shorts.filter((v) =>
    v?.snippet?.title?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredLongs = longs.filter((v) =>
    v?.snippet?.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Get selected channel info
  const selectedChannelInfo = channelInfo.find((c) => c.id === selectedChannel.id);

  return (
    <IVXStoreProvider>
      <main className="min-h-screen bg-[#0A0F2C] text-white">
        <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          {/* Category Carousel */}
          <CategoryCarousel
            channels={transformChannelsData(channelInfo)}
            selectedChannelId={selectedChannel.id}
            onChannelSelect={(channel: any) => {
              const foundChannel = CHANNELS.find(c => c.id === channel.id);
              if (foundChannel) setSelectedChannel(foundChannel);
            }}
          />

          {/* Search Bar */}
          <div className="mt-4 md:mt-6">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search videos..."
            />
          </div>

          {/* Content Sections */}
          {!loading && (filteredShorts.length > 0 || filteredLongs.length > 0) ? (
            <>
              {/* Shorts Section */}
              {filteredShorts.length > 0 && (
                <section className="mt-8 md:mt-10">
                  <h2 className="text-pretty font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                    Shorts
                  </h2>
                  <ShortsRow
                    videos={transformShortsData(filteredShorts.slice(0, showCount))}
                    onVideoClick={(transformedVideo) => {
                      const originalVideo = filteredShorts.find(v => v.id === transformedVideo.id);
                      if (originalVideo) {
                        handleVideoClick(transformedVideo);
                      }
                    }}
                  />
                  {showCount < filteredShorts.length && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row items-center justify-center">
                      <button
                        onClick={() => setShowCount((c) => c + 8)}
                        className="inline-flex items-center justify-center rounded-[8px] border border-white/30 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors bg-white/10"
                      >
                        More Videos
                      </button>
                    </div>
                  )}
                </section> 
              )}

              {/* Play & Earn Banner */}
              <div className="mt-10 md:mt-12">
                <PlayEarnBanner />
              </div>

              {/* Long Videos Section */}
              {filteredLongs.length > 0 && (
                <section className="mt-10 md:mt-12">
                  <h2 className="text-pretty font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                    Videos
                  </h2>
                  <VideoGrid
                    videos={transformVideosData(filteredLongs.slice(0, showCountLong))}
                    onVideoClick={(transformedVideo) => {
                      const originalVideo = filteredLongs.find(v => v.id === transformedVideo.id);
                      if (originalVideo) {
                        handleVideoClick(transformedVideo);
                      }
                    }}
                  />
                  {showCountLong < filteredLongs.length && (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row items-center justify-center">
                      <button
                        onClick={() => setShowCountLong((c) => c + 8)}
                        className="inline-flex items-center justify-center rounded-[20px] border border-white/30 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                      >
                        More Videos
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          ) : !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No videos found for this channel</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Loading videos...</p>
            </div>
          )}

          {/* IVX Product Shelf Integration - Only shows when video is selected */}
          <div className="mt-12">
            <IVXVideoAttach />
          </div>
        </section>

        {/* Debug: Log video state */}
        {/* {modalOpen && console.log('Modal state:', { modalOpen, selectedVideo, hasId: selectedVideo?.id, hasSnippet: selectedVideo?.snippet, functionsReady })} */}

        {/* Fullscreen Video Player */}
        <VideoHubFullscreen
          isOpen={modalOpen && functionsReady}
          videoId={selectedVideo?.id || null}
          onClose={closeModal}
          isAutoPlayEnabled={queueState.isAutoPlayEnabled}
          onToggleAutoPlay={toggleAutoPlay}
          hasNextVideo={hasNextVideo()}
          isVideoAlreadyWatched={isVideoAlreadyWatched}
        >
          {/* Loading State */}
          {!functionsReady && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="bg-[#181F36] rounded-xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Initializing anti-cheat system...</p>
              </div>
            </div>
          )}
          
          {/* YouTube Player Container */}
          {functionsReady && (
            <>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-full max-w-full relative">
                  <div id="yt-player" className="w-full h-full" />
                  
                  {/* Fallback for when YouTube player fails to load */}
                  {!youTubeAPIReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
                      <div className="bg-[#181F36] rounded-xl p-8 text-center max-w-md mx-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">Video Player Unavailable</h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          The YouTube video player could not be loaded. This may be due to:
                        </p>
                        <ul className="text-gray-400 text-sm space-y-1 mb-6 text-left">
                          <li>• Ad blocker blocking YouTube content</li>
                          <li>• Network connectivity issues</li>
                          <li>• Browser security restrictions</li>
                        </ul>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Reload Page
                          </button>
                          <button
                            onClick={closeModal}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Close Video
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Details Overlay (Auto-hiding) */}
              {showVideoDetails && selectedVideo && (
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)' }}
                >
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-sm font-medium">
                        Video
                      </span>
                      <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-3 py-1 rounded text-sm font-medium">
                        {formatDuration(selectedVideo?.contentDetails?.duration || 'PT0S')}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                      {selectedVideo?.snippet?.title || 'Video Title'}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <span>👁</span>
                        <span>{formatViews(selectedVideo?.statistics?.viewCount || '0')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{timeAgo(selectedVideo?.snippet?.publishedAt || new Date().toISOString())}</span>
                      </div>
                      {selectedVideo?.snippet?.channelTitle && (
                        <div className="flex items-center gap-2">
                          <span>📺</span>
                          <span>{selectedVideo.snippet.channelTitle}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-300 text-base leading-relaxed max-w-3xl mb-4">
                      {selectedVideo?.snippet?.description ? 
                        selectedVideo.snippet.description.slice(0, 300) + (selectedVideo.snippet.description.length > 300 ? '...' : '') 
                        : 'No description available'
                      }
                    </p>

                    {/* Watch & Earn Section */}
                    <div className="bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 rounded-lg p-4 border border-[var(--color-primary)]/30 max-w-md">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[var(--color-primary)]">🎮</span>
                        <h4 className="text-sm font-semibold text-white">Watch & Earn</h4>
                      </div>
                      <p className="text-xs text-gray-400">
                        Watch this video completely to earn XUT rewards. Anti-cheat protection is active.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </VideoHubFullscreen>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-right-2">
            <div className={`rounded-lg px-4 py-3 shadow-lg max-w-sm ${toastMessage.type === 'success' ? 'bg-green-600 text-white' :
                toastMessage.type === 'warning' ? 'bg-yellow-600 text-white' :
                  toastMessage.type === 'info' ? 'bg-blue-600 text-white' :
                    'bg-red-600 text-white'
              }`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{toastMessage.message}</p>
                <button
                  onClick={() => setToastMessage(null)}
                  className="ml-3 text-white/80 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Toast */}
        {confirmationToast && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 text-white rounded-xl p-6 max-w-lg mx-4 shadow-2xl border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xl font-semibold text-white">Leave Video?</h3>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 text-base leading-relaxed">
                {confirmationToast.message}
              </p>
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-300 font-medium">
                    💡 You can always come back to watch this video later!
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={confirmationToast.onCancel}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Stay & Watch
                </button>
                <button
                  onClick={confirmationToast.onConfirm}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 border border-transparent rounded-lg hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Leave Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Anti-Cheat Warning Dialog */}
        {antiCheatWarning && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 text-white rounded-xl p-6 max-w-lg mx-4 shadow-2xl border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xl font-semibold text-white">{antiCheatWarning.title}</h3>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 text-base leading-relaxed">
                  {antiCheatWarning.message}
                </p>
                <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-sm text-orange-300 font-medium">
                    💡 Stay engaged and earn rewards by watching videos fairly!
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={antiCheatWarning.onSecondary}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  {antiCheatWarning.secondaryLabel}
                </button>
                <button
                  onClick={antiCheatWarning.onPrimary}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 border border-transparent rounded-lg hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {antiCheatWarning.primaryLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* YouTube-Style "Up Next" Countdown */}
        <UpNextCountdown
          nextVideo={getNextVideo()}
          countdown={countdown}
          isVisible={showCountdown}
          onPlayNow={() => {
            playNextVideo((nextVideo) => {
              setSelectedVideo(nextVideo);
              setVideoCompleted(false);
              // Reset anti-cheat flags for new video
              antiCheatFlagsRef.current = {
                seekDetected: false,
                speedChanged: false,
                tabSwitched: false,
                refreshDetected: false,
                pauseDetected: false
              };
            });
          }}
          onCancel={() => {
            cancelAutoPlayCountdown();
          }}
          onSkip={() => {
            skipToNext((nextVideo) => {
              setSelectedVideo(nextVideo);
              setVideoCompleted(false);
              // Reset anti-cheat flags for new video
              antiCheatFlagsRef.current = {
                seekDetected: false,
                speedChanged: false,
                tabSwitched: false,
                refreshDetected: false,
                pauseDetected: false
              };
            });
          }}
        />
      </main>
    </IVXStoreProvider>
  );
} 