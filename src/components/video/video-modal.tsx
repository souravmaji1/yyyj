"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowLeft, Maximize2, Minimize2, Play, Pause } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Video {
  id: string;
  title: string;
  desc: string;
  img: string;
  duration?: string;
  views?: string;
  publishedAt?: string;
  url?: string;
}

interface VideoModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

export function VideoModal({ video, isOpen, onClose, onBack }: VideoModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Netflix-like UI visibility state
  const [isUIVisible, setIsUIVisible] = useState(true);
  const mouseActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse activity detection for Netflix-like behavior
  const handleMouseActivity = useCallback(() => {
    setIsUIVisible(true);
    
    // Clear existing timeout
    if (mouseActivityTimeoutRef.current) {
      clearTimeout(mouseActivityTimeoutRef.current);
    }
    
    // Set new timeout to hide UI after 3 seconds of inactivity
    mouseActivityTimeoutRef.current = setTimeout(() => {
      setIsUIVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
      setIsPlaying(false);
      setIsUIVisible(true);
      if (mouseActivityTimeoutRef.current) {
        clearTimeout(mouseActivityTimeoutRef.current);
        mouseActivityTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, onClose]);

  // Setup mouse activity listeners for fullscreen mode
  useEffect(() => {
    if (!isOpen || !isFullscreen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const events = ['mousemove', 'mouseenter', 'click', 'keydown'];
    
    events.forEach(event => {
      modal.addEventListener(event, handleMouseActivity);
    });

    // Initial timeout when entering fullscreen
    handleMouseActivity();

    return () => {
      events.forEach(event => {
        modal.removeEventListener(event, handleMouseActivity);
      });
      
      if (mouseActivityTimeoutRef.current) {
        clearTimeout(mouseActivityTimeoutRef.current);
      }
    };
  }, [isOpen, isFullscreen, handleMouseActivity]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className={`relative w-full h-full flex flex-col ${
          isFullscreen ? 'p-0' : 'p-4 md:p-8'
        }`}
        style={{
          cursor: isFullscreen && !isUIVisible ? 'none' : 'default'
        }}
      >
        {/* Header Controls */}
        {!isFullscreen && (
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex items-center gap-3">
                <img 
                  src="/logo/intelliverse-X img-1.svg" 
                  alt="Intelliverse X" 
                  className="w-6 h-6"
                />
                <h2 className="text-xl font-bold text-white truncate">
                  {video.title}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Video Container */}
        <div className={`relative flex-1 bg-black rounded-lg overflow-hidden ${
          isFullscreen ? 'rounded-none' : ''
        }`}>
          {/* Fullscreen Controls Overlay */}
          {isFullscreen && (
            <AnimatePresence>
              {isUIVisible && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-4 right-4 z-10 flex items-center gap-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-black/50 hover:text-white bg-black/30"
                  >
                    <Minimize2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-black/50 hover:text-white bg-black/30"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Video Player Placeholder */}
          <div className="relative w-full h-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center">
            {/* Placeholder for actual video player */}
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 hover:text-white p-6"
                >
                  {isPlaying ? (
                    <Pause className="h-12 w-12" />
                  ) : (
                    <Play className="h-12 w-12 ml-1" />
                  )}
                </Button>
              </div>
              <div className="text-white space-y-2">
                <h3 className="text-lg font-semibold">{video.title}</h3>
                <p className="text-gray-300 text-sm max-w-md mx-auto">{video.desc}</p>
                {video.views && video.publishedAt && (
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <span>👁 {video.views}</span>
                    <span>📅 {video.publishedAt}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video element (hidden for now, would be replaced with actual video) */}
            <video
              ref={videoRef}
              className="hidden w-full h-full object-contain"
              controls={false}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              src={video.url}
            />
          </div>
        </div>

        {/* Video Details (only shown when not fullscreen) */}
        {!isFullscreen && (
          <div className="mt-4 px-2">
            <div className="bg-[var(--color-surface)]/80 rounded-lg p-4 border border-slate-700/50">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Video
                </Badge>
                {video.duration && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                    {video.duration}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{video.desc}</p>
              
              {video.views && video.publishedAt && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/30">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>👁</span>
                    <span>{video.views}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>📅</span>
                    <span>{video.publishedAt}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}