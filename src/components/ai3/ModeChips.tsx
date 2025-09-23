"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mode, SubMode } from '@/src/app/(protected)/ai-studio/types';

interface ModeChipsProps {
  mode: Mode;
  subMode: SubMode;
  onModeChange: (mode: Mode) => void;
  onSubModeChange: (subMode: SubMode) => void;
  costs: Record<SubMode, number>;
  uploadedFile?: File | null;
}

const MODE_LABELS = {
  image: { 
    label: 'Image', 
    icon: '🎨',
    subtext: 'Generate or enhance images for ads & social.'
  },
  video: { 
    label: 'Video', 
    icon: '🎬',
    subtext: 'Make 5s clips from text or animate an image.'
  },
  audio: { 
    label: 'Audio', 
    icon: '🎵',
    subtext: 'Generate music and sound effects.'
  },
  threeD: { 
    label: '3D Object', 
    icon: '📦',
    subtext: 'Create 3D models and objects.'
  },
};

const SUB_MODE_LABELS = {
  txt2img: 'Text → Image',
  img2img: 'Image → Image', 
  enhance: 'Enhance',
  imgswap: 'Image Swapping',
  txt2vid: 'Text → Video (5s)',
  img2vid: 'Image → Video (5s)',
  music: 'Text → Music',
  soundeffect: 'Text → Sound Effect',
  audiobook: 'Text → Audio Book',
  character: 'Text → 3D Character',
  object: 'Text → 3D Object',
  environment: 'Text → 3D Environment',
  img2obj: 'Image → 3D Object',
};

const SUB_MODES: Record<Mode, SubMode[]> = {
  image: ['txt2img', 'img2img', 'enhance', 'imgswap'],
  video: ['txt2vid', 'img2vid'],
  audio: ['music', 'soundeffect', 'audiobook'],
  threeD: ['character', 'object', 'environment', 'img2obj'],
};

export default function ModeChips({ 
  mode, 
  subMode, 
  onModeChange, 
  onSubModeChange, 
  costs,
  uploadedFile
}: ModeChipsProps) {
  
  return (
    <div className="glass space-y-6">
      {/* Top Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(MODE_LABELS) as Mode[]).map((modeKey) => {
          const isActive = mode === modeKey;
          const modeInfo = MODE_LABELS[modeKey];
          
          return (
            <motion.div
              key={modeKey}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onModeChange(modeKey)}
              className={`
                p-6 rounded-2xl cursor-pointer transition-all duration-300
                ${isActive 
                  ? 'bg-[rgba(255,255,255,0.05)] border border-white/10 shadow-lg'
                  : 'bg-[rgba(255,255,255,0.02)] border border-white/5 hover:bg-[rgba(255,255,255,0.05)]'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{modeInfo.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    {modeInfo.label}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {modeInfo.subtext}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sub-mode Chips */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {SUB_MODES[mode].map((subModeKey) => {
            const isActive = subMode === subModeKey;
            const cost = costs[subModeKey];
            
            return (
              <motion.button
                key={subModeKey}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSubModeChange(subModeKey)}
                className={`
                  px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2
                  ${isActive
                    ? 'bg-[rgba(255,255,255,0.1)] border border-white/10 text-white'
                    : 'bg-[rgba(255,255,255,0.05)] border border-white/5 text-slate-400 hover:bg-[rgba(255,255,255,0.08)]'
                  }
                `}
              >
                <span>{SUB_MODE_LABELS[subModeKey]}</span>
                <span className="text-xs">·</span>
                <span className="text-xs font-medium">
                  {cost} XUT
                </span>
              </motion.button>
            );
          })}
        </div>
        
        {/* Special Image-to-3D Indicator */}
        {subMode === 'img2obj' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${
              uploadedFile 
                ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20' 
                : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                uploadedFile 
                  ? 'bg-gradient-to-br from-green-500 to-blue-500' 
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
              }`}>
                <span className="text-white text-sm">📷</span>
              </div>
              <div>
                <h4 className={`font-medium text-sm ${
                  uploadedFile ? 'text-green-300' : 'text-purple-300'
                }`}>
                  {uploadedFile ? 'Image-to-3D Mode Ready' : 'Image-to-3D Mode Active'}
                </h4>
                <p className={`text-xs ${
                  uploadedFile ? 'text-green-200/70' : 'text-purple-200/70'
                }`}>
                  {uploadedFile 
                    ? `Ready to convert "${uploadedFile.name}" into a 3D object` 
                    : 'Upload an image to convert it into a 3D object'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}