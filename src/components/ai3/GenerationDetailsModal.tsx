"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    AiOutlineClockCircle,
    AiOutlineReload,
    AiOutlineCalendar,
    AiOutlineDownload,
} from "react-icons/ai";
import { Generation } from "@/src/store/slices/aiStudioSlice";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store'; // Adjust path as needed
import { downloadItem } from '@/src/store/slices/aiStudioSlice';
import Model3DViewer from './Model3DViewer';

interface GenerationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    generation: Generation | null;
    onRegenerate: (generation: Generation) => void;
    onDownload: (generation: Generation) => void;
    isDownloading: boolean;
}

export default function GenerationDetailsModal({
    isOpen,
    onClose,
    generation,
    onRegenerate,
    onDownload,
    isDownloading,
}: GenerationDetailsModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);
    const [isPaused, setIsPaused] = React.useState(false);
    // Add state for tracking which image is being hovered
    const [hoveredImageIndex, setHoveredImageIndex] = React.useState<number>(0);

    if (!isOpen || !generation) return null;

    const getOriginalImageUrl = (item: Generation) => {
        if ((item as any).metadata && (item as any).metadata.originalImageUrl) {
            return (item as any).metadata.originalImageUrl;
        }
        return null;
    };

    const getGeneratedResultUrl = (item: Generation) => {
        return (
            (item as any).resultUrl ||
            item.imageUrl ||
            item.videoUrl ||
            item.enhancedImageUrl ||
            item.musicUrl ||
            item.audioUrl
        );
    };

    const getAllResultUrls = (item: Generation) => {
        const results: string[] = [];
        
        // Add main resultUrl
        if ((item as any).resultUrl) {
            results.push((item as any).resultUrl);
        }
        
        // Add regeneration results
        if ((item as any).regenerations && Array.isArray((item as any).regenerations)) {
            (item as any).regenerations.forEach((regeneration: any) => {
                if (regeneration.resultUrl) {
                    results.push(regeneration.resultUrl);
                }
            });
        }
        
        // Fallback to other URLs if no resultUrl
        if (results.length === 0) {
            if (item.imageUrl) results.push(item.imageUrl);
            if (item.videoUrl) results.push(item.videoUrl);
            if (item.enhancedImageUrl) results.push(item.enhancedImageUrl);
            if (item.musicUrl) results.push(item.musicUrl);
            if (item.audioUrl) results.push(item.audioUrl);
            if (item.threeDUrl) results.push(item.threeDUrl);
        }
        
        return results;
    };

    const getOriginalImageContent = (item: Generation) => {
        const originalImageUrl = getOriginalImageUrl(item);

        if (originalImageUrl) {
            return (
                <img
                    src={originalImageUrl}
                    alt="Original input image"
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                        console.error("Original image preview error:", e);
                        e.currentTarget.style.display = "none";
                    }}
                />
            );
        } else {
            return (
                <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-2xl mb-2">🖼️</span>
                        <span className="text-white text-sm">N/A</span>
                    </div>
                </div>
            );
        }
    };

    // New function to get metadata for a specific image
    const getImageMetadata = (index: number) => {
        const allResults = getAllResultUrls(generation);
        const resultUrl = allResults[index];
        
        if (!resultUrl) return null;

        // Check if it's the original generation
        if (index === 0) {
            // Determine format based on generation type
            let format = "PNG"; // default
            if (generation.type === "video") format = "MP4";
            else if (generation.type === "3d") format = (generation.metadata as any)?.format?.toUpperCase() || "GLB";
            else if (generation.type === "music" || generation.type === "audio") format = "MP3";
            
            return {
                resolution: (generation as any).size || generation.metadata?.size || "N/A",
                format: format,
                size: "2.4 MB", // You might want to calculate this dynamically
                aiModel: (generation as any).model || generation.metadata?.model || (generation.type === "3d" ? "Trellis" : "GPT-4 Vision"),
                motion: generation.type === "video" ? "Smooth" : "N/A",
                style: (generation as any).style || generation.metadata?.style || "N/A",
                quality: (generation as any).quality || generation.metadata?.quality || "N/A"
            };
        }

        // Check if it's a regeneration
        const regenerations = (generation as any).regenerations || [];
        const regenerationIndex = index - 1;
        
        if (regenerations[regenerationIndex]) {
            const regen = regenerations[regenerationIndex];
            
            // Determine format based on generation type
            let format = "PNG"; // default
            if (generation.type === "video") format = "MP4";
            else if (generation.type === "3d") format = (regen.metadata as any)?.format?.toUpperCase() || "GLB";
            else if (generation.type === "music" || generation.type === "audio") format = "MP3";
            
            return {
                resolution: regen.metadata?.size || "N/A",
                format: format,
                size: "2.4 MB",
                aiModel: regen.metadata?.model || (generation.type === "3d" ? "Trellis" : "N/A"),
                motion: generation.type === "video" ? (regen.metadata?.motionType || "Smooth") : "N/A",
                style: regen.metadata?.style || "N/A",
                quality: regen.metadata?.quality || "N/A"
            };
        }

        return null;
    };

    const handleDownload = async (resultUrl: string) => {
        try {
            await dispatch(downloadItem({ url: resultUrl }));
        } catch (error) {
            console.error('Download error:', error);
        }
    };
      
    const handleMainDownload = async () => {
        if (!generation) return;
        
        // Get the main result URL
        const resultUrl = getGeneratedResultUrl(generation);
        if (!resultUrl) {
            console.error('No result URL available for download');
            return;
        }
        
        try {
            // Determine file extension based on generation type
            let extension = 'file';
            if (generation.type === 'video') {
                extension = 'mp4';
            } else if (generation.type === 'image' || generation.type === 'enhancement') {
                extension = 'png';
            } else if (generation.type === '3d') {
                extension = 'glb';
            } else if (generation.type === 'audio' || generation.type === 'music') {
                extension = 'mp3';
            }
            
            const filename = `ai-generation-${generation.id}.${extension}`;
            await dispatch(downloadItem({ url: resultUrl, filename }));
        } catch (error) {
            console.error('Download error:', error);
        }
    };
      

    return (
        <div
            className="fixed inset-0 bg-[#0F1629] backdrop-blur-sm z-50 max-w-[1340px] mx-auto h-[90vh] mt-8 overflow-y-auto"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full h-full bg-[#0F1629] overflow-auto"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 w-12 h-12 bg-[rgba(255,255,255,0.1)] backdrop-blur-sm border border-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-all duration-300"
                >
                    <span className="text-2xl">×</span>
                </motion.button>

                {/* Modal Content */}
                <div className="p-8 h-90vh overflow-y-auto bg-[#0F1629]">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-4xl font-semibold text-white mb-4">
                            Generation Details
                        </h2>
                    </div>

                    {/* Content Layout */}
                    <div className="space-y-8">
                        {/* Original Input Section with Stats Cards */}
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Original Input Image */}
                            {getOriginalImageUrl(generation) && (
                                <div className="w-full lg:w-1/4">
                                    <h3 className="text-lg font-medium text-gray-400 mb-4">
                                        Original Input
                                    </h3>
                                    <div className="aspect-square rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.05)]">
                                        {getOriginalImageContent(generation)}
                                    </div>
                                </div>
                            )}

                            {/* Stats Cards */}
                            <div
                                className={`w-full ${getOriginalImageUrl(generation) ? "lg:w-3/4" : "lg:w-full"
                                    } flex items-center`}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                    <div className="bg-[rgba(59,130,246,0.1)] border border-blue-500/20 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <AiOutlineClockCircle className="text-blue-400 text-xl" />
                                            <span className="text-sm text-blue-400 font-medium">
                                                CREDITS
                                            </span>
                                        </div>
                                        <div className="text-white font-bold text-2xl">
                                            {generation.cost} XUT
                                        </div>
                                    </div>

                                    <div className="bg-[rgba(147,51,234,0.1)] border border-purple-500/20 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <AiOutlineReload className="text-purple-400 text-xl" />
                                            <span className="text-sm text-purple-400 font-medium">
                                                REGENERATIONS
                                            </span>
                                        </div>
                                        <div className="text-white font-bold text-2xl">
                                            {generation.retryCount}/3
                                        </div>
                                    </div>

                                    <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <AiOutlineCalendar className="text-gray-400 text-xl" />
                                            <span className="text-sm text-gray-400 font-medium">
                                                GENERATED
                                            </span>
                                        </div>
                                        <div className="text-white text-lg">
                                            {new Date(generation.createdAt).toLocaleDateString(
                                                "en-US",
                                                {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prompt Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-400 mb-4">Prompt</h3>
                            <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6">
                                <p className="text-white text-lg leading-relaxed">
                                    {generation.prompt || "No prompt available"}
                                </p>
                            </div>
                        </div>

                        {/* Generated Results and Metadata Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Generated Results */}
                            <div className="lg:col-span-2">
                                <h3 className="text-lg font-medium text-gray-400 mb-4">
                                    Generated Results
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {getAllResultUrls(generation).map((resultUrl, index) => (
                                        <div 
                                            key={index} 
                                            className="relative group"
                                            onMouseEnter={() => setHoveredImageIndex(index)}
                                            onMouseLeave={() => setHoveredImageIndex(0)} // Reset to first image
                                        >
                                            <div className="aspect-square rounded-xl overflow-hidden bg-[rgba(255,255,255,0.05)] relative">
                                                {/* Check if it's a video based on type or URL extension */}
                                                {generation.type === "video" ||
                                                    resultUrl.includes(".mp4") ||
                                                    resultUrl.includes("video") ? (
                                                    // Video content
                                                    (playingIndex === index ? (<video
                                                        src={resultUrl}
                                                        className="w-full h-full object-contain"
                                                        controls
                                                        autoPlay
                                                        onEnded={() => setPlayingIndex(null)}
                                                        onPause={(e) => {
                                                            // Go back to card mode if paused before video ends
                                                            if (e.currentTarget.currentTime < e.currentTarget.duration) {
                                                                setPlayingIndex(null);
                                                            }
                                                        }}
                                                        onPlay={() => setPlayingIndex(index)}
                                                    />) : (<>
                                                        <video
                                                            src={resultUrl}
                                                            className="w-full h-full object-contain"
                                                            muted
                                                            preload="metadata"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPlayingIndex(index);
                                                                }}
                                                                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition hover:scale-110 active:scale-95"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="w-8 h-8 text-white ml-1"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 16 16"
                                                                >
                                                                    <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l4.5-2.5a.5.5 0 0 0 0-.814l-4.5-2.5z" />
                                                                </svg>
                                                            </button>

                                                            {/* Action Buttons */}
                                                            <div className="space-y-3 w-48">
                                                                <button className="w-full py-2 bg-purple-500 rounded-lg text-white hover:bg-purple-600">
                                                                    Mint NFT
                                                                </button>
                                                                <button className="w-full py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600">
                                                                    Use on Product
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>))
                                                ) : generation.type === "3d" ||
                                                    resultUrl.includes(".glb") || resultUrl.includes(".gltf") || resultUrl.includes(".obj") ? (
                                                    // 3D Model content - Same design as history panel
                                                    (<div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-xl overflow-hidden group">
                                                        {/* 3D Model Container */}
                                                        <div className="w-full h-full flex items-center justify-center p-4">
                                                            {/* 3D Model Preview Area */}
                                                            <div className="relative w-full h-full max-w-sm">
                                                                {/* Show video if available (turntable) */}
                                                                {generation.metadata?.combinedVideo ? (
                                                                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/20">
                                                                        <video
                                                                            src={generation.metadata.combinedVideo}
                                                                            className="w-full h-full object-cover rounded-xl"
                                                                            muted
                                                                            loop
                                                                            autoPlay
                                                                            playsInline
                                                                            onError={(e) => {
                                                                                console.error('3D video preview error:', e);
                                                                                e.currentTarget.style.display = 'none';
                                                                            }}
                                                                        />
                                                                        {/* Overlay with model info */}
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl">
                                                                            <div className="absolute bottom-4 left-4 right-4">
                                                                                <h3 className="text-white font-bold text-sm mb-1">3D Model</h3>
                                                                                <p className="text-white/80 text-xs truncate">{generation.prompt}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Fallback: 3D Model Placeholder with better design */
                                                                    (<div className="relative w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20 flex flex-col items-center justify-center">
                                                                        {/* 3D Wireframe-like pattern */}
                                                                        <div className="absolute inset-0 opacity-10">
                                                                            <div className="w-full h-full relative">
                                                                                {/* Wireframe grid */}
                                                                                <div className="absolute inset-4 border border-purple-400/30 rounded-lg"></div>
                                                                                <div className="absolute inset-8 border border-purple-400/20 rounded-lg"></div>
                                                                                <div className="absolute inset-12 border border-purple-400/10 rounded-lg"></div>
                                                                                
                                                                                {/* 3D cube representation */}
                                                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                                                    <div className="w-16 h-16 relative transform rotate-45">
                                                                                        <div className="absolute inset-0 border-2 border-purple-400/40 rounded-lg"></div>
                                                                                        <div className="absolute inset-2 border border-purple-400/20 rounded-lg"></div>
                                                                                        <div className="absolute inset-4 border border-purple-400/10 rounded-lg"></div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Content */}
                                                                        <div className="relative z-10 text-center">
                                                                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                                                                <div className="text-2xl">🎲</div>
                                                                            </div>
                                                                            <h3 className="text-white font-bold text-lg mb-2">3D Model</h3>
                                                                            <p className="text-gray-300 text-sm mb-4 max-w-xs truncate">{generation.prompt}</p>
                                                                        </div>
                                                                    </div>)
                                                                )}
                                                                
                                                                {/* Download Button Overlay */}
                                                                <div className="absolute bottom-2 right-2 flex gap-2">
                                                                    <a 
                                                                        href={resultUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-3 py-2 bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-all duration-200 backdrop-blur-sm"
                                                                    >
                                                                        <AiOutlineDownload className="w-3 h-3" />
                                                                        GLB
                                                                    </a>
                                                                    {generation.metadata?.combinedVideo && (
                                                                        <a 
                                                                            href={generation.metadata.combinedVideo} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all duration-200 backdrop-blur-sm"
                                                                        >
                                                                            <AiOutlineDownload className="w-3 h-3" />
                                                                            Video
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Subtle animation overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                    </div>)
                                                ) : generation.type === "music" || generation.type === "audio" ||
                                                    resultUrl.includes(".mp3") || resultUrl.includes(".wav") || resultUrl.includes(".m4a") ? (
                                                    // Audio/Music content
                                                    (<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                                                        <audio
                                                            src={resultUrl}
                                                            controls
                                                            className="w-full h-full"
                                                            onError={(e) => {
                                                                console.error("Audio preview error:", e);
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                    </div>)
                                                ) : (
                                                    <>
                                                        <img
                                                            src={resultUrl}
                                                            alt={`Generated result ${index + 1}`}
                                                            className="w-full h-full object-contain rounded-xl"
                                                            onError={(e) => {
                                                                console.error("Generated result preview error:", e);
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                                                            <div className="space-y-3 w-48">
                                                                <button className="w-full py-2 bg-purple-500 rounded-lg text-white hover:bg-purple-600">
                                                                    Mint NFT
                                                                </button>
                                                                <button className="w-full py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600">
                                                                    Use on Product
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Download Icon */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(resultUrl);
                                                    }}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer z-10"
                                                >
                                                    <AiOutlineDownload className="text-white text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {getAllResultUrls(generation).length === 0 && (
                                        <div className="col-span-3 flex items-center justify-center py-8">
                                            <div className="text-center">
                                                <span className="text-4xl mb-2">📁</span>
                                                <p className="text-slate-400 text-sm">
                                                    No generated results available
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic Metadata */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-400 mb-4">
                                    Metadata
                                </h3>
                                <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6 mb-6">
                                    <div className="space-y-4 text-base">
                                        {(() => {
                                            const metadata = getImageMetadata(hoveredImageIndex);
                                            if (!metadata) return null;
                                            
                                            return (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400">Resolution:</span>
                                                        <span className="text-white">{metadata.resolution}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400">Format:</span>
                                                        <span className="text-white">{metadata.format}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400">Size:</span>
                                                        <span className="text-white">{metadata.size}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400">AI Model:</span>
                                                        <span className="text-white">{metadata.aiModel}</span>
                                                    </div>
                                                    {metadata.motion !== "N/A" && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400">Motion:</span>
                                                            <span className="text-white">{metadata.motion}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400">Style:</span>
                                                        <span className="text-white">{metadata.style}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400">Quality:</span>
                                                        <span className="text-white">{metadata.quality}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onRegenerate(generation);
                                            onClose();
                                        }}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <span>🔄</span>
                                        Regenerate ({3 - generation.retryCount} left)
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleMainDownload}
                                        disabled={isDownloading}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <span>⬇️</span>
                                        {isDownloading ? "Downloading..." : "Download"}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-white/10">
                        {generation.retryCount < 3 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    onRegenerate(generation);
                                    onClose();
                                }}
                                className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white rounded-xl font-semibold text-lg hover:from-[#E55A2B] hover:to-[#E68A1A] transition-all duration-300"
                            >
                                🔄 Regenerate ({3 - generation.retryCount} left)
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDownload(generation)}
                            disabled={isDownloading}
                            className={`px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl font-semibold text-lg transition-all duration-300 ${isDownloading
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:opacity-90'
                                }`}
                        >
                            {isDownloading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Downloading...
                                </div>
                            ) : (
                                '⬇️ Download'
                            )}
                        </motion.button>
                    </div> */}
                </div>
            </motion.div>
        </div>
    );
}
