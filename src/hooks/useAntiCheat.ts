import { useEffect, useRef, useCallback } from 'react';
import { useVideoRewards } from './useVideoRewards';

export const useAntiCheat = () => {
  const { setFlag, resetFlags, watchInProgress } = useVideoRewards();
  const lastTimeRef = useRef<number>(0);
  const lastSpeedRef = useRef<number>(1);
  const tabFocusRef = useRef<boolean>(true);
  const refreshDetectedRef = useRef<boolean>(false);

  // Detect seek operations
  const detectSeek = useCallback((currentTime: number, duration: number) => {
    if (lastTimeRef.current > 0) {
      const timeDiff = Math.abs(currentTime - lastTimeRef.current);
      // If time jump is more than 5 seconds, it's likely a seek
      if (timeDiff > 5 && currentTime > lastTimeRef.current) {
        setFlag('seekDetected', true);
      }
    }
    lastTimeRef.current = currentTime;
  }, [setFlag]);

  // Detect playback speed changes
  const detectSpeedChange = useCallback((speed: number) => {
    if (lastSpeedRef.current !== speed && speed !== 1) {
      setFlag('speedChanged', true);
    }
    lastSpeedRef.current = speed;
  }, [setFlag]);

  // Detect tab switching
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && watchInProgress) {
      setFlag('tabSwitched', true);
      tabFocusRef.current = false;
    } else if (!document.hidden && !tabFocusRef.current) {
      tabFocusRef.current = true;
    }
  }, [watchInProgress, setFlag]);

  // Detect page refresh
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (watchInProgress) {
      setFlag('refreshDetected', true);
      refreshDetectedRef.current = true;
      // Show warning to user
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? You will lose your reward progress.';
      return 'Are you sure you want to leave? You will lose your reward progress.';
    }
    return undefined; // Return undefined when watch is not in progress
  }, [watchInProgress, setFlag]);

  // Detect page visibility changes
  const handlePageShow = useCallback(() => {
    if (refreshDetectedRef.current && watchInProgress) {
      setFlag('refreshDetected', true);
    }
  }, [watchInProgress, setFlag]);

  // Reset all flags when starting a new watch
  useEffect(() => {
    if (watchInProgress) {
      resetFlags();
      lastTimeRef.current = 0;
      lastSpeedRef.current = 1;
      tabFocusRef.current = true;
      refreshDetectedRef.current = false;
    }
  }, [watchInProgress, resetFlags]);

  // Set up event listeners
  useEffect(() => {
    if (watchInProgress) {
      // Tab visibility
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Page refresh
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', () => {
        if (watchInProgress) {
          setFlag('refreshDetected', true);
        }
      });
      
      // Page show (after refresh)
      window.addEventListener('pageshow', handlePageShow);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', () => {});
        window.removeEventListener('pageshow', handlePageShow);
      };
    }
    return () => {}; // Return empty cleanup function when watch is not in progress
  }, [watchInProgress, handleVisibilityChange, handleBeforeUnload, handlePageShow, setFlag]);

  // Function to check if video is eligible for rewards
  const isEligibleForRewards = useCallback(() => {
    return !Object.values({
      seekDetected: false,
      speedChanged: false,
      tabSwitched: false,
      refreshDetected: false,
    }).some(flag => flag);
  }, []);

  return {
    detectSeek,
    detectSpeedChange,
    isEligibleForRewards,
  };
};
