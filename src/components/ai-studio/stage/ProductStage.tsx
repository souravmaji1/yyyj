"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Undo, Redo, Download, RotateCcw, ZoomIn, ZoomOut, Grid, AlignCenter } from 'lucide-react';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { useStudioStore } from '../store/useStudioStore';
import { ProductPicker } from './ProductPicker';
import { ProductViewer } from './ProductViewer';

export function ProductStage() {
  const {
    zoom,
    history,
    setZoom,
    undo,
    redo,
    clearSelection
  } = useStudioStore();

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <motion.main 
      className="flex-1 flex flex-col bg-[var(--color-surface)] overflow-hidden"
      initial={false}
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-secondary)]/30">
        {/* Left side - Product Picker */}
        <div className="flex items-center space-x-4">
          <ProductPicker />
        </div>

        {/* Center - View Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <Undo className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <Redo className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-4 bg-gray-600" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(zoom * 0.8)}
            className="text-gray-400 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            className="text-gray-400 hover:text-white text-xs min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(zoom * 1.25)}
            className="text-gray-400 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-4 bg-gray-600" />
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Grid className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
        </div>

        {/* Right side - Export Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <ProductViewer />
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-secondary)]/30 bg-[#232f3e]">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Ready</span>
          <Separator orientation="vertical" className="h-3 bg-gray-600" />
          <span>2 objects</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            className="text-gray-400 hover:text-white text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset View
          </Button>
        </div>
      </div>
    </motion.main>
  );
}