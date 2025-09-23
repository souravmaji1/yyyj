"use client";
import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import TokenConfirmationModal from "@/src/components/aiStudio/TokenConfirmationModal";
import {
    generateImage,
    enhanceImage,
    imageToImage,
    downloadGeneration,
    regenerate,
    Generation
} from "@/src/store/slices/aiStudioSlice";
import { logAPICall } from "@/src/utils/aiStudioParity";
import { AIStudioCosts, aiStudioCostsService } from "@/src/app/apis/aiStudioCostsService";


interface ImageGeneratorProps {
    filteredGeneration?: Generation | null;
}

export default function ImageGenerator({ filteredGeneration }: ImageGeneratorProps) {
    const dispatch = useDispatch();
    const { profile } = useSelector((state: RootState) => state.user);
    const { isGenerating, currentGeneration: globalCurrentGeneration } = useSelector((state: RootState) => state.aiStudio);

    // Use filteredGeneration if provided, otherwise fall back to global currentGeneration
    const currentGeneration = filteredGeneration !== undefined ? filteredGeneration : globalCurrentGeneration;

    // Debug logging for currentGeneration
    console.log('🎨 ImageGenerator Render - currentGeneration:', {
        id: currentGeneration?.id,
        status: currentGeneration?.status,
        imageUrl: currentGeneration?.imageUrl,
        prompt: currentGeneration?.prompt,
        type: currentGeneration?.type
    });

    const [mode, setMode] = useState<'text' | 'upload' | 'enhance'>('text');
    const [prompt, setPrompt] = useState('');
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingGeneration, setPendingGeneration] = useState<any>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
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

    // Function to reset all fields when switching tabs
    const resetFieldsForTab = (newMode: 'text' | 'upload' | 'enhance') => {
        console.log('🔄 Resetting fields for tab:', newMode);

        // Reset common fields
        setPrompt('');
        setPendingGeneration(null);

        // Reset image-related fields based on new tab
        if (newMode === 'text') {
            // Text to image: no image needed
            setUploadedImage(null);
            setPreviewUrl('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else if (newMode === 'upload') {
            // Image to image: keep image but reset prompt
            // Don't reset image here as user might want to keep it
        } else if (newMode === 'enhance') {
            // Enhancement: keep image but reset prompt
            // Don't reset image here as user might want to keep it
        }
    };

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

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('Image size must be less than 10MB');
                return;
            }

            setUploadedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const getCostForMode = () => {
        switch (mode) {
            case 'text': return costs.imageCost;
            case 'upload': return costs.imageCost;
            case 'enhance': return costs.enhancementCost;
            default: return 0;
        }
    };

    const canGenerate = () => {
        const cost = getCostForMode();
        const hasBalance = (profile?.tokenBalance || 0) >= cost;

        switch (mode) {
            case 'text':
                return prompt.trim().length > 0 && hasBalance;
            case 'upload':
                return uploadedImage && prompt.trim().length > 0 && hasBalance;
            case 'enhance':
                return uploadedImage && hasBalance;
            default:
                return false;
        }
    };

    const handleGenerate = () => {
        if (!canGenerate()) return;

        const cost = getCostForMode();
        const generationData = {
            mode,
            prompt: mode === 'enhance' ? 'Auto Enhancement' : prompt,
            image: uploadedImage,
            cost
        };

        setPendingGeneration(generationData);
        setShowConfirmation(true);
    };

    const confirmGeneration = async () => {
        if (!pendingGeneration) return;

        setShowConfirmation(false);

        try {
            switch (pendingGeneration.mode) {
                case 'text':
                    // Log API call for parity tracking
                    logAPICall({
                        url: '/ai-studio/generate-image',
                        method: 'POST',
                        timestamp: Date.now(),
                        source: 'ai-studio',
                        params: { 
                            prompt: pendingGeneration.prompt, 
                            style: 'photorealistic', 
                            size: '1024x1024', 
                            quality: 'standard', 
                            cost: pendingGeneration.cost 
                        }
                    });

                    await dispatch(generateImage({
                        prompt: pendingGeneration.prompt,
                        style: 'photorealistic', // Default style
                        size: '1024x1024', // Default size
                        quality: 'standard', // Default quality
                        cost: pendingGeneration.cost
                    }) as any);
                    break;

                case 'upload':
                    // For image to image, create FormData with image and instructions
                    if (pendingGeneration.image) {
                        const formData = new FormData();
                        formData.append('image', pendingGeneration.image);
                        formData.append('instructions', pendingGeneration.prompt || 'Transform this image with artistic style');
                        // Only append userId once - don't duplicate it
                        formData.append('userId', profile?.id || '');

                        // Debug logging
                        console.log('🔍 Frontend - Creating FormData for image-to-image:', {
                            profileId: profile?.id,
                            profileExists: !!profile,
                            formDataEntries: Array.from(formData.entries())
                        });

                        // Log API call for parity tracking
                        logAPICall({
                            url: '/ai-studio/image-to-image',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio',
                            params: { prompt: pendingGeneration.prompt, cost: pendingGeneration.cost, hasImage: true }
                        });

                        await dispatch(imageToImage({
                            formData,
                            cost: pendingGeneration.cost
                        }) as any);
                    }
                    break;

                case 'enhance':
                    // For enhance image, create FormData with image and required fields
                    if (pendingGeneration.image) {
                        const formData = new FormData();
                        formData.append('image', pendingGeneration.image);
                        formData.append('type', 'upload'); // Added: required type field
                        // Only append userId once - don't duplicate it
                        formData.append('userId', profile?.id || '');

                        // Log API call for parity tracking
                        logAPICall({
                            url: '/ai-studio/enhance-image',
                            method: 'POST',
                            timestamp: Date.now(),
                            source: 'ai-studio',
                            params: { cost: pendingGeneration.cost, hasImage: true }
                        });

                        await dispatch(enhanceImage({
                            formData,
                            cost: pendingGeneration.cost
                        }) as any);
                    }
                    break;
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Generation failed. Please try again.');
        }

        setPendingGeneration(null);
    };

    const resetForm = () => {
        setPrompt('');
        setUploadedImage(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6">
            {/* Mode Selection */}
            <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
                {/* Responsive heading scaling */}
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white text-center">Select Generation Mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (mode !== 'text') {
                                resetFieldsForTab('text');
                                setMode('text');
                            }
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${mode === 'text'
                                ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 shadow-lg shadow-[var(--color-primary)]/25'
                                : 'border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)]/50 bg-[rgba(255,255,255,0.02)]'
                            }`}
                    >
                        <div className="text-4xl mb-3">✨</div>
                        <h3 className="text-xl font-bold mb-2 text-white">Text to Image</h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">Generate from description</p>
                        <span className="text-lg font-bold text-[var(--color-primary)]">{costs.imageCost} XUT</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (mode !== 'upload') {
                                resetFieldsForTab('upload');
                                setMode('upload');
                            }
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${mode === 'upload'
                                ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 shadow-lg shadow-[var(--color-primary)]/25'
                                : 'border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)]/50 bg-[rgba(255,255,255,0.02)]'
                            }`}
                    >
                        <div className="text-4xl mb-3">🎨</div>
                        <h3 className="text-xl font-bold mb-2 text-white">Image to Image</h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">Transform with style</p>
                        <span className="text-lg font-bold text-[var(--color-primary)]">{costs.imageCost} XUT</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (mode !== 'enhance') {
                                resetFieldsForTab('enhance');
                                setMode('enhance');
                            }
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${mode === 'enhance'
                                ? 'border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 shadow-lg shadow-[var(--color-primary)]/25'
                                : 'border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)]/50 bg-[rgba(255,255,255,0.02)]'
                            }`}
                    >
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="text-xl font-bold mb-2 text-white">Enhancement</h3>
                        <p className="text-gray-300 mb-4 leading-relaxed">Auto improve quality</p>
                        <span className="text-lg font-bold text-[var(--color-primary)]">{costs.enhancementCost} XUT</span>
                    </motion.button>
                </div>
            </div>

            {/* Generation Interface */}
            <div className="bg-[#0F172A] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">

                {/* Processing Status Banner */}
                {currentGeneration?.status === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 border border-[var(--color-primary)]/30 rounded-xl"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[var(--color-primary)] font-medium">
                                {mode === 'upload' ? '🔄 Transforming image...' :
                                    mode === 'enhance' ? '⚡ Enhancing image...' :
                                        '✨ Generating image...'}
                            </span>
                        </div>
                    </motion.div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Preview - LEFT SIDE */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-white">
                            {mode === 'upload' ? 'Image Transformation' :
                                mode === 'enhance' ? 'Image Enhancement' :
                                    'Generated Image'}
                        </h3>

                        {/* Show both original and generated images for upload/enhance modes */}
                        {(mode === 'upload' || mode === 'enhance') && uploadedImage && (
                            <div className="space-y-4 mb-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Original Image</h4>
                                    <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.1)] overflow-hidden">
                                        <img
                                            src={previewUrl}
                                            alt="Original image"
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Generated/Transformed Image */}
                        {currentGeneration && currentGeneration.imageUrl ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                                        {mode === 'upload' ? 'Transformed Image' :
                                            mode === 'enhance' ? 'Enhanced Image' :
                                                'Generated Image'}
                                    </h4>
                                    <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.1)] overflow-hidden">
                                        <img
                                            src={currentGeneration.imageUrl}
                                            alt="Generated image"
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {/* Action buttons stack on mobile */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Regenerate Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={async () => {
                                            if (currentGeneration && currentGeneration.retryCount < 3 && !isRegenerating) {
                                                try {
                                                    setIsRegenerating(true);

                                                    // Log API call for parity tracking
                                                    logAPICall({
                                                        url: `/ai-studio/regenerate/${currentGeneration.id}`,
                                                        method: 'POST',
                                                        timestamp: Date.now(),
                                                        source: 'ai-studio',
                                                        params: { generationId: currentGeneration.id, modifiedPrompt: currentGeneration.prompt }
                                                    });

                                                    // Dispatch regenerate action
                                                    const result = await dispatch(regenerate({
                                                        generationId: currentGeneration.id,
                                                        modifiedPrompt: currentGeneration.prompt // Use same prompt for regeneration
                                                    }) as any);

                                                    if (result.meta?.requestStatus === 'fulfilled') {
                                                        toast.success('🔄 Image regeneration started!');
                                                    } else {
                                                        toast.error('❌ Regeneration failed. Please try again.');
                                                    }
                                                } catch (error) {
                                                    console.error('Regeneration error:', error);
                                                    toast.error('❌ Regeneration failed. Please try again.');
                                                } finally {
                                                    setIsRegenerating(false);
                                                }
                                            } else if (currentGeneration?.retryCount >= 3) {
                                                toast.error('❌ No more regeneration attempts left');
                                            }
                                        }}
                                        disabled={!currentGeneration || currentGeneration.retryCount >= 3 || isRegenerating}
                                        className={`py-3 px-4 font-bold rounded-xl transition-all duration-300 shadow-lg ${currentGeneration && currentGeneration.retryCount < 3 && !isRegenerating
                                                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[#0291D8] hover:to-[#2524A3] text-white hover:shadow-xl'
                                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isRegenerating ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">Regenerating...</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm"> 🔄 Regenerate</span>
                                        )}
                                    </motion.button>

                                    {/* Download Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            if (currentGeneration?.imageUrl) {
                                                const link = document.createElement('a');
                                                link.href = currentGeneration.imageUrl;
                                                link.download = `generated-image-${currentGeneration.id}.png`;
                                                link.target = '_blank';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                toast.success('📥 Download started!');
                                            }
                                        }}
                                        className="py-3 px-4 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[#0291D8] hover:to-[#2524A3] text-white"
                                    >
                                        <span className="text-sm"> 📥 Download</span>
                                    </motion.button>
                                </div>

                                {/* Regeneration Status Info */}
                                {currentGeneration && (
                                    <div className="text-center text-sm">
                                        {currentGeneration.retryCount > 0 && (
                                            <p className="text-red-400 font-medium">
                                                ✅ Regenerated {currentGeneration.retryCount} time{currentGeneration.retryCount > 1 ? 's' : ''}
                                            </p>
                                        )}
                                        {currentGeneration.retryCount >= 3 && (
                                            <p className="text-red-400 font-medium">
                                                ❌ Maximum regeneration attempts reached
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-square bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <div className="text-6xl mb-4">
                                        {mode === 'upload' ? '🎨' :
                                            mode === 'enhance' ? '⚡' :
                                                '🖼️'}
                                    </div>
                                    <p>
                                        {mode === 'upload' ? 'Your transformed image will appear here' :
                                            mode === 'enhance' ? 'Your enhanced image will appear here' :
                                                'Your generated image will appear here'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Section - RIGHT SIDE */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-white">
                            {mode === 'text' && 'Describe Your Image'}
                            {mode === 'upload' && 'Upload & Style'}
                            {mode === 'enhance' && 'Upload to Enhance'}
                        </h3>

                        {/* Image Upload for upload/enhance modes */}
                        {(mode === 'upload' || mode === 'enhance') && (
                            <div className="mb-6">
                                {/* Accessible file input */}
                                <label htmlFor="image-upload" className="sr-only">Upload image</label>
                                <input
                                    id="image-upload"
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
                                    aria-label="Upload image"
                                    type="button"
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
                                        </div>
                                    )}
                                </motion.button>
                            </div>
                        )}

                        {/* Prompt Input (not for enhance mode) */}
                        {mode !== 'enhance' && (
                            <div className="mb-6">
                                {/* Accessible prompt textarea */}
                                <label htmlFor="prompt" className="sr-only">Prompt</label>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={
                                        mode === 'text'
                                            ? "Describe the image you want to generate..."
                                            : "Describe how you want to transform the image (e.g., 'Make it more artistic', 'Add vintage style', 'Transform to watercolor')..."
                                    }
                                    className="w-full h-40 p-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none resize-none text-lg"
                                />
                                <div className="text-right text-sm text-gray-400 mt-2" aria-live="polite">
                                    {prompt.length}/500
                                </div>
                            </div>
                        )}

                        {/* Enhancement Mode Info */}
                        {mode === 'enhance' && (
                            <div className="mb-6 p-4 bg-[rgba(2,167,253,0.1)] border border-[rgba(2,167,253,0.2)] rounded-xl">
                                <div className="flex items-center gap-3 text-[var(--color-primary)]">
                                    <span className="text-2xl">✨</span>
                                    <div>
                                        <p className="font-medium">AI-Powered Enhancement</p>
                                        <p className="text-sm text-[var(--color-primary)]/80">
                                            Our AI will automatically analyze your image and enhance quality, colors, lighting, and details without needing a prompt.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Generate Button */}
                        <motion.button
                            whileHover={{ scale: canGenerate() ? 1.02 : 1 }}
                            whileTap={{ scale: canGenerate() ? 0.98 : 1 }}
                            onClick={handleGenerate}
                            disabled={!canGenerate() || isGenerating}
                            className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${canGenerate() && !isGenerating
                                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[#0291D8] hover:to-[#2524A3] text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isGenerating ? 'Generating...' : `Generate for ${getCostForMode()} XUT`}
                        </motion.button>

                        {/* Token Balance Warning */}
                        {!canGenerate() && (profile?.tokenBalance || 0) < getCostForMode() && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <div className="flex items-center gap-2 text-red-400">
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <p className="text-sm font-medium">Insufficient XUT Balance</p>
                                        <p className="text-xs text-red-300">
                                            You need {getCostForMode()} XUT but have {profile?.tokenBalance || 0} XUT
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Token Balance Info */}
                        <div className="mt-3 text-center">
                            <span className="text-sm text-gray-400">
                                Current Balance: <span className="text-[var(--color-primary)] font-medium">{profile?.tokenBalance || 0} XUT</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Token Confirmation Modal */}
            {showConfirmation && (
                <TokenConfirmationModal
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={confirmGeneration}
                    cost={pendingGeneration?.cost || 0}
                    currentBalance={profile?.tokenBalance || 0}
                    action="AI Generation"
                />
            )}


        </div>
    );
}
