import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerProps {
  timeout: number; // Timeout in milliseconds (e.g., 30000 for 30 seconds)
  onInactive: () => void; // Callback when user becomes inactive
  onActive: () => void; // Callback when user becomes active again
  enabled?: boolean; // Whether the timer is enabled
}

export const useInactivityTimer = ({
  timeout,
  onInactive,
  onActive,
  enabled = true
}: UseInactivityTimerProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isInactiveRef = useRef(false);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (enabled && !isInactiveRef.current) {
      console.log(`Starting inactivity timer for ${timeout}ms`);
      timerRef.current = setTimeout(() => {
        console.log('Inactivity timeout reached, calling onInactive');
        isInactiveRef.current = true;
        onInactive();
      }, timeout);
    }
  }, [timeout, onInactive, enabled]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    if (isInactiveRef.current) {
      console.log('User became active, calling onActive');
      isInactiveRef.current = false;
      onActive();
    }
    // Only reset timer if user is not already inactive
    if (!isInactiveRef.current) {
      resetTimer();
    }
  }, [onActive, resetTimer]);

  // Set up activity event listeners
  useEffect(() => {
    if (!enabled) return;

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
      'wheel'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, handleUserActivity, resetTimer]);

  // Reset timer when enabled state changes
  useEffect(() => {
    if (enabled) {
      resetTimer();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [enabled, resetTimer]);

  // Return functions for manual control
  return {
    resetTimer,
    handleUserActivity,
    isInactive: isInactiveRef.current
  };
};
