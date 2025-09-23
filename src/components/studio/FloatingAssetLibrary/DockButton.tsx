"use client";

import React from 'react';
import { Package } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { DockEdge } from './types';

interface DockButtonProps {
  onClick: () => void;
  dock: DockEdge;
}

export function DockButton({ onClick, dock }: DockButtonProps) {
  // Position based on dock edge
  const getPosition = () => {
    const buttonSize = 48;
    const margin = 16;
    
    switch (dock) {
      case 'left':
        return {
          left: margin,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          right: margin,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'top':
        return {
          left: '50%',
          top: margin,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          left: '50%',
          bottom: margin,
          transform: 'translateX(-50%)',
        };
      default:
        // Default to bottom-right if no dock edge
        return {
          right: margin,
          bottom: margin,
        };
    }
  };

  return (
    <Button
      data-testid="asset-window-dock-btn"
      onClick={onClick}
      className="
        fixed z-40 w-12 h-12 p-0 bg-[var(--color-surface)] border border-white/20 
        rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 
        hover:scale-110 hover:bg-[#2A3F5F] flex items-center justify-center
        focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50
      "
      style={getPosition()}
      aria-label="Open Asset Library"
      title="Assets"
    >
      <Package className="h-5 w-5 text-[#E6EEFF]" />
    </Button>
  );
}