"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { ARIA_LABELS } from '@/src/lib/studio/accessibility';
import { motion } from 'framer-motion';

interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'text';
  start: number;
  duration: number;
  content: string;
  color: string;
}

const mockClips: TimelineClip[] = [
  { id: '1', type: 'video', start: 0, duration: 5, content: 'Opening Scene', color: '#3b82f6' },
  { id: '2', type: 'audio', start: 0, duration: 10, content: 'Background Music', color: '#10b981' },
  { id: '3', type: 'text', start: 2, duration: 3, content: 'Title Card', color: '#f59e0b' },
  { id: '4', type: 'video', start: 5, duration: 4, content: 'Action Sequence', color: '#ef4444' },
];

export function TimelineVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10); // seconds
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Animation loop for playback
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0] || 0);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] || 0);
    setIsMuted(false);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getClipPosition = (clip: TimelineClip) => {
    const left = (clip.start / duration) * 100;
    const width = (clip.duration / duration) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const playheadPosition = (currentTime / duration) * 100;

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      {/* Video Preview Area */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-xl mb-2">Video Preview</div>
            <div className="text-sm">Timeline: {formatTime(currentTime)} / {formatTime(duration)}</div>
          </div>
        </div>

        {/* Playhead overlay */}
        <div className="absolute top-4 right-4 bg-[#0F1629]/80 backdrop-blur rounded-lg p-2 text-xs text-gray-300">
          {isPlaying ? '🔴 Recording' : '⏸️ Paused'}
        </div>
      </div>

      {/* Transport Controls */}
      <div className="bg-[#0F1629] border-t border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTime(0)}
              className="hover:bg-white/10"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="hover:bg-white/10"
              aria-label={ARIA_LABELS.playPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTime(duration)}
              className="hover:bg-white/10"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="text-sm text-gray-300 ml-4">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="hover:bg-white/10"
              aria-label={ARIA_LABELS.mute}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="cursor-pointer"
                aria-label={ARIA_LABELS.volume}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-white/10"
              aria-label="Export video"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration}
            step={0.1}
            className="cursor-pointer"
            aria-label={ARIA_LABELS.seek}
          />
        </div>

        {/* Timeline Tracks */}
        <div 
          ref={timelineRef}
          className="relative bg-[#2A3F5F] rounded-lg p-4 min-h-[200px]"
        >
          {/* Time ruler */}
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-2 bg-gray-400"></div>
                <span>{formatTime(i)}</span>
              </div>
            ))}
          </div>

          {/* Track lanes */}
          <div className="space-y-2">
            {['Video', 'Audio', 'Text'].map((trackName, trackIndex) => (
              <div key={trackName} className="relative">
                <div className="text-xs text-gray-300 mb-1 w-16">{trackName}</div>
                <div className="relative h-12 bg-[var(--color-surface)] rounded border border-white/10">
                  {/* Track clips */}
                  {mockClips
                    .filter(clip => {
                      if (trackIndex === 0) return clip.type === 'video';
                      if (trackIndex === 1) return clip.type === 'audio';
                      if (trackIndex === 2) return clip.type === 'text';
                      return false;
                    })
                    .map(clip => {
                      const { left, width } = getClipPosition(clip);
                      return (
                        <motion.div
                          key={clip.id}
                          className="absolute top-1 bottom-1 rounded flex items-center justify-center text-xs text-white font-medium cursor-pointer hover:brightness-110"
                          style={{
                            left,
                            width,
                            backgroundColor: clip.color,
                            minWidth: '60px'
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {clip.content}
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Playhead */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
            style={{ left: `${playheadPosition}%` }}
            initial={false}
            animate={{ left: `${playheadPosition}%` }}
            transition={{ type: "tween", duration: 0.1 }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rotate-45"></div>
          </motion.div>
        </div>

        {/* Timeline Instructions */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Drag video clips to timeline • Click clips to edit • Drop assets to add new clips
        </div>
      </div>
    </div>
  );
}