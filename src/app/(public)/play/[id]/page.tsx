"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ARENA_EVENTS } from "@/src/data/arena";
import { getExternalGameUrl } from "@/src/lib/arena-utils";
import { useAuthState } from "@/src/hooks/useAuthState";

export default function PlayGamePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthState();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const event = useMemo(() => {
    const found = ARENA_EVENTS.find((e) => e.id === params?.id);
    return found;
  }, [params]);

  const gameUrl = useMemo(() => {
    if (!event?.externalGameUrl) return null;
    return getExternalGameUrl(
      event.externalGameUrl,
      event.requiresOAuth ? token : undefined,
      true // Enable auto fullscreen
    );
  }, [event, token]);

  useEffect(() => {
    if (!event || !gameUrl) return;

    // Note: Message handling is done in a separate useEffect below
    console.log('PlayGamePage useEffect - Version 2.0 - Fullscreen fix applied');

    // Utility function to check fullscreen support and availability
    const checkFullscreenPermissions = async () => {
      try {
        console.log('Checking fullscreen permissions...');
        
        // Check if fullscreen is supported
        const isSupported = !!(
          document.fullscreenEnabled ||
          (document as any).webkitFullscreenEnabled ||
          (document as any).mozFullScreenEnabled ||
          (document as any).msFullscreenEnabled
        );
        
        console.log('Fullscreen supported:', isSupported);
        
        if (!isSupported) {
          console.log('Fullscreen not supported by browser');
          return false;
        }
        
        // Check if already in fullscreen
        const isAlreadyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        
        console.log('Already in fullscreen:', isAlreadyFullscreen);
        
        if (isAlreadyFullscreen) {
          console.log('Already in fullscreen mode');
          return false;
        }
        
        console.log('Fullscreen check passed');
        return true; // Fullscreen is supported and available
      } catch (error) {
        console.error('Error in checkFullscreenPermissions:', error);
        return false; // Return false on error to be safe
      }
    };

    // Function to try clicking Unity fullscreen button
    const tryUnityFullscreenButton = () => {
      const iframe = iframeRef.current;
      if (iframe) {
        try {
          // First try direct access (works for same-origin games)
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Look for Unity fullscreen button
            const unityButton = iframeDoc.getElementById('unity-fullscreen-button');
            if (unityButton) {
              console.log('Found Unity fullscreen button, clicking...');
              unityButton.click();
              return true;
            }
          }
        } catch (error) {
          console.log('Unity fullscreen button direct access failed (likely cross-origin):', error);
          
          // Fallback: Use postMessage to communicate with the game
          try {
            if (iframe.contentWindow) {
              console.log('Attempting postMessage communication for Unity fullscreen...');
              iframe.contentWindow.postMessage({
                type: 'TRIGGER_FULLSCREEN',
                action: 'clickUnityButton',
                target: 'unity-fullscreen-button'
              }, '*');
              return true; // Assume success for postMessage
            }
          } catch (postError) {
            console.log('PostMessage communication also failed:', postError);
          }
        }
      }
      return false;
    };

    // Function to try fullscreen on the iframe/game
    const tryGameFullscreen = async () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) {
          console.log('No iframe found');
          return;
        }

        // Check permissions first
        const hasPermission = await checkFullscreenPermissions();
        if (!hasPermission) {
          console.log('Fullscreen not available or not supported');
          return;
        }

        // First, try to communicate with the game via postMessage to trigger internal fullscreen
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'TRIGGER_FULLSCREEN',
              action: 'enterFullscreen',
              source: 'parent-frame'
            }, '*');
            console.log('Sent postMessage to trigger game fullscreen');
          }
        } catch (error) {
          console.log('PostMessage communication failed:', error);
        }

        // Also try to make the iframe itself fullscreen as a fallback
        const iframeElement = iframe as any;
        const request =
          iframeElement.requestFullscreen ||
          iframeElement.webkitRequestFullscreen ||
          iframeElement.msRequestFullscreen ||
          iframeElement.mozRequestFullScreen;

        if (request) {
          try {
            // Check if fullscreen is supported and not already active
            if (document.fullscreenElement || 
                (document as any).webkitFullscreenElement || 
                (document as any).mozFullScreenElement || 
                (document as any).msFullscreenElement) {
              console.log('Already in fullscreen mode');
              return;
            }

            // Request fullscreen with proper error handling
            const result = await request.call(iframeElement);
            console.log('Iframe fullscreen request successful:', result);
          } catch (error) {
            console.log('Direct iframe fullscreen failed:', error);
            // Don't throw the error, just log it and continue
          }
        }
      } catch (error) {
        console.error('Error in tryGameFullscreen:', error);
        // Don't re-throw the error to prevent uncaught promise rejection
      }
    };

    // Container fullscreen as final fallback
    const tryContainerFullscreen = async () => {
      const el = containerRef.current as any;
      if (!el) {
        console.log('Container element not found for fullscreen');
        return;
      }

      // Check permissions first
      const hasPermission = await checkFullscreenPermissions();
      if (!hasPermission) {
        console.log('Fullscreen permission not granted for container');
        return;
      }

      // Check if already in fullscreen
      if (document.fullscreenElement || 
          (document as any).webkitFullscreenElement || 
          (document as any).mozFullScreenElement || 
          (document as any).msFullscreenElement) {
        console.log('Already in fullscreen mode');
        return;
      }

      const request =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.msRequestFullscreen ||
        el.mozRequestFullScreen;

      try {
        if (request) {
          await request.call(el);
          console.log('Container fullscreen successful');
        } else {
          console.log('Fullscreen API not supported');
        }
      } catch (error) {
        console.log('Container fullscreen failed:', error);
        // Don't throw the error, just log it
      }
    };

    // Wait for iframe to load, then trigger fullscreen
    const iframe = iframeRef.current;
    const handleIframeLoad = () => {
      // Wait a bit for the game to initialize
      setTimeout(() => {
        // First try Unity fullscreen button (most specific)
        const unityClicked = tryUnityFullscreenButton();
        
        // If Unity button wasn't found or clicked, try other fullscreen methods
        if (!unityClicked) {
          tryGameFullscreen().catch(error => {
            console.log('Game fullscreen failed:', error);
          });
        }
      }, 1000);
      
      // Also try Unity button multiple times with increasing delays for games that load slowly
      setTimeout(() => tryUnityFullscreenButton(), 2000);
      setTimeout(() => tryUnityFullscreenButton(), 3000);
      setTimeout(() => tryUnityFullscreenButton(), 5000);
    };

    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    // Also try immediately and on container click as backup
    const immediateTimer = setTimeout(() => {
      // Try Unity button first, then fallback to other methods
      const unityClicked = tryUnityFullscreenButton();
      if (!unityClicked) {
        tryGameFullscreen().catch(error => {
          console.log('Game fullscreen failed:', error);
        });
        // If that doesn't work, try container fullscreen
        setTimeout(tryContainerFullscreen, 500);
      }
    }, 100);

    // Click handler for container as final fallback
    const el = containerRef.current;
    const handleClick = async (event: Event) => {
      // Ensure this is a user gesture
      event.preventDefault();
      console.log('User clicked container, attempting fullscreen...');
      
      try {
        const unityClicked = tryUnityFullscreenButton();
        if (!unityClicked) {
          await tryGameFullscreen();
        }
        
        // If game fullscreen didn't work, try container fullscreen as fallback
        setTimeout(() => {
          tryContainerFullscreen().catch(error => {
            console.log('Container fullscreen failed:', error);
          });
        }, 300);
      } catch (error) {
        console.log('Game fullscreen failed:', error);
      }
    };
    el?.addEventListener?.("click", handleClick, { once: true });

    return () => {
      clearTimeout(immediateTimer);
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [event, gameUrl]);

  // Listen for messages from the game iframe
  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      // Only listen to messages from the game domain for security
      if (gameUrl && !event.origin.includes(new URL(gameUrl).origin)) {
        return;
      }

      if (event.data?.type === 'GAME_READY') {
        console.log('Game ready message received, attempting fullscreen...');
        // Game is ready, try fullscreen after a short delay
        setTimeout(() => {
          const iframe = iframeRef.current;
          if (iframe) {
            // Try Unity button first
            const tryUnityButton = () => {
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  const unityButton = iframeDoc.getElementById('unity-fullscreen-button');
                  if (unityButton) {
                    console.log('Game ready: clicking Unity fullscreen button');
                    unityButton.click();
                    return true;
                  }
                }
              } catch (error) {
                console.log('Unity button click failed on game ready (cross-origin):', error);
                // Fallback to postMessage
                iframe.contentWindow?.postMessage({
                  type: 'TRIGGER_FULLSCREEN',
                  action: 'clickUnityButton',
                  target: 'unity-fullscreen-button'
                }, '*');
                return true; // Assume success for postMessage
              }
              return false;
            };

            // Try Unity button, then fallback to general fullscreen
            const unityClicked = tryUnityButton();
            if (!unityClicked) {
              // Use the async tryGameFullscreen function
              const tryGameFullscreenAsync = async () => {
                try {
                  if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                      type: 'TRIGGER_FULLSCREEN',
                      action: 'enterFullscreen',
                      source: 'parent-frame'
                    }, '*');
                  }
                } catch (error) {
                  console.log('PostMessage in game ready handler failed:', error);
                }
              };
              tryGameFullscreenAsync();
            }
          }
        }, 500);
      } else if (event.data?.type === 'FULLSCREEN_SUCCESS') {
      } else if (event.data?.type === 'FULLSCREEN_FAILED') {
        console.log('Game reported fullscreen failure, trying container fullscreen');
        const containerRef = document.querySelector('.game-container');
        if (containerRef) {
          const request = (containerRef as any).requestFullscreen || 
                         (containerRef as any).webkitRequestFullscreen ||
                         (containerRef as any).msRequestFullscreen ||
                         (containerRef as any).mozRequestFullScreen;
          if (request) {
            request.call(containerRef);
          }
        }
      }
    };

    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [gameUrl]);

  // Handle escape key for back navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [router]);

  const handleBackClick = () => {
    // Check if we came from the arena page
    if (document.referrer.includes('/arena')) {
      router.back();
    } else {
      router.push('/arena');
    }
  };

  useEffect(() => {
    if (!event) {
      router.replace("/arena");
    }
  }, [event, router]);

  if (!event || !gameUrl) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black"
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Netflix-style Back Button - Always Visible */}
      <button
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-[10000] bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Go back to arena"
        title="Press Escape or click to go back"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Game Title Overlay - Always Visible */}
      <div className="fixed top-4 left-16 sm:left-20 z-[10000]">
        <h1 className="text-white text-lg sm:text-xl font-semibold bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          {event.title}
        </h1>
      </div>

      <iframe
        ref={iframeRef}
        src={gameUrl}
        title={event.title}
        allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; camera; microphone; geolocation;"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        className="w-screen h-screen border-0 block"
        style={{ display: "block" }}
      />
    </div>
  );
}


