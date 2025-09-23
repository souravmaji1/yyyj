"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface FullscreenRootProps {
  /**
   * The video container element ref that will become fullscreen
   */
  videoContainerRef: React.RefObject<HTMLElement>;
  
  /**
   * Whether fullscreen mode is active
   */
  isActive: boolean;
  
  /**
   * Children to render inside the fullscreen container
   */
  children: React.ReactNode;
}

/**
 * FullscreenRoot component that manages overlay rendering in fullscreen mode
 * 
 * This component:
 * 1. Creates a container inside the fullscreen element
 * 2. Uses React portals to render children inside the fullscreen context
 * 3. Provides proper cleanup when exiting fullscreen
 */
export function FullscreenRoot({ 
  videoContainerRef, 
  isActive, 
  children 
}: FullscreenRootProps) {
  const [fsContainer, setFsContainer] = useState<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Create and manage the fullscreen container
  useEffect(() => {
    if (!isActive || !videoContainerRef.current) {
      // Clean up existing container when not in fullscreen
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      setFsContainer(null);
      return;
    }

    const videoContainer = videoContainerRef.current;
    
    // Create the fullscreen overlay container
    const container = document.createElement("div");
    container.className = "fs-root-container";
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      pointer-events: none;
    `;

    // Append to the video container (which is the fullscreen element)
    videoContainer.appendChild(container);
    setFsContainer(container);

    // Setup cleanup function
    cleanupRef.current = () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    // Cleanup when unmounting or when fullscreen changes
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isActive, videoContainerRef]);

  // Only render portal when we have a container and are in fullscreen
  if (!isActive || !fsContainer) {
    return null;
  }

  return createPortal(children, fsContainer);
}

/**
 * Hook to manage fullscreen overlay container
 * Returns a container element that can be used with createPortal
 */
export function useFullscreenContainer(
  videoContainerRef: React.RefObject<HTMLElement>,
  isActive: boolean
): HTMLElement | null {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !videoContainerRef.current) {
      setContainer(null);
      return;
    }

    // Use existing fs-root-container or create one
    let fsContainer = videoContainerRef.current.querySelector('.fs-root-container') as HTMLElement;
    
    if (!fsContainer) {
      fsContainer = document.createElement('div');
      fsContainer.className = 'fs-root-container';
      fsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        pointer-events: none;
      `;
      videoContainerRef.current.appendChild(fsContainer);
    }

    setContainer(fsContainer);

    return () => {
      // Don't remove the container here - let FullscreenRoot handle it
      // This prevents race conditions between multiple components using the hook
    };
  }, [isActive, videoContainerRef]);

  return container;
}

/**
 * Context for sharing fullscreen state across components
 */
export const FullscreenContext = React.createContext<{
  isActive: boolean;
  container: HTMLElement | null;
  videoContainerRef: React.RefObject<HTMLElement> | null;
}>({
  isActive: false,
  container: null,
  videoContainerRef: null,
});

/**
 * Provider component for fullscreen context
 */
export function FullscreenProvider({ 
  children, 
  videoContainerRef, 
  isActive 
}: {
  children: React.ReactNode;
  videoContainerRef: React.RefObject<HTMLElement>;
  isActive: boolean;
}) {
  const container = useFullscreenContainer(videoContainerRef, isActive);

  return (
    <FullscreenContext.Provider value={{ isActive, container, videoContainerRef }}>
      {children}
    </FullscreenContext.Provider>
  );
}

/**
 * Hook to use fullscreen context
 */
export function useFullscreen() {
  return React.useContext(FullscreenContext);
}