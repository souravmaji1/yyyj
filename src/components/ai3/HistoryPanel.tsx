"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/src/store/hooks';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { AiOutlineEye } from 'react-icons/ai';
import { Minimize2, Expand, Upload, Search, Download, FileText, RotateCcw } from 'lucide-react'; // Add Search icon and RotateCcw for regenerate
import { Generation, regenerate, downloadGeneration, addUploadedFile, fetchDocuments } from '@/src/store/slices/aiStudioSlice';
import { logAPICall } from '@/src/utils/aiStudioParity';
import GenerationDetailsModal from './GenerationDetailsModal';
import UploadDrawer from './UploadDrawer';
import UploadedFileModal from './UploadedFileModal';
import DocumentViewerModal from './DocumentViewerModal';

interface HistoryPanelProps {
  history: Generation[];
  autoOpenGeneration?: Generation | null;
  onModalStateChange?: (isOpen: boolean) => void;
  onFileUpload?: (file: File | null) => void;
  uploadedFile?: File | null;
  onActionSelect?: (action: string, file: File, title: string) => void;
}

type HistoryFilter = 'all' | 'images' | 'videos' | 'audio' | '3d' | 'uploaded' | 'ai-generated';

const FILTER_LABELS = {
  all: 'All',
  images: 'Images',
  videos: 'Videos',
  audio: 'Audio',
  '3d': '3D',
  uploaded: 'Uploaded',
  'ai-generated': 'AI Generated',
};

export default function HistoryPanel({ history, autoOpenGeneration, onModalStateChange, onFileUpload, uploadedFile, onActionSelect }: HistoryPanelProps) {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotificationUtils();
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [carouselStates, setCarouselStates] = useState<{ [key: string]: { currentIndex: number; images: string[] } }>({});
  const [isExpanded, setIsExpanded] = useState(false); // Add expanded state
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false); // Upload drawer state
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [isUploadedFileModalOpen, setIsUploadedFileModalOpen] = useState(false); // Uploaded file modal state
  const [selectedUploadedFile, setSelectedUploadedFile] = useState<{ file: File, title: string, description?: string, imageUrl?: string } | null>(null);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false); // Document viewer modal state
  const [selectedDocument, setSelectedDocument] = useState<{ file: File, title: string, description?: string } | null>(null);
  
  // Replace pagination state with carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5; // Change back to 5

  // Remove debouncing and hover functionality
  // const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Keyboard support for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isModalOpen || isUploadedFileModalOpen || isDocumentViewerOpen)) {
        if (isModalOpen) handleCloseModal();
        if (isUploadedFileModalOpen) {
          setIsUploadedFileModalOpen(false);
          setSelectedUploadedFile(null);
        }
        if (isDocumentViewerOpen) {
          setIsDocumentViewerOpen(false);
          setSelectedDocument(null);
        }
      }
    };

    if (isModalOpen || isUploadedFileModalOpen || isDocumentViewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling - more robust approach
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore original styles
        document.body.style.overflow = originalStyle;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
      };
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, isUploadedFileModalOpen, isDocumentViewerOpen]);

  // Fetch documents from API when component loads
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        await dispatch(fetchDocuments({
          page: 1,
          limit: 50,
          status: 'ready'
        })).unwrap();
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };

    loadDocuments();
  }, [dispatch]);

  // Fetch documents when filter changes to 'uploaded'
  useEffect(() => {
    if (filter === 'uploaded') {
      const loadUploadedDocuments = async () => {
        try {
          console.log('🔄 Fetching uploaded documents...');
          await dispatch(fetchDocuments({
            page: 1,
            limit: 50,
            status: 'ready'
          })).unwrap();
          console.log('✅ Uploaded documents fetched successfully');
        } catch (error) {
          console.error('❌ Failed to fetch uploaded documents:', error);
        }
      };
      loadUploadedDocuments();
    }
  }, [filter, dispatch]);

  // Auto-open modal for completed generation
  useEffect(() => {
    if (autoOpenGeneration && !isModalOpen) {
      setSelectedGeneration(autoOpenGeneration);
      setIsModalOpen(true);
    }
  }, [autoOpenGeneration, isModalOpen]);

  // Filter history based on selected filter and search query
  const filteredHistory = history.filter((item) => {
    // Apply type filter
    let typeMatch = false;
    switch (filter) {
      case 'images':
        typeMatch = item.type === 'image' || item.type === 'enhancement';
        break;
      case 'videos':
        typeMatch = item.type === 'video';
        break;
      case 'audio':
        typeMatch = item.type === 'audio' || item.type === 'music';
        break;
      case '3d':
        typeMatch = item.type === '3d';
        break;
      case 'uploaded':
        typeMatch = item.metadata?.isUploaded === true;
        break;
      case 'ai-generated':
        typeMatch = item.metadata?.isUploaded !== true;
        break;
      default:
        typeMatch = true;
    }

    // Apply search filter
    const searchMatch = !searchQuery ||
      item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && searchMatch;
  });

  // Sort history - always newest first
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Always newest first
  });

  const handleRegenerate = async (item: Generation) => {
    try {
      console.log('🔄 Starting regeneration for generation:', item.id);
      console.log('🔄 Generation details:', {
        id: item.id,
        type: item.type,
        retryCount: item.retryCount,
        prompt: item.prompt
      });

      // Log API call for parity tracking
      logAPICall({
        url: `/ai-studio/regenerate/${item.id}`,
        method: 'POST',
        timestamp: Date.now(),
        source: 'ai-studio',
        params: { generationId: item.id, modifiedPrompt: item.prompt }
      });

      const result = await dispatch(regenerate({
        generationId: item.id,
        modifiedPrompt: item.prompt // Use same prompt for regeneration
      }) as any);

      console.log('🔄 Regenerate dispatch result:', result);

      if (result.meta?.requestStatus === 'fulfilled') {
        showSuccess('Regeneration Started', `Regeneration started! (Retry ${result.payload.retryCount}/3)`);
        console.log('✅ Regeneration successful:', result.payload);
      } else {
        console.error('❌ Regeneration failed:', result);
        const errorMessage = result.error?.message || 'Regeneration failed. Please try again.';
        showError('Regeneration Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Regeneration error:', error);
      const errorMessage = error.message || 'Regeneration failed. Please try again.';
      showError('Regeneration Failed', errorMessage);
    }
  };

  const handleOpenModal = (item: Generation) => {
    if (item.status === 'completed' || item.status === 'success') {
   
      if (item.metadata?.isUploaded) {
       
        // Create a proper file object with the S3 URL for uploaded files
        const createFileFromS3Url = async (url: string, fileName: string, mimeType: string): Promise<File> => {
          try {
            console.log('Fetching S3 URL:', url);
            const response = await fetch(url);
            console.log('S3 fetch response:', response.status, response.statusText);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const blob = await response.blob();
            console.log('S3 blob size:', blob.size);
            if (blob.size === 0) {
              throw new Error('Empty blob received from S3');
            }
            return new File([blob], fileName, { type: mimeType });
          } catch (error) {
            console.error('Error creating file from S3 URL:', error);
            // Fallback to empty file
            return new File([], fileName, { type: mimeType });
          }
        };

        // Check if it's a document file
        if (isDocumentFile(item.metadata.fileType || '')) {
          const file = new File([], item.metadata.originalFileName || 'uploaded-file', {
            type: item.metadata.fileType || 'image/jpeg'
          });
          setSelectedDocument({
            file,
            title: item.prompt,
            description: item.metadata.description
          });
          setIsDocumentViewerOpen(true);
        } else {
          // For media files (images, videos, audio), create file from S3 URL
          const s3Url = item.metadata?.s3Url || item.imageUrl || item.videoUrl || item.audioUrl || item.musicUrl;
          console.log('S3 URL for file creation:', s3Url);
          if (s3Url) {
            createFileFromS3Url(s3Url, item.metadata?.originalFileName || 'uploaded-file', item.metadata?.fileType || 'image/jpeg')
              .then(file => {
                console.log('Successfully created file from S3 URL, size:', file.size);
                // Attach S3 URL to the file object
                (file as any).s3Url = s3Url;
                setSelectedUploadedFile({
                  file,
                  title: item.prompt,
                  description: item.metadata?.description,
                  imageUrl: s3Url
                });
                setIsUploadedFileModalOpen(true);
              })
              .catch((error) => {
                console.error('Failed to create file from S3 URL, using fallback:', error);
                console.log('Creating empty file as fallback');
                // Fallback to empty file if S3 URL fails
                const file = new File([], item.metadata?.originalFileName || 'uploaded-file', {
                  type: item.metadata?.fileType || 'image/jpeg'
                });
                // Attach S3 URL to the fallback file as well
                (file as any).s3Url = s3Url;
                console.log('Empty file created, size:', file.size);
                setSelectedUploadedFile({
                  file,
                  title: item.prompt,
                  description: item.metadata?.description,
                  imageUrl: s3Url
                });
                setIsUploadedFileModalOpen(true);
              });
          } else {
            // Fallback to empty file if no S3 URL
            const file = new File([], item.metadata?.originalFileName || 'uploaded-file', {
              type: item.metadata?.fileType || 'image/jpeg'
            });
            setSelectedUploadedFile({
              file,
              title: item.prompt,
              description: item.metadata?.description,
              imageUrl: item.imageUrl
            });
            setIsUploadedFileModalOpen(true);
          }
        }
      } else {
        // For AI generated content, use the existing modal
      setSelectedGeneration(item);
      setIsModalOpen(true);
      onModalStateChange?.(true);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGeneration(null);
    onModalStateChange?.(false);
  };

  const handleUploadedFileActionSelect = async (action: string, file: File, title: string) => {
    // For uploaded files, we need to create a proper file with actual data
    // since the file object might be empty
    const s3Url = selectedUploadedFile?.imageUrl;
    let fileToPass = file;
    
    if (s3Url && file.size === 0) {
      // If the file is empty but we have an S3 URL, fetch the actual file data
      try {
        console.log('Fetching actual file data from S3 URL:', s3Url);
        const response = await fetch(s3Url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        console.log('S3 blob size:', blob.size);
        if (blob.size === 0) {
          throw new Error('Empty blob received from S3');
        }
        fileToPass = new File([blob], file.name, { type: file.type });
        console.log('Created file with actual data, size:', fileToPass.size);
      } catch (error) {
        console.error('Failed to fetch file data from S3 URL:', error);
        // Fallback to empty file with S3 URL attached
        fileToPass = new File([], file.name, { type: file.type });
        (fileToPass as any).s3Url = s3Url;
      }
    }

    // Call the parent component's action select handler
    onActionSelect?.(action, fileToPass, title);

    // Close the uploaded file modal
    setIsUploadedFileModalOpen(false);
    setSelectedUploadedFile(null);
  };

  const handleUseAIBot = (file: File, title: string) => {
    // This is now handled within the DocumentViewerModal itself
    // No need for separate chat drawer state
  };

  const handleDownload = async (generation: Generation) => {
    try {
      const url = generation.imageUrl || generation.videoUrl || generation.enhancedImageUrl || generation.threeDUrl || generation.audioUrl;
      if (!url) {
        showError('Download Error', 'No media available for download');
        return;
      }

      setIsDownloading(true);
      console.log('📥 Starting direct download for generation:', generation.id);

      // Direct download without API call
      const link = document.createElement('a');
      link.href = url;
      
      // Determine file extension based on generation type
      let extension = 'file';
      if (generation.type === 'video') {
        extension = 'mp4';
      } else if (generation.type === 'image' || generation.type === 'enhancement') {
        extension = 'png';
      } else if (generation.type === '3d') {
        extension = 'obj';
      } else if (generation.type === 'audio') {
        extension = 'mp3';
      }
      
      link.download = `ai-generation-${generation.id}.${extension}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Download Started', 'Download started!');
    } catch (error) {
      console.error('❌ Download error:', error);
      showError('Download Failed', 'Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getMediaUrl = (item: Generation) => {
    if (item.type === 'video') {
      return item.videoUrl;
    } else if (item.type === 'enhancement') {
      return item.enhancedImageUrl || item.imageUrl;
    } else if (item.type === '3d') {
      return item.threeDUrl;
    } else {
      return item.imageUrl;
    }
  };

  // Get all available images for a generation
  const getAvailableImages = (item: Generation): string[] => {
    const images: string[] = [];

    // For uploaded files, prioritize S3 URL
    if (item.metadata?.isUploaded && item.metadata?.s3Url) {
      images.push(item.metadata.s3Url);
    }

    // For videos, prioritize videoUrl
    if (item.type === 'video' && item.videoUrl) {
      images.push(item.videoUrl);
    }

    // For 3D models, prioritize threeDUrl
    if (item.type === '3d' && item.threeDUrl) {
      images.push(item.threeDUrl);
    }

    // Add resultUrl first (main generated image/video)
    if ((item as any).resultUrl) {
      images.push((item as any).resultUrl);
    }

    // Add original image if exists (for image-to-image transformations)
    if ((item as any).metadata?.originalImageUrl) {
      images.push((item as any).metadata.originalImageUrl);
    }

    // Add regeneration results if they exist
    if ((item as any).regenerations && Array.isArray((item as any).regenerations)) {
      (item as any).regenerations.forEach((regeneration: any) => {
        if (regeneration.resultUrl) {
          images.push(regeneration.resultUrl);
        }
      });
    }

    // Fallback to other URLs if no resultUrl
    if (images.length === 0) {
      if (item.imageUrl) images.push(item.imageUrl);
      if (item.videoUrl) images.push(item.videoUrl);
      if (item.enhancedImageUrl) images.push(item.enhancedImageUrl);
      if (item.threeDUrl) images.push(item.threeDUrl);
    }

    return images;
  };

  // Initialize carousel state for a generation
  useEffect(() => {
    const newCarouselStates: { [key: string]: { currentIndex: number; images: string[] } } = {};

    history.forEach((item) => {
      const images = getAvailableImages(item);
      if (images.length > 1) {
        newCarouselStates[item.id] = {
          currentIndex: 0,
          images: images
        };
      }
    });

    setCarouselStates(newCarouselStates);
  }, [history]);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    Object.keys(carouselStates).forEach((generationId) => {
      const interval = setInterval(() => {
        setCarouselStates(prev => {
          const current = prev[generationId];
          if (current && current.images.length > 1) {
            return {
              ...prev,
              [generationId]: {
                ...current,
                currentIndex: (current.currentIndex + 1) % current.images.length
              }
            };
          }
          return prev;
        });
      }, 5000);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [carouselStates]);

  // Manual carousel navigation
  const handleDotClick = (generationId: string, index: number) => {
    setCarouselStates(prev => ({
      ...prev,
      [generationId]: {
        ...prev[generationId],
        currentIndex: index,
        images: prev[generationId]?.images || []
      }
    }));
  };

  const getCurrentImageUrl = (item: Generation): string | null => {
    const images = getAvailableImages(item);

    if (images.length === 0) return null;

    // If only one image, return it
    if (images.length === 1) return images[0] || null;

    // If multiple images, use carousel state
    const carouselState = carouselStates[item.id];
    if (carouselState) {
      return carouselState.images[carouselState.currentIndex] || null;
    }

    return images[0] || null;
  };

  const getPreviewContent = (item: Generation) => {
    const imageUrl = getCurrentImageUrl(item);

    // For processing videos, show processing indicator
    if (item.type === 'video' && item.status === 'processing') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-3">🎬</div>
            <div className="text-sm text-yellow-400 animate-pulse">Processing video...</div>
          </div>
        </div>
      );
    }

    // Check if it's an uploaded PDF document (only for PDFs, not images)
    if (item.metadata?.isUploaded) {
      const isPdf = item.metadata?.fileType === 'application/pdf' || 
                   item.metadata?.originalFileName?.toLowerCase().endsWith('.pdf') ||
                   item.metadata?.s3Url?.toLowerCase().includes('.pdf') ||
                   (item.metadata?.fileType?.includes('pdf')) ||
                   (item.metadata?.originalFileName?.toLowerCase().includes('pdf'));
      
      const isImage = item.metadata?.fileType?.startsWith('image/') || 
                     item.metadata?.originalFileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
      
      if (isPdf) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">PDF Document</h3>
              <p className="text-gray-300 text-sm">{item.metadata?.originalFileName || 'Document'}</p>
            </div>
          </div>
        );
      } else if (isImage) {
        // For uploaded images, show the actual image
        return (
          <img
            src={item.metadata?.s3Url}
            alt="Uploaded image"
            className="w-full h-full object-contain rounded-xl max-h-screen"
            onError={(e) => {
              console.error('Image preview error:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      } else {
        // Other uploaded documents (not PDF, not image)
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Document</h3>
              <p className="text-gray-300 text-sm mb-4">{item.metadata?.originalFileName || 'Document'}</p>
              <a 
                href={item.metadata?.s3Url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Open Document
              </a>
            </div>
          </div>
        );
      }
    }

    if (imageUrl && (item.status === 'completed' || item.status === 'success')) {
      // Check if it's a 3D model
      if (item.type === '3d' || imageUrl.includes('.glb') || imageUrl.includes('.gltf')) {
        return (
          <div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-xl overflow-hidden group">
            {/* 3D Model Container */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {/* 3D Model Preview Area */}
              <div className="relative w-full h-full max-w-sm">
                {/* Show video if available (turntable) */}
                {item.metadata?.combinedVideo ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/20">
                    <video
                      src={item.metadata.combinedVideo}
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
                        <p className="text-white/80 text-xs truncate">{item.prompt}</p>
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
                      <p className="text-gray-300 text-sm mb-4 max-w-xs truncate">{item.prompt}</p>
                    </div>
                  </div>)
                )}
                
                {/* Download Button Overlay */}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <a 
                    href={imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <Download className="w-3 h-3" />
                    GLB
                  </a>
                  {item.metadata?.combinedVideo && (
                    <a 
                      href={item.metadata.combinedVideo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-all duration-200 backdrop-blur-sm"
                    >
                      <Download className="w-3 h-3" />
                      Video
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* Subtle animation overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        );
      }
      // Check if it's a video
      else if (item.type === 'video' || imageUrl.includes('.mp4') || imageUrl.includes('video')) {
        return (
          <video
            src={imageUrl}
            className="w-full h-full object-contain rounded-xl"
            muted
            preload="metadata"
            controls
            onError={(e) => {
              console.error('Video preview error:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      } else {
        return (
          <img
            src={imageUrl}
            alt="Generated image"
            className="w-full h-full object-contain rounded-xl max-h-screen"
            onError={(e) => {
              console.error('Image preview error:', e);
              // Show placeholder instead of hiding
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+Cjwvc3ZnPgo=';
            }}
          />
        );
      }
    } else {
      return (
        <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">
            {item.type === 'video' ? '🎬' : 
             item.type === '3d' ? '🎲' : 
             '🖼️'}
          </span>
        </div>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Processing
          </span>
        );
      case 'completed':
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  // Get appropriate tag for the item
  const getItemTag = (item: Generation) => {
    // If it's an uploaded file, no tag needed
    if (item.metadata?.isUploaded) {
      return null;
    }

    // If it's AI generated (not uploaded), show "AI Generated" tag
    // Only show for actual AI-generated content (not uploaded files)
    if (!item.metadata?.isUploaded && (item.type === 'image' || item.type === 'video' || item.type === 'audio' || item.type === 'enhancement')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
          AI Generated
        </span>
      );
    }

    return null;
  };

  const isDocumentFile = (fileType: string) => {
    return fileType.includes('pdf') ||
      fileType.includes('powerpoint') ||
      fileType.includes('presentation') ||
      fileType.includes('excel') ||
      fileType.includes('spreadsheet') ||
      fileType.includes('text');
  };

  // Replace pagination handlers with carousel handlers
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, sortedHistory.length - itemsPerPage);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Helper functions to determine arrow visibility
  const canGoPrevious = () => {
    return sortedHistory.length > itemsPerPage && currentIndex > 0;
  };

  const canGoNext = () => {
    return sortedHistory.length > itemsPerPage && currentIndex < sortedHistory.length - itemsPerPage;
  };

  // Get items for current carousel position - simple slice
  const getCurrentItems = () => {
    if (sortedHistory.length === 0) return [];
    
    // For collapsed view, return all items for smooth sliding
    // For expanded view, return only the current visible items
    if (isExpanded) {
      // Show only the current carousel items (5 items max)
      if (sortedHistory.length <= itemsPerPage) {
        return sortedHistory;
      }
      return sortedHistory.slice(currentIndex, currentIndex + itemsPerPage);
    }
    
    // Return all items for collapsed view sliding
    return sortedHistory;
  };
  return (
    <section className="mt-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Library</h2>
          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUploadDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-lg transition-all duration-300"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload</span>
            </motion.button>

            {/* Expand/Collapse Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all duration-300"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="text-sm">Collapse</span>
              </>
            ) : (
              <>
                <Expand className="w-4 h-4" />
                <span className="text-sm">Expand</span>
              </>
            )}
          </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all duration-300"
          />
        </div>

        <div className="flex justify-end">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {(Object.keys(FILTER_LABELS) as HistoryFilter[]).map((filterKey) => (
              <motion.button
                key={filterKey}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFilter(filterKey);
                  setCurrentIndex(0); // Reset carousel position when filter changes
                }}
                className={`
                  px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all duration-300 min-h-[44px] sm:min-h-[auto] touch-manipulation whitespace-nowrap flex-shrink-0
                  ${filter === filterKey
                    ? 'bg-[rgba(255,255,255,0.1)] border border-white/10 text-white'
                    : 'bg-[rgba(255,255,255,0.05)] border border-white/5 text-slate-400 hover:bg-[rgba(255,255,255,0.08)]'
                  }
                `}
              >
                {FILTER_LABELS[filterKey]}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden">
        {/* Navigation arrows - only show in collapsed mode */}
        {!isExpanded && canGoPrevious() && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200/80 transition-all duration-300 shadow-lg"
          >
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" stroke="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {!isExpanded && canGoNext() && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200/80 transition-all duration-300 shadow-lg"
          >
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" stroke="none" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Content Container - Different layouts based on expanded state */}
        <div className="relative">
          {isExpanded ? (
            // Expanded view - grid layout with same 5 items
            (<div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {getCurrentItems().length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-slate-400 text-sm">No items found</p>
                </div>
              ) : (
                getCurrentItems().map((item, index) => {
                  const images = getAvailableImages(item);
                  const hasMultipleImages = images.length > 1;

                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                      onClick={() => {
                        if (item.status === 'completed' || item.status === 'success') {
                          handleOpenModal(item);
                        }
                      }}
                    >
                      {/* Media Container */}
                      <div className="relative w-full h-64 sm:h-72 mb-4">
                        {item.status === 'processing' ? (
                          <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl mb-3">{item.type === 'video' ? '🎬' : '🎨'}</div>
                              <div className="text-sm text-yellow-400 animate-pulse">Rendering…</div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            {getPreviewContent(item)}
                            
                            {/* Regenerate Icon - Top right for AI generated content with attempts left */}
                            {(item.status === 'completed' || item.status === 'success') && item.retryCount < 3 && !item.metadata?.isUploaded && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegenerate(item);
                                }}
                                className="absolute top-2 right-2 w-8 h-8 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-[rgba(0,0,0,0.8)] transition-all duration-300 z-10 group"
                                title={`Regenerate (${3 - item.retryCount} attempts left)`}
                              >
                                <div className="relative">
                                  <RotateCcw className="w-4 h-4" />
                                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {3 - item.retryCount}
                                  </span>
                                </div>
                              </button>
                            )}

                            {/* Carousel indicators - only show if multiple images */}
                            {hasMultipleImages && (
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                                {images.map((_, imageIndex) => {
                                  const carouselState = carouselStates[item.id];
                                  const isActive = carouselState ? carouselState.currentIndex === imageIndex : imageIndex === 0;
                                  return (
                                    <div
                                      key={imageIndex}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDotClick(item.id, imageIndex);
                                      }}
                                      className={`glass w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${isActive ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                                        }`}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Title and Cost */}
                      <div className="space-y-3">
                        <h4 className="text-base font-medium text-white line-clamp-2">
                          {item.prompt || (item.status === 'processing' ? 'Drone city sunrise' : 'Make it black and white')}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          {item.status === 'processing' ? (
                            <span className="text-xs text-yellow-400">Processing…</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {item.cost > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgba(255,255,255,0.05)] text-slate-400 text-xs rounded-full">
                              {item.cost} XUT
                            </span>
                          )}
                              {getItemTag(item)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>)
          ) : (
            // Collapsed view - sliding carousel with proper spacing
            (<div className="overflow-hidden px-24">
              <div 
                className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
                }}
              >
                {getCurrentItems().length === 0 ? (
                  <div className="w-full text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-slate-400 text-sm">No items found</p>
                  </div>
                ) : (
                  getCurrentItems().map((item, index) => {
                    const images = getAvailableImages(item);
                    const hasMultipleImages = images.length > 1;

                    return (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex-shrink-0 bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                        style={{ width: `${100 / itemsPerPage}%` }}
                        onClick={() => {
                          if (item.status === 'completed' || item.status === 'success') {
                            handleOpenModal(item);
                          }
                        }}
                      >
                        {/* Media Container */}
                        <div className="relative w-full h-48 mb-4">
                          {item.status === 'processing' ? (
                            <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-3xl mb-3">{item.type === 'video' ? '🎬' : '🎨'}</div>
                                <div className="text-sm text-yellow-400 animate-pulse">Rendering…</div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full h-full">
                              {getPreviewContent(item)}
                              
                              {/* Regenerate Icon - Top right for AI generated content with attempts left */}
                              {(item.status === 'completed' || item.status === 'success') && item.retryCount < 3 && !item.metadata?.isUploaded && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRegenerate(item);
                                  }}
                                  className="absolute top-2 right-2 w-8 h-8 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-[rgba(0,0,0,0.8)] transition-all duration-300 z-10 group"
                                  title={`Regenerate (${3 - item.retryCount} attempts left)`}
                                >
                                  <div className="relative">
                                    <RotateCcw className="w-4 h-4" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                      {3 - item.retryCount}
                                    </span>
                                  </div>
                                </button>
                              )}

                              {/* Carousel indicators - only show if multiple images */}
                              {hasMultipleImages && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                                  {images.map((_, imageIndex) => {
                                    const carouselState = carouselStates[item.id];
                                    const isActive = carouselState ? carouselState.currentIndex === imageIndex : imageIndex === 0;
                                    return (
                                      <div
                                        key={imageIndex}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDotClick(item.id, imageIndex);
                                        }}
                                        className={`glass w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${isActive ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                                          }`}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Title and Cost */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white line-clamp-2">
                            {item.prompt || (item.status === 'processing' ? 'Drone city sunrise' : 'Make it black and white')}
                          </h4>
                          
                          <div className="flex items-center justify-between">
                            {item.status === 'processing' ? (
                              <span className="text-xs text-yellow-400">Processing…</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                {item.cost > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgba(255,255,255,0.05)] text-slate-400 text-xs rounded-full">
                                {item.cost} XUT
                              </span>
                            )}
                                {getItemTag(item)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>)
          )}
        </div>
      </div>
      <div className='h-16'></div>
      {/* Generation Details Modal */}
      <GenerationDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        generation={selectedGeneration}
        onRegenerate={handleRegenerate}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      {/* Upload Drawer */}
      <UploadDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onUploadComplete={async (files) => {
          console.log('Files uploaded:', files);

          // Note: Files are already added to history by uploadDocument action
          // No need to call addUploadedFile as it would create duplicates

          showSuccess('Upload Successful', `Successfully uploaded ${files.length} file(s) to library`);

          // Open appropriate modal with the first uploaded file
          if (files.length > 0) {
            const firstFile = files[0];
            if (!firstFile) return;

            // Check if it's a document file
            if (isDocumentFile(firstFile.file.type)) {
              setSelectedDocument({
                file: firstFile.file,
                title: firstFile.title || firstFile.file.name.split('.')[0] || 'Untitled',
                description: firstFile.description || ''
              });
              setIsDocumentViewerOpen(true);
            } else {
              // For media files, open uploaded file modal
              setSelectedUploadedFile({
                file: firstFile.file,
                title: firstFile.title || firstFile.file.name.split('.')[0] || 'Untitled',
                description: firstFile.description || '',
                imageUrl: firstFile.file.type.startsWith('image/') ? URL.createObjectURL(firstFile.file) : undefined
              });
              setIsUploadedFileModalOpen(true);
            }
          }
        }}
      />
      {/* Uploaded File Modal */}
      {selectedUploadedFile && (
        <UploadedFileModal
          isOpen={isUploadedFileModalOpen}
          onClose={() => {
            setIsUploadedFileModalOpen(false);
            setSelectedUploadedFile(null);
          }}
          file={selectedUploadedFile.file}
          title={selectedUploadedFile.title}
          description={selectedUploadedFile.description}
          imageUrl={selectedUploadedFile.imageUrl}
          onActionSelect={handleUploadedFileActionSelect}
        />
      )}
      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          isOpen={isDocumentViewerOpen}
          onClose={() => {
            setIsDocumentViewerOpen(false);
            setSelectedDocument(null);
          }}
          file={selectedDocument.file}
          title={selectedDocument.title}
          description={selectedDocument.description}
          onUseAIBot={handleUseAIBot}
        />
      )}
    </section>
  );
}

// Extracted HistoryItem component for reusability
function HistoryItem({ 
  item, 
  onOpenModal, 
  onRegenerate 
}: { 
  item: Generation; 
  onOpenModal: (item: Generation) => void; 
  onRegenerate: (item: Generation) => void; 
}) {
  const getMediaUrl = (item: Generation) => {
    if (item.type === 'video') {
      return item.videoUrl;
    } else if (item.type === 'enhancement') {
      return item.enhancedImageUrl || item.imageUrl;
    } else if (item.type === '3d') {
      return item.threeDUrl;
    } else {
      return item.imageUrl;
    }
  };

  const getPreviewContent = (item: Generation) => {
    console.log('getPreviewContent called for item:', {
      id: item.id,
      type: item.type,
      status: item.status,
      musicUrl: item.musicUrl,
      audioUrl: item.audioUrl
    });
    
    // For processing videos, show processing indicator
    if (item.type === 'video' && item.status === 'processing') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-3">🎬</div>
            <div className="text-sm text-yellow-400 animate-pulse">Processing video...</div>
          </div>
        </div>
      );
    }

    // For uploaded files, prioritize S3 URL
    if (item.metadata?.isUploaded && item.metadata?.s3Url) {
      if (item.type === 'video' || item.metadata.s3Url.includes('.mp4') || item.metadata.s3Url.includes('video')) {
        return (
          <video 
            src={item.metadata.s3Url} 
            className="w-full h-full object-contain rounded-xl max-h-screen"
            muted
            preload="metadata"
            controls
            onError={(e) => {
              console.error('Video preview error:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      } else {
        // Check if it's a PDF document - enhanced detection for uploaded documents
        const isPdf = item.metadata?.fileType === 'application/pdf' || 
                     item.metadata?.originalFileName?.toLowerCase().endsWith('.pdf') ||
                     item.metadata?.s3Url?.toLowerCase().includes('.pdf') ||
                     // Additional checks for uploaded documents
                     (item.metadata?.isUploaded && item.metadata?.fileType?.includes('pdf')) ||
                     (item.metadata?.isUploaded && item.metadata?.originalFileName?.toLowerCase().includes('pdf')) ||
                     // Check if it's an uploaded document with no imageUrl but has s3Url (likely PDF)
                     (item.metadata?.isUploaded && !item.imageUrl && item.metadata?.s3Url);
        
        // Debug logging for uploaded documents
        if (item.metadata?.isUploaded) {
          console.log('🔍 Uploaded document preview check:', {
            id: item.id,
            prompt: item.prompt,
            type: item.type,
            fileType: item.metadata?.fileType,
            originalFileName: item.metadata?.originalFileName,
            s3Url: item.metadata?.s3Url,
            imageUrl: item.imageUrl,
            isPdf,
            isUploaded: item.metadata?.isUploaded
          });
        }
        
        if (isPdf) {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">PDF Document</h3>
                <p className="text-gray-300 text-sm mb-4">{item.metadata?.originalFileName || 'Document'}</p>
                <a 
                  href={item.metadata.s3Url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Open PDF
                </a>
              </div>
            </div>
          );
        } else if (item.metadata?.isUploaded) {
          // Fallback for uploaded documents that aren't PDFs
          return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Document</h3>
                <p className="text-gray-300 text-sm mb-4">{item.metadata?.originalFileName || item.prompt || 'Document'}</p>
                <a 
                  href={item.metadata?.s3Url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Open Document
                </a>
              </div>
            </div>
          );
        } else {
          return (
            <img 
              src={item.metadata.s3Url} 
              alt="Uploaded image" 
              className="w-full h-full object-contain rounded-xl max-h-screen"
              onError={(e) => {
                console.error('Image preview error:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          );
        }
      }
    }

    if (item.type === 'video') {
      // Show actual video or thumbnail if available
      if (item.videoUrl && (item.status === 'completed' || item.status === 'success')) {
        return (
          <video 
            src={item.videoUrl} 
            className="w-full h-full object-contain rounded-xl max-h-screen"
            muted
            preload="metadata"
            controls
            onError={(e) => {
              console.error('Video preview error:', e);
              // Fallback to icon on error
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      } else if (item.thumbnailUrl && (item.status === 'completed' || item.status === 'success')) {
        return (
          <img 
            src={item.thumbnailUrl} 
            alt="Video thumbnail" 
            className="w-full h-full object-contain rounded-xl max-h-screen"
            onError={(e) => {
              console.error('Thumbnail preview error:', e);
              // Fallback to icon on error
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      } else {
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎬</span>
          </div>
        );
      }
    } else if (item.type === 'image' || item.type === 'enhancement') {
      // Show actual image if available
      const imageUrl = item.enhancedImageUrl || item.imageUrl;
      if (imageUrl && (item.status === 'completed' || item.status === 'success')) {
        return (
          <img 
            src={imageUrl} 
            alt="Generated image" 
            className="w-full h-full object-contain rounded-xl max-h-screen"
            onError={(e) => {
              console.error('Image preview error:', e);
              // Fallback to icon on error
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      } else {
        return (
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🖼️</span>
          </div>
        );
      }
    } else if (item.type === 'music' || item.type === 'audio') {
      // Show music/audio preview
      const audioUrl = item.musicUrl || item.audioUrl;
      if (audioUrl && (item.status === 'completed' || item.status === 'success')) {
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <audio 
              src={audioUrl} 
              controls
              className="w-full h-full"
              onError={(e) => {
                console.error('Audio preview error:', e);
                // Fallback to icon on error
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );
      } else {
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
        );
      }
    }

    // Default fallback
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
        <span className="text-2xl">🎨</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-[rgba(255,255,255,0.08)] transition-colors h-full"
    >
      {/* Thumbnail - Clickable if completed */}
      <div 
        className={`aspect-square rounded-xl overflow-hidden mb-3 bg-[rgba(255,255,255,0.05)] flex items-center justify-center ${(item.status === 'completed' || item.status === 'success')
            ? 'cursor-pointer hover:ring-2 hover:ring-[var(--color-primary)] transition-all touch-manipulation' 
            : ''
        }`}
        onClick={() => {
          if (item.status === 'completed' || item.status === 'success') {
            onOpenModal(item);
          }
        }}
      >
        {item.status === 'processing' ? (
          <div className="text-center">
            <div className="text-2xl mb-2">
              {item.type === 'video' ? '🎬' : 
               item.type === 'music' || item.type === 'audio' ? '🎵' :
               '🎨'}
            </div>
            <div className="text-xs text-yellow-400 animate-pulse">Rendering…</div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {getPreviewContent(item)}
            {/* Click indicator overlay for completed items */}
            {(item.status === 'completed' || item.status === 'success') && (
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <span className="text-white text-xl">🔍</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-white line-clamp-2 mb-2">
        {item.prompt || (item.status === 'processing' ? 'Drone city sunrise' : 'Make it black and white')}
      </h4>

      {/* Status/Cost */}
      <div className="flex items-center justify-between mb-3">
        {item.status === 'processing' ? (
          <span className="text-xs text-yellow-400">Processing…</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgba(255,255,255,0.05)] text-slate-400 text-xs rounded-full">
            {item.cost} XUT
          </span>
        )}
      </div>

      {/* Regenerate button for completed items */}
      {(item.status === 'completed' || item.status === 'success') && item.retryCount < 3 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onRegenerate(item)}
          className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-white/10 text-slate-400 text-xs sm:text-sm font-medium rounded-xl hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 min-h-[44px] touch-manipulation"
        >
          Regenerate ({3 - item.retryCount} attempts left)
        </motion.button>
      )}
    </motion.div>
  );
}