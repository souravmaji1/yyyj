"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AutoplayControlProps {
  isEnabled: boolean;
  onToggle: () => void;
  hasNextVideo: boolean;
  className?: string;
}

export const AutoplayControl: React.FC<AutoplayControlProps> = ({
  isEnabled,
  onToggle,
  hasNextVideo,
  className = ""
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`
        group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium 
        transition-all duration-200 shadow-lg border backdrop-blur-sm
        ${hasNextVideo 
          ? 'bg-black/50 hover:bg-black/70 border-gray-600/50 text-white' 
          : 'bg-gray-700/50 hover:bg-gray-600/70 border-gray-500/50 text-gray-300'
        }
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`AutoPlay: ${isEnabled ? 'On' : 'Off'}${!hasNextVideo ? ' (No more videos available)' : ''}`}
      title={`AutoPlay: ${isEnabled ? 'On' : 'Off'}${!hasNextVideo ? ' - No more videos available' : ''}`}
    >
      <motion.div
        animate={{ rotate: isEnabled ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isEnabled ? (
          // Play icon for enabled state
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
              clipRule="evenodd" 
            />
          </svg>
        ) : (
          // Pause icon for disabled state
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </motion.div>
      
      <span className="font-semibold">
        AutoPlay
      </span>
      
      {/* Green toggle switch indicator */}
      <div className="relative">
        <motion.div
          className={`w-10 h-5 rounded-full border-2 transition-colors duration-200 ${
            isEnabled ? 'bg-emerald-500 border-emerald-400' : 'bg-gray-600 border-gray-500'
          }`}
        >
          <motion.div
            className={`w-3 h-3 rounded-full bg-white shadow-sm`}
            animate={{ 
              x: isEnabled ? 18 : 2,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ y: 2 }}
          />
        </motion.div>
      </div>
    </motion.button>
  );
};