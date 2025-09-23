'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useAssistant } from '@/src/hooks/useAssistant';
import { KEYBOARD_SHORTCUTS } from '@/src/lib/studio/accessibility';

interface AssistantButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'navbar' | 'fab';
}

export function AssistantButton({ 
  className = '', 
  size = 'sm',
  variant = 'navbar' 
}: AssistantButtonProps) {
  const { isOpen: open, togglePanel } = useAssistant();

  // Global keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        togglePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel]);

  const sizeClasses = {
    sm: 'h-6 w-6', // 24px as specified
    md: 'h-8 w-8', 
    lg: 'h-12 w-12', // For mobile FAB
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const baseClasses = variant === 'fab' 
    ? 'fixed bottom-6 left-6 z-40 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-lg shadow-indigo-500/25 border border-indigo-500/20'
    : 'bg-transparent hover:bg-white/10 text-white rounded-lg border border-white/20 hover:border-indigo-400/50 transition-all duration-200';

  return (
    <div className="group relative">
      <motion.button
        onClick={togglePanel}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${className}
          flex items-center justify-center transition-all duration-200
          ${open ? 'bg-indigo-600 border-indigo-500' : ''}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
        title="Assistant"
      >
        <motion.div
          animate={{ 
            rotate: open ? 15 : 0,
            scale: open ? 1.1 : 1 
          }}
          transition={{ duration: 0.2 }}
        >
          <Mic className={`${iconSizes[size]} ${open ? 'text-white' : ''}`} />
        </motion.div>
        
        {/* Pulse animation when active */}
        {open && (
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-400/30"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Tooltip for navbar variant */}
      {variant === 'navbar' && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Assistant
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}