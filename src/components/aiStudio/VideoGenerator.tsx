"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import TokenConfirmationModal from "./TokenConfirmationModal";
import GenerationPreview from "./GenerationPreview";
import { checkVideoJobStatus, downloadGeneration, generateVideo, Generation, imageToVideo } from "@/src/store/slices/aiStudioSlice";
import { logAPICall } from "@/src/utils/aiStudioParity";
import { AIStudioCosts, aiStudioCostsService } from "@/src/app/apis/aiStudioCostsService";


const MOTION_TYPES = [
  { value: 'smooth', label: 'Smooth Motion' },
  { value: 'dynamic', label: 'Dynamic Motion' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'fast', label: 'Fast Paced' },
  { value: 'slow', label: 'Slow Motion' }
];

interface VideoGeneratorProps {
  filteredGeneration?: Generation | null;
}

export default function VideoGenerator({ filteredGeneration }: VideoGeneratorProps) {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  const { isGenerating, currentGeneration: globalCurrentGeneration } = useSelector((state: RootState) => state.aiStudio);

  // Use filteredGeneration if provided, otherwise fall back to global currentGeneration
  const currentGeneration = filteredGeneration !== undefined ? filteredGeneration : globalCurrentGeneration;

  // Debug Redux state
  console.log('🎬 VideoGenerator Render - Redux State:', {
    isGenerating,
    currentGeneration,
    currentGenerationId: currentGeneration?.id,
    currentGenerationStatus: currentGeneration?.status,
    currentGenerationJobId: currentGeneration?.jobId
  });

  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [motionType, setMotionType] = useState('smooth');
  const [duration, setDuration] = useState(5);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [costs, setCosts] = useState<AIStudioCosts>({
    imageCost: 15,
    videoCost: 25,
    enhancementCost: 10,
    downloadCost: 5,
    faceSwapCost: 18,
    audioCost: 20,
    audiobookCost: 30,
    threeDCost: 30
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch AI Studio costs on component mount
  React.useEffect(() => {
    const fetchCosts = async () => {
      try {
        const fetchedCosts = await aiStudioCostsService.getAIStudioCosts();
        setCosts(fetchedCosts);
      } catch (error) {
        console.error('Failed to fetch AI Studio costs:', error);
        // Keep default costs on error
      }
    };

    fetchCosts();
  }, []);

  // Check job status periodically for video generations
  useEffect(() => {
    console.log('🔄 useEffect triggered - currentGeneration:', currentGeneration);

    let interval: NodeJS.Timeout | undefined;

    // Continue polling for 'processing' or 'pending' status
    if (currentGeneration?.jobId && currentGeneration.status === 'processing') {
      console.log('🔄 Starting job status polling for:', currentGeneration.id, 'with jobId:', currentGeneration.jobId, 'status:', currentGeneration.status);

      interval = setInterval(async () => {
        try {
          console.log('🔍 Polling job status for generation:', currentGeneration.id);
          const result = await dispatch(checkVideoJobStatus({ 
            generationId: currentGeneration.id 
          }) as any);
          console.log('✅ Job status update result:', result);
        } catch (error) {
          console.error('❌ Failed to check job status:', error);
        }
      }, 5000); // Check every 5 seconds
    } else {
      console.log('❌ Not starting polling - missing jobId or wrong status:', {
        jobId: currentGeneration?.jobId,
        status: currentGeneration?.status
      });
    }
    
    // Return empty cleanup function if condition is not met
    return () => {};
  }, [currentGeneration, dispatch]); // Added currentGeneration back to dependencies

  // Debug currentGeneration changes
  useEffect(() => {
    console.log('🎬 Current Generation Updated:', currentGeneration);
    if (currentGeneration) {
      console.log('🎯 Generation Type Detection:', {
        prompt: currentGeneration.prompt,
        type: currentGeneration.type,
        isImageToVideo: currentGeneration.prompt === 'Image to Video',
        isTextToVideo: currentGeneration.prompt !== 'Image to Video'
      });
    }
  }, [currentGeneration]);

  // Show success message when video is completed
  useEffect(() => {
    if ((currentGeneration?.status === 'completed' || currentGeneration?.status === 'success') && currentGeneration?.videoUrl) {
      toast.success('🎉 Video generation completed!');
    }
  }, [currentGeneration?.status, currentGeneration?.videoUrl]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width < 300 || img.height < 300) {
          toast.error(`Image dimensions must be at least 300x300px. Current: ${img.width}x${img.height}px`);
        return;
      }

      setUploadedImage(file);
        // Create preview without blob URL - just use the file directly
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      };
      img.onerror = () => {
        toast.error('Failed to load image. Please try another file.');
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const getCostForMode = () => {
    return mode === 'text' ? costs.videoCost : costs.videoCost;
  };

  const canGenerate = () => {
    const cost = getCostForMode();
    const hasBalance = (profile?.tokenBalance || 0) >= cost;

    if (mode === 'text') {
      return prompt.trim().length > 0 && hasBalance;
    } else {
      return uploadedImage && hasBalance;
    }
  };

  const handleGenerate = () => {
    if (!canGenerate()) return;

    const cost = getCostForMode();
    const generationData = {
      mode,
      prompt,
      image: uploadedImage,
      motionType,
      duration,
      cost
    };

    setPendingGeneration(generationData);
    setShowConfirmation(true);
  };

  const confirmGeneration = async () => {
    if (!pendingGeneration) return;

    console.log('confirmGeneration called with:', pendingGeneration);
    setShowConfirmation(false);

    try {
      if (pendingGeneration.mode === 'text') {
        console.log('Dispatching generateVideo...');
        
        // Log API call for parity tracking
        logAPICall({
          url: '/ai-studio/generate-video',
          method: 'POST',
          timestamp: Date.now(),
          source: 'ai-studio',
          params: { 
            prompt: pendingGeneration.prompt, 
            motionType: pendingGeneration.motionType, 
            duration: pendingGeneration.duration, 
            cost: pendingGeneration.cost 
          }
        });

        dispatch(generateVideo({ 
          prompt: pendingGeneration.prompt,
          motionType: pendingGeneration.motionType,
          duration: pendingGeneration.duration,
          cost: pendingGeneration.cost 
        }) as any);
      } else {
        // For image to video, we need to upload the image file directly
        if (!pendingGeneration.image) {
          toast.error('No image selected for video generation');
          return;
        }

        console.log('Dispatching imageToVideo...');
        console.log('Image file:', pendingGeneration.image);
        console.log('Motion type:', pendingGeneration.motionType);
        console.log('Duration:', pendingGeneration.duration);

        // Log API call for parity tracking
        logAPICall({
          url: '/ai-studio/image-to-video',
          method: 'POST',
          timestamp: Date.now(),
          source: 'ai-studio',
          params: { 
            motionType: pendingGeneration.motionType, 
            duration: pendingGeneration.duration, 
            instructions: '', 
            cost: pendingGeneration.cost,
            hasImage: true
          }
        });

        const result = await dispatch(imageToVideo({ 
          image: pendingGeneration.image,
          motionType: pendingGeneration.motionType,
          duration: pendingGeneration.duration,
          instructions: '', // Optional instructions
          cost: pendingGeneration.cost 
        }) as any);

        console.log(' imageToVideo dispatch result:', result);

        // If successful, manually trigger job status check after a delay
        if (result.meta?.requestStatus === 'fulfilled') {
          console.log('Job created successfully, starting manual status check...');
          setTimeout(() => {
            if (result.payload?.id) {
              dispatch(checkVideoJobStatus({ generationId: result.payload.id }) as any);
            }
          }, 2000); // Wait 2 seconds then start checking
        }
      }
    } catch (error) {
      console.error(' Error in confirmGeneration:', error);
      toast.error('Video generation failed. Please try again.');
    }

    setPendingGeneration(null);
  };

  const handleDownload = async () => {
    if (!currentGeneration?.id || !currentGeneration?.videoUrl) {
      toast.error('No video available for download');
      return;
    }

    try {
      setIsDownloading(true);
      console.log('Starting direct download for generation:', currentGeneration.id);

      // Direct download without API call
      const link = document.createElement('a');
      link.href = currentGeneration.videoUrl;
      link.download = `video-${currentGeneration.id}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Video download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setUploadedImage(null);
    setPreviewUrl('');
    setMotionType('smooth');
    setDuration(5);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('data:')) {
        // Clean up data URL to free memory
        setPreviewUrl('');
      }
    };
  }, [previewUrl]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Status Banner - Show when job is in progress (processing) */}
      {currentGeneration?.status === 'processing' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 border border-[var(--color-primary)]/30 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  🎬 Video Generation in Progress
                </h3>
                                  <p className="text-[var(--color-primary)] text-sm">
                  Your {currentGeneration?.prompt === 'Image to Video' ? 'image-to-video' : 'text-to-video'} job is being processed
                </p>
                {/* Show source details */}
                {mode === 'image' && uploadedImage && (
                  <p className="text-[var(--color-primary)]/80 text-xs mt-1">
                    📁 Source: {uploadedImage.name} • ⏱️ {duration}s • 🎭 {motionType}
                  </p>
                )}
                {mode === 'text' && prompt && (
                  <p className="text-[var(--color-primary)]/80 text-xs mt-1">
                    📝 Prompt: {prompt.substring(0, 50)}{prompt.length > 50 ? '...' : ''} • ⏱️ {duration}s • 🎭 {motionType}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Job ID</p>
              <p className="text-sm font-mono text-[var(--color-primary)]">{currentGeneration.jobId}</p>
              <p className="text-xs text-gray-400 mt-1">Started</p>
              <p className="text-xs text-[var(--color-primary)]">
                {new Date(currentGeneration.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mode Selection */}
      <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-white text-center">Select Video Generation Mode</h2>

        {/* Current Job Status Indicator */}
        {currentGeneration?.status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border border-[var(--color-primary)]/20 rounded-xl"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[var(--color-primary)] font-medium">
                Currently processing: {mode === 'image' ? 'Image to Video' : 'Text to Video'} 
                ({currentGeneration.backendStatus || 'pending'})
              </span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('text')}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              mode === 'text' 
                ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 shadow-lg shadow-[var(--color-primary)]/25' 
                : 'border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)]/50 bg-[rgba(255,255,255,0.02)]'
            }`}
          >
            <div className="text-4xl mb-3">🎬</div>
            <h3 className="text-xl font-bold mb-2 text-white">Text to Video</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">Generate 5s video from prompt</p>
                            <span className="text-lg font-bold text-[#3B82F6]">{costs.videoCost} XUT</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('image')}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
              mode === 'image' 
                ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 shadow-lg shadow-[var(--color-primary)]/25' 
                : 'border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)]/50 bg-[rgba(255,255,255,0.02)]'
            }`}
          >
            <div className="text-4xl mb-3">🎥</div>
            <h3 className="text-xl font-bold mb-2 text-white">Image to Video</h3>
            <p className="text-gray-300 mb-4 leading-relaxed">Animate uploaded image</p>
                            <span className="text-lg font-bold text-[#3B82F6]">{costs.videoCost} XUT</span>
          </motion.button>
        </div>
      </div>

      {/* Current Generation Status Card */}
      {currentGeneration?.status === 'processing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-6 border border-[rgba(255,255,255,0.1)] shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🎬 Current Generation
              <span className="text-sm font-normal text-[var(--color-primary)]">
                ({currentGeneration.backendStatus || 'pending'})
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
              <span className="text-sm text-[var(--color-primary)]">Live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Source Preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Source</h4>
              {mode === 'image' && previewUrl ? (
                <div className="aspect-video bg-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
                  <img 
                    src={previewUrl} 
                    alt="Source image" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : mode === 'text' ? (
                <div className="aspect-video bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-xs text-gray-400">Text Prompt</p>
                  </div>
                </div>
              ) : null}
              <p className="text-xs text-gray-400 text-center">
                {mode === 'image' ? uploadedImage?.name : 'Text to Video'}
              </p>
            </div>

            {/* Center: Generation Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-white font-medium">
                    {mode === 'image' ? '🖼️ Image to Video' : '📝 Text to Video'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-medium">{duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Motion:</span>
                  <span className="text-white font-medium capitalize">{motionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost:</span>
                  <span className="text-white font-medium">{getCostForMode()} XUT</span>
                </div>
              </div>
            </div>

            {/* Right: Status & Progress */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Job ID:</span>
                  <span className="text-[var(--color-primary)] font-mono text-xs">
                    {currentGeneration.jobId?.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white text-xs">
                    {new Date(currentGeneration.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">AI Status:</span>
                  <span className="text-yellow-400 text-xs">
                    {currentGeneration.backendStatus || 'pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Updates:</span>
                  <span className="text-green-400 text-xs">Every 5s</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generation Interface - Show different states based on status */}
      {!currentGeneration ? (
        <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section - LEFT SIDE */}
          <div>
              <h3 className="text-2xl font-bold mb-6 text-white">Preview</h3>
              <div className="aspect-video bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
              {previewUrl && mode === 'image' ? (
                <img 
                  src={previewUrl} 
                  alt="Upload preview" 
                    className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🎬</div>
                    <p>Your generated video will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Input Section - RIGHT SIDE */}
          <div>
              <h3 className="text-2xl font-bold mb-6 text-white">
              {mode === 'text' ? 'Describe Your Video' : 'Upload Image to Animate'}
            </h3>

            {/* Image Upload for image mode */}
            {mode === 'image' && (
                <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-2xl hover:border-[var(--color-primary)]/50 transition-all duration-300 bg-[rgba(255,255,255,0.02)]"
                >
                  {uploadedImage ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl text-green-400">✓</span>
                        <span className="text-white font-medium">{uploadedImage.name}</span>
                    </div>
                  ) : (
                    <div>
                        <div className="text-4xl mb-3">📁</div>
                        <p className="text-white font-medium mb-2">Click to upload image</p>
                        <p className="text-gray-400">PNG, JPG up to 10MB</p>
                        <p className="text-gray-400 text-xs mt-1">Minimum dimensions: 300x300px</p>
                    </div>
                  )}
                </motion.button>
              </div>
            )}

            {/* Prompt Input for text mode */}
            {mode === 'text' && (
                <div className="mb-6">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to generate..."
                    className="w-full h-40 p-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none resize-none text-lg"
                />
                  <div className="text-right text-sm text-gray-400 mt-2">
                  {prompt.length}/500
                </div>
              </div>
            )}


            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: canGenerate() ? 1.02 : 1 }}
              whileTap={{ scale: canGenerate() ? 0.98 : 1 }}
              onClick={handleGenerate}
              disabled={!canGenerate() || isGenerating}
                className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${
                canGenerate() && !isGenerating
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[#0291D8] hover:to-[#2524A3] text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Video Job...
                </div>
              ) : (
                `Generate Video (${getCostForMode()} XUT)`
              )}
            </motion.button>

            {/* Balance Warning */}
              {(profile?.tokenBalance || 0) < getCostForMode() && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">
                    ⚠️ Insufficient XUT balance. You need {getCostForMode()} XUT but have {profile?.tokenBalance || 0} XUT.
                </p>
              </div>
            )}
          </div>

        </div>
        </div>
      ) : currentGeneration.status === 'processing' ? (
        /* Show processing state for both pending and processing statuses */
        <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                🎬 Video Generation in Progress
              </h3>
              <p className="text-[var(--color-primary)] text-lg">
                Your {currentGeneration?.prompt === 'Image to Video ' ? 'image-to-video' : 'text-to-video'} is being processed
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This usually takes 2-10 minutes. You can check the status above.
              </p>
            </div>

            {/* Job Details */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Job ID</p>
                  <p className="text-[var(--color-primary)] font-mono">{currentGeneration.jobId}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-[var(--color-primary)]">{currentGeneration.backendStatus || currentGeneration.status}</p>
                </div>
                <div>
                  <p className="text-gray-400">Started</p>
                  <p className="text-[var(--color-primary)]">
                    {new Date(currentGeneration.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Updates</p>
                  <p className="text-[var(--color-primary)]">Every 5s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (currentGeneration.status === 'completed' || currentGeneration.status === 'success') && currentGeneration.videoUrl ? (
        /* Show success state when video is completed */
        <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
          <div className="text-center space-y-6">
            {/* Success Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">✓</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-400">🎉 Video Generation Complete!</h3>
                  <p className="text-green-300 text-lg">
                    Your {currentGeneration.prompt === 'Image to Video' ? 'image-to-video' : 'text-to-video'} is ready for download
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Video Preview */}
            <div className="aspect-video bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.1)] overflow-hidden">
              <video 
                src={currentGeneration.videoUrl} 
                controls 
                className="w-full h-full object-cover rounded-2xl"
                poster={currentGeneration.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Generation Details */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="text-lg font-bold text-white mb-4">Generation Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Job ID</p>
                  <p className="text-[var(--color-primary)] font-mono text-xs">{currentGeneration.jobId}</p>
                </div>
                <div>
                  <p className="text-gray-400">Mode</p>
                  <p className="text-white font-medium">
                    {currentGeneration.prompt === 'Image to Video' ? '🖼️ Image to Video' : '📝 Text to Video'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="text-white font-medium">{duration}s</p>
                </div>
                <div>
                  <p className="text-gray-400">Motion</p>
                  <p className="text-white font-medium capitalize">{motionType}</p>
                </div>
                <div>
                  <p className="text-gray-400">Started</p>
                  <p className="text-[var(--color-primary)] text-xs">
                    {new Date(currentGeneration.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Cost</p>
                  <p className="text-white font-medium">{getCostForMode()} XUT</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-green-400 font-medium">✅ Completed</p>
                </div>
          <div>
                  <p className="text-gray-400">Quality</p>
                  <p className="text-white font-medium">HD</p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={isDownloading}
                className={`px-12 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isDownloading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-[#0291D8] hover:to-[#2524A3] hover:shadow-xl'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  '📥 Download Video'
                )}
              </motion.button>
            </div>

            {/* Tips */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 border border-[rgba(255,255,255,0.05)]">
              <p className="text-sm text-gray-400">
                💡 <strong>Tip:</strong> The video is watermarked. For commercial use, consider upgrading to premium plans.
              </p>
            </div>
          </div>
        </div>
      ) : currentGeneration.status === 'failed' ? (
        /* Show failed state */
        <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-400">Video Generation Failed</h3>
                  <p className="text-red-300 text-lg">
                    Sorry, your {mode === 'image' ? 'image-to-video' : 'text-to-video'} generation failed
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="text-lg font-bold text-white mb-4">Error Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Job ID</p>
                  <p className="text-[var(--color-primary)] font-mono text-xs">{currentGeneration.jobId}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-red-400 font-medium">❌ Failed</p>
                </div>
          <div>
                  <p className="text-gray-400">Started</p>
                  <p className="text-[var(--color-primary)] text-xs">
                    {new Date(currentGeneration.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Cost</p>
                  <p className="text-white font-medium">{getCostForMode()} XUT</p>
            </div>
          </div>
                </div>

            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetForm}
                className="px-8 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl text-white font-bold hover:from-[#0291D8] hover:to-[#2524A3] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                🔄 Try Again
              </motion.button>
            </div>
          </div>
        </div>

      ) : null}

        {/* Reset Button */}
      <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetForm}
          className="px-8 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] justify-end border  rounded-xl text-white hover:text-white hover:border-[var(--color-primary)]/50 transition-all duration-300"
          >
            Reset Form
          </motion.button>
      </div>

      {/* Token Confirmation Modal */}
      <TokenConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmGeneration}
        cost={pendingGeneration?.cost || 0}
        action={`Generate ${mode === 'text' ? 'Video from Text' : 'Image'}`}
        currentBalance={profile?.tokenBalance || 0}
      />
    </div>
  );
}