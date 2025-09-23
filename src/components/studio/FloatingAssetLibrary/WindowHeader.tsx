"use client";

import React from 'react';
import { Minus, X, Search, FileText } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface WindowHeaderProps {
  onDragStart: (e: React.MouseEvent) => void;
  onShrink: () => void;
  onClose: () => void;
  isDragging?: boolean;
}

export function WindowHeader({ onDragStart, onShrink, onClose, isDragging }: WindowHeaderProps) {
  return (
    <div
      data-testid="asset-window-header"
      className={`
        h-12 px-4 flex items-center justify-between bg-[var(--color-surface)] border-b border-white/10 rounded-t-2xl cursor-move select-none
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      onMouseDown={onDragStart}
    >
      {/* Left section - Title and hint */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <FileText className="h-5 w-5 text-[#E6EEFF] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-[#E6EEFF] truncate">
            Asset Library
          </h2>
        </div>
        <div className="text-xs text-gray-400 hidden sm:block">
          Search (⌘F)
        </div>
      </div>

      {/* Right section - Action buttons */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onShrink();
          }}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          aria-label="Shrink Asset Library"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          aria-label="Close Asset Library"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}