"use client";

import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface ShrunkPillProps {
  onClick: () => void;
  x: number;
  y: number;
}

export function ShrunkPill({ onClick, x, y }: ShrunkPillProps) {
  return (
    <Button
      data-testid="asset-window-shrunk"
      onClick={onClick}
      className="
        fixed z-50 h-14 min-w-[200px] px-4 bg-[var(--color-surface)] border border-white/20 
        rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 
        hover:scale-105 hover:bg-[#2A3F5F] flex items-center space-x-3
        focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50
      "
      style={{
        left: x,
        top: y,
      }}
      aria-label="Asset Library (Expand)"
      title="Asset Library (Expand)"
    >
      <FileText className="h-5 w-5 text-[#E6EEFF]" />
      <span className="text-sm font-medium text-[#E6EEFF] hidden sm:inline">
        Asset Library
      </span>
      <ChevronRight className="h-4 w-4 text-gray-400" />
    </Button>
  );
}