"use client";

import React from 'react';
import { LeftAssetsPanel } from './panels/LeftAssetsPanel';
import { ProductStage } from './stage/ProductStage';
import { RightChatPanel } from './panels/RightChatPanel';
import { useStudioStore } from './store/useStudioStore';

export function AIStudioDesigner() {
  const rightPanelVisible = useStudioStore(state => state.rightPanelVisible);

  return (
    <div className="flex h-screen w-full bg-[var(--color-surface)] text-white overflow-hidden">
      <LeftAssetsPanel />
      <ProductStage />
      {rightPanelVisible && <RightChatPanel />}
    </div>
  );
}