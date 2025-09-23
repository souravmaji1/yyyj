"use client";

import { useState, useEffect } from 'react';
import { Play, X, SkipForward } from 'lucide-react';
import { VideoData } from '../../hooks/useVideoQueue';

interface UpNextCountdownProps {
  nextVideo: VideoData | null;
  countdown: number;
  isVisible: boolean;
  onPlayNow: () => void;
  onCancel: () => void;
  onSkip: () => void;
}

export function UpNextCountdown({
  nextVideo,
  countdown,
  isVisible,
  onPlayNow,
  onCancel,
  onSkip
}: UpNextCountdownProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible && countdown > 0) {
      const interval = setInterval(() => {
        setProgress((10 - countdown) / 10 * 100);
      }, 100);
      return () => clearInterval(interval);
    }
    
    // Return empty cleanup function when not visible or countdown is 0
    return () => {};
  }, [isVisible, countdown]);

  if (!isVisible || !nextVideo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 p-6 shadow-2xl max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-lg font-semibold">Up next</span>
          </div>
          <button
            onClick={onCancel}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Next Video Preview */}
        <div className="flex gap-4 mb-4">
          <div className="relative w-24 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
            <img
              src={nextVideo.snippet.thumbnails?.high?.url || nextVideo.snippet.thumbnails?.default?.url || ''}
              alt={nextVideo.snippet.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-base font-medium line-clamp-2 leading-tight mb-1">
              {nextVideo.snippet.title}
            </h3>
            <p className="text-white/70 text-sm mb-2">
              {nextVideo.snippet.channelTitle}
            </p>
            <div className="flex items-center gap-3 text-white/60 text-xs">
              <span>{formatDuration(nextVideo.contentDetails.duration)}</span>
              <span>•</span>
              <span>{formatViews(nextVideo.statistics.viewCount || '0')}</span>
            </div>
          </div>
        </div>

        {/* Countdown Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">
              Playing in {countdown} seconds
            </span>
            <span className="text-white/60 text-sm">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onPlayNow}
            className="flex-1 bg-white text-black hover:bg-white/90 text-sm font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            Play Now
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2.5 border border-white/30 text-white hover:bg-white/10 text-sm rounded-md transition-colors flex items-center justify-center"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Auto-play Info */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/60 text-xs text-center">
            Auto-play is on • Videos will play automatically
          </p>
        </div>
      </div>
    </div>
  );
}

// Utility functions
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
