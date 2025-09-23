"use client";

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { StudioMode } from '@/src/types/studio';
import { ARIA_LABELS, KEYBOARD_SHORTCUTS } from '@/src/lib/studio/accessibility';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Box,
  Music,
  ShirtIcon as Shirt,
  Coins
} from 'lucide-react';

interface ModeConfig {
  id: StudioMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  shortcut: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'image',
    label: 'Image',
    icon: <ImageIcon className="h-4 w-4" />,
    description: 'Generate and edit images',
    shortcut: KEYBOARD_SHORTCUTS.imageMode,
  },
  {
    id: 'video',
    label: 'Ad/Video',
    icon: <Video className="h-4 w-4" />,
    description: 'Create videos and advertisements',
    shortcut: KEYBOARD_SHORTCUTS.videoMode,
  },
  {
    id: 'threeD',
    label: '3D',
    icon: <Box className="h-4 w-4" />,
    description: 'Generate and edit 3D models',
    shortcut: KEYBOARD_SHORTCUTS.threeDMode,
  },
  {
    id: 'music',
    label: 'Music',
    icon: <Music className="h-4 w-4" />,
    description: 'Create and produce music',
    shortcut: KEYBOARD_SHORTCUTS.musicMode,
  },
  {
    id: 'product',
    label: 'Product',
    icon: <Shirt className="h-4 w-4" />,
    description: 'Design products and mockups',
    shortcut: KEYBOARD_SHORTCUTS.productMode,
  },
  {
    id: 'nft',
    label: 'NFT',
    icon: <Coins className="h-4 w-4" />,
    description: 'Mint and trade NFTs',
    shortcut: KEYBOARD_SHORTCUTS.nftMode,
  },
];

export function ModeChips() {
  const { mode, setMode } = useStudioStore();

  const handleModeChange = (newMode: StudioMode) => {
    setMode(newMode);
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle single key shortcuts when no modifier keys are pressed
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }

      // Don't handle if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as Element)?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      const modeMap: Record<string, StudioMode> = {
        '1': 'image',
        '2': 'video',
        '3': 'threeD',
        '4': 'music',
        '5': 'product',
        '6': 'nft',
      };

      const targetMode = modeMap[event.key];
      if (targetMode) {
        event.preventDefault();
        setMode(targetMode);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setMode]);

  return (
    <div 
      className="sticky top-0 z-10 bg-[#0F1629] border-b border-white/10 px-6 py-3"
      role="tablist"
      aria-label={ARIA_LABELS.modeChips}
    >
      <div className="flex items-center space-x-2 overflow-x-auto">
        {MODES.map((modeConfig) => {
          const isActive = mode === modeConfig.id;
          
          return (
            <motion.div
              key={modeConfig.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange(modeConfig.id)}
                className={`relative flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${modeConfig.id}-panel`}
                aria-label={`${modeConfig.description}. Shortcut: ${modeConfig.shortcut}`}
                title={`${modeConfig.description} (${modeConfig.shortcut})`}
              >
                {modeConfig.icon}
                <span className="font-medium">{modeConfig.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeMode"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-md -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
      
      {/* Mode description for current selection */}
      <div className="mt-2 text-xs text-gray-400">
        {MODES.find(m => m.id === mode)?.description}
      </div>
    </div>
  );
}