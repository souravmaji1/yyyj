"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image, Video, Upload, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { useStudioStore } from '../store/useStudioStore';
import { generateQrDataUrl } from '../qr/generateQr';

export function LeftAssetsPanel() {
  const {
    leftPanelCollapsed,
    assetSource,
    assets,
    toggleLeftPanel,
    setAssetSource,
    addAsset
  } = useStudioStore();

  const [videoUrl, setVideoUrl] = useState('');
  const [qrGenerating, setQrGenerating] = useState(false);

  const handleGenerateQr = async () => {
    if (!videoUrl.trim()) return;
    
    setQrGenerating(true);
    try {
      const qrDataUrl = await generateQrDataUrl(videoUrl, { 
        color: '#000000',
        ecc: 'M' 
      });
      
      addAsset({
        type: 'video_qr',
        name: `QR: ${videoUrl.slice(0, 30)}...`,
        thumbUrl: qrDataUrl,
        srcUrl: qrDataUrl,
        meta: { originalUrl: videoUrl }
      });
      
      setVideoUrl('');
    } catch (error) {
      console.error('Failed to generate QR:', error);
    } finally {
      setQrGenerating(false);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: leftPanelCollapsed ? 56 : 320 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
      className="relative border-r border-[var(--color-secondary)]/30 bg-[#232f3e] flex flex-col overflow-hidden"
      aria-label="Assets Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-secondary)]/30">
        <AnimatePresence mode="wait">
          {!leftPanelCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-semibold text-white"
            >
              Assets
            </motion.h2>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLeftPanel}
          className="text-gray-400 hover:text-white"
        >
          {leftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {!leftPanelCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Source Selector */}
            <div className="p-4">
              <div className="flex bg-[var(--color-surface)] rounded-lg p-1">
                <Button
                  variant={assetSource === 'image' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setAssetSource('image')}
                  className="flex-1 text-xs"
                >
                  <Image className="w-3 h-3 mr-1" />
                  Image
                </Button>
                <Button
                  variant={assetSource === 'video' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setAssetSource('video')}
                  className="flex-1 text-xs"
                >
                  <Video className="w-3 h-3 mr-1" />
                  Video
                </Button>
              </div>
            </div>

            <Separator className="bg-[var(--color-secondary)]/30" />

            {/* Asset Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {assetSource === 'image' ? (
                <ImageAssetsSection assets={assets} />
              ) : (
                <VideoQrSection 
                  videoUrl={videoUrl}
                  setVideoUrl={setVideoUrl}
                  onGenerateQr={handleGenerateQr}
                  qrGenerating={qrGenerating}
                  assets={assets}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state - icon rail */}
      {leftPanelCollapsed && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <Image className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </motion.aside>
  );
}

function ImageAssetsSection({ assets }: { assets: any[] }) {
  const imageAssets = assets.filter(asset => asset.type === 'image');
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">
        Your generated images
      </div>
      
      <Button 
        variant="outline" 
        className="w-full border-dashed border-gray-600 hover:border-[var(--color-primary)]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Image
      </Button>
      
      <div className="grid grid-cols-2 gap-3">
        {imageAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
        
        {/* Placeholder assets for demo */}
        {imageAssets.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No images yet. Add some to get started!
          </div>
        )}
      </div>
    </div>
  );
}

function VideoQrSection({ 
  videoUrl, 
  setVideoUrl, 
  onGenerateQr, 
  qrGenerating,
  assets 
}: {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  onGenerateQr: () => void;
  qrGenerating: boolean;
  assets: any[];
}) {
  const qrAssets = assets.filter(asset => asset.type === 'video_qr');
  
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">
        Generate QR codes from video URLs
      </div>
      
      <div className="space-y-3">
        <input
          type="url"
          placeholder="Enter video URL..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none"
        />
        
        <Button
          onClick={onGenerateQr}
          disabled={!videoUrl.trim() || qrGenerating}
          className="w-full bg-[var(--color-primary)] hover:bg-[#0289d4]"
        >
          {qrGenerating ? 'Generating...' : 'Generate QR'}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {qrAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
        
        {qrAssets.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No QR codes yet. Generate one from a video URL!
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: any }) {
  const addNode = useStudioStore(state => state.addNode);
  
  const handleDoubleClick = () => {
    // Auto-place asset in center of canvas
    addNode({
      kind: asset.type === 'video_qr' ? 'qr' : 'image',
      assetId: asset.id,
      x: 200, // Will be centered properly in actual implementation
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag data for the design layer to pick up
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  return (
    <Card 
      className="bg-[var(--color-surface)] border-gray-600 hover:border-[var(--color-primary)] cursor-pointer transition-colors"
      onDoubleClick={handleDoubleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-2">
        <div className="aspect-square bg-gray-800 rounded mb-2 flex items-center justify-center overflow-hidden">
          {asset.thumbUrl ? (
            <img 
              src={asset.thumbUrl} 
              alt={asset.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="text-gray-500">
              {asset.type === 'video_qr' ? <Video className="w-6 h-6" /> : <Image className="w-6 h-6" />}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-300 truncate">
          {asset.name}
        </div>
      </CardContent>
    </Card>
  );
}