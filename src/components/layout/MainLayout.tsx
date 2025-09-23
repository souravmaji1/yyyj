"use client";

import { TopBar } from './navigation/topBar';
import { Navigation } from './navigation';
import { Footer } from './footer';
import { InactivityTimer } from '../auth/InactivityTimer';
import FloatingChatWidget from '../arena/FloatingChatWidget';
import { AssistantPanel, AssistantButton } from '@/src/components/assistant';
import { ToastHost } from '@/src/components/studio/ToastHost';
import { isKeyObject } from 'util/types';
import { isKioskInterface, getKioskMacFromLocalStorage } from '@/src/core/utils';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import ScreensaverAdPlayer from '../kiosk/ScreensaverAdPlayer';
import { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const isUser = useSelector((state: RootState) => state.user.profile);
  const [showScreensaver, setShowScreensaver] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const machineId = getKioskMacFromLocalStorage();

  // Show screensaver after 30 seconds of inactivity in kiosk mode for non-logged users
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (isKioskInterface() && machineId && !isUser) {
      // Clear any existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Set new 30-second timer
      timer = setTimeout(() => {
        setShowScreensaver(true);
      }, 30000); // 30 seconds
      
      setInactivityTimer(timer);
    } else {
      // Clear timer and hide screensaver for logged users
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        setInactivityTimer(null);
      }
      setShowScreensaver(false);
      
      // Return empty cleanup function
      return () => {};
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isUser, machineId]);

  // Handle return from screensaver
  const handleReturnFromScreensaver = () => {
    setShowScreensaver(false);
    
    // Reset the 30-second timer when user returns
    if (isKioskInterface() && machineId && !isUser) {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      const timer = setTimeout(() => {
        setShowScreensaver(true);
      }, 30000);
      
      setInactivityTimer(timer);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  return (
    <>
      <div className="sticky top-0 z-50">
        {/* <div className="bg-[#021A62]">
          <TopBar />
        </div> */}
        <Navigation />
      </div>
      {children}
      <Footer />
      
      {/* Floating Chat Widget - Available on all pages */}
      <FloatingChatWidget />
      
      {/* AI Assistant Panel - Site-wide */}
      <AssistantPanel  />
      
      {/* Mobile Assistant FAB - Only show on mobile screens */}
      <div className="lg:hidden">
        <AssistantButton variant="fab" size="lg" />
      </div>
      
      {/* Toast notifications for feedback and other messages */}
      <ToastHost />
      
      {/* Show InactivityTimer for logged-in users in kiosk mode */}
      {isKioskInterface() && isUser && (
        <InactivityTimer />
      )}
      
      {/* Show ScreensaverAdPlayer after logout in kiosk mode */}
      {isKioskInterface() && machineId && !isUser && showScreensaver && (
        <ScreensaverAdPlayer
          machineId={machineId}
          onUserActivity={handleReturnFromScreensaver}
          isVisible={showScreensaver}
        />
      )}
    </>
  );
}; 