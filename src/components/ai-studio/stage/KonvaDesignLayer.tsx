"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudioStore } from '../store/useStudioStore';
import { Product, ViewMode, DesignNode } from '../types';

interface SimpleDesignLayerProps {
  product: Product;
  view: ViewMode;
}

export function KonvaDesignLayer({ product, view }: SimpleDesignLayerProps) {
  const [draggedAsset, setDraggedAsset] = useState<any>(null);
  
  const { 
    nodes, 
    selectedIds, 
    assets,
    selectNodes, 
    updateNode,
    addNode,
    deleteNode
  } = useStudioStore();

  // Get print area for current view
  const printArea = product.printAreas.find(area => area.view === view);
  
  // Canvas dimensions
  const canvasWidth = 384;
  const canvasHeight = 384;
  
  // Calculate print area bounds in pixels
  const printBounds = printArea ? {
    x: (printArea.xPct / 100) * canvasWidth,
    y: (printArea.yPct / 100) * canvasHeight,
    width: (printArea.widthPct / 100) * canvasWidth,
    height: (printArea.heightPct / 100) * canvasHeight,
  } : null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const assetData = JSON.parse(e.dataTransfer.getData('application/json'));
      const rect = e.currentTarget.getBoundingClientRect();
      
      // Calculate drop position relative to canvas
      const dropPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Check if drop is within print area
      if (printBounds) {
        const isInPrintArea = (
          dropPos.x >= printBounds.x &&
          dropPos.x <= printBounds.x + printBounds.width &&
          dropPos.y >= printBounds.y &&
          dropPos.y <= printBounds.y + printBounds.height
        );

        if (!isInPrintArea) {
          console.log('Drop outside print area');
          return;
        }
      }

      // Create new design node
      addNode({
        kind: assetData.type === 'video_qr' ? 'qr' : 'image',
        assetId: assetData.id,
        x: Math.max(0, dropPos.x - 50), // Center the asset
        y: Math.max(0, dropPos.y - 50),
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1
      });
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  const handleNodeDrag = (nodeId: string, newX: number, newY: number) => {
    // Constrain to print area if defined
    if (printBounds) {
      const constrainedPos = {
        x: Math.max(printBounds.x, Math.min(printBounds.x + printBounds.width - 100, newX)),
        y: Math.max(printBounds.y, Math.min(printBounds.y + printBounds.height - 100, newY))
      };
      updateNode(nodeId, constrainedPos);
    } else {
      updateNode(nodeId, { x: newX, y: newY });
    }
  };

  // Filter nodes for current view
  const currentViewNodes = nodes.filter(node => {
    return view === 'front' || view === 'back';
  });

  return (
    <div 
      className="absolute inset-0 pointer-events-auto"
      style={{ width: canvasWidth, height: canvasHeight }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => selectNodes([])}
    >
      {/* Print Area Outline */}
      {printBounds && (
        <div
          className="absolute border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-primary)]/10 pointer-events-none"
          style={{
            left: printBounds.x,
            top: printBounds.y,
            width: printBounds.width,
            height: printBounds.height,
          }}
        />
      )}

      {/* Design Nodes */}
      <AnimatePresence>
        {currentViewNodes.map((node) => (
          <DesignNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedIds.includes(node.id)}
            onSelect={() => selectNodes([node.id])}
            onMove={(x, y) => handleNodeDrag(node.id, x, y)}
            onDelete={() => deleteNode(node.id)}
            assets={assets}
          />
        ))}
      </AnimatePresence>

      {/* Drop Zone Indicator */}
      {printBounds && (
        <div
          className="absolute pointer-events-none flex items-center justify-center text-[var(--color-primary)]/50 text-sm font-medium"
          style={{
            left: printBounds.x,
            top: printBounds.y,
            width: printBounds.width,
            height: printBounds.height,
          }}
        >
          {currentViewNodes.length === 0 && "Drop assets here"}
        </div>
      )}
    </div>
  );
}

interface DesignNodeComponentProps {
  node: DesignNode;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDelete: () => void;
  assets: any[];
}

function DesignNodeComponent({ 
  node, 
  isSelected, 
  onSelect, 
  onMove, 
  onDelete,
  assets 
}: DesignNodeComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const asset = assets.find(a => a.id === node.assetId);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onMove(e.clientX - dragStart.x, e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      onDelete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: node.opacity || 1, 
        scale: 1,
        x: node.x,
        y: node.y,
        rotate: node.rotation || 0
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`absolute cursor-move select-none ${
        isSelected ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-transparent' : ''
      }`}
      style={{
        width: node.width,
        height: node.height,
        zIndex: isSelected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Asset Content */}
      {asset?.srcUrl ? (
        <img 
          src={asset.srcUrl} 
          alt={asset.name}
          className="w-full h-full object-cover rounded border-2 border-gray-400 hover:border-[var(--color-primary)] transition-colors"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-700 border-2 border-gray-400 rounded flex items-center justify-center text-white text-xs">
          {node.kind === 'qr' ? 'QR' : node.kind === 'image' ? 'IMG' : 'TXT'}
        </div>
      )}

      {/* Selection Handles */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-[var(--color-primary)] rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-primary)] rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[var(--color-primary)] rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--color-primary)] rounded-full"></div>
        </div>
      )}
    </motion.div>
  );
}