"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SpinViewerProps {
  frames: string[];
}

export function SpinViewer({ frames }: SpinViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [zoom, setZoom] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  // Auto-spin functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isAutoSpinning && !isDragging) {
      interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, 100);
    }
    // Return empty cleanup function if condition is not met
    return () => {};
  }, [isAutoSpinning, isDragging, frames.length]);

  // Inertial spinning
  useEffect(() => {
    let animationId: number | undefined;
    
    if (velocity !== 0 && !isDragging && !isAutoSpinning) {
      const animate = (currentTime: number) => {
        if (lastTimeRef.current) {
          const deltaTime = currentTime - lastTimeRef.current;
          const frameStep = (velocity * deltaTime) / 16.67; // Normalize to 60fps
          
          setCurrentFrame(prev => {
            const newFrame = prev + frameStep;
            return ((newFrame % frames.length) + frames.length) % frames.length;
          });
          
          setVelocity(prev => {
            const friction = 0.95;
            const newVelocity = prev * friction;
            return Math.abs(newVelocity) < 0.01 ? 0 : newVelocity;
          });
        }
        
        lastTimeRef.current = currentTime;
        
        if (Math.abs(velocity) > 0.01) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      animationId = animationRef.current;
    }
    // Return empty cleanup function if condition is not met
    return () => {};
  }, [velocity, isDragging, isAutoSpinning, frames.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    setLastX(e.clientX);
    setVelocity(0);
    lastTimeRef.current = performance.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentTime = performance.now();
    const deltaX = e.clientX - lastX;
    const sensitivity = 0.5;
    const frameStep = (deltaX * sensitivity) / (containerRef.current?.clientWidth || 400);
    
    setCurrentFrame(prev => {
      const newFrame = prev - frameStep;
      return ((newFrame % frames.length) + frames.length) % frames.length;
    });
    
    // Calculate velocity for inertia
    if (lastTimeRef.current) {
      const deltaTime = currentTime - lastTimeRef.current;
      setVelocity(-frameStep / (deltaTime || 1));
    }
    
    setLastX(e.clientX);
    lastTimeRef.current = currentTime;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentFrame(prev => (prev - 1 + frames.length) % frames.length);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setCurrentFrame(prev => (prev + 1) % frames.length);
        break;
      case 's':
      case 'S':
        e.preventDefault();
        setIsAutoSpinning(prev => !prev);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none focus:outline-none"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: `scale(${zoom})`
      }}
    >
      {/* Main 360 Image */}
      <motion.div
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
        initial={false}
        animate={{ 
          scale: zoom,
          rotateY: isAutoSpinning ? 360 : 0 
        }}
        transition={{ 
          scale: { duration: 0.1 },
          rotateY: { duration: 2, repeat: isAutoSpinning ? Infinity : 0, ease: "linear" }
        }}
      >
        {/* Since we don't have actual frames, show a placeholder */}
        <div className="w-96 h-96 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">360° View</div>
            <div className="text-sm mb-4">
              Frame {Math.floor(currentFrame) + 1} of {frames.length}
            </div>
            <div className="text-xs space-y-1">
              <div>• Drag left/right to rotate</div>
              <div>• Scroll to zoom</div>
              <div>• Press 'S' to auto-spin</div>
              <div>• Use arrow keys to step</div>
            </div>
          </div>
        </div>
        
        {/* Frame indicator */}
        <div className="absolute bottom-4 left-4 bg-black/50 rounded px-2 py-1 text-white text-xs">
          {Math.floor(currentFrame) + 1}/{frames.length}
        </div>
        
        {/* Auto-spin indicator */}
        {isAutoSpinning && (
          <div className="absolute top-4 right-4 bg-[var(--color-primary)] rounded-full p-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        )}
      </motion.div>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 bg-[#232f3e] rounded-lg p-2 border border-gray-600">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAutoSpinning(!isAutoSpinning)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              isAutoSpinning 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isAutoSpinning ? 'Stop' : 'Auto-spin'}
          </button>
          
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Reset Zoom
          </button>
        </div>
      </div>
    </div>
  );
}