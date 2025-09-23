"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { ARIA_LABELS } from '@/src/lib/studio/accessibility';

interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  src?: string;
  text?: string;
  fill?: string;
}

function ImageElement({ element, isSelected, onSelect, onChange }: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<CanvasElement>) => void;
}) {
  return (
    <div
      className={`absolute border-2 cursor-move ${
        isSelected ? 'border-indigo-400' : 'border-transparent'
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width || 200,
        height: element.height || 200,
        transform: `rotate(${element.rotation || 0}deg)`,
      }}
      onClick={onSelect}
      onMouseDown={(e) => {
        const startX = e.clientX - element.x;
        const startY = e.clientY - element.y;
        
        const handleMouseMove = (e: MouseEvent) => {
          onChange({
            x: e.clientX - startX,
            y: e.clientY - startY,
          });
        };
        
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    >
      <img 
        src={element.src} 
        alt="Canvas element" 
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}

export function Canvas2D() {
  const stageRef = useRef<any>(null);
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { selection, setSelection } = useStudioStore();

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const scaleBy = 1.1;
    const newScale = e.deltaY > 0 ? zoom / scaleBy : zoom * scaleBy;
    
    // Limit zoom
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    setZoom(clampedScale);
  }, [zoom]);

  const handleZoomIn = () => {
    const newZoom = Math.min(5, zoom * 1.2);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom / 1.2);
    setZoom(newZoom);
  };

  const handleResetZoom = () => {
    setZoom(1);
    setStagePos({ x: 0, y: 0 });
  };

  const handleStageClick = (e: React.MouseEvent) => {
    // Deselect when clicking on empty area
    if (e.target === e.currentTarget) {
      setSelectedId(null);
      setSelection([]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const assetData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (assetData && assetData.type === 'image') {
        const rect = e.currentTarget.getBoundingClientRect();
        
        const x = (e.clientX - rect.left - stagePos.x) / zoom;
        const y = (e.clientY - rect.top - stagePos.y) / zoom;
        
        const newElement: CanvasElement = {
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'image',
          x,
          y,
          width: 200,
          height: 200,
          src: assetData.url,
        };
        
        setCanvasElements(prev => [...prev, newElement]);
        
        window.dispatchEvent(new CustomEvent('studio-toast', {
          detail: {
            type: 'success',
            title: 'Asset Added',
            description: 'Image added to canvas'
          }
        }));
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [zoom, stagePos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateElement = (id: string, attrs: Partial<CanvasElement>) => {
    setCanvasElements(prev =>
      prev.map(el => el.id === id ? { ...el, ...attrs } : el)
    );
  };

  return (
    <div className="relative h-full bg-[var(--color-surface)] overflow-hidden">
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className="bg-[#0F1629] border border-white/20 rounded-lg p-2 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0 hover:bg-white/10"
            aria-label={ARIA_LABELS.zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-300 min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0 hover:bg-white/10"
            aria-label={ARIA_LABELS.zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-8 w-8 p-0 hover:bg-white/10"
            aria-label={ARIA_LABELS.resetZoom}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            aria-label={ARIA_LABELS.fullscreen}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        className="w-full h-full relative bg-[#2A3F5F] overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onWheel={handleWheel}
        onClick={handleStageClick}
        style={{
          transform: `scale(${zoom}) translate(${stagePos.x}px, ${stagePos.y}px)`,
          transformOrigin: '0 0',
        }}
      >
        {/* Grid background */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <React.Fragment key={i}>
              <div
                className="absolute bg-white/5"
                style={{
                  left: i * 50,
                  top: 0,
                  width: 1,
                  height: 2500,
                }}
              />
              <div
                className="absolute bg-white/5"
                style={{
                  left: 0,
                  top: i * 50,
                  width: 2500,
                  height: 1,
                }}
              />
            </React.Fragment>
          ))}
        </div>
        
        {/* Canvas Elements */}
        {canvasElements.map((element) => {
          if (element.type === 'image') {
            return (
              <ImageElement
                key={element.id}
                element={element}
                isSelected={selectedId === element.id}
                onSelect={() => {
                  setSelectedId(element.id);
                  setSelection([element.id]);
                }}
                onChange={(attrs) => updateElement(element.id, attrs)}
              />
            );
          }
          return null;
        })}
      </div>

      {/* Drop Zone Indicator */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full border-2 border-dashed border-transparent opacity-0 transition-all duration-200" />
      </div>
      
      {/* Instructions */}
      {canvasElements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <div className="text-lg font-medium mb-2">Canvas Ready</div>
            <div className="text-sm">Drag assets from the library to start creating</div>
            <div className="text-xs mt-2 opacity-60">
              Use mouse wheel to zoom • Drag to pan
            </div>
          </div>
        </div>
      )}
    </div>
  );
}