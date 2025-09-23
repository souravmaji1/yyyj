"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Upload, Image, Video, Music, Mic, Palette, Hash, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';

interface AssetLibraryPanelProps {
  onFileUpload: (file: File | null) => void;
  uploadedFile: File | null;
}

export default function AssetLibraryPanel({ onFileUpload, uploadedFile }: AssetLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        onFileUpload(file);
      }
    }
  };

  const removeFile = () => {
    onFileUpload(null);
  };

  return (
    <div className="glass h-[400px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-slate-50 mb-3">Your Library</h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search your assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--color-surface)] border-white/20 text-[#E6EEFF] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {/* Upload Tile - First Item */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer ${
              dragOver 
                ? 'border-[var(--brand-primary-600)] bg-[var(--brand-primary-600)]/10' 
                : uploadedFile
                  ? 'border-[var(--brand-primary-600)] bg-[var(--brand-primary-600)]/5'
                  : 'border-white/20 hover:border-[var(--brand-primary-600)] hover:bg-[var(--brand-primary-600)]/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload image file"
            />
            
            {uploadedFile ? (
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--brand-primary-600)]/10 flex items-center justify-center">
                    <img 
                      src={URL.createObjectURL(uploadedFile)} 
                      alt="Uploaded" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--brand-primary-600)] mb-1">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-3 text-[var(--brand-primary-600)]" />
                <p className="text-sm font-medium text-slate-50 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG/JPG up to 10MB · Min 300×300px
                </p>
              </div>
            )}
          </div>

          {/* Placeholder for other assets */}
          <div className="text-center text-gray-400 py-8">
            <div className="text-sm">No assets yet</div>
            <div className="text-xs mt-1">Upload images to see them here</div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}