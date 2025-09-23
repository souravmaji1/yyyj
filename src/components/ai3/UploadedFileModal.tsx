"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, Music, File, Zap, Box, ShoppingCart, RefreshCw } from 'lucide-react';
import {
    AiOutlineClockCircle,
    AiOutlineReload,
} from "react-icons/ai";

interface UploadedFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File;
  title: string;
  description?: string;
  imageUrl?: string;
  onActionSelect: (action: string, file: File, title: string) => void;
}

interface Action {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  credits: number;
}

const getAvailableActions = (fileType: string): Action[] => {
  const commonActions = [
    {
      id: 'get-on-product',
      name: 'Get on Product',
      icon: ShoppingCart,
      description: 'Use this media on your products',
      credits: 5
    }
  ];

  if (fileType.startsWith('image/')) {
    return [
      {
        id: 'image-to-image',
        name: 'Image to Image',
        icon: Image,
        description: 'Transform your image with AI',
        credits: 15
      },
      {
        id: 'image-to-video',
        name: 'Image to Video',
        icon: Video,
        description: 'Create video from your image',
        credits: 25
      },
      {
        id: 'enhance',
        name: 'Enhance',
        icon: Zap,
        description: 'Improve image quality and details',
        credits: 10
      },
      {
        id: '3d-object',
        name: '3D Object',
        icon: Box,
        description: 'Convert to 3D object',
        credits: 20
      },
      {
        id: 'image-swapping',
        name: 'Image Swapping',
        icon: RefreshCw,
        description: 'Swap objects in your image',
        credits: 18
      },
      ...commonActions
    ];
  } else if (fileType.startsWith('video/')) {
    return [
      {
        id: 'video-enhance',
        name: 'Video Enhance',
        icon: Zap,
        description: 'Improve video quality and details',
        credits: 30
      },
      {
        id: 'video-to-image',
        name: 'Video to Image',
        icon: Image,
        description: 'Extract frames from video',
        credits: 15
      },
      ...commonActions
    ];
  } else if (fileType.startsWith('audio/')) {
    return [
      {
        id: 'audio-enhance',
        name: 'Audio Enhance',
        icon: Music,
        description: 'Improve audio quality and clarity',
        credits: 20
      },
      ...commonActions
    ];
  }
  
  return commonActions;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function UploadedFileModal({ 
  isOpen, 
  onClose, 
  file, 
  title, 
  description,
  imageUrl,
  onActionSelect 
}: UploadedFileModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  const availableActions = getAvailableActions(file.type);
  const selectedActionData = availableActions.find(action => action.id === selectedAction);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    return File;
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full h-fullbg-[#0F1629] overflow-auto"
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
                  Uploaded File Details
                </h2>
              </div>

              {/* Content Layout */}
              <div className="space-y-8">
                {/* File Preview Section with Available Actions */}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* File Preview */}
                  <div className="w-full lg:w-1/3">
                    <h3 className="text-lg font-medium text-gray-400 mb-4">
                      Uploaded File
                    </h3>
                    <div className="w-full h-96 rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.05)]">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={imageUrl || URL.createObjectURL(file)}
                          alt={title}
                          className="w-full h-full object-contain"
                        />
                      ) : file.type.startsWith('video/') ? (
                        <video
                          src={imageUrl || URL.createObjectURL(file)}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {React.createElement(getFileIcon(), { className: "w-16 h-16 text-slate-400" })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Actions */}
                  <div className="w-full lg:w-2/3">
                    <h3 className="text-lg font-medium text-gray-400 mb-4">
                      Available Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableActions.map((action) => (
                        <motion.div
                          key={action.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleActionSelect(action.id)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all duration-200
                            ${selectedAction === action.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-white/10 hover:border-white/30 bg-white/5'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {React.createElement(action.icon, { className: "w-5 h-5 text-slate-400" })}
                            <h4 className="text-base font-medium text-white">{action.name}</h4>
                            <span className="ml-auto text-sm text-blue-400 font-medium">{action.credits} XUT</span>
                          </div>
                          <p className="text-sm text-slate-400">{action.description}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Selected Action Details - Directly under Available Actions */}
                    {selectedAction && selectedActionData && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-400 mb-4">
                          Action Details
                        </h3>
                        <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            {React.createElement(selectedActionData.icon, { className: "w-6 h-6 text-blue-400" })}
                            <h4 className="text-lg font-medium text-white">{selectedActionData.name}</h4>
                          </div>
                          <p className="text-slate-400 mb-6">{selectedActionData.description}</p>
                          
                          {/* Credits and Regenerations Cards - Like Generation Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-[rgba(59,130,246,0.1)] border border-blue-500/20 rounded-xl p-6">
                              <div className="flex items-center gap-3 mb-2">
                                <AiOutlineClockCircle className="text-blue-400 text-xl" />
                                <span className="text-sm text-blue-400 font-medium">
                                  CREDITS
                                </span>
                              </div>
                              <div className="text-white font-bold text-2xl">
                                {selectedActionData.credits} XUT
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
                                0/3
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onActionSelect(selectedAction, file, title)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                          >
                            Continue to Generation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Info Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-400 mb-4">File Information</h3>
                  <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">File Name</p>
                        <p className="text-white text-lg font-medium">{file.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Title</p>
                        <p className="text-white text-lg font-medium">{title}</p>
                      </div>
                      {description && (
                        <div className="md:col-span-2">
                          <p className="text-gray-400 text-sm mb-2">Description</p>
                          <p className="text-white text-lg leading-relaxed">{description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UploadedFileModal;