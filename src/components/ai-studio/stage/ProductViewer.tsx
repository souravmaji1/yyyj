"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { useStudioStore } from '../store/useStudioStore';
import { DUMMY_PRODUCTS } from '../data';
import { KonvaDesignLayer } from './KonvaDesignLayer';
import { SpinViewer } from './SpinViewer';

export function ProductViewer() {
  const { 
    view, 
    productId, 
    garmentColorId, 
    zoom, 
    setView 
  } = useStudioStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentProduct = DUMMY_PRODUCTS.find(p => p.id === productId);
  const currentColor = currentProduct?.colors.find(c => c.id === garmentColorId);

  // Handle mouse wheel for zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const { setZoom } = useStudioStore.getState();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(zoom * delta);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    // Return empty cleanup function if container is not available
    return () => {};
  }, [zoom]);

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      setIsDragging(true);
      setLastPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - lastPan.x,
        y: e.clientY - lastPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!currentProduct) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Product Selected</div>
          <div className="text-sm">Choose a product to start designing</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Switcher */}
      <div className="flex items-center justify-center py-3 border-b border-[var(--color-secondary)]/30">
        <div className="flex bg-[#232f3e] rounded-lg p-1">
          <Button
            variant={view === 'front' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('front')}
            className="text-xs"
          >
            Front
          </Button>
          <Button
            variant={view === 'back' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('back')}
            className="text-xs"
          >
            Back
          </Button>
          {currentProduct.mockups.spin && (
            <Button
              variant={view === 'spin' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('spin')}
              className="text-xs"
            >
              360°
            </Button>
          )}
        </div>

        {/* Color Swatches */}
        <div className="flex items-center ml-6 space-x-2">
          <span className="text-xs text-gray-400">Color:</span>
          <div className="flex space-x-1">
            {currentProduct.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  const { setProduct } = useStudioStore.getState();
                  setProduct(productId, color.id);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  color.id === garmentColorId 
                    ? 'border-[var(--color-primary)] scale-110' 
                    : 'border-gray-500 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Viewer */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
          transition={{ type: "tween", duration: isDragging ? 0 : 0.1 }}
        >
          {view === 'spin' && currentProduct.mockups.spin ? (
            <SpinViewer frames={currentProduct.mockups.spin} />
          ) : (
            <div className="relative">
              {/* Product Mockup */}
              <div className="relative bg-white rounded-lg shadow-lg">
                {/* Placeholder for product image */}
                <div className="w-96 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-lg font-medium mb-2">
                      {currentProduct.name}
                    </div>
                    <div className="text-sm">
                      {view === 'front' ? 'Front View' : 'Back View'}
                    </div>
                    <div className="text-xs mt-2">
                      Color: {currentColor?.name}
                    </div>
                  </div>
                </div>
                
                {/* Design Layer Overlay */}
                <div className="absolute inset-0">
                  <KonvaDesignLayer 
                    product={currentProduct}
                    view={view}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-4 left-4 bg-[#232f3e] rounded-lg p-2 border border-gray-600">
          <div className="flex items-center space-x-2 text-xs text-gray-300">
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <Separator orientation="vertical" className="h-3 bg-gray-600" />
            <span>Drag to pan</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center py-3 border-t border-[var(--color-secondary)]/30">
        <div className="flex items-center space-x-4">
          <div className="bg-[#232f3e] rounded-full px-4 py-2 flex items-center space-x-2">
            <span className="text-sm font-medium text-white">
              {view === 'front' ? 'Front' : view === 'back' ? 'Back' : '360°'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (view === 'front') setView('back');
                else if (view === 'back') setView('front');
              }}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}