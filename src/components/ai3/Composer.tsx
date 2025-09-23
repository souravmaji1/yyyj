"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, RefreshCw, User, Target } from 'lucide-react';
import { Mode, SubMode } from '@/src/app/(protected)/ai-studio/types';
import CapsulePromptSelector from './CapsulePromptSelector';

interface ComposerProps {
  mode: Mode;
  subMode: SubMode;
  prompt: string;
  selectedPreset: string;
  uploadedFile: File | null;
  targetImage?: File | null;
  onPromptChange: (prompt: string) => void;
  onPresetChange: (preset: string, promptText: string) => void;
  onFileUpload: (file: File | null) => void;
  onTargetImageUpload?: (file: File | null) => void;
  onSubModeChange?: (subMode: SubMode) => void;
  isPreviewMode?: boolean; // New prop to control layout mode
  isPreviewOnly?: boolean; // New prop for preview-only mode (desktop right column layout)
  currentGeneration?: any; // Add current generation for processing status
  processingDuration?: number; // Add processing duration
}

export default function Composer({
  mode,
  subMode,
  prompt,
  selectedPreset,
  uploadedFile,
  targetImage,
  onPromptChange,
  onPresetChange,
  onFileUpload,
  onTargetImageUpload,
  onSubModeChange,
  isPreviewMode = false,
  isPreviewOnly = false,
  currentGeneration,
  processingDuration = 0,
}: ComposerProps) {
  const needsUpload = subMode === 'img2img' || subMode === 'img2vid';

  const removeFile = () => {
    onFileUpload(null);
  };

  // Preview Only Mode - Just the preview area for desktop right-column layout
  if (isPreviewOnly) {
    return (
      <div className="mb-8 bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl min-h-[220px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[400px] xl:min-h-[480px] flex items-center justify-center overflow-hidden">
        {uploadedFile ? (
          <div className="relative w-full h-full max-h-[700px] flex items-center justify-center">
            {mode === 'video' && subMode === 'img2vid' ? (
              // For image-to-video, show the uploaded image
              (<img
                src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                alt="Uploaded image for video conversion"
                className="w-full h-full object-cover rounded-2xl"
                style={{ height: '400px' }}
              />)
            ) : mode === 'video' ? (
              // For text-to-video, show video if available
              (<video
                src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                className="w-full h-full object-cover rounded-2xl"
                style={{ height: '400px' }}
                controls
                muted
                preload="metadata"
                onError={(e) => {
                  console.error('Video preview error:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />)
            ) : mode === 'audio' ? (
              <audio
                src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                className="w-full h-full"
                controls
                preload="metadata"
                onError={(e) => {
                  console.error('Audio preview error:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <img
                src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-2xl"
                style={{ height: '500px' }}
              />
            )}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
              aria-label="Remove uploaded file"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-center text-slate-500 p-4">
            {currentGeneration && currentGeneration.status === 'processing' ? (
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4 animate-pulse">
                  {mode === 'video' ? '🎬' : '🎨'}
                </div>
                <div className="text-slate-400 text-sm sm:text-base mb-2">
                  {mode === 'video' ? 'Processing video...' : 'Processing...'}
                </div>
                <div className="text-slate-500 text-xs">
                  {Math.floor(processingDuration / 60)}m {processingDuration % 60}s
                </div>
              </div>
            ) : (
              <>
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4">
                  {mode === 'video' ? '🎬' : 
                   mode === 'audio' ? '🎵' :
                   mode === 'threeD' ? '🎲' :
                   '🎨'}
                </div>
                <p className="text-slate-400 text-sm sm:text-base">
                  {mode === 'video' ? 'Your video preview will appear here.' : 'Your image preview will appear here.'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Preview Mode - Full width preview for responsive layout */}
      {isPreviewMode ? (
        <div className="space-y-4">
          {/* Preview Section */}
          <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl min-h-[220px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[400px] xl:min-h-[480px] flex items-center justify-center overflow-hidden">
            {uploadedFile ? (
              <div className="relative w-full h-full max-h-[700px] flex items-center justify-center">
                {mode === 'video' && subMode === 'img2vid' ? (
                  // For image-to-video, show the uploaded image
                  (<img
                    src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                    alt="Uploaded image for video conversion"
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ height: '400px' }}
                  />)
                ) : mode === 'video' ? (
                  // For text-to-video, show video if available
                  (<video
                    src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                    className="w-full h-full object-cover rounded-2xl"
                    controls
                    muted
                    preload="metadata"
                    onError={(e) => {
                      console.error('Video preview error:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />)
                ) : mode === 'audio' ? (
                  <audio
                    src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                    className="w-full h-full"
                    controls
                    preload="metadata"
                    onError={(e) => {
                      console.error('Audio preview error:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <img
                    src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ height: '400px' }}
                  />
                )}
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
                  aria-label="Remove uploaded file"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-500 p-4">
                {currentGeneration && currentGeneration.status === 'processing' ? (
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-4 animate-pulse">
                      {mode === 'video' ? '🎬' : 
                       mode === 'audio' ? '🎵' :
                       mode === 'threeD' ? '🎲' :
                       '🎨'}
                    </div>
                    <div className="text-slate-400 text-sm sm:text-base mb-2">
                      {mode === 'video' ? 'Processing video...' : 
                       mode === 'audio' ? 'Processing audio...' :
                       mode === 'threeD' ? 'Processing 3D object...' :
                       'Processing...'}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {Math.floor(processingDuration / 60)}m {processingDuration % 60}s
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-4">
                      {mode === 'video' ? '🎬' : '🎨'}
                    </div>
                    <p className="text-slate-400 text-sm sm:text-base">
                      {mode === 'video' ? 'Your video preview will appear here.' : 
                       mode === 'audio' ? 'Your audio preview will appear here.' :
                       mode === 'threeD' ? 'Your 3D object preview will appear here.' :
                       'Your image preview will appear here.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Controls Section - Mobile/Tablet layout */}
          <div className="xl:hidden">
            <CapsulePromptSelector
              mode={mode}
              subMode={subMode}
              prompt={prompt}
              onPromptChange={onPromptChange}
            />
          </div>
        </div>
      ) : (
        /* Legacy Mode - Original two-column layout */
        (<div className="md:grid md:grid-cols-2 gap-6">
          {/* Left preview */}
          <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl min-h-[220px] md:min-h-[260px] flex items-center justify-center">
            {uploadedFile ? (
              <div className="relative w-full h-full">
                {mode === 'video' ? (
                  <video
                    src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                    className="w-full h-full object-cover rounded-2xl"
                    controls
                    muted
                    preload="metadata"
                    onError={(e) => {
                      console.error('Video preview error:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : mode === 'audio' ? (
                  <audio
                    src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                    className="w-full h-full"
                    controls
                    preload="metadata"
                    onError={(e) => {
                      console.error('Audio preview error:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <img
                    src={(uploadedFile as any).s3Url || URL.createObjectURL(uploadedFile)}
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                {currentGeneration && currentGeneration.status === 'processing' ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2 animate-pulse">
                      {mode === 'video' ? '🎬' : 
                       mode === 'audio' ? '🎵' :
                       mode === 'threeD' ? '🎲' :
                       '🎨'}
                    </div>
                    <div className="text-slate-400 mb-1">
                      {mode === 'video' ? 'Processing video...' : 
                       mode === 'audio' ? 'Processing audio...' :
                       mode === 'threeD' ? 'Processing 3D object...' :
                       'Processing...'}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {Math.floor(processingDuration / 60)}m {processingDuration % 60}s
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">
                      {mode === 'video' ? '🎬' : 
                       mode === 'audio' ? '🎵' :
                       mode === 'threeD' ? '🎲' :
                       '🎨'}
                    </div>
                    <p className="text-slate-400">
                      {mode === 'video' ? 'Your video preview will appear here.' : 
                       mode === 'audio' ? 'Your audio preview will appear here.' :
                       mode === 'threeD' ? 'Your 3D object preview will appear here.' :
                       'Your image preview will appear here.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Right stack */}
          <div>
            {subMode === 'imgswap' ? (
              <ImageSwapInterface
                prompt={prompt}
                onPromptChange={onPromptChange}
                uploadedFile={uploadedFile}
                onFileUpload={onFileUpload}
                targetImage={targetImage}
                onTargetImageUpload={onTargetImageUpload}
                onSubModeChange={onSubModeChange}
              />
            ) : (
              <CapsulePromptSelector
                mode={mode}
                subMode={subMode}
                prompt={prompt}
                onPromptChange={onPromptChange}
              />
            )}
          </div>
        </div>)
      )}
    </>
  );
}

// Image Swap Interface Component
interface ImageSwapInterfaceProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  uploadedFile: File | null;
  onFileUpload: (file: File | null) => void;
  targetImage?: File | null;
  onTargetImageUpload?: (file: File | null) => void;
  onSubModeChange?: (subMode: SubMode) => void;
}

const ImageSwapInterface: React.FC<ImageSwapInterfaceProps> = ({
  prompt,
  onPromptChange,
  uploadedFile,
  onFileUpload,
  targetImage,
  onTargetImageUpload,
  onSubModeChange,
}) => {
  const handleTargetUpload = (file: File) => {
    onTargetImageUpload?.(file);
  };

  const removeTargetImage = () => {
    onTargetImageUpload?.(null);
  };

  // Prompt presets for image swapping
  const swapPresets = [
    { label: 'Face Swap' },
    { label: 'Object Replacement' },
    { label: 'Background Swap' },
    { label: 'Style Transfer' },
    { label: 'Person Swap' },
    { label: 'Animal Face Swap' },
    { label: 'Celebrity Look' },
    { label: 'Age Progression' },
  ];

  const handlePresetSelect = (preset: { label: string }) => {
    onPromptChange(preset.label);
    // For face swap, we need to trigger the parent to change subMode to 'imgswap'
    if (preset.label === 'Face Swap' && onSubModeChange) {
      onSubModeChange('imgswap');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Description */}
      <div>
        <label className="block text-slate-50 font-medium mb-2 text-sm sm:text-base">
          Describe your image swap
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe what you want to swap or transform..."
          className="w-full h-24 sm:h-32 bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[#0b0f1a] transition-colors motion-reduce:transition-none text-sm sm:text-base"
        />
      </div>

      {/* Preset Pills */}
      <div>
        <p className="text-sm text-slate-400 mb-3">Or choose a preset:</p>
        <div className="flex flex-wrap gap-2">
          {swapPresets.map((preset) => (
            <motion.button
              key={preset.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePresetSelect(preset)}
              className="px-3 py-2 text-xs rounded-full bg-[rgba(255,255,255,0.05)] border border-white/10 text-slate-400 hover:bg-[rgba(255,255,255,0.08)] hover:text-white transition-all duration-200"
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Target Image Upload Area */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <label className="text-sm font-medium text-slate-50">Upload Target Image</label>
        </div>
        <div className="relative">
          {targetImage ? (
            <div className="relative group">
              <img
                src={URL.createObjectURL(targetImage)}
                alt="Target"
                className="w-full h-40 object-cover rounded-xl border border-white/10"
              />
              <button
                onClick={removeTargetImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-400 mb-2">Upload target image to swap with</p>
              <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleTargetUpload(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Swap Arrow */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full p-3 border border-white/10">
          <RefreshCw className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-4">
        <h4 className="text-sm font-medium text-slate-50 mb-2">How it works:</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Your uploaded image is the source (what you want to change)</li>
          <li>• Upload your target image (what you want to swap to)</li>
          <li>• Describe the transformation you want</li>
          <li>• AI will intelligently swap the elements</li>
        </ul>
      </div>
    </div>
  );
};

export { ImageSwapInterface };

