"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { downloadGeneration, regenerate } from "@/src/store/slices/aiStudioSlice";
import { logAPICall } from "@/src/utils/aiStudioParity";
import { isKioskInterface } from "@/src/core/utils";
import { submitAIStudioGenerationAsAd } from "@/src/app/apis/aiStudioAdService";
import { AIStudioGeneration, AIStudioAdSubmission } from "@/src/types/aiStudioAd";

interface GenerationPreviewProps {
  generation: AIStudioGeneration;
}

export default function GenerationPreview({ generation }: GenerationPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dispatch = useDispatch();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmittingAd, setIsSubmittingAd] = useState(false);

  // Check if we're in kiosk mode and if this is a completed video generation
  const canSubmitAsKioskAd = isKioskInterface() && 
    generation.type === 'video' && 
    (generation.status === 'completed' || generation.status === 'success') && 
    generation.videoUrl;

  const handleRegenerate = async () => {
    try {
      console.log('🔄 Starting regeneration for generation:', generation.id);
      console.log('🔄 Generation details:', {
        id: generation.id,
        type: generation.type,
        retryCount: generation.retryCount,
        prompt: generation.prompt
      });

      // Log API call for parity tracking
      logAPICall({
        url: `/ai-studio/regenerate/${generation.id}`,
        method: 'POST',
        timestamp: Date.now(),
        source: 'ai-studio',
        params: { generationId: generation.id, modifiedPrompt: generation.prompt }
      });

      const result = await dispatch(regenerate({ 
        generationId: generation.id,
        modifiedPrompt: generation.prompt // Use same prompt for regeneration
      }) as any);

      console.log('🔄 Regenerate dispatch result:', result);

      if (result.meta?.requestStatus === 'fulfilled') {
        toast.success(`Regeneration started! (Retry ${result.payload.retryCount}/3)`);
        console.log('✅ Regeneration successful:', result.payload);
      } else {
        console.error('❌ Regeneration failed:', result);
        const errorMessage = result.error?.message || 'Regeneration failed. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Regeneration error:', error);
      const errorMessage = error.message || 'Regeneration failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDownload = async () => {
    try {
      const url = generation.imageUrl || generation.videoUrl || generation.enhancedImageUrl;
      if (!url) {
        toast.error('No media available for download');
        return;
      }

      setIsDownloading(true);
      console.log('📥 Starting download for generation:', generation.id);

      // Log API call for parity tracking
      logAPICall({
        url: '/ai-studio/download',
        method: 'POST',
        timestamp: Date.now(),
        source: 'ai-studio',
        params: { generationId: generation.id, type: generation.type === 'video' ? 'video' : 'image' }
      });

      const result = await dispatch(downloadGeneration({ 
        generationId: generation.id,
        type: generation.type === 'video' ? 'video' : 
              generation.type === 'audio' || generation.type === 'music' ? 'audio' :
              generation.type === '3d' ? '3d' : 'image' 
      }) as any);

      if (result.meta?.requestStatus === 'fulfilled') {
        const downloadUrl = result.payload.downloadUrl;
        console.log('✅ Download URL received:', downloadUrl);

        // Determine file extension based on type
        let fileExtension = 'png'; // default
        if (generation.type === 'video') fileExtension = 'mp4';
        else if (generation.type === 'audio' || generation.type === 'music') fileExtension = 'mp3';
        else if (generation.type === '3d') fileExtension = 'glb';

        // Trigger browser download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `ai-generation-${generation.id}.${fileExtension}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Download started!');
      } else {
        toast.error('Download failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmitAsKioskAd = async () => {
    if (!canSubmitAsKioskAd) {
      toast.error('Cannot submit this generation as a kiosk ad');
      return;
    }

    setIsSubmittingAd(true);

    try {
      const submission: AIStudioAdSubmission = {
        generationId: generation.id,
        type: generation.type,
        prompt: generation.prompt,
        mediaUrl: generation.videoUrl!,
        title: `AI Generated Video - ${generation.prompt.substring(0, 50)}...`,
        description: `AI-generated video created with prompt: ${generation.prompt}`,
        notes: `Generated on ${new Date(generation.createdAt).toLocaleDateString()}`
      };

      console.log('🚀 Submitting generation as kiosk ad:', submission);

      const result = await submitAIStudioGenerationAsAd(submission);

      if (result.success) {
        toast.success(result.data?.message || 'Redirecting to kiosk ad submission...');
      } else {
        toast.error(result.error || 'Failed to submit as kiosk ad');
      }
    } catch (error) {
      console.error('❌ Error submitting as kiosk ad:', error);
      toast.error('Failed to submit as kiosk ad. Please try again.');
    } finally {
      setIsSubmittingAd(false);
    }
  };


  const getMediaElement = () => {
    if (generation.type === 'video' && generation.videoUrl) {
      return (
        <video 
          src={generation.videoUrl} 
          className="w-full h-full object-contain rounded-2xl"
          style={{ height: '400px' }}
          controls
          autoPlay
          muted
          loop
        />
      );
    }

    if (generation.type === 'image' && generation.imageUrl) {
      return (
        <img 
          src={generation.imageUrl} 
          alt="Generated image" 
          className="w-full h-full object-contain rounded-2xl"
          style={{ height: '400px' }}
        />
      );
    }

    if (generation.type === 'enhancement' && generation.enhancedImageUrl) {
      return (
        <img 
          src={generation.enhancedImageUrl} 
          alt="Enhanced image" 
          className="w-full h-full object-contain rounded-2xl"
        />
      );
    }

    if ((generation.type === 'audio' || generation.type === 'music') && (generation.audioUrl || generation.musicUrl)) {
      const audioSrc = generation.musicUrl || generation.audioUrl;
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl">
          <div className="text-4xl mb-2">🎵</div>
          <div className="text-xs text-center text-white mb-2">
            {generation.audioType === 'music' ? 'Music' : 
             generation.audioType === 'voice' ? 'Voice' : 'Audio'}
          </div>
          <audio 
            src={audioSrc} 
            controls
            className="w-full max-w-[200px]"
            style={{ height: '32px' }}
          />
          {generation.genre && (
            <div className="text-xs text-gray-400 mt-1">{generation.genre}</div>
          )}
        </div>
      );
    }

    if (generation.type === '3d' && generation.threeDUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl">
          <div className="text-4xl mb-2">🎲</div>
          <div className="text-xs text-center text-white mb-2">3D Model</div>
          <div className="text-xs text-gray-400 text-center">
            {generation.objectType} · {generation.style}
          </div>
          <a 
            href={generation.threeDUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            View 3D Model
          </a>
        </div>
      );
    }

    // Show appropriate error state based on generation type and status
    if (generation.status === 'failed') {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-red-400 bg-red-500/10 rounded-2xl">
          <span className="text-4xl mb-2">❌</span>
          <span className="text-xs text-center">Generation Failed</span>
      </div>
    );
  }

    if (generation.status === 'processing') {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-2xl">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-xs text-center">Processing...</span>
      </div>
    );
  }

    // No media available
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-500/10 rounded-2xl">
        <span className="text-4xl mb-2">📁</span>
        <span className="text-xs text-center">No Media</span>
      </div>
    );
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-all duration-300"
          >
            <span className="text-2xl">×</span>
          </motion.button>

          {/* Media */}
          <div className="max-w-6xl max-h-full w-full h-full flex items-center justify-center">
            {getMediaElement()}
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl font-medium shadow-lg transition-all duration-300 ${
                isDownloading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-[#0291D8] hover:to-[#2524A3] hover:shadow-xl'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Downloading...
                </>
              ) : (
                'Download'
              )}
            </motion.button>

            {/* Submit as Kiosk Ad Button */}
            {canSubmitAsKioskAd && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitAsKioskAd}
                disabled={isSubmittingAd}
                className={`px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-xl font-medium shadow-lg transition-all duration-300 ${
                  isSubmittingAd 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-[#E55A2B] hover:to-[#E68A1A] hover:shadow-xl'
                }`}
              >
                {isSubmittingAd ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit as Kiosk Ad'
              )}
            </motion.button>
            )}

            {/* Regenerate Button - Only show if retry count < 3 */}
            {generation.retryCount < 3 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRegenerate()}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-xl font-medium shadow-lg hover:from-[#E55A2B] hover:to-[#E68A1A] hover:shadow-xl transition-all duration-300"
              >
                🔄 Regenerate ({3 - generation.retryCount} left)
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Media Preview */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: '400px' }}>
        {getMediaElement()}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFullscreen(true)}
              className="w-12 h-12 bg-[rgba(255,255,255,0.2)] backdrop-blur-sm border border-[rgba(255,255,255,0.3)] rounded-full flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.3)] transition-all duration-300"
            >
              <span className="text-lg">🔍</span>
            </motion.button>

          <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            onClick={handleDownload}
            disabled={isDownloading}
              className={`w-12 h-12 backdrop-blur-sm border border-[rgba(255,255,255,0.3)] rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                isDownloading 
                  ? 'bg-[rgba(255,255,255,0.1)] opacity-50 cursor-not-allowed' 
                  : 'bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)]'
              }`}
          >
            {isDownloading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-lg">⬇️</span>
              )}
            </motion.button>

            {/* Submit as Kiosk Ad Button */}
            {canSubmitAsKioskAd && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmitAsKioskAd}
                disabled={isSubmittingAd}
                className={`w-12 h-12 backdrop-blur-sm border border-[rgba(255,255,255,0.3)] rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                  isSubmittingAd 
                    ? 'bg-[rgba(255,255,255,0.1)] opacity-50 cursor-not-allowed' 
                    : 'bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)]'
                }`}
              >
                {isSubmittingAd ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-lg">🎬</span>
                )}
              </motion.button>
            )}

          </div>
        </div>
      </div>

      {/* Generation Info */}
      <div className="mt-4 p-4 bg-[rgba(255,255,255,0.05)] rounded-xl border border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400 capitalize">{generation.type}</span>
          <span className="text-sm font-medium text-[var(--color-primary)]">{generation.cost} XUT</span>
        </div>

        <p className="text-gray-300 text-sm line-clamp-2 mb-2">{generation.prompt}</p>

        {/* Regenerate Button - Only show if retry count < 3 */}
        {generation.retryCount < 3 && (
          <div className="mb-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegenerate}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-lg font-medium hover:from-[#E55A2B] hover:to-[#E68A1A] transition-all duration-300 text-sm"
            >
              🔄 Regenerate ({3 - generation.retryCount} attempts left)
            </motion.button>
              </div>
        )}

        {/* Submit as Kiosk Ad Button - Only show in kiosk mode for completed videos */}
        {canSubmitAsKioskAd && (
          <div className="mb-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitAsKioskAd}
              disabled={isSubmittingAd}
              className={`w-full px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg font-medium transition-all duration-300 text-sm ${
                isSubmittingAd 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-[#0EA271] hover:to-[#047857]'
              }`}
            >
              {isSubmittingAd ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Submitting as Kiosk Ad...
                </>
              ) : (
                '🎬 Submit as Kiosk Ad'
            )}
          </motion.button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{new Date(generation.createdAt).toLocaleDateString()}</span>
          {generation.retryCount > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
              {generation.retryCount} retries
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
