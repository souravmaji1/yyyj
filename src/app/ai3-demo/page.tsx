"use client";

import React, { useState, useEffect } from 'react';
import ModeChips from '@/src/components/ai3/ModeChips';
import AssetLibraryPanel from '@/src/components/ai3/AssetLibraryPanel';
import { Mode, SubMode } from '@/src/app/(protected)/ai-studio/types';
import { aiStudioCostsService } from '@/src/app/apis/aiStudioCostsService';

export default function AI3DemoPage() {
  const [ai3State, setAI3State] = useState({
    mode: 'image' as Mode,
    subMode: 'txt2img' as SubMode,
    uploadedFile: null as File | null,
  });

  const [costs, setCosts] = useState<Record<SubMode, number>>({
    txt2img: 15,
    img2img: 15,
    enhance: 10,
    imgswap: 18,
    txt2vid: 25,
    img2vid: 25,
    music: 20,
    soundeffect: 20,
    audiobook: 30,
    character: 30,
    object: 25,
    environment: 40,
    img2obj: 30,
  });

  // Load costs from admin settings
  useEffect(() => {
    const loadCosts = async () => {
      try {
        const adminCosts = await aiStudioCostsService.getAIStudioCosts();
        setCosts({
          txt2img: adminCosts.imageCost,
          img2img: adminCosts.imageCost,
          enhance: adminCosts.enhancementCost,
          imgswap: adminCosts.faceSwapCost,
          txt2vid: adminCosts.videoCost,
          img2vid: adminCosts.videoCost,
          music: adminCosts.audioCost,
          soundeffect: adminCosts.audioCost,
          audiobook: adminCosts.audiobookCost,
          character: adminCosts.threeDCost,
          object: adminCosts.threeDCost,
          environment: adminCosts.threeDCost,
          img2obj: adminCosts.threeDCost,
        });
      } catch (error) {
        console.error('Failed to load admin costs, using defaults:', error);
      }
    };
    
    loadCosts();
  }, []);

  const handleModeChange = (mode: Mode) => {
    const newSubMode = mode === 'image' ? 'txt2img' : 
                      mode === 'video' ? 'txt2vid' :
                      mode === 'audio' ? 'music' : 'character';
    setAI3State(prev => ({ ...prev, mode, subMode: newSubMode }));
  };

  const handleSubModeChange = (subMode: SubMode) => {
    setAI3State(prev => ({ ...prev, subMode }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-4 text-center">
            AI3 Component Demo
          </h1>
          <p className="text-center text-slate-400 mb-4">
            Demonstrating the updated AI3 component with upload moved to library section
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <ModeChips
            mode={ai3State.mode}
            subMode={ai3State.subMode}
            onModeChange={handleModeChange}
            onSubModeChange={handleSubModeChange}
            costs={costs}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:gap-8 xl:grid-cols-12">
          {/* Preview Area */}
          <div className="xl:col-span-7">
            <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl min-h-[400px] flex items-center justify-center">
              {ai3State.uploadedFile ? (
                <div className="relative w-full h-full p-4">
                  <img
                    src={URL.createObjectURL(ai3State.uploadedFile)}
                    alt="Uploaded"
                    className="w-full h-full object-contain rounded-2xl max-h-[360px]"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-500 p-4">
                  <div className="text-4xl sm:text-5xl md:text-6xl mb-4">
                    {ai3State.mode === 'video' ? '🎬' : 
                     ai3State.mode === 'audio' ? '🎵' :
                     ai3State.mode === 'threeD' ? '📦' : '🎨'}
                  </div>
                  <p className="text-slate-400 text-sm sm:text-base">
                    Your {ai3State.mode} preview will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Library Panel */}
          <div className="xl:col-span-5">
            <AssetLibraryPanel
              onFileUpload={(file) => setAI3State(prev => ({ ...prev, uploadedFile: file }))}
              uploadedFile={ai3State.uploadedFile}
            />
          </div>
        </div>

        {/* Changes Summary */}
        <div className="mt-8 bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-slate-50 mb-4">Key Changes Made</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--brand-primary-600)] mb-2">Top Modes Updated</h3>
              <ul className="text-slate-400 space-y-1">
                <li>• ❌ Removed "Design Merch" (👕)</li>
                <li>• ✅ Added "Audio" (🎵)</li>
                <li>• ✅ Added "3D Object" (📦)</li>
                <li>• Brand-friendly styling applied</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--brand-primary-600)] mb-2">Upload Functionality</h3>
              <ul className="text-slate-400 space-y-1">
                <li>• ❌ Removed from top sections</li>
                <li>• ✅ Moved to library as first tile</li>
                <li>• Drag & drop with brand colors</li>
                <li>• "PNG/JPG up to 10MB · Min 300×300px"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}