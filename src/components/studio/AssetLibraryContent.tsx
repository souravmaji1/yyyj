"use client";

import React, { useCallback, useState, forwardRef } from 'react';
import { Upload, Image, Video, Music, Mic, Palette, Hash, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '@/src/lib/studio/api';
import { ARIA_LABELS } from '@/src/lib/studio/accessibility';

const ASSET_TYPE_ICONS = {
  image: <Image className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  palette: <Palette className="h-4 w-4" />,
  qr: <Hash className="h-4 w-4" />,
  threeD: <div className="h-4 w-4 border border-current rounded"></div>,
  font: <div className="h-4 w-4 text-xs font-bold">Aa</div>,
};

interface AssetLibraryContentProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  listScrollTop?: number;
  onListScroll?: (scrollTop: number) => void;
}

export const AssetLibraryContent = forwardRef<HTMLDivElement, AssetLibraryContentProps>(
  function AssetLibraryContent(
    { searchQuery = '', onSearchChange, searchInputRef, listScrollTop = 0, onListScroll },
    ref
  ) {
    const [dragOver, setDragOver] = useState(false);

    const { data: assets = [], isLoading } = useQuery({
      queryKey: ['assets'],
      queryFn: fetchAssets,
    });

    const filteredAssets = assets.filter(asset => 
      !searchQuery || 
      asset.meta?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      // Handle file upload here
      console.log('Dropped files:', files);
      
      // Show toast for file upload
      window.dispatchEvent(new CustomEvent('studio-toast', {
        detail: {
          type: 'success',
          title: 'Files Uploaded',
          description: `${files.length} file(s) uploaded successfully`
        }
      }));
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        // Handle file upload here
        console.log('Selected files:', files);
        
        window.dispatchEvent(new CustomEvent('studio-toast', {
          detail: {
            type: 'success',
            title: 'Files Uploaded',
            description: `${files.length} file(s) uploaded successfully`
          }
        }));
      }
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
      <div ref={ref} className="h-full flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] placeholder-gray-400"
            />
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
              dragOver 
                ? 'border-indigo-400 bg-indigo-500/10' 
                : 'border-white/20 hover:border-white/40'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.glb,.gltf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label={ARIA_LABELS.uploadFile}
            />
            
            <div className="text-center">
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images, videos, audio, 3D models
              </p>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <ScrollArea 
          className="flex-1"
          onScrollCapture={(e) => {
            const target = e.target as HTMLElement;
            onListScroll?.(target.scrollTop);
          }}
        >
          <div className="p-4 space-y-2">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))
            ) : filteredAssets.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-sm">No assets found</div>
                {searchQuery && (
                  <div className="text-xs mt-1">Try a different search term</div>
                )}
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center space-x-3 p-3 bg-[var(--color-surface)] rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group hover:scale-105"
                  draggable
                  onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(asset));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  {/* Asset Icon/Thumbnail */}
                  <div className="flex-shrink-0 w-12 h-12 bg-[#2A3F5F] rounded-lg flex items-center justify-center overflow-hidden">
                    {asset.type === 'image' ? (
                      <img 
                        src={asset.url} 
                        alt={asset.meta?.name || 'Asset'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={asset.type === 'image' ? 'hidden' : ''}>
                      {ASSET_TYPE_ICONS[asset.type] || ASSET_TYPE_ICONS.image}
                    </div>
                  </div>

                  {/* Asset Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#E6EEFF] truncate">
                      {asset.meta?.name || `${asset.type} asset`}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center space-x-2">
                      <span className="capitalize">{asset.type}</span>
                      {asset.meta?.size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(asset.meta.size)}</span>
                        </>
                      )}
                    </div>
                    {asset.meta?.createdAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(asset.meta.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Drag Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-violet-400 rounded-full"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);