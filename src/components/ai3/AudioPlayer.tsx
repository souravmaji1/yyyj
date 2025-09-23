"use client";

import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export default function AudioPlayer({ src, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Format time in MM:SS format
  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Don't play if we're at the end
        if (duration > 0 && currentTime >= duration - 0.1) {
          // Reset to beginning and play
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }
        audioRef.current.play();
      }
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      // Cap seek time to never exceed duration
      const cappedSeekTime = duration > 0 ? Math.min(seekTime, duration) : seekTime;
      audioRef.current.currentTime = cappedSeekTime;
      setCurrentTime(cappedSeekTime);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const newCurrentTime = audioRef.current.currentTime;
      // Cap current time to never exceed duration
      const cappedTime = duration > 0 ? Math.min(newCurrentTime, duration) : newCurrentTime;
      setCurrentTime(cappedTime);
      
      // Check if audio has reached the end
      if (duration > 0 && newCurrentTime >= duration - 0.1) {
        setIsPlaying(false);
        setCurrentTime(duration);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  };

  // Handle play/pause events
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      setCurrentTime(audioRef.current.duration);
    }
  };

  // Handle error
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Audio player error:", e);
    setIsLoaded(false);
  };

  // Reset when src changes
  useEffect(() => {
    if (audioRef.current) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsLoaded(false);
    }
  }, [src]);

  return (
    <div className={`glass w-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 ${className}`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />
      {/* Custom controls */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
        {/* Play/Pause Button */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={togglePlayPause}
            disabled={!isLoaded}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 3.5A.5.5 0 0 1 6 4v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm5 0A.5.5 0 0 1 11 4v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l4.5-2.5a.5.5 0 0 0 0-.814l-4.5-2.5z"/>
              </svg>
            )}
          </button>
          
          {/* Time Display */}
          <div className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={!isLoaded}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #ffffff 0%, #ffffff ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Loading State */}
        {!isLoaded && (
          <div className="text-white/70 text-xs mt-2 text-center">
            Loading audio...
          </div>
        )}
      </div>
    </div>
  );
}
