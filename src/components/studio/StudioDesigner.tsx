"use client";

import React, { useEffect, useRef } from 'react';
import { Header } from './Header';
import { ModeChips } from './ModeChips';
import { FloatingAssetLibrary } from './FloatingAssetLibrary';
import { Canvas2D } from './Canvas2D';
import { Canvas3D } from './Canvas3D';
import { TimelineVideo } from './TimelineVideo';
import { TimelineAudio } from './TimelineAudio';
import { PropertiesPanel } from './PropertiesPanel';
import { AssistantPanel } from './AssistantPanel';
import { MarketplacePanel } from './MarketplacePanel';
import { ExportDialog } from './ExportDialog';
import { MintNFTDialog } from './MintNFTDialog';
import { WalletHistoryModal } from './WalletHistoryModal';
import { ToastHost } from './ToastHost';
import { useStudioStore } from '@/src/lib/store/studio/studio';
import { useStudioWalletStore } from '@/src/lib/store/studio/wallet';
import { trackStudioEvent } from '@/src/lib/studio/analytics';
import { ARIA_LABELS } from '@/src/lib/studio/accessibility';

interface StudioDesignerProps {
  projectId?: string;
}

export function StudioDesigner({ projectId }: StudioDesignerProps) {
  const { 
    mode, 
    rightTab,
    isExportDialogOpen,
    isMintDialogOpen,
    setProjectId 
  } = useStudioStore();
  
  const { isHistoryOpen } = useStudioWalletStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      setProjectId(projectId);
    }
    trackStudioEvent.view();
  }, [projectId, setProjectId]);

  // Focus canvas helper for accessibility
  const focusCanvas = () => {
    canvasRef.current?.focus();
  };

  // Render appropriate canvas based on mode
  const renderCanvas = () => {
    switch (mode) {
      case 'image':
      case 'product':
      case 'nft':
        return <Canvas2D />;
      case 'threeD':
        return <Canvas3D />;
      case 'video':
        return <TimelineVideo />;
      case 'music':
        return <TimelineAudio />;
      default:
        return <Canvas2D />;
    }
  };

  // Render appropriate right panel based on tab
  const renderRightPanel = () => {
    switch (rightTab) {
      case 'Assistant':
        return <AssistantPanel />;
      case 'Properties':
        return <PropertiesPanel />;
      case 'Marketplace':
        return <MarketplacePanel />;
      default:
        return <AssistantPanel />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0B1220] text-[#E6EEFF] overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Mode Chips */}
      <ModeChips />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Panel - Canvas (now full width) */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          aria-label={ARIA_LABELS.canvas}
          tabIndex={0}
        >
          {renderCanvas()}
        </div>

        {/* Right Panel - Tabs */}
        <div 
          className="w-80 border-l border-white/10 flex flex-col"
          aria-label={`${rightTab} panel`}
        >
          {renderRightPanel()}
        </div>
      </div>

      {/* Floating Asset Library */}
      <FloatingAssetLibrary onFocusCanvas={focusCanvas} />

      {/* Modals and Dialogs */}
      {isExportDialogOpen && <ExportDialog />}
      {isMintDialogOpen && <MintNFTDialog />}
      {isHistoryOpen && <WalletHistoryModal />}
      
      {/* Toast Notifications */}
      <ToastHost />
    </div>
  );
}