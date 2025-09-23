/**
 * Type definitions for AI Studio Ad functionality
 */

export interface AIStudioGeneration {
  id: string;
  type: 'image' | 'video' | 'enhancement' | 'audio' | 'music' | '3d';
  prompt: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  musicUrl?: string;
  threeDUrl?: string;
  originalImageUrl?: string;
  enhancedImageUrl?: string;
  status: 'completed' | 'failed' | 'processing' | 'success' | 'pending';
  cost: number;
  createdAt: string;
  retryCount: number;
  tokensDeducted: boolean;
  // Additional fields for audio and 3D
  audioType?: 'music' | 'voice' | 'effects';
  genre?: string;
  duration?: number;
  objectType?: 'character' | 'object' | 'environment';
  style?: string;
}

export interface AIStudioAdSubmission {
  generationId: string;
  type: 'image' | 'video' | 'enhancement' | 'audio' | 'music' | '3d';
  prompt: string;
  mediaUrl: string;
  title?: string;
  description?: string;
  targetAudience?: string;
  notes?: string;
  machineId?: string;
}

export interface AIStudioAdSubmissionResponse {
  success: boolean;
  data?: {
    submissionId: string;
    status: string;
    message: string;
    redirectUrl?: string;
  };
  error?: string;
}

export interface AIStudioAdSubmissionParams {
  aiStudio: boolean;
  generationId?: string;
  type?: string;
  prompt?: string;
  mediaUrl?: string;
  machineId?: string;
}

export interface KioskAdFormData {
  title: string;
  description: string;
  paymentAmount: string;
  machineId: string;
  tabId: string;
  videoFile?: File;
  thumbnailFile?: File;
  aiStudioData?: AIStudioAdSubmission;
}

export type AIStudioGenerationType = 'image' | 'video' | 'enhancement' | 'audio' | 'music' | '3d';
export type AIStudioGenerationStatus = 'completed' | 'failed' | 'processing' | 'success' | 'pending';
export type AIStudioAdSubmissionStatus = 'pending' | 'approved' | 'rejected' | 'published';