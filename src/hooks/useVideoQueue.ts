import { useState, useCallback, useRef, useEffect } from 'react';
import { getLocalData, setLocalData } from '@/src/core/config/localStorage';

export interface VideoData {
  id: string;
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      high?: { url: string };
      default?: { url: string };
    };
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
  };
}

export interface VideoQueueState {
  shorts: VideoData[];
  longs: VideoData[];
  currentIndex: {
    shorts: number;
    longs: number;
  };
  isAutoPlayEnabled: boolean;
  currentVideoType: 'short' | 'long' | null;
}

export const useVideoQueue = () => {
  // Load persisted state from localStorage
  const getInitialState = (): VideoQueueState => {
    const persistedState = getLocalData<VideoQueueState>('videoQueueState');
    if (persistedState && persistedState.shorts && persistedState.longs) {
      return {
        ...persistedState,
        // Always reset countdown state on reload
        currentVideoType: persistedState.currentVideoType
      };
    }
    
    return {
      shorts: [],
      longs: [],
      currentIndex: {
        shorts: 0,
        longs: 0
      },
      isAutoPlayEnabled: true,
      currentVideoType: null
    };
  };

  const [queueState, setQueueState] = useState<VideoQueueState>(getInitialState());

  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Initialize video queues
  const initializeQueues = useCallback((shorts: VideoData[], longs: VideoData[]) => {
    setQueueState(prev => {
      // If queues are already populated and match, preserve current state
      if (prev.shorts.length > 0 && prev.longs.length > 0 &&
          prev.shorts.length === shorts.length && prev.longs.length === longs.length) {
        return prev;
      }
      
      return {
        ...prev,
        shorts,
        longs,
        // Only reset indexes if this is a new queue set
        currentIndex: prev.shorts.length === 0 && prev.longs.length === 0 ? {
          shorts: 0,
          longs: 0
        } : prev.currentIndex
      };
    });
  }, []);

  // Set current video and determine type
  const setCurrentVideo = useCallback((video: VideoData) => {
    const isShort = parseDuration(video.contentDetails.duration) < 60 || 
                   video.snippet.title.toLowerCase().includes("short");
    
    setQueueState(prev => ({
      ...prev,
      currentVideoType: isShort ? 'short' : 'long'
    }));
  }, []);

  // Get next video in queue
  const getNextVideo = useCallback((): VideoData | null => {
    const { currentVideoType, currentIndex, shorts, longs } = queueState;
    
    if (!currentVideoType) return null;

    if (currentVideoType === 'short') {
      const nextIndex = currentIndex.shorts + 1;
      if (nextIndex < shorts.length) {
        return shorts[nextIndex] || null;
      }
    } else {
      const nextIndex = currentIndex.longs + 1;
      if (nextIndex < longs.length) {
        return longs[nextIndex] || null;
      }
    }
    
    return null;
  }, [queueState]);

  // Move to next video
  const moveToNext = useCallback(() => {
    const { currentVideoType, currentIndex } = queueState;
    
    if (!currentVideoType) return;

    setQueueState(prev => ({
      ...prev,
      currentIndex: {
        ...prev.currentIndex,
        [currentVideoType === 'short' ? 'shorts' : 'longs']: 
          prev.currentIndex[currentVideoType === 'short' ? 'shorts' : 'longs'] + 1
      }
    }));
  }, [queueState]);

  // Toggle auto-play
  const toggleAutoPlay = useCallback(() => {
    setQueueState(prev => ({
      ...prev,
      isAutoPlayEnabled: !prev.isAutoPlayEnabled
    }));
  }, []);

  // Start auto-play countdown (YouTube-style with countdown display)
  const startAutoPlayCountdown = useCallback((onNextVideo: (video: VideoData) => void) => {
    if (!queueState.isAutoPlayEnabled) return;

    const nextVideo = getNextVideo();
    if (!nextVideo) return;

    // Clear any existing timeouts/intervals
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown display
    setShowCountdown(true);
    setCountdown(10);

    // Start countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown finished, play next video
          clearInterval(countdownIntervalRef.current!);
          setShowCountdown(false);
          moveToNext();
          setCurrentVideo(nextVideo);
          onNextVideo(nextVideo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [queueState.isAutoPlayEnabled, getNextVideo, moveToNext, setCurrentVideo]);

  // Cancel auto-play countdown
  const cancelAutoPlayCountdown = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowCountdown(false);
    setCountdown(10);
  }, []);

  // Play next video immediately (cancel countdown and play now)
  const playNextVideo = useCallback((onNextVideo: (video: VideoData) => void) => {
    cancelAutoPlayCountdown();
    
    const nextVideo = getNextVideo();
    if (!nextVideo) return;

    moveToNext();
    setCurrentVideo(nextVideo);
    onNextVideo(nextVideo);
  }, [cancelAutoPlayCountdown, getNextVideo, moveToNext, setCurrentVideo]);

  // Skip to next video immediately (seamless)
  const skipToNext = useCallback((onNextVideo: (video: VideoData) => void) => {
    cancelAutoPlayCountdown();
    
    const nextVideo = getNextVideo();
    if (!nextVideo) return;

    moveToNext();
    setCurrentVideo(nextVideo);
    onNextVideo(nextVideo);
  }, [cancelAutoPlayCountdown, getNextVideo, moveToNext, setCurrentVideo]);

  // Check if there are more videos
  const hasNextVideo = useCallback((): boolean => {
    return getNextVideo() !== null;
  }, [getNextVideo]);

  // Get current video info
  const getCurrentVideoInfo = useCallback(() => {
    const { currentVideoType, currentIndex, shorts, longs } = queueState;
    
    if (!currentVideoType) return null;

    const videos = currentVideoType === 'short' ? shorts : longs;
    const index = currentVideoType === 'short' ? currentIndex.shorts : currentIndex.longs;
    
    return {
      current: videos[index],
      next: getNextVideo(),
      position: index + 1,
      total: videos.length,
      type: currentVideoType
    };
  }, [queueState, getNextVideo]);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (queueState.shorts.length > 0 || queueState.longs.length > 0) {
      setLocalData('videoQueueState', queueState);
    }
  }, [queueState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    queueState,
    isTransitioning,
    showCountdown,
    countdown,
    
    // Actions
    initializeQueues,
    setCurrentVideo,
    getNextVideo,
    moveToNext,
    toggleAutoPlay,
    startAutoPlayCountdown,
    cancelAutoPlayCountdown,
    playNextVideo,
    skipToNext,
    hasNextVideo,
    getCurrentVideoInfo
  };
};

// Utility function to parse duration
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match?.[1] || "0");
  const minutes = parseInt(match?.[2] || "0");
  const seconds = parseInt(match?.[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}
