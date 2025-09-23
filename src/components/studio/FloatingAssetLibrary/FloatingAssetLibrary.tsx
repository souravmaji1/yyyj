"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WindowHeader } from './WindowHeader';
import { ResizeHandle } from './ResizeHandle';
import { ShrunkPill } from './ShrunkPill';
import { DockButton } from './DockButton';
import { AssetLibraryContent } from '../AssetLibraryContent';
import { 
  AssetWindowState, 
  AssetWindowMode,
  WindowGeometry,
  DockEdge 
} from './types';
import {
  loadWindowState,
  saveWindowState,
  constrainWindowToViewport,
  calculateDockEdge,
  constrainPosition,
  constrainSize,
} from './utils';

interface FloatingAssetLibraryProps {
  onFocusCanvas?: () => void;
}

export function FloatingAssetLibrary({ onFocusCanvas }: FloatingAssetLibraryProps) {
  const [windowState, setWindowState] = useState<AssetWindowState>(() => loadWindowState());
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, windowX: 0, windowY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, windowW: 0, windowH: 0 });
  
  const windowRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveWindowState(windowState);
  }, [windowState]);

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setWindowState(prev => constrainWindowToViewport(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Handle Cmd/Ctrl+F inside the window to focus search
        if ((e.metaKey || e.ctrlKey) && e.key === 'f' && windowState.mode === 'expanded') {
          e.preventDefault();
          searchInputRef.current?.focus();
          return;
        }
        
        // Handle Esc to clear search or shrink window
        if (e.key === 'Escape') {
          if (searchQuery) {
            setSearchQuery('');
            searchInputRef.current?.blur();
          } else {
            handleShrink();
          }
          return;
        }
        return;
      }

      // Global shortcuts
      if (e.key === 'a' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        toggleExpandShrink();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, windowState.mode]);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newX = e.clientX - dragStart.x + dragStart.windowX;
      const newY = e.clientY - dragStart.y + dragStart.windowY;
      
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const constrained = constrainPosition(newX, newY, windowState.w, windowState.h, viewport);
      
      setWindowState(prev => ({
        ...prev,
        x: constrained.x,
        y: constrained.y,
      }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      
      // Calculate dock edge on release
      const geometry: WindowGeometry = {
        x: windowState.x,
        y: windowState.y,
        width: windowState.w,
        height: windowState.h,
      };
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const dock = calculateDockEdge(geometry, viewport);
      
      setWindowState(prev => ({ ...prev, dock }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, windowState.w, windowState.h, windowState.x, windowState.y]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = resizeStart.windowW + deltaX;
      const newHeight = resizeStart.windowH + deltaY;
      
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const constrained = constrainSize(newWidth, newHeight, viewport);
      
      setWindowState(prev => ({
        ...prev,
        w: constrained.width,
        h: constrained.height,
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      windowX: windowState.x,
      windowY: windowState.y,
    });
  }, [windowState.x, windowState.y]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      windowW: windowState.w,
      windowH: windowState.h,
    });
  }, [windowState.w, windowState.h]);

  const handleExpand = useCallback(() => {
    // Store current focused element
    if (document.activeElement && document.activeElement !== document.body) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
    }
    
    setWindowState(prev => ({ ...prev, mode: 'expanded' }));
  }, []);

  const handleShrink = useCallback(() => {
    setWindowState(prev => ({ ...prev, mode: 'shrunk' }));
    
    // Return focus to canvas
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    } else {
      onFocusCanvas?.();
    }
  }, [onFocusCanvas]);

  const handleClose = useCallback(() => {
    setWindowState(prev => ({ ...prev, mode: 'closed' }));
    
    // Return focus to canvas
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus();
      lastFocusedElement.current = null;
    } else {
      onFocusCanvas?.();
    }
  }, [onFocusCanvas]);

  const toggleExpandShrink = useCallback(() => {
    if (windowState.mode === 'expanded') {
      handleShrink();
    } else {
      handleExpand();
    }
  }, [windowState.mode, handleExpand, handleShrink]);

  const handleListScroll = useCallback((scrollTop: number) => {
    setWindowState(prev => ({ ...prev, listScrollTop: scrollTop }));
  }, []);

  // Bring window to front on mouse down
  const handleMouseDown = useCallback(() => {
    if (windowRef.current) {
      windowRef.current.style.zIndex = '50';
    }
  }, []);

  // Render based on current mode
  if (windowState.mode === 'closed') {
    return (
      <DockButton
        onClick={handleExpand}
        dock={windowState.dock}
      />
    );
  }

  if (windowState.mode === 'shrunk') {
    return (
      <ShrunkPill
        onClick={handleExpand}
        x={windowState.x}
        y={windowState.y}
      />
    );
  }

  // Expanded mode
  return (
    <div
      ref={windowRef}
      data-testid="asset-window"
      role="dialog"
      aria-modal="false"
      aria-label="Asset Library"
      className="fixed z-40 bg-[#0F1629] border border-white/20 rounded-2xl shadow-2xl"
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.w,
        height: windowState.h,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Window Header */}
      <WindowHeader
        onDragStart={handleDragStart}
        onShrink={handleShrink}
        onClose={handleClose}
        isDragging={isDragging}
      />

      {/* Window Body */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 48px)' }}>
        <AssetLibraryContent
          ref={contentRef}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          listScrollTop={windowState.listScrollTop}
          onListScroll={handleListScroll}
        />
      </div>

      {/* Resize Handle */}
      <ResizeHandle
        onResizeStart={handleResizeStart}
        isResizing={isResizing}
      />
    </div>
  );
}