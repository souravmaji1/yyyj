"use client";

import React from 'react';
import { Mode, SubMode } from '@/src/app/(protected)/ai-studio/types';

interface CapsulePromptSelectorProps {
  mode: Mode;
  subMode: SubMode;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubModeChange?: (subMode: SubMode) => void;
}

// Prompt presets for each sub-mode
const PROMPT_PRESETS: Record<SubMode, { label: string }[]> = {
  txt2img: [
    { label: 'Create a custom NFT drop' },
    { label: 'Design a hoodie with QR audio' },
    { label: 'Compose your own soundtrack' },
    { label: 'Generate a viral ad video' },
    { label: 'Make a 3D collectible' },
    { label: 'Launch your personal brand logo' },
    { label: 'Produce a fantasy art poster' },
    { label: 'Craft a podcast intro' },
    { label: 'Immortalize a memory in video' },
    { label: 'Design a futuristic gadget' },
  ],
  img2img: [
    { label: 'Style Transfer' },
    { label: 'Color Enhancement' },
    { label: 'Background Change' },
    { label: 'Artistic Filter' },
    { label: 'Mood Adjustment' },
    { label: 'Vintage Effect' },
    { label: 'HDR Enhancement' },
    { label: 'Black & White' },
  ],
  enhance: [
    { label: 'Quality Boost' },
    { label: 'Upscale & Detail' },
    { label: 'Noise Reduction' },
    { label: 'Color Correction' },
    { label: 'Professional Touch' },
    { label: 'Super Resolution' },
    { label: 'Detail Enhancement' },
  ],
  imgswap: [
    { label: 'Face Swap' },
    { label: 'Object Replacement' },
    { label: 'Background Swap' },
    { label: 'Style Transfer' },
    { label: 'Person Swap' },
    { label: 'Animal Face Swap' },
    { label: 'Celebrity Look' },
    { label: 'Age Progression' },
  ],
  txt2vid: [
    { label: 'Create a custom NFT drop' },
    { label: 'Generate a viral ad video' },
    { label: 'Make a 3D collectible' },
    { label: 'Produce a fantasy art poster' },
    { label: 'Craft a podcast intro' },
    { label: 'Immortalize a memory in video' },
    { label: 'Design a futuristic gadget' },
  ],
  img2vid: [
    { label: 'Parallax Effect' },
    { label: 'Subtle Animation' },
    { label: 'Zoom & Pan' },
    { label: 'Element Animation' },
    { label: 'Atmospheric Motion' },
    { label: '3D Rotation' },
  ],
  music: [
    { label: 'Compose your own soundtrack' },
    { label: 'Craft a podcast intro' },
    { label: 'Background Music' },
    { label: 'Epic Orchestral' },
    { label: 'Electronic Beat' },
    { label: 'Nature Sounds' },
    { label: 'Ambient Soundscape' },
  ],
  soundeffect: [
    { label: 'Door closing sound' },
    { label: 'Footsteps on gravel' },
    { label: 'Rain falling' },
    { label: 'Car engine starting' },
    { label: 'Birds chirping' },
    { label: 'Wind blowing' },
    { label: 'Glass breaking' },
  ],
  audiobook: [
    { label: 'Narrate a story' },
    { label: 'Educational content' },
    { label: 'News reading' },
    { label: 'Poetry recitation' },
    { label: 'Documentary style' },
    { label: 'Children\'s story' },
    { label: 'Historical narrative' },
  ],
  character: [
    { label: 'Fantasy warrior' },
    { label: 'Sci-fi robot' },
    { label: 'Medieval knight' },
    { label: 'Modern superhero' },
    { label: 'Mythical creature' },
    { label: 'Cartoon character' },
    { label: 'Realistic person' },
  ],
  object: [
    { label: 'Futuristic gadget' },
    { label: 'Decorative vase' },
    { label: 'Furniture piece' },
    { label: 'Weapon model' },
    { label: 'Vehicle design' },
    { label: 'Architectural element' },
    { label: 'Tool or instrument' },
  ],
  environment: [
    { label: 'Fantasy forest' },
    { label: 'Sci-fi space station' },
    { label: 'Medieval castle' },
    { label: 'Modern cityscape' },
    { label: 'Underwater scene' },
    { label: 'Desert landscape' },
    { label: 'Mountain terrain' },
  ],
  img2obj: [
    { label: 'Convert photo to 3D model' },
    { label: 'Create 3D character from image' },
    { label: 'Generate 3D object from reference' },
    { label: 'Transform 2D art to 3D' },
    { label: 'Make 3D sculpture from photo' },
    { label: 'Convert drawing to 3D model' },
    { label: 'Create 3D asset from image' },
  ],
};

export default function CapsulePromptSelector({
  mode,
  subMode,
  prompt,
  onPromptChange,
  onSubModeChange,
}: CapsulePromptSelectorProps) {
  const presets = PROMPT_PRESETS[subMode] || [];

  const handlePresetSelect = (preset: { label: string }) => {
    onPromptChange(preset.label);
    // For face swap, we need to trigger the parent to change subMode to 'imgswap'
    if (preset.label === 'Face Swap' && onSubModeChange) {
      onSubModeChange('imgswap');
    }
  };

  return (
    <div className="glass space-y-4">
      {/* Textarea */}
      <div>
        <label htmlFor="prompt-textarea-capsule" className="block text-slate-50 font-medium mb-2 text-sm sm:text-base">
          {mode === 'video' ? 'Describe your video' : 
           mode === 'audio' ? 'Describe your audio' :
           mode === 'threeD' ? 'Describe your 3D object' :
           'Describe your image'}
        </label>
        <textarea
          id="prompt-textarea-capsule"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={
            subMode === 'enhance' 
              ? 'Optionally describe what you want to enhance...'
              : mode === 'audio' 
                ? 'Describe the music, sound effect, or audio book you want to create...'
                : mode === 'threeD'
                  ? 'Describe the 3D character, object, or environment you want to create...'
                  : 'Type a description or pick from presets below'
          }
          aria-describedby="prompt-help-capsule"
          className="w-full h-24 sm:h-32 bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[#0b0f1a] transition-colors motion-reduce:transition-none text-sm sm:text-base"
        />
        <div id="prompt-help-capsule" className="sr-only">
          Enter a description for the {mode === 'video' ? 'video' : 
                                     mode === 'audio' ? 'audio' :
                                     mode === 'threeD' ? '3D object' :
                                     'image'} you want to generate
        </div>
      </div>

      {/* Capsule Prompt Selector */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <label className="block text-slate-50 font-medium mb-2 text-sm sm:text-base">
            Or choose a preset...
          </label>

          {/* Capsule Grid - Always Visible */}
          <div className="flex flex-wrap gap-2 justify-center">
            {presets.map((preset, index) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all  duration-200 hover:bg-white/5 focus:outline-none ${
                  prompt === preset.label 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
