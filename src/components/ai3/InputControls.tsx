"use client";

import React from 'react';
import { Mode, SubMode } from '@/src/app/(protected)/ai-studio/types';
import CapsulePromptSelector from './CapsulePromptSelector';
import { ImageSwapInterface } from './Composer';

interface InputControlsProps {
  mode: Mode;
  subMode: SubMode;
  prompt: string;
  selectedPreset: string;
  uploadedFile: File | null;
  audioGenre?: string;
  targetImage?: File | null;
  onPromptChange: (prompt: string) => void;
  onPresetChange: (preset: string, promptText: string) => void;
  onFileUpload: (file: File | null) => void;
  onAudioGenreChange?: (genre: string) => void;
  onSubModeChange?: (subMode: SubMode) => void;
  onTargetImageUpload?: (file: File | null) => void;
}

export default function InputControls({
  mode,
  subMode,
  prompt,
  selectedPreset,
  uploadedFile,
  audioGenre,
  targetImage,
  onPromptChange,
  onPresetChange,
  onFileUpload,
  onAudioGenreChange,
  onSubModeChange,
  onTargetImageUpload,
}: InputControlsProps) {
  const needsUpload = subMode === 'img2img' || subMode === 'img2vid';

  // Sound effect types
  const soundEffectTypes = [
    { value: 'general', label: 'General', icon: '🔊' },
    { value: 'drum', label: 'Drum', icon: '🥁' },
    { value: 'percussion', label: 'Percussion', icon: '🎵' },
    { value: 'ambient', label: 'Ambient', icon: '🌫️' },
    { value: 'nature', label: 'Nature', icon: '🌿' },
    { value: 'mechanical', label: 'Mechanical', icon: '⚙️' },
    { value: 'electronic', label: 'Electronic', icon: '⚡' },
  ];

  // Audiobook voice types
  const audiobookVoices = [
    { value: 'af_bella', label: 'Bella', fullLabel: 'Bella (African Female)' },
    { value: 'en_amy', label: 'Amy', fullLabel: 'Amy (English Female)' },
    { value: 'en_brian', label: 'Brian', fullLabel: 'Brian (English Male)' },
    { value: 'en_emma', label: 'Emma', fullLabel: 'Emma (English Female)' },
    { value: 'en_joanna', label: 'Joanna', fullLabel: 'Joanna (English Female)' },
    { value: 'en_joey', label: 'Joey', fullLabel: 'Joey (English Male)' },
    { value: 'en_justin', label: 'Justin', fullLabel: 'Justin (English Male)' },
    { value: 'en_kimberly', label: 'Kimberly', fullLabel: 'Kimberly (English Female)' },
    { value: 'en_matthew', label: 'Matthew', fullLabel: 'Matthew (English Male)' },
    { value: 'en_salli', label: 'Salli', fullLabel: 'Salli (English Female)' },
  ];

  return (
    <div className="glass space-y-4">
      {/* Show ImageSwapInterface for imgswap mode, otherwise show CapsulePromptSelector */}
      {subMode === 'imgswap' ? (
        <ImageSwapInterface
          prompt={prompt}
          onPromptChange={onPromptChange}
          uploadedFile={uploadedFile}
          onFileUpload={onFileUpload}
          targetImage={targetImage}
          onTargetImageUpload={onTargetImageUpload}
          onSubModeChange={onSubModeChange}
        />
      ) : (
        <CapsulePromptSelector
          mode={mode}
          subMode={subMode}
          prompt={prompt}
          onPromptChange={onPromptChange}
          onSubModeChange={onSubModeChange}
        />
      )}

      {/* Sound Effect Type Selector */}
      {subMode === 'soundeffect' && onAudioGenreChange && (
        <div className="space-y-2">
          <label className="block text-slate-50 font-medium text-sm">
            Effect Type
          </label>
          <div className="flex flex-wrap gap-2">
            {soundEffectTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => onAudioGenreChange(type.value)}
                className={`px-3 py-2 text-xs rounded-full transition-all duration-200 hover:bg-white/5 focus:outline-none ${
                  audioGenre === type.value 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audiobook Voice Selector */}
      {subMode === 'audiobook' && onAudioGenreChange && (
        <div className="space-y-2">
          <label className="block text-slate-50 font-medium text-sm">
            Voice Selection
          </label>
          <div className="flex flex-wrap gap-2">
            {audiobookVoices.map((voice) => (
              <button
                key={voice.value}
                onClick={() => onAudioGenreChange(voice.value)}
                className={`px-3 py-2 text-xs rounded-full transition-all duration-200 hover:bg-white/5 focus:outline-none ${
                  audioGenre === voice.value 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {voice.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}