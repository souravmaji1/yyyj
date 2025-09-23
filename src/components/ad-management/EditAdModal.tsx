"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { X, Upload, Video, AlertCircle, Loader2, CalendarIcon, DollarSign, Type, FileText, Edit3 } from "lucide-react";
import { useNotification } from "@/src/contexts/NotificationContext";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { updateAdvertisement, clearUpdateAdStatus } from "@/src/store/slices/adManagementSlice";
import authAxiosClient from "@/src/app/apis/auth/axios";
import { Advertisement } from "@/src/store/slices/adManagementSlice";
import { useModalScrollLock } from "@/src/hooks/useModalScrollLock";

interface EditAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  advertisement: Advertisement;
}

interface FormData {
  title: string;
  description: string;
  machineId: string;
  startDate: string;
  endDate: string;
  amount: number;
}

interface MediaMetadata {
  width?: number;
  height?: number;
  size?: number;
  type?: string;
}

const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export function EditAdModal({ isOpen, onClose, onSuccess, advertisement }: EditAdModalProps) {
  const { showNotification } = useNotification();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { updateAdLoading, updateAdSuccess, updateAdError } = useSelector(
    (state: RootState) => state.adManagement
  );
  
  // Prevent body scrolling when modal is open - MUST BE AT TOP LEVEL
  useModalScrollLock(isOpen);
  
  // Helper function to convert ISO date to local date string
  const convertToLocalDate = (isoDateString: string): string => {
    if (!isoDateString) return '';
    
    // Parse the ISO date and adjust for timezone
    const date = new Date(isoDateString);
    
    // Get the date components in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<FormData>({
    title: advertisement.title,
    description: advertisement.description,
    machineId: advertisement.machineId,
    startDate: convertToLocalDate(advertisement.startDate),
    endDate: convertToLocalDate(advertisement.endDate),
    amount: advertisement.amount || 1,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [keepExistingMedia, setKeepExistingMedia] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle update success/error notifications
  useEffect(() => {
    if (updateAdSuccess) {
      showNotification({
        type: "success",
        title: "Success",
        message: "Advertisement updated successfully!",
      });
      dispatch(clearUpdateAdStatus());
      onSuccess();
    }
  }, [updateAdSuccess, showNotification, dispatch, onSuccess]);

  useEffect(() => {
    if (updateAdError) {
      showNotification({
        type: "error",
        title: "Error",
        message: updateAdError,
      });
      dispatch(clearUpdateAdStatus());
    }
  }, [updateAdError, showNotification, dispatch]);

  // Update end date minimum when start date changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      // If end date is before or equal to start date, clear it
      if (endDate <= startDate) {
        setFormData(prev => ({ ...prev, endDate: '' }));
      }
    }
  }, [formData.startDate]);

  // Auto-update dates when editing (only runs once when modal opens)
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 EditAdModal: Checking dates for auto-update...');
      
      // Get today's date at midnight (UTC timezone) for accurate comparison
      const today = new Date();
      const todayStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      
      const startDate = new Date(formData.startDate + 'T00:00:00Z');
      const endDate = new Date(formData.endDate + 'T23:59:59Z');
      
      console.log('📅 Date comparison:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        todayStart: todayStart.toISOString(),
        startDateBeforeToday: startDate < todayStart,
        endDateBeforeToday: endDate < todayStart
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const validateFile = (file: File): boolean => {
    // Check if file is video
    if (!file.type.startsWith('video/')) {
      showNotification({
        type: "error",
        title: "Invalid File Type",
        message: "Please upload a video file only",
      });
      return false;
    }

    // Check file size
    if (file.size > MAX_VIDEO_SIZE) {
      showNotification({
        type: "error",
        title: "File Too Large",
        message: "Video file size must be less than 10MB",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setKeepExistingMedia(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setKeepExistingMedia(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keepExistingMedia && !selectedFile) {
      showNotification({
        type: "error",
        title: "Video Required",
        message: "Please upload a new video file or keep the existing one",
      });
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.machineId.trim() || 
        !formData.startDate || !formData.endDate || formData.amount <= 0) {
      showNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields",
      });
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate + 'T00:00:00Z');
    const endDate = new Date(formData.endDate + 'T23:59:59Z');
    
    // Get today's date at midnight (UTC timezone) for accurate comparison
    const today = new Date();
    const todayStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    if (startDate < todayStart) {
      showNotification({
        type: "error",
        title: "Invalid Start Date",
        message: "Start date cannot be in the past",
      });
      return;
    }

    if (endDate <= startDate) {
      showNotification({
        type: "error",
        title: "Invalid End Date",
        message: "End date must be at least one day after start date",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      let videoUrl = advertisement.media[0]?.mediaUrl || '';

              // Upload new video if selected
        if (selectedFile && !keepExistingMedia) {
          const formDataToSend = new FormData();
          formDataToSend.append('files', selectedFile);
        
        // Video upload goes to PRODUCT service (S3) - NOT user service
        const uploadResponse = await authAxiosClient.post(
          `${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/shopify/upload-ad`, 
          formDataToSend, 
          {
            headers: { "Content-Type": "multipart/form-data" }
          }
        );

        if (!uploadResponse.data?.videos?.[0]) {
          throw new Error('Failed to upload video');
        }

        videoUrl = uploadResponse.data.videos[0];
      }

      // Update the advertisement using Redux - Don't include id field
      const adData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        machineId: formData.machineId.trim(),
        startDate: new Date(formData.startDate + 'T00:00:00Z').toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59Z').toISOString(),
        amount: Number(formData.amount), // Convert to number
        media: [{
          mediaType: 'video',
          mediaUrl: videoUrl,
          metadata: selectedFile && !keepExistingMedia ? {
            size: selectedFile.size,
            type: selectedFile.type
          } : advertisement.media[0]?.metadata
        }]
      };

      // Pass id separately, not in the request body
      await dispatch(updateAdvertisement({ id: advertisement.id, ...adData })).unwrap();
      
    } catch (error: any) {
      console.error('Error updating advertisement:', error);
      
      // Show specific error messages for different error types
      let errorMessage = "Failed to update advertisement. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification({
        type: "error",
        title: "Update Failed",
        message: errorMessage,
      });
      
      // Reset video upload state so user can try again
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-[var(--color-bg)] rounded-lg mx-2 sm:mx-0">
        <Card className="bg-[var(--color-bg)] border-slate-700 shadow-2xl">
          {/* Header */}
          <CardHeader className="border-b border-slate-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex-shrink-0">
                  <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    Edit Advertisement
                  </CardTitle>
                  <p className="text-gray-400 text-sm sm:text-base mt-1 truncate">
                    Update your advertisement details and settings
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-slate-700/50 text-white hover:text-white border border-slate-600 hover:border-slate-500 transition-all duration-200 flex-shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Important Alert */}
          <Alert className="bg-[var(--color-bg)] border-amber-500/50 text-amber-300 mx-6 mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              You can only edit advertisements that are in REJECTED status. All changes will be reviewed.
            </AlertDescription>
          </Alert>

          {/* Date Auto-Update Alert */}
          <Alert className="bg-[var(--color-bg)] border-blue-500/50 text-blue-300 mx-6 mt-4">
            <CalendarIcon className="h-4 w-4" />
            <AlertTitle>Automatic Date Updates</AlertTitle>
            <AlertDescription>
              Dates are automatically updated when editing: past start dates become today (00:00:00Z), past end dates are cleared if both dates are in the past.
            </AlertDescription>
          </Alert>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-6 pt-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                  Basic Information
                </h3>
                <Separator className="bg-slate-600" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-300">
                      Advertisement Title
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter advertisement title"
                      className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                      required
                      disabled={updateAdLoading || isUploading}
                    />
                  </div>

                  {/* Machine ID */}
                  <div className="space-y-2">
                    <Label htmlFor="machineId" className="text-slate-300">
                      Machine ID
                      <span className="text-red-500 ml-1">*</span>
                      <span className="text-blue-400 text-xs ml-2">(Cannot be changed)</span>
                    </Label>
                    <Input
                      id="machineId"
                      name="machineId"
                      value={formData.machineId}
                      onChange={handleInputChange}
                      placeholder="Machine ID (read-only)"
                      className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 cursor-not-allowed opacity-80"
                      disabled={updateAdLoading || isUploading || true}
                      readOnly={true}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Description
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your advertisement in detail"
                    rows={4}
                    className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none text-sm sm:text-base min-h-[120px] overflow-y-auto !ring-0 !ring-offset-0 focus-visible:!ring-0 focus-visible:!ring-offset-0"
                    required
                    disabled={updateAdLoading || isUploading}
                  />
                </div>
              </div>

              {/* Campaign Dates Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[var(--color-primary)]" />
                  Campaign Dates
                </h3>
                <Separator className="bg-slate-600" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-slate-300">
                      Start Date
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                                                 min={(() => {
                           const today = new Date();
                           const year = today.getFullYear();
                           const month = String(today.getMonth() + 1).padStart(2, '0');
                           const day = String(today.getDate()).padStart(2, '0');
                           return `${year}-${month}-${day}`;
                         })()}
                        className="flex h-10 w-full rounded-md border border-slate-600 bg-[var(--color-bg)] px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        style={{ 
                          colorScheme: 'dark',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                        disabled={updateAdLoading || isUploading}
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-slate-300">
                      End Date
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                                                 min={formData.startDate || (() => {
                           const today = new Date();
                           const year = today.getFullYear();
                           const month = String(today.getMonth() + 1).padStart(2, '0');
                           const day = String(today.getDate()).padStart(2, '0');
                           return `${year}-${month}-${day}`;
                         })()}
                        className="flex h-10 w-full rounded-md border border-slate-600 bg-[var(--color-bg)] px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        style={{ 
                          colorScheme: 'dark',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                        disabled={updateAdLoading || isUploading}
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-slate-300">
                      Budget Amount (XUT)
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="bg-[var(--color-bg)] border-slate-600 text-white placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                      required
                      disabled={updateAdLoading || isUploading}
                    />
                  </div>
                </div>
                
                {/* Date Update Info */}
                <div className="bg-[var(--color-bg)]/50 p-3 rounded-lg border border-blue-500/30 text-sm text-blue-300">
                  <div className="flex items-start gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-300 mb-1">Automatic Date Updates:</p>
                      <ul className="space-y-1 text-blue-200 text-xs">
                        <li>• <strong>Start Date:</strong> If in the past, automatically updated to today at 00:00:00Z</li>
                        <li>• <strong>End Date:</strong> If both dates are in the past, both are cleared for new selection</li>
                        <li>• <strong>Time Format:</strong> Start date uses 00:00:00Z, end date uses 23:59:59Z</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Upload Section */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Video className="h-5 w-5 text-[var(--color-primary)]" />
                  Video Content
                </h3>
                <Separator className="bg-slate-600" />

                                 {/* Current Video Display */}
                 <div className="bg-[var(--color-bg)]/50 p-4 rounded-lg border border-slate-600">
                   <div className="flex items-center gap-3 mb-3">
                     <Video className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0" />
                     <span className="text-slate-300 font-medium">Current Video</span>
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-start gap-2">
                       <span className="text-slate-400 text-sm font-medium min-w-[40px]">File:</span>
                       <div className="min-w-0 flex-1">
                         <p className="text-sm text-slate-300 break-all leading-relaxed">
                           {advertisement.media[0]?.mediaUrl?.split('/').pop() || 'Unknown'}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <span className="text-slate-400 text-sm font-medium min-w-[40px]">Size:</span>
                       <span className="text-sm text-slate-300">
                         {advertisement.media[0]?.metadata?.size ? 
                           `${(advertisement.media[0].metadata.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown'}
                       </span>
                     </div>
                   </div>
                                  </div>

                 <div className="space-y-3">
                   <Label className="text-slate-300">
                     New Video File (Optional)
                   </Label>
                  
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : selectedFile
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-slate-600 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 text-green-400">
                          <Video className="h-8 w-8 sm:h-10 sm:w-10" />
                          <div className="text-left min-w-0">
                            <div className="font-medium text-white text-sm sm:text-base truncate">{selectedFile.name}</div>
                            <div className="text-xs sm:text-sm text-slate-400">
                              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400">Uploading video...</p>
                          </div>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                          className="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 text-xs sm:text-sm transition-all duration-200"
                          disabled={isUploading}
                        >
                          Remove New File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-white font-medium text-base sm:text-lg">Drop new video here or click to browse</p>
                          <p className="text-xs sm:text-sm text-slate-400 mt-2">
                            Supported formats: MP4, AVI, MOV, WEBM • Max size: 10MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] text-sm sm:text-base"
                          disabled={isUploading}
                        >
                          Choose New Video File
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Requirements Info */}
              <div className="bg-[var(--color-bg)]/50 p-4 rounded-lg border border-slate-600 text-sm text-slate-300 mt-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-primary)] mb-3">Update Guidelines:</p>
                    <ul className="space-y-2 text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--color-primary)] mt-1">•</span>
                        <span>Only video files are accepted (MP4, AVI, MOV, WEBM, etc.)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--color-primary)] mt-1">•</span>
                        <span>Maximum file size: <strong>10MB</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--color-primary)] mt-1">•</span>
                        <span>All fields marked with <span className="text-red-500 font-bold">*</span> are required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--color-primary)] mt-1">•</span>
                        <span>If no new video is selected, the existing video will be kept</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--color-primary)] mt-1">•</span>
                        <span>Your updated advertisement will be reviewed before approval</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Footer with Action Buttons */}
            <CardFooter className="flex flex-col gap-4 bg-[var(--color-bg)] border-t border-slate-700 px-6 py-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-all disabled:opacity-50"
                disabled={updateAdLoading || isUploading}
              >
                {updateAdLoading || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading Video...' : 'Updating Advertisement...'}
                  </>
                ) : (
                  'Update Advertisement'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full border-slate-600 text-white bg-transparent hover:bg-slate-700/50 hover:border-slate-500"
                disabled={updateAdLoading || isUploading}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 