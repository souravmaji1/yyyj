"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  generateImage, 
  imageToImage, 
  enhanceImage, 
  generateVideo, 
  imageToVideo 
} from '@/src/store/slices/aiStudioSlice';
import { logAPICall } from '@/src/utils/aiStudioParity';
import { AI3State } from '@/src/app/(protected)/ai-studio/types';

interface StickyBottomBarProps {
  cost: number;
  readinessText: string;
  canGenerate: boolean;
  isGenerating: boolean;
  ai3State: AI3State;
  dispatch: any;
}

export default function StickyBottomBar({
  cost,
  readinessText,
  canGenerate,
  isGenerating,
  ai3State,
  dispatch,
}: StickyBottomBarProps) {
  const router = useRouter();

  const handleGenerate = async () => {
    if (!canGenerate || isGenerating) return;

    const { subMode, prompt, uploadedFile } = ai3State;

    try {
      switch (subMode) {
        case 'txt2img':
          // Log API call for parity tracking
          logAPICall({
            url: '/ai-studio/generate-image',
            method: 'POST',
            timestamp: Date.now(),
            source: 'ai-studio-3',
            params: { prompt, style: 'realistic', size: '1024x1024', quality: 'high', cost }
          });

          await dispatch(generateImage({
            prompt,
            style: 'realistic', // Default style like in existing AI Studio
            size: '1024x1024', // Default size
            quality: 'high', // Default quality
            cost,
          }));
          break;

        case 'img2img':
          if (!uploadedFile) return;
          const img2imgFormData = new FormData();
          img2imgFormData.append('image', uploadedFile);
          img2imgFormData.append('prompt', prompt);
          // Get userId from localStorage (same as existing implementation)
          const userAuthDetails = JSON.parse(localStorage.getItem("userAuthDetails") || "{}");
          if (userAuthDetails.id) {
            img2imgFormData.append('userId', userAuthDetails.id);
          }
          
          // Log API call for parity tracking
          logAPICall({
            url: '/ai-studio/image-to-image',
            method: 'POST',
            timestamp: Date.now(),
            source: 'ai-studio-3',
            params: { prompt, cost, hasImage: true }
          });
          
          await dispatch(imageToImage({
            formData: img2imgFormData,
            cost,
          }));
          break;

        case 'enhance':
          if (!uploadedFile) return;
          const enhanceFormData = new FormData();
          enhanceFormData.append('image', uploadedFile);
          if (prompt.trim()) {
            enhanceFormData.append('instructions', prompt); // Fixed: use 'instructions' instead of 'prompt'
          }
          enhanceFormData.append('type', 'upload'); // Added: required type field
          // Get userId from localStorage
          const userAuthDetailsEnhance = JSON.parse(localStorage.getItem("userAuthDetails") || "{}");
          if (userAuthDetailsEnhance.id) {
            enhanceFormData.append('userId', userAuthDetailsEnhance.id);
          }
          
          // Log API call for parity tracking
          logAPICall({
            url: '/ai-studio/enhance-image',
            method: 'POST',
            timestamp: Date.now(),
            source: 'ai-studio-3',
            params: { prompt, cost, hasImage: true }
          });
          
          await dispatch(enhanceImage({
            formData: enhanceFormData,
            cost,
          }));
          break;

        case 'txt2vid':
          // Log API call for parity tracking
          logAPICall({
            url: '/ai-studio/generate-video',
            method: 'POST',
            timestamp: Date.now(),
            source: 'ai-studio-3',
            params: { prompt, motionType: 'smooth', duration: 5, cost }
          });

          await dispatch(generateVideo({
            prompt,
            motionType: 'smooth', // Default motion type
            duration: 5, // Default duration in seconds
            cost,
          }));
          break;

        case 'img2vid':
          if (!uploadedFile) return;
          
          // Log API call for parity tracking
          logAPICall({
            url: '/ai-studio/image-to-video',
            method: 'POST',
            timestamp: Date.now(),
            source: 'ai-studio-3',
            params: { motionType: 'parallax', duration: 5, instructions: prompt, cost, hasImage: true }
          });

          await dispatch(imageToVideo({
            image: uploadedFile,
            motionType: 'parallax', // Default motion type
            duration: 5, // Default duration
            instructions: prompt || undefined,
            cost,
          }));
          break;

        case 'music':
        case 'soundeffect':
        case 'audiobook':
          // Handle audio generation
          console.log('Audio generation not yet implemented');
          break;

        case 'character':
        case 'object':
        case 'environment':
        case 'img2obj':
          // Handle 3D object creation
          console.log('3D object creation not yet implemented');
          break;

        default:
          console.error('Unknown sub-mode:', subMode);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      // Error handling is managed by the Redux slice
    }
  };

  const getButtonText = () => {
    if (isGenerating) return 'Generating...';
    return 'Generate';
  };

  const getButtonIcon = () => {
    if (isGenerating) {
      return (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      );
    }
    return '✨';
  };

  return (
    <div className="glass fixed bottom-0 left-0 right-0 bg-[#0F172A]/80 backdrop-blur-xl border-t border-[rgba(255,255,255,0.1)] p-4 z-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Left side - Cost and status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{cost}</span>
              <span className="text-gray-400">XUT</span>
            </div>
            <div className="h-6 w-px bg-[rgba(255,255,255,0.2)]"></div>
            <div className="text-sm text-gray-300">{readinessText}</div>
          </div>

          {/* Right side - Generate button */}
          <motion.button
            whileHover={canGenerate && !isGenerating ? { scale: 1.05 } : {}}
            whileTap={canGenerate && !isGenerating ? { scale: 0.95 } : {}}
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
              ${canGenerate && !isGenerating
                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg hover:shadow-xl hover:from-[#0291D8] hover:to-[#2524A3] cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              }
            `}
          >
            {getButtonIcon()}
            <span>{getButtonText()}</span>
          </motion.button>
        </div>

        {/* Additional info for insufficient balance */}
        {ai3State.balance < cost && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-red-400">
              Insufficient balance. Need {cost - ai3State.balance} more XUT.
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // TODO: Implement top-up modal (same as existing AI Studio)
                console.log('Open top-up modal');
              }}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary)]/80 transition-colors"
            >
              💰 Top Up
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}