"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic, Download, Scissors } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Slider } from '@/src/components/ui/slider';
import { ARIA_LABELS } from '@/src/lib/studio/accessibility';
import { motion } from 'framer-motion';

// Mock WaveSurfer component since we're not actually loading audio files
function MockWaveform({ isPlaying, currentTime, duration }: { 
  isPlaying: boolean; 
  currentTime: number; 
  duration: number; 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2; // Retina
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw waveform
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const barWidth = 2;
    const barGap = 1;
    const numBars = Math.floor(width / (barWidth + barGap));

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + barGap);
      const amplitude = Math.sin(i * 0.1) * 0.5 + 0.5; // Mock waveform
      const barHeight = amplitude * height * 0.8;
      const y = (height - barHeight) / 2;

      // Progress color
      const progress = currentTime / duration;
      const isPlayed = i / numBars < progress;
      
      ctx.fillStyle = isPlayed ? '#3b82f6' : '#475569';
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [currentTime, duration, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 cursor-pointer"
      style={{ width: '100%', height: '128px' }}
    />
  );
}

interface AudioTrack {
  id: string;
  name: string;
  type: 'voice' | 'music' | 'effects';
  volume: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

const mockTracks: AudioTrack[] = [
  { id: '1', name: 'Voice Recording', type: 'voice', volume: 80, muted: false, solo: false, color: '#3b82f6' },
  { id: '2', name: 'Background Music', type: 'music', volume: 60, muted: false, solo: false, color: '#10b981' },
  { id: '3', name: 'Sound Effects', type: 'effects', volume: 70, muted: false, solo: false, color: '#f59e0b' },
];

export function TimelineAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // seconds
  const [masterVolume, setMasterVolume] = useState(80);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [tracks, setTracks] = useState(mockTracks);
  const [isRecording, setIsRecording] = useState(false);
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

  const handleMasterVolumeChange = (value: number[]) => {
    setMasterVolume(value[0] || 0);
    setIsMasterMuted(false);
  };

  const handleMasterMute = () => {
    setIsMasterMuted(!isMasterMuted);
  };

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume, muted: false } : track
    ));
  };

  const handleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const handleTrackSolo = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : { ...track, solo: false }
    ));
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    
    window.dispatchEvent(new CustomEvent('studio-toast', {
      detail: {
        type: isRecording ? 'info' : 'success',
        title: isRecording ? 'Recording Stopped' : 'Recording Started',
        description: isRecording ? 'Audio saved to Voice track' : 'Speaking into microphone...'
      }
    }));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-[var(--color-surface)] flex flex-col">
      {/* Audio Visualizer Area */}
      <div className="flex-1 bg-[#0F1629] p-6">
        <div className="h-full rounded-lg bg-[#2A3F5F] p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#E6EEFF]">Audio Waveform</h3>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              {isRecording && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center space-x-1 text-red-400"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-xs">REC</span>
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="flex-1 bg-[var(--color-surface)] rounded-lg p-4">
            <MockWaveform 
              isPlaying={isPlaying} 
              currentTime={currentTime} 
              duration={duration} 
            />
          </div>
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

            <Button
              variant={isRecording ? "destructive" : "ghost"}
              size="sm"
              onClick={handleRecord}
              className={isRecording ? "" : "hover:bg-white/10"}
            >
              <Mic className="h-4 w-4" />
            </Button>

            <div className="text-sm text-gray-300 ml-4">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Master Volume Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Master</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMasterMute}
              className="hover:bg-white/10"
              aria-label={ARIA_LABELS.mute}
            >
              {isMasterMuted || masterVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="w-20">
              <Slider
                value={[isMasterMuted ? 0 : masterVolume]}
                onValueChange={handleMasterVolumeChange}
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
              aria-label="Export audio"
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

        {/* Audio Tracks Mixer */}
        <div className="bg-[#2A3F5F] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-[#E6EEFF]">Track Mixer</h4>
            <Button variant="ghost" size="sm" className="hover:bg-[var(--color-primary-50)]">
              <Scissors className="h-4 w-4 mr-1" />
              Split
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tracks.map((track) => (
              <div key={track.id} className="bg-[var(--color-surface)] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="text-sm font-medium text-[#E6EEFF]">{track.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">{track.type}</span>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Button
                    variant={track.solo ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTrackSolo(track.id)}
                    className="text-xs h-6 px-2"
                  >
                    S
                  </Button>
                  <Button
                    variant={track.muted ? "destructive" : "ghost"}
                    size="sm"
                    onClick={() => handleTrackMute(track.id)}
                    className="text-xs h-6 px-2"
                  >
                    M
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <VolumeX className="h-3 w-3 text-gray-400" />
                  <Slider
                    value={[track.muted ? 0 : track.volume]}
                    onValueChange={(value) => handleTrackVolumeChange(track.id, value[0] ?? 100)}
                    max={100}
                    step={1}
                    className="flex-1 cursor-pointer"
                  />
                  <Volume2 className="h-3 w-3 text-gray-400" />
                </div>
                
                <div className="text-xs text-gray-400 text-center mt-1">
                  {track.muted ? 'MUTED' : `${track.volume}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Instructions */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Drop audio files to add tracks • Click waveform to seek • Use mixer to balance audio levels
        </div>
      </div>
    </div>
  );
}