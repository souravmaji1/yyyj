"use client";

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { RootState, AppDispatch } from '@/src/store';
import { Navigation } from '@/src/components/layout/navigation';
import ModeChips from '@/src/components/ai3/ModeChips';
import Composer from '@/src/components/ai3/Composer';
import InputControls from '@/src/components/ai3/InputControls';
import HistoryPanel from '@/src/components/ai3/HistoryPanel';
import StickyBottomBar from '@/src/components/ai3/StickyBottomBar';
import { aiStudioCostsService } from '@/src/app/apis/aiStudioCostsService';
import { 
  generateImage, 
  imageToImage, 
  enhanceImage, 
  generateVideo, 
  imageToVideo,
  generateAudio,
  generate3D,
  generateImageTo3D,
  generateFaceSwap,
  fetchGenerationHistory,
  checkVideoJobStatus,
  checkFaceSwapJobStatus
} from '@/src/store/slices/aiStudioSlice';
import { logAPICall } from '@/src/utils/aiStudioParity';
import Glass from "@/src/components/ui/Glass";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";

// Types for AI Studio v3
export type Mode = 'image' | 'video' | 'audio' | 'threeD';
export type SubMode = 'txt2img' | 'img2img' | 'enhance' | 'imgswap' | 'txt2vid' | 'img2vid' | 'music' | 'soundeffect' | 'audiobook' | 'character' | 'object' | 'environment' | 'img2obj';

export interface AI3State {
  mode: Mode;
  subMode: SubMode;
  prompt: string;
  selectedPreset: string;
  uploadedFile: File | null;
  sourceImage: File | null; // For face swap
  targetImage: File | null; // For face swap
  balance: number;
  // Audio-specific options
  audioGenre?: string;
  audioType?: 'music' | 'voice' | 'effects';
  audioDuration?: number;
  // 3D-specific options
  objectType?: 'character' | 'object' | 'environment';
  modelStyle?: string;
}

// COSTS will be loaded from admin settings dynamically

const SUB_MODES: Record<Mode, SubMode[]> = {
  image: ['txt2img', 'img2img', 'enhance', 'imgswap'],
  video: ['txt2vid', 'img2vid'],
  audio: ['music', 'soundeffect', 'audiobook'],
  threeD: ['character', 'object', 'environment', 'img2obj'],
};

export default function AIStudio3Page() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.user);
  const { isGenerating, history, currentGeneration } = useSelector((state: RootState) => state.aiStudio);
  const { showSuccess, showError } = useNotificationUtils();
  const searchParams = useSearchParams();

  // Check for legacy UI rollback
  const isLegacyUI = searchParams?.get('ui') === 'legacy';

  const [ai3State, setAI3State] = useState<AI3State>({
    mode: 'image',
    subMode: 'txt2img',
    prompt: '',
    selectedPreset: '',
    uploadedFile: null,
    sourceImage: null, // For face swap
    targetImage: null, // For face swap
    balance: profile?.tokenBalance || 0,
    audioGenre: 'pop',
    audioType: 'music',
    audioDuration: 30,
    objectType: 'object',
    modelStyle: 'realistic',
  });

  const [autoOpenModal, setAutoOpenModal] = useState<boolean>(false);
  const [lastGenerationId, setLastGenerationId] = useState<string | null>(null);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [processingDuration, setProcessingDuration] = useState<number>(0);
  const [costs, setCosts] = useState<Record<SubMode, number>>({
    txt2img: 15,
    img2img: 15,
    enhance: 10,
    imgswap: 18,
    txt2vid: 25,
    img2vid: 25,
    music: 20,
    soundeffect: 15,
    audiobook: 30,
    character: 35,
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

  // Update balance when profile changes
  useEffect(() => {
    setAI3State(prev => ({ ...prev, balance: profile?.tokenBalance || 0 }));
  }, [profile?.tokenBalance]);

  // Auto-open modal when generation completes (but not for uploaded files)
  useEffect(() => {
    if (currentGeneration && 
        (currentGeneration.status === 'completed' || currentGeneration.status === 'success') &&
        currentGeneration.id !== lastGenerationId) {
      
      console.log('🔍 Checking if should auto-open modal:', {
        id: currentGeneration.id,
        status: currentGeneration.status,
        isUploaded: currentGeneration.metadata?.isUploaded,
        lastGenerationId
      });
      
      if (!currentGeneration.metadata?.isUploaded) { // Don't auto-open for uploaded files
      console.log('🎉 Generation completed, auto-opening modal:', currentGeneration.id);
      setAutoOpenModal(true);
      setLastGenerationId(currentGeneration.id);
      } else {
        console.log('📁 Uploaded file detected, skipping auto-open modal');
        setLastGenerationId(currentGeneration.id); // Still update to prevent re-triggering
      }
    }
  }, [currentGeneration, lastGenerationId]);

  // Poll video job status
  useEffect(() => {
    if (currentGeneration && currentGeneration.type === 'video' && currentGeneration.status === 'processing' && currentGeneration.jobId) {
      console.log(' Starting video job polling for:', currentGeneration.id);
      
      // Set processing start time
      if (!processingStartTime) {
        setProcessingStartTime(Date.now());
      }
      
      const pollInterval = setInterval(async () => {
        try {
          console.log(' Polling video job status for:', currentGeneration.id);
          await dispatch(checkVideoJobStatus({ generationId: currentGeneration.id }));
        } catch (error) {
          console.error(' Error polling video job status:', error);
        }
      }, 5000); // Poll every 5 seconds

      return () => {
        console.log('Stopping video job polling for:', currentGeneration.id);
        clearInterval(pollInterval);
      };
    }
    
    // Return empty cleanup function if condition is not met
    return () => {};
  }, [currentGeneration, dispatch, processingStartTime]);

  // Poll face swap job status
  useEffect(() => {
    if (currentGeneration && currentGeneration.type === 'image' && currentGeneration.status === 'processing' && currentGeneration.jobId && currentGeneration.metadata?.type === 'face_swap') {
      console.log(' Starting face swap job polling for:', currentGeneration.id);
      
      // Set processing start time
      if (!processingStartTime) {
        setProcessingStartTime(Date.now());
      }
      
      const pollInterval = setInterval(async () => {
        try {
          console.log(' Polling face swap job status for:', currentGeneration.id);
          if (currentGeneration.jobId) {
            await dispatch(checkFaceSwapJobStatus({ generationId: currentGeneration.jobId }));
          }
        } catch (error) {
          console.error(' Error polling face swap job status:', error);
        }
      }, 3000); // Poll every 3 seconds for face swap

      return () => {
        console.log('Stopping face swap job polling for:', currentGeneration.id);
        clearInterval(pollInterval);
      };
    }
    
    // Return empty cleanup function if condition is not met
    return () => {};
  }, [currentGeneration, dispatch, processingStartTime]);

  // Timer effect for processing duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (currentGeneration && currentGeneration.status === 'processing' && processingStartTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - processingStartTime) / 1000);
        setProcessingDuration(elapsed);
      }, 1000);
    } else if (currentGeneration && (currentGeneration.status === 'completed' || currentGeneration.status === 'success')) {
      // Reset timer when processing completes
      setProcessingStartTime(null);
      setProcessingDuration(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentGeneration, processingStartTime]);

  // Fetch generation history to match /ai-studio behavior
  useEffect(() => {
    console.log(' AI Studio 3: Fetching generation history');
    
    // Log API call for parity tracking
    logAPICall({
      url: '/ai-studio-3/history',
      method: 'GET',
      timestamp: Date.now(),
      source: 'ai-studio-3',
      params: { page: 1, limit: 6 }
    });
    
    try {
      dispatch(fetchGenerationHistory({
        page: 1,
        limit: 6,
        // Match the same parameters used by /ai-studio
      }) as any);
    } catch (error) {
      console.error(' AI Studio 3: Failed to fetch generation history:', error);
    }
  }, [dispatch]);

  // Mode change handler - resets state
  const handleModeChange = (newMode: Mode) => {
    const defaultSubMode = SUB_MODES[newMode][0] as SubMode;
    setAI3State(prev => ({
      ...prev,
      mode: newMode,
      subMode: defaultSubMode,
      prompt: '',
      selectedPreset: '',
      uploadedFile: null,
    }));
  };

  // Sub-mode change handler
  const handleSubModeChange = (newSubMode: SubMode) => {
    setAI3State(prev => ({
      ...prev,
      subMode: newSubMode,
      prompt: '',
      selectedPreset: '',
      uploadedFile: null,
    }));
  };

  // Handle action selection from uploaded file modal
  const handleActionSelect = async (action: string, file: File, title: string) => {
    console.log('🔍 handleActionSelect called:', { action, file: file.name, title });
    console.log('🔍 File object in handleActionSelect:', {
      name: file.name,
      size: file.size,
      type: file.type,
      hasS3Url: !!(file as any).s3Url,
      s3Url: (file as any).s3Url
    });
    
    // If the file has an S3 URL but no actual data, fetch the data
    let fileToUse = file;
    if ((file as any).s3Url && file.size === 0) {
      console.log('🔍 File has S3 URL but no data, fetching actual file data...');
      console.log('🔍 S3 URL:', (file as any).s3Url);
      try {
        const response = await fetch((file as any).s3Url);
        console.log('🔍 Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        console.log('🔍 S3 blob size:', blob.size);
        if (blob.size === 0) {
          throw new Error('Empty blob received from S3');
        }
        fileToUse = new File([blob], file.name, { type: file.type });
        console.log('🔍 Created file with actual data, size:', fileToUse.size);
        console.log('🔍 New file object:', {
          name: fileToUse.name,
          size: fileToUse.size,
          type: fileToUse.type
        });
      } catch (error) {
        console.error('🔍 Failed to fetch file data from S3 URL:', error);
        // Continue with the original file
      }
    } else {
      console.log('🔍 File already has data or no S3 URL, using as-is. Size:', file.size);
      console.log('🔍 File object details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        constructor: file.constructor.name,
        keys: Object.keys(file),
        hasS3Url: !!(file as any).s3Url,
        s3Url: (file as any).s3Url
      });
    }
    
    // Map action to mode and subMode
    let mode: Mode = 'image';
    let subMode: SubMode = 'txt2img';
    
    switch (action) {
      case 'image-to-image':
        mode = 'image';
        subMode = 'img2img';
        break;
      case 'image-to-video':
        mode = 'video';
        subMode = 'img2vid';
        break;
      case 'enhance':
        mode = 'image';
        subMode = 'enhance';
        break;
      case 'image-swapping':
        mode = 'image';
        subMode = 'imgswap';
        break;
      case '3d-object':
        mode = 'threeD';
        subMode = 'img2obj';
        break;
      case '3d-object-swap':
        mode = 'threeD';
        subMode = 'object';
        break;
      case 'video-enhance':
        mode = 'video';
        subMode = 'txt2vid';
        break;
      case 'video-to-image':
        mode = 'image';
        subMode = 'txt2img';
        break;
      case 'audio-enhance':
        mode = 'audio';
        subMode = 'music';
        break;
    }
    
    console.log(' Mapped to:', { mode, subMode });
    
    // Update state
    setAI3State(prev => {
      const newState = {
        ...prev,
        mode,
        subMode,
        uploadedFile: fileToUse,
        prompt: '' // Empty prompt so user can write their own
      };
      console.log('🔍 Updated state with fileToUse:', {
        mode: newState.mode,
        subMode: newState.subMode,
        uploadedFile: {
          name: newState.uploadedFile?.name,
          size: newState.uploadedFile?.size,
          type: newState.uploadedFile?.type
        }
      });
      return newState;
    });
    
    // Scroll to generation interface with a small delay to ensure state is updated
    setTimeout(() => {
      console.log(' Attempting to scroll to generation interface...');
      const generationInterface = document.getElementById('generation-interface-main') || document.getElementById('generation-interface-legacy');
      if (generationInterface) {
        console.log(' Found generation interface, scrolling...');
        generationInterface.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback to generation section if interface not found
        const generationSection = document.getElementById('generation-section') || document.getElementById('generation-section-legacy');
        if (generationSection) {
          console.log(' Found generation section, scrolling...');
          generationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Final fallback to main-content
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            console.log(' Found main content, scrolling...');
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            console.log(' No generation interface, section, or main content found!');
          }
        }
      }
    }, 100);
    
    showSuccess('Action Selected', `Selected ${action} for ${title}`);
  };

  // Check if generation requirements are met
  const canGenerate = () => {
    const { subMode, prompt, uploadedFile, sourceImage, targetImage, balance } = ai3State;
    const cost = costs[subMode];
    
    // Don't allow generation if currently processing
    if (isGenerating || (currentGeneration && currentGeneration.status === 'processing')) {
      return false;
    }
    
    if (balance < cost) return false;
    
    const needsUpload = subMode === 'img2img' || subMode === 'img2vid' || subMode === 'img2obj';
    if (needsUpload && !uploadedFile) return false;
    
    // Face swap needs uploaded file (source) and target image
    if (subMode === 'imgswap') {
      return uploadedFile && targetImage;
    }
    
    if (subMode === 'enhance') return true; // enhance works with or without prompt
    
    // All other modes need a prompt (minimum 3 characters)
    return prompt.trim().length >= 3;
  };

  const getReadinessText = () => {
    const { subMode, prompt, uploadedFile, sourceImage, targetImage, balance } = ai3State;
    const cost = costs[subMode];
    
    // Show processing status if currently processing
    if (currentGeneration && currentGeneration.status === 'processing') {
      const minutes = Math.floor(processingDuration / 60);
      const seconds = processingDuration % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      
      if (currentGeneration.type === 'video') {
        return `🎬 Processing video... (${timeStr})`;
      } else {
        return `🎨 Processing... (${timeStr})`;
      }
    }
    
    if (isGenerating) return 'Generating...';
    
    if (balance < cost) return 'Insufficient XUT balance';
    
    const needsUpload = subMode === 'img2img' || subMode === 'img2vid';
    
    // Helper text based on sub-tab rules from requirements
    switch (subMode) {
      case 'txt2img':
        return 'No prompt needed · No upload needed';
      case 'enhance':
        return 'No prompt needed · No upload needed';
      case 'img2img':
        return 'Add a short prompt · Upload required';
      case 'imgswap':
        if (!uploadedFile) return 'Upload source image';
        if (!targetImage) return 'Upload target image';
        return 'Ready to swap faces';
      case 'txt2vid':
        return 'Add a short prompt · No upload needed';
      case 'img2vid':
        return 'Add a short prompt · Upload required';
      case 'music':
        return 'Add a short prompt · No upload needed';
      case 'soundeffect':
        return 'Add a short prompt · No upload needed';
      case 'audiobook':
        return 'Add a short prompt · No upload needed';
      case 'character':
        return 'Add a short prompt · No upload needed';
      case 'object':
        return 'Add a short prompt · No upload needed';
      case 'environment':
        return 'Add a short prompt · No upload needed';
      case 'img2obj':
        return 'Upload an image and add a prompt · Image-to-3D generation';
      default:
        return 'Ready to generate';
    }
  };

  // Legacy UI fallback - render old design unchanged
  if (isLegacyUI) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] text-white">
        {/* NavBar */}
        <div className="sticky top-0 z-50">
          <Navigation />
        </div>

        {/* Page wrapper */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-8 md:pt-10">
          {/* Library Section - Moved to top */}
          <div className="mb-8">
            <HistoryPanel 
              history={history} 
              autoOpenGeneration={autoOpenModal ? currentGeneration : null}
              onModalStateChange={(isOpen) => {
                if (!isOpen) {
                  setAutoOpenModal(false);
                }
              }}
              onFileUpload={(file) => setAI3State(prev => ({ ...prev, uploadedFile: file }))}
              uploadedFile={ai3State.uploadedFile}
              onActionSelect={handleActionSelect}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-4 text-center">
              What would you like to make?
            </h1>
          </div>

          {/* Mode Selection */}
          <section id="generation-section-legacy" className="mb-8">
          <ModeChips
            mode={ai3State.mode}
            subMode={ai3State.subMode}
            onModeChange={handleModeChange}
            onSubModeChange={handleSubModeChange}
            costs={costs}
            uploadedFile={ai3State.uploadedFile}
          />
          </section>

          {/* Composer */}
          <div id="generation-interface-legacy">
          <Composer
            mode={ai3State.mode}
            subMode={ai3State.subMode}
            prompt={ai3State.prompt}
            selectedPreset={ai3State.selectedPreset}
            uploadedFile={ai3State.uploadedFile}
            onPromptChange={(prompt) => setAI3State(prev => ({ ...prev, prompt }))}
            onPresetChange={(preset, promptText) => setAI3State(prev => ({ 
              ...prev, 
              selectedPreset: preset,
              prompt: promptText
            }))}
            onFileUpload={(file) => setAI3State(prev => ({ ...prev, uploadedFile: file }))}
            currentGeneration={currentGeneration}
            processingDuration={processingDuration}
          />
          </div>

          {/* Bottom helper text + actions */}
          <div className="flex items-center justify-between mt-6 mb-6">
            <div className="text-slate-400 text-sm">
              {getReadinessText()}
            </div>
            <div className="flex items-center gap-4">
              <Glass className="px-4 py-2">
                <span className="text-slate-400 text-sm">Cost: </span>
                <span className="text-white font-medium">{costs[ai3State.subMode]} XUT</span>
              </Glass>
              <button
                onClick={async () => {
                  if (!canGenerate() || isGenerating) return;

                  const { subMode, prompt, uploadedFile } = ai3State;
                  const cost = costs[subMode];

                  try {
                    switch (subMode) {
                      case 'txt2img':
                        // Log API call for parity tracking
                        logAPICall({
                          url: '/ai-studio-3/generate-image',
                          method: 'POST',
                          timestamp: Date.now(),
                          source: 'ai-studio-3',
                          params: { prompt, style: 'realistic', size: '1024x1024', quality: 'high', cost }
                        });

                        await dispatch(generateImage({
                          prompt,
                          style: 'realistic',
                          size: '1024x1024',
                          quality: 'high',
                          cost,
                        }));
                        break;

                      case 'img2img':
                        console.log('Executing img2img case');
                        if (!uploadedFile) return;
                        const img2imgFormData = new FormData();
                        
                        // If file has S3 URL but no data (due to CORS), send S3 URL instead
                        if ((uploadedFile as any).s3Url && uploadedFile.size === 0) {
                          console.log('Sending S3 URL instead of empty file:', (uploadedFile as any).s3Url);
                          img2imgFormData.append('s3Url', (uploadedFile as any).s3Url);
                          img2imgFormData.append('fileName', uploadedFile.name);
                          img2imgFormData.append('fileType', uploadedFile.type);
                        } else {
                        img2imgFormData.append('image', uploadedFile);
                        }
                        img2imgFormData.append('instructions', prompt);
                        const userAuthDetails = JSON.parse(localStorage.getItem("userAuthDetails") || "{}");
                        console.log('Debug userAuthDetails:', userAuthDetails);
                        console.log('Debug id:', userAuthDetails.id);
                        if (userAuthDetails.id) {
                          img2imgFormData.append('userId', userAuthDetails.id);
                          console.log('Added userId to FormData:', userAuthDetails.id);
                        } else {
                          console.error('id is missing or undefined');
                        }
                        
                        // Debug FormData contents
                        console.log('FormData entries:');
                        Array.from(img2imgFormData.entries()).forEach(([key, value]) => {
                          console.log(key, value);
                        });
                        
                        // Log API call for parity tracking
                        logAPICall({
                          url: '/ai-studio-3/image-to-image',
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
                        console.log('🔍 Enhance: File details before FormData:', {
                          name: uploadedFile.name,
                          size: uploadedFile.size,
                          type: uploadedFile.type,
                          hasS3Url: !!(uploadedFile as any).s3Url
                        });
                        
                        // If file has S3 URL but no data, send S3 URL instead
                        const enhanceFormData = new FormData();
                        if ((uploadedFile as any).s3Url && uploadedFile.size === 0) {
                          console.log('🔍 Enhance: File has S3 URL but no data, sending S3 URL instead');
                          enhanceFormData.append('s3Url', (uploadedFile as any).s3Url);
                          enhanceFormData.append('fileName', uploadedFile.name);
                          enhanceFormData.append('fileType', uploadedFile.type);
                        } else {
                          enhanceFormData.append('image', uploadedFile);
                        }
                        if (prompt.trim()) {
                          enhanceFormData.append('instructions', prompt); // Fixed: use 'instructions' instead of 'prompt'
                        }
                        enhanceFormData.append('type', 'upload'); // Added: required type field
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

                      case 'imgswap':
                        if (!uploadedFile || !ai3State.targetImage) return;
                        
                        // Log API call for parity tracking
                        logAPICall({
                          url: '/ai-studio-3/faceswap',
                          method: 'POST',
                          timestamp: Date.now(),
                          source: 'ai-studio-3',
                          params: { prompt, cost, hasSourceImage: true, hasTargetImage: true }
                        });
                        
                        await dispatch(generateFaceSwap({
                          sourceImage: uploadedFile,
                          targetImage: ai3State.targetImage,
                          prompt: prompt || 'Face swap',
                          cost,
                        }));
                        break;

                      case 'txt2vid':
                        // Log API call for parity tracking
                        logAPICall({
                          url: '/ai-studio-3/generate-video',
                          method: 'POST',
                          timestamp: Date.now(),
                          source: 'ai-studio-3',
                          params: { prompt, motionType: 'smooth', duration: 5, cost }
                        });

                        await dispatch(generateVideo({
                          prompt,
                          motionType: 'smooth',
                          duration: 5,
                          cost,
                        }));
                        break;

                      case 'img2vid':
                        if (!uploadedFile) return;
                        
                        // Log API call for parity tracking
                        logAPICall({
                          url: '/ai-studio-3/image-to-video',
                          method: 'POST',
                          timestamp: Date.now(),
                          source: 'ai-studio-3',
                          params: { motionType: 'parallax', duration: 5, instructions: prompt, cost, hasImage: true }
                        });

                        // Always send S3 URL if available (for CORS compatibility)
                        if ((uploadedFile as any).s3Url) {
                          console.log('Sending S3 URL for image-to-video:', (uploadedFile as any).s3Url);
                          await dispatch(imageToVideo({
                            image: uploadedFile,
                            motionType: 'parallax',
                            duration: 5,
                            instructions: prompt || undefined,
                            cost,
                            s3Url: (uploadedFile as any).s3Url,
                            fileName: uploadedFile.name,
                            fileType: uploadedFile.type,
                          }));
                        } else {
                          await dispatch(imageToVideo({
                            image: uploadedFile,
                            motionType: 'parallax',
                            duration: 5,
                            instructions: prompt || undefined,
                            cost,
                          }));
                        }
                        break;

                      default:
                        console.error('Unknown sub-mode:', subMode);
                    }
                  } catch (error) {
                    console.error('Generation failed:', error);
                  }
                }}
                disabled={!canGenerate()}
                className={`
                  px-6 py-3 rounded-2xl font-medium transition-all duration-300
                  ${canGenerate() && !isGenerating
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 cursor-pointer'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  }
                `}
              >
                  {currentGeneration && currentGeneration.status === 'processing' 
                    ? `Processing... (${Math.floor(processingDuration / 60)}m ${processingDuration % 60}s)`
                    : isGenerating 
                    ? 'Generating...' 
                    : 'Generate'
                  }
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      {/* NavBar */}

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10" id="main-content">
        {/* Library Section - Moved to top */}
        <section className="mb-8 sm:mb-12" aria-label="Your Library">
          <HistoryPanel 
            history={history} 
            autoOpenGeneration={autoOpenModal ? currentGeneration : null}
            onModalStateChange={(isOpen) => {
              if (!isOpen) {
                setAutoOpenModal(false);
              }
            }}
            onActionSelect={handleActionSelect}
          />
        </section>

        {/* Header with fluid typography */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 mb-4 text-center">
            What would you like to make?
          </h1>
        </header>

        {/* Mode Selection */}
        <section id="generation-section" className="mb-6 sm:mb-8" aria-label="AI Generation Modes">
          <ModeChips
            mode={ai3State.mode}
            subMode={ai3State.subMode}
            onModeChange={handleModeChange}
            onSubModeChange={handleSubModeChange}
            costs={costs}
            uploadedFile={ai3State.uploadedFile}
          />
        </section>

        {/* Main Content Grid */}
        <section className="grid gap-6 md:gap-8 xl:grid-cols-12" aria-label="AI Generation Interface">
          {/* Preview Section - Left */}
          <div className="xl:col-span-7" role="region" aria-label="Preview Area" id="generation-interface-main">
            <Composer
              mode={ai3State.mode}
              subMode={ai3State.subMode}
              prompt={ai3State.prompt}
              selectedPreset={ai3State.selectedPreset}
              uploadedFile={ai3State.uploadedFile}
              targetImage={ai3State.targetImage}
              onPromptChange={(prompt) => setAI3State(prev => ({ ...prev, prompt }))}
              onPresetChange={(preset, promptText) => setAI3State(prev => ({ 
                ...prev, 
                selectedPreset: preset,
                prompt: promptText
              }))}
              onFileUpload={(file) => setAI3State(prev => ({ ...prev, uploadedFile: file }))}
              onTargetImageUpload={(file: File | null) => setAI3State(prev => ({ ...prev, targetImage: file }))}
              onSubModeChange={(subMode: SubMode) => setAI3State(prev => ({ ...prev, subMode }))}
              isPreviewOnly={true}
              currentGeneration={currentGeneration}
              processingDuration={processingDuration}
            />
          </div>

          {/* Controls Section - Right */}
          <aside className="xl:col-span-5 space-y-6 mb-8" role="complementary" aria-label="Generation Controls">
            {/* Input Controls - Desktop Only */}
            <div className="hidden xl:block">
              <InputControls
                mode={ai3State.mode}
                subMode={ai3State.subMode}
                prompt={ai3State.prompt}
                selectedPreset={ai3State.selectedPreset}
                uploadedFile={ai3State.uploadedFile}
                targetImage={ai3State.targetImage}
                onPromptChange={(prompt) => setAI3State(prev => ({ ...prev, prompt }))}
                onPresetChange={(preset, promptText) => setAI3State(prev => ({ 
                  ...prev, 
                  selectedPreset: preset,
                  prompt: promptText
                }))}
                onFileUpload={(file) => setAI3State(prev => ({ ...prev, uploadedFile: file }))}
                onTargetImageUpload={(file) => setAI3State(prev => ({ ...prev, targetImage: file }))}
                onSubModeChange={(subMode) => setAI3State(prev => ({ ...prev, subMode }))}
              />
            </div>

            {/* Input Controls - Mobile/Tablet (below preview) */}
            <div className="xl:hidden">
              <InputControls
                mode={ai3State.mode}
                subMode={ai3State.subMode}
                prompt={ai3State.prompt}
                selectedPreset={ai3State.selectedPreset}
                uploadedFile={ai3State.uploadedFile}
                targetImage={ai3State.targetImage}
                onPromptChange={(prompt) => setAI3State(prev => ({ ...prev, prompt }))}
                onPresetChange={(preset, promptText) => setAI3State(prev => ({ 
                  ...prev, 
                  selectedPreset: preset,
                  prompt: promptText
                }))}
                onFileUpload={(file) => setAI3State(prev => ({ ...prev, uploadedFile: file }))}
                onTargetImageUpload={(file) => setAI3State(prev => ({ ...prev, targetImage: file }))}
                onSubModeChange={(subMode) => setAI3State(prev => ({ ...prev, subMode }))}
              />
            </div>

            {/* Cost and Action Controls */}
            <div>
              <Glass className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-slate-400 text-sm md:text-base" aria-live="polite" aria-label="Generation status">
                    {getReadinessText()}
                  </div>
                  <Glass className="px-4 py-2" aria-label="Generation cost">
                    <span className="text-slate-400 text-sm">Cost: </span>
                    <span className="text-white font-medium">{costs[ai3State.subMode]} XUT</span>
                  </Glass>
                </div>
                
                <button
                  onClick={async () => {
                    if (!canGenerate() || isGenerating) return;

                    const { subMode, prompt, uploadedFile } = ai3State;
                    const cost = costs[subMode];

                    try {
                      switch (subMode) {
                        case 'txt2img':
                          // Log API call for parity tracking
                          logAPICall({
                            url: '/ai-studio-3/generate-image',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, style: 'realistic', size: '1024x1024', quality: 'high', cost }
                          });

                          await dispatch(generateImage({
                            prompt,
                            style: 'realistic',
                            size: '1024x1024',
                            quality: 'high',
                            cost,
                          }));
                          break;

                        case 'img2img':
                          console.log('Executing img2img case (second)');
                          if (!uploadedFile) return;
                          console.log('File object details:', {
                            name: uploadedFile.name,
                            size: uploadedFile.size,
                            type: uploadedFile.type,
                            hasS3Url: !!(uploadedFile as any).s3Url,
                            s3Url: (uploadedFile as any).s3Url
                          });
                          const img2imgFormData = new FormData();
                          
                          // If file has S3 URL but no data (due to CORS), send S3 URL instead
                          if ((uploadedFile as any).s3Url && uploadedFile.size === 0) {
                            console.log('Sending S3 URL instead of empty file:', (uploadedFile as any).s3Url);
                            img2imgFormData.append('s3Url', (uploadedFile as any).s3Url);
                            img2imgFormData.append('fileName', uploadedFile.name);
                            img2imgFormData.append('fileType', uploadedFile.type);
                          } else {
                          img2imgFormData.append('image', uploadedFile);
                          }
                          img2imgFormData.append('instructions', prompt);
                          // Debug localStorage and Redux profile
                          console.log('All localStorage keys:', Object.keys(localStorage));
                          console.log('userAuthDetails from localStorage:', localStorage.getItem("userAuthDetails"));
                          console.log('Redux profile:', profile);
                          
                          const userAuthDetails = JSON.parse(localStorage.getItem("userAuthDetails") || "{}");
                          console.log('Debug userAuthDetails (second):', userAuthDetails);
                          
                          // Try to get userId from multiple sources
                          const userId = profile?.id || userAuthDetails.id || userAuthDetails.userId || userAuthDetails.sub;
                          console.log('UserId from all sources:', {
                            profileId: profile?.id,
                            localStorageId: userAuthDetails.id,
                            localStorageUserId: userAuthDetails.userId,
                            localStorageSub: userAuthDetails.sub,
                            final: userId
                          });
                          
                          if (userId) {
                            img2imgFormData.append('userId', userId);
                            console.log('Added userId to FormData (second):', userId);
                          } else {
                            console.error('No userId found in any source (second)');
                          }
                          
                          // Debug FormData contents
                          console.log('FormData entries (second):');
                          Array.from(img2imgFormData.entries()).forEach(([key, value]) => {
                            console.log(key, value);
                          });
                          
                          // Log API call for parity tracking
                          logAPICall({
                            url: '/ai-studio-3/image-to-image',
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
                          
                          // If file has S3 URL but no data, send S3 URL instead
                          const enhanceFormData = new FormData();
                          if ((uploadedFile as any).s3Url && uploadedFile.size === 0) {
                            console.log('🔍 Enhance: File has S3 URL but no data, sending S3 URL instead');
                            enhanceFormData.append('s3Url', (uploadedFile as any).s3Url);
                            enhanceFormData.append('fileName', uploadedFile.name);
                            enhanceFormData.append('fileType', uploadedFile.type);
                          } else {
                            enhanceFormData.append('image', uploadedFile);
                          }
                          if (prompt.trim()) {
                            enhanceFormData.append('instructions', prompt); // Fixed: use 'instructions' instead of 'prompt'
                          }
                          enhanceFormData.append('type', 'upload'); // Added: required type field
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

                        case 'imgswap':
                          if (!uploadedFile || !ai3State.targetImage) return;
                          
                          // Log API call for parity tracking
                          logAPICall({
                            url: '/ai-studio-3/faceswap',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, cost, hasSourceImage: true, hasTargetImage: true }
                          });
                          
                          await dispatch(generateFaceSwap({
                            sourceImage: uploadedFile,
                            targetImage: ai3State.targetImage,
                            prompt: prompt || 'Face swap',
                            cost,
                          }));
                          break;

                        case 'txt2vid':
                          // Log API call for parity tracking
                          logAPICall({
                            url: '/ai-studio-3/generate-video',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, motionType: 'smooth', duration: 5, cost }
                          });

                          await dispatch(generateVideo({
                            prompt,
                            motionType: 'smooth',
                            duration: 5,
                            cost,
                          }));
                          break;

                        case 'img2vid':
                          if (!uploadedFile) return;
                          
                          // Log API call for parity tracking
                          logAPICall({
                            url: '/ai-studio-3/image-to-video',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { motionType: 'parallax', duration: 5, instructions: prompt, cost, hasImage: true }
                          });

                          // Always send S3 URL if available (for CORS compatibility)
                          if ((uploadedFile as any).s3Url) {
                            console.log('Sending S3 URL for image-to-video:', (uploadedFile as any).s3Url);
                            await dispatch(imageToVideo({
                              image: uploadedFile,
                              motionType: 'parallax',
                              duration: 5,
                              instructions: prompt || undefined,
                              cost,
                              s3Url: (uploadedFile as any).s3Url,
                              fileName: uploadedFile.name,
                              fileType: uploadedFile.type,
                            }));
                          } else {
                            await dispatch(imageToVideo({
                              image: uploadedFile,
                              motionType: 'parallax',
                              duration: 5,
                              instructions: prompt || undefined,
                              cost,
                            }));
                          }
                          break;

                        case 'music':
                          // Handle music generation
                          logAPICall({
                            url: '/ai-studio-3/generate-audio',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, type: 'music', genre: ai3State.audioGenre, duration: ai3State.audioDuration, cost }
                          });
                          
                          await dispatch(generateAudio({
                            prompt,
                            audioType: 'music',
                            genre: ai3State.audioGenre || 'pop',
                            duration: ai3State.audioDuration || 30,
                            cost,
                          }));
                          break;

                        case 'soundeffect':
                          // Handle sound effect generation
                          logAPICall({
                            url: '/ai-studio-3/generate-audio',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, type: 'voice', genre: ai3State.audioGenre, duration: ai3State.audioDuration, cost }
                          });
                          
                          await dispatch(generateAudio({
                            prompt,
                            audioType: 'voice',
                            genre: ai3State.audioGenre || 'pop',
                            duration: ai3State.audioDuration || 30,
                            cost,
                          }));
                          break;

                        case 'audiobook':
                          // Handle audio book generation
                          logAPICall({
                            url: '/ai-studio-3/generate-audio',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, type: 'voice', genre: ai3State.audioGenre, duration: ai3State.audioDuration, cost }
                          });
                          
                          await dispatch(generateAudio({
                            prompt,
                            audioType: 'voice',
                            genre: ai3State.audioGenre || 'pop',
                            duration: ai3State.audioDuration || 30,
                            cost,
                          }));
                          break;

                        case 'character':
                          // Handle 3D character creation
                          logAPICall({
                            url: '/ai-studio-3/create-3d',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, objectType: 'character', style: ai3State.modelStyle, cost }
                          });
                          
                          await dispatch(generate3D({
                            prompt,
                            objectType: 'character',
                            style: ai3State.modelStyle || 'realistic',
                            cost,
                          }));
                          break;

                        case 'object':
                          // Handle 3D object creation
                          logAPICall({
                            url: '/ai-studio-3/create-3d',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, objectType: 'object', style: ai3State.modelStyle, cost }
                          });
                          
                          await dispatch(generate3D({
                            prompt,
                            objectType: 'object',
                            style: ai3State.modelStyle || 'realistic',
                            cost,
                          }));
                          break;

                        case 'environment':
                          // Handle 3D environment creation
                          logAPICall({
                            url: '/ai-studio-3/create-3d',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, objectType: 'environment', style: ai3State.modelStyle, cost }
                          });
                          
                          await dispatch(generate3D({
                            prompt,
                            objectType: 'environment',
                            style: ai3State.modelStyle || 'realistic',
                            cost,
                          }));
                          break;

                        case 'img2obj':
                          // Handle Image-to-3D generation
                          if (!ai3State.uploadedFile) {
                            throw new Error('No image provided for image-to-3D generation');
                          }
                          
                          logAPICall({
                            url: '/ai-studio-3/create-3d',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio-3',
                            params: { prompt, objectType: ai3State.objectType, style: ai3State.modelStyle, cost, hasImage: true }
                          });
                          
                          await dispatch(generateImageTo3D({
                            prompt,
                            image: ai3State.uploadedFile,
                            objectType: ai3State.objectType || 'object',
                            style: ai3State.modelStyle || 'realistic',
                            cost,
                          }));
                          break;

                        default:
                          console.error('Unknown sub-mode:', subMode);
                      }
                    } catch (error) {
                      console.error('Generation failed:', error);
                    }
                  }}
                  disabled={!canGenerate()}
                  aria-describedby="generation-status"
                  className={`
                    w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 motion-reduce:transition-none
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[#0b0f1a]
                    ${canGenerate() && !isGenerating
                      ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {currentGeneration && currentGeneration.status === 'processing' 
                    ? `Processing... (${Math.floor(processingDuration / 60)}m ${processingDuration % 60}s)`
                    : isGenerating 
                    ? 'Generating...' 
                    : 'Generate'
                  }
                </button>
              </Glass>
            </div>
          </aside>
        </section>

      </main>

      {/* Mobile Sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f1a]/95 backdrop-blur-sm border-t border-white/10 p-4" role="toolbar" aria-label="Mobile generation controls">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-400 text-sm" aria-live="polite">
            {getReadinessText()}
          </div>
          <Glass className="rounded-xl px-3 py-1" aria-label="Generation cost">
            <span className="text-slate-400 text-xs">Cost: </span>
            <span className="text-white font-medium text-sm">{costs[ai3State.subMode]} XUT</span>
          </Glass>
        </div>
        
        <button
          onClick={async () => {
            if (!canGenerate() || isGenerating) return;

            const { subMode, prompt, uploadedFile } = ai3State;
            const cost = costs[subMode];

            try {
              switch (subMode) {
                case 'txt2img':
                  // Log API call for parity tracking
                  logAPICall({
                    url: '/ai-studio-3/generate-image',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, style: 'realistic', size: '1024x1024', quality: 'high', cost }
                  });

                  await dispatch(generateImage({
                    prompt,
                    style: 'realistic',
                    size: '1024x1024',
                    quality: 'high',
                    cost,
                  }));
                  break;

                case 'img2img':
                  console.log('Executing img2img case (third)');
                  if (!uploadedFile) return;
                  const img2imgFormData = new FormData();
                  
                  // If file has S3 URL but no data (due to CORS), send S3 URL instead
                  if ((uploadedFile as any).s3Url && uploadedFile.size === 0) {
                    console.log('Sending S3 URL instead of empty file:', (uploadedFile as any).s3Url);
                    img2imgFormData.append('s3Url', (uploadedFile as any).s3Url);
                    img2imgFormData.append('fileName', uploadedFile.name);
                    img2imgFormData.append('fileType', uploadedFile.type);
                  } else {
                  img2imgFormData.append('image', uploadedFile);
                  }
                  img2imgFormData.append('instructions', prompt);
                  const userAuthDetails = JSON.parse(localStorage.getItem("userAuthDetails") || "{}");
                  console.log('Debug userAuthDetails (third):', userAuthDetails);
                  console.log('Debug id (third):', userAuthDetails.id);
                  if (userAuthDetails.id) {
                    img2imgFormData.append('userId', userAuthDetails.id);
                    console.log('Added userId to FormData (third):', userAuthDetails.id);
                  } else {
                    console.error('id is missing or undefined (third)');
                  }
                  
                  // Debug FormData contents
                  console.log('FormData entries (third):');
                  Array.from(img2imgFormData.entries()).forEach(([key, value]) => {
                    console.log(key, value);
                  });
                  
                  // Log API call for parity tracking
                  logAPICall({
                    url: '/ai-studio-3/image-to-image',
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
                  
                  // If file has S3 URL but no data, send S3 URL instead
                  const enhanceFormData = new FormData();
                  if ((uploadedFile as any).s3Url && uploadedFile.size === 0) {
                    console.log('🔍 Enhance: File has S3 URL but no data, sending S3 URL instead');
                    enhanceFormData.append('s3Url', (uploadedFile as any).s3Url);
                    enhanceFormData.append('fileName', uploadedFile.name);
                    enhanceFormData.append('fileType', uploadedFile.type);
                  } else {
                    enhanceFormData.append('image', uploadedFile);
                  }
                  if (prompt.trim()) {
                    enhanceFormData.append('instructions', prompt); // Fixed: use 'instructions' instead of 'prompt'
                  }
                  enhanceFormData.append('type', 'upload'); // Added: required type field
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

                case 'imgswap':
                  // Check if both source and target images are available
                  if (!uploadedFile || !ai3State.targetImage) {
                    showError('Please upload both source and target images for face swap');
                    return;
                  }
                  
                  // Log API call for parity tracking
                  logAPICall({
                    url: '/ai-studio-3/face-swap',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, cost, hasSourceImage: true, hasTargetImage: true }
                  });
                  
                  await dispatch(generateFaceSwap({
                    sourceImage: uploadedFile,
                    targetImage: ai3State.targetImage,
                    prompt: prompt || 'Face Swap',
                    cost,
                  }));
                  break;

                case 'txt2vid':
                  // Log API call for parity tracking
                  logAPICall({
                    url: '/ai-studio-3/generate-video',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, motionType: 'smooth', duration: 5, cost }
                  });

                  await dispatch(generateVideo({
                    prompt,
                    motionType: 'smooth',
                    duration: 5,
                    cost,
                  }));
                  break;

                case 'img2vid':
                  if (!uploadedFile) return;
                  
                  // Log API call for parity tracking
                  logAPICall({
                    url: '/ai-studio-3/image-to-video',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { motionType: 'parallax', duration: 5, instructions: prompt, cost, hasImage: true }
                  });

                  // Always send S3 URL if available (for CORS compatibility)
                  if ((uploadedFile as any).s3Url) {
                    console.log('Sending S3 URL for image-to-video:', (uploadedFile as any).s3Url);
                    await dispatch(imageToVideo({
                      image: uploadedFile,
                      motionType: 'parallax',
                      duration: 5,
                      instructions: prompt || undefined,
                      cost,
                      s3Url: (uploadedFile as any).s3Url,
                      fileName: uploadedFile.name,
                      fileType: uploadedFile.type,
                    }));
                  } else {
                    await dispatch(imageToVideo({
                      image: uploadedFile,
                      motionType: 'parallax',
                      duration: 5,
                      instructions: prompt || undefined,
                      cost,
                    }));
                  }
                  break;

                case 'music':
                  // Handle music generation
                  logAPICall({
                    url: '/ai-studio-3/generate-audio',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, type: 'music', genre: ai3State.audioGenre, duration: ai3State.audioDuration, cost }
                  });
                  
                  await dispatch(generateAudio({
                    prompt,
                    audioType: 'music',
                    genre: ai3State.audioGenre || 'pop',
                    duration: ai3State.audioDuration || 30,
                    cost,
                  }));
                  break;

                case 'soundeffect':
                  // Handle sound effect generation
                  logAPICall({
                    url: '/ai-studio-3/generate-audio',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, type: 'voice', genre: ai3State.audioGenre, duration: ai3State.audioDuration, cost }
                  });
                  
                  await dispatch(generateAudio({
                    prompt,
                    audioType: 'voice',
                    genre: ai3State.audioGenre || 'pop',
                    duration: ai3State.audioDuration || 30,
                    cost,
                  }));
                  break;

                case 'audiobook':
                  // Handle audio book generation
                  logAPICall({
                    url: '/ai-studio-3/generate-audio',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, type: 'voice', genre: ai3State.audioGenre, duration: ai3State.audioDuration, cost }
                  });
                  
                  await dispatch(generateAudio({
                    prompt,
                    audioType: 'voice',
                    genre: ai3State.audioGenre || 'pop',
                    duration: ai3State.audioDuration || 30,
                    cost,
                  }));
                  break;

                case 'character':
                  // Handle 3D character creation
                  logAPICall({
                    url: '/ai-studio-3/create-3d',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, objectType: 'character', style: ai3State.modelStyle, cost }
                  });
                  
                  await dispatch(generate3D({
                    prompt,
                    objectType: 'character',
                    style: ai3State.modelStyle || 'realistic',
                    cost,
                  }));
                  break;

                case 'object':
                  // Handle 3D object creation
                  logAPICall({
                    url: '/ai-studio-3/create-3d',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, objectType: 'object', style: ai3State.modelStyle, cost }
                  });
                  
                  await dispatch(generate3D({
                    prompt,
                    objectType: 'object',
                    style: ai3State.modelStyle || 'realistic',
                    cost,
                  }));
                  break;

                case 'environment':
                  // Handle 3D environment creation
                  logAPICall({
                    url: '/ai-studio-3/create-3d',
                    method: 'POST',
                    timestamp: Date.now(),
                    source: 'ai-studio-3',
                    params: { prompt, objectType: 'environment', style: ai3State.modelStyle, cost }
                  });
                  
                  await dispatch(generate3D({
                    prompt,
                    objectType: 'environment',
                    style: ai3State.modelStyle || 'realistic',
                    cost,
                  }));
                  break;

                default:
                  console.error('Unknown sub-mode:', subMode);
              }
            } catch (error) {
              console.error('Generation failed:', error);
            }
          }}
          disabled={!canGenerate()}
          aria-describedby="mobile-generation-status"
          className={`
            w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 motion-reduce:transition-none min-h-[44px] touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[#0b0f1a]
            ${canGenerate() && !isGenerating
              ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 cursor-pointer'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }
          `}
        >
          {currentGeneration && currentGeneration.status === 'processing' 
            ? `Processing... (${Math.floor(processingDuration / 60)}m ${processingDuration % 60}s)`
            : isGenerating 
            ? 'Generating...' 
            : 'Generate'
          }
        </button>
      </div>

      {/* Mobile bottom padding to account for sticky CTA */}
      <div className="sm:hidden h-32"></div>
    </div>
  );
}