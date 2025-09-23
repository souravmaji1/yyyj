"use client";

import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/src/store';
import { AppDispatch } from '@/src/store';
import { useAuth } from '@/src/app/apis/auth/UserAuth';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 30000; // 30 seconds
const MODAL_DISPLAY_TIME = 5000; // 5 seconds

export const InactivityTimer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { logout } = useAuth();
  const isUser = useSelector((state: RootState) => state.user.profile);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MODAL_DISPLAY_TIME / 1000);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const modalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (isUser) {
      inactivityTimerRef.current = setTimeout(() => {
        setShowModal(true);
        setTimeLeft(MODAL_DISPLAY_TIME / 1000);
        
        // Start countdown timer
        countdownTimerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Auto logout after countdown
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Auto logout after modal display time
        modalTimerRef.current = setTimeout(() => {
          handleLogout();
        }, MODAL_DISPLAY_TIME);
      }, INACTIVITY_TIMEOUT);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    setShowModal(false);
    setTimeLeft(MODAL_DISPLAY_TIME / 1000);
    
    // Dispatch logout
    logout()
    router.push('/');
  };

  // Handle user activity
  const handleUserActivity = () => {
    if (showModal) {
      // If modal is showing, close it and reset timer
      setShowModal(false);
      setTimeLeft(MODAL_DISPLAY_TIME / 1000);
      
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }
    
    resetInactivityTimer();
  };

  // Set up event listeners for user activity
  useEffect(() => {
    if (!isUser) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Start initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  if (!isUser) return null;

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Session Timeout Warning
            </h3>
            <p className="text-gray-600 mb-4">
              You've been inactive for 30 seconds. You will be automatically logged out in:
            </p>
            <div className="text-2xl font-bold text-red-600 mb-4">
              {timeLeft} seconds
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleUserActivity}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Stay Logged In
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Logout Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 