"use client";

import React from 'react';

interface ResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

export function ResizeHandle({ onResizeStart, isResizing }: ResizeHandleProps) {
  return (
    <div
      data-testid="asset-window-resize"
      className={`
        absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity duration-200
        ${isResizing ? 'opacity-100' : ''}
      `}
      onMouseDown={onResizeStart}
    >
      {/* Resize indicator - three diagonal lines */}
      <div className="absolute bottom-1 right-1">
        <div className="w-3 h-px bg-white/40 transform rotate-45 origin-bottom-right mb-1"></div>
        <div className="w-2 h-px bg-white/40 transform rotate-45 origin-bottom-right mb-1"></div>
        <div className="w-1 h-px bg-white/40 transform rotate-45 origin-bottom-right"></div>
      </div>
      
      {/* Larger invisible hit area */}
      <div className="absolute -bottom-2 -right-2 w-6 h-6"></div>
    </div>
  );
}