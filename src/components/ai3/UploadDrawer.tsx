"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, Image, Video, Music, File, Trash2 } from 'lucide-react';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { uploadDocument, deleteDocument } from '@/src/store/slices/aiStudioSlice';

interface UploadedFile {
  id: string;
  file: File;
  title?: string;
  description?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  documentId?: string; // Document ID from backend after upload
}

interface UploadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF' },
  'application/vnd.ms-powerpoint': { icon: FileText, label: 'PPT' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: FileText, label: 'PPTX' },
  'application/vnd.ms-excel': { icon: FileText, label: 'XLS' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileText, label: 'XLSX' },
  'text/plain': { icon: FileText, label: 'TXT' },
  'image/jpeg': { icon: Image, label: 'JPG' },
  'image/png': { icon: Image, label: 'PNG' },
  'audio/mpeg': { icon: Music, label: 'MP3' },
  'audio/wav': { icon: Music, label: 'WAV' },
  'video/mp4': { icon: Video, label: 'MP4' },
};

const ACCEPTED_EXTENSIONS = Object.keys(ACCEPTED_FILE_TYPES);

export default function UploadDrawer({ isOpen, onClose, onUploadComplete }: UploadDrawerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { showError, showSuccess } = useNotificationUtils();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';

      return () => {
        // Restore original styles
        document.body.style.overflow = originalStyle;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
      };
    }
    return undefined;
  }, [isOpen]);

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
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      ACCEPTED_EXTENSIONS.includes(file.type) || 
      ACCEPTED_EXTENSIONS.some(ext => {
        const extension = ext.split('/')[1];
        return extension ? file.name.toLowerCase().endsWith(extension) : false;
      })
    );

    if (validFiles.length !== files.length) {
      showError('File Type Error', 'Some files were skipped. Only PDF, PPT, XLS, TXT, JPG, PNG, MP3, WAV, MP4 files are supported.');
    }

    const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      title: file.name.split('.')[0],
      description: '',
      progress: 0,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
  };

  const updateFile = (id: string, updates: Partial<UploadedFile>) => {
    console.log('🔍 Updating file:', id, 'with updates:', updates);
    setUploadedFiles(prev => {
      const updated = prev.map(file => file.id === id ? { ...file, ...updates } : file);
      console.log('🔍 Updated files:', updated);
      return updated;
    });
  };

  const removeFile = async (id: string) => {
    console.log('🗑️ Remove file called with ID:', id);
    const fileToRemove = uploadedFiles.find(file => file.id === id);
    console.log('🔍 File to remove:', fileToRemove);
    console.log('🔍 Document ID:', fileToRemove?.documentId);
    
    if (fileToRemove?.documentId) {
      // If file has been uploaded to backend, call delete API
      try {
        console.log('🗑️ Deleting document from backend:', fileToRemove.documentId);
        await dispatch(deleteDocument(fileToRemove.documentId)).unwrap();
        console.log('✅ Document deleted from backend');
      } catch (error) {
        console.error('❌ Failed to delete document from backend:', error);
        showError('Delete Failed', 'Failed to delete document from server');
        return; // Don't remove from UI if backend delete failed
      }
    } else {
      console.log('⚠️ No documentId found, removing from local state only');
    }
    
    // Remove from local state
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
    console.log('✅ File removed from local state');
  };


  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    const successfulUploads: UploadedFile[] = [];

    try {
      for (const fileData of uploadedFiles) {
        updateFile(fileData.id, { status: 'uploading', progress: 0 });
        
        try {
          // Determine document type based on file type
          let documentType = 'document';
          if (fileData.file.type.startsWith('image/')) {
            documentType = 'image';
          } else if (fileData.file.type.startsWith('video/')) {
            documentType = 'video';
          } else if (fileData.file.type.startsWith('audio/')) {
            documentType = 'audio';
          } else if (fileData.file.type.includes('pdf')) {
            documentType = 'pdf';
          } else if (fileData.file.type.includes('presentation')) {
            documentType = 'presentation';
          } else if (fileData.file.type.includes('spreadsheet')) {
            documentType = 'spreadsheet';
          }

          // Simulate progress bar animation
          for (let progress = 0; progress <= 90; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            updateFile(fileData.id, { progress });
          }

          // Call the real upload API
          const result = await dispatch(uploadDocument({
            file: fileData.file,
            title: fileData.title || fileData.file.name.split('.')[0],
            description: fileData.description || '',
            documentType,
            isPublic: false,
            tags: []
          })).unwrap();

          // Store the document ID for future deletion
          const documentId = result.id;
          console.log('🔍 Setting documentId for file:', fileData.id, 'documentId:', documentId);
          updateFile(fileData.id, { 
            status: 'completed', 
            progress: 100,
            documentId: documentId
          });
          
          // Add documentId to the file data for successful uploads
          const fileWithDocumentId = { ...fileData, documentId };
          successfulUploads.push(fileWithDocumentId);
          
          console.log('✅ Document uploaded successfully:', result, 'Document ID:', documentId);
        } catch (error) {
          console.error('❌ Upload failed for file:', fileData.file.name, error);
          updateFile(fileData.id, { status: 'error' });
          showError('Upload Failed', `Failed to upload ${fileData.file.name}`);
        }
      }

      if (successfulUploads.length > 0) {
        showSuccess('Upload Successful', `Successfully uploaded ${successfulUploads.length} file(s). Documents are being processed in the background.`);
        onUploadComplete?.(successfulUploads);
      }

      // Reset form and close drawer
      setUploadedFiles([]);
      onClose();
    } catch (error) {
      console.error('❌ Upload process failed:', error);
      showError('Upload Error', 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const fileType = ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES];
    if (fileType) {
      const IconComponent = fileType.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F1629] border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Upload Files</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Dropzone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  dragOver 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                    : 'border-white/20 hover:border-white/40'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp3,.wav,.mp4"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-white font-medium mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-slate-400">
                  PDF, PPT, XLS, TXT, JPG, PNG, MP3, WAV, MP4
                </p>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium text-white">Files to Upload</h3>
                  
                  {uploadedFiles.map((fileData) => (
                    <div key={fileData.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      {/* File Header */}
                      <div className="flex items-center gap-3 mb-3">
                        {getFileIcon(fileData.file)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {fileData.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatFileSize(fileData.file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            console.log('🗑️ Delete button clicked for file:', fileData.id);
                            removeFile(fileData.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {fileData.status === 'uploading' && (
                        <div className="mb-3">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${fileData.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Uploading... {fileData.progress}%</p>
                        </div>
                      )}

                      {/* Status Messages */}
                      {fileData.status === 'completed' && (
                        <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-xs text-green-400">✅ Upload completed successfully</p>
                        </div>
                      )}

                      {fileData.status === 'error' && (
                        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-xs text-red-400">❌ Upload failed</p>
                        </div>
                      )}

                      {/* Title Input */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={fileData.title || ''}
                          onChange={(e) => updateFile(fileData.id, { title: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[var(--color-primary)]"
                          placeholder="Enter title"
                        />
                      </div>


                      {/* Description */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Description (optional)
                        </label>
                        <textarea
                          value={fileData.description || ''}
                          onChange={(e) => updateFile(fileData.id, { description: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none"
                          rows={2}
                          placeholder="Enter description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadedFiles.length === 0 || isUploading}
                  className="flex-1 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
