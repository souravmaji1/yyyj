import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiAxiosClient } from '@/src/app/apis/auth/axios';
import { RootState } from '@/src/store';
import { updateTokenBalance } from './userSlice';

// Types
export interface Generation {
  id: string;
  type: 'image' | 'video' | 'enhancement' | 'audio' | 'music' | '3d';
  prompt: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  musicUrl?: string;
  threeDUrl?: string;
  thumbnailUrl?: string;
  originalImageUrl?: string;
  enhancedImageUrl?: string;
  resultUrl?: string; // Add this for the final result URL
  status: 'processing' | 'completed' | 'success' | 'failed' | 'pending';
  cost: number;
  retryCount: number;
  tokensDeducted: boolean;
  createdAt: string;
  isDownloaded: boolean;
  // Audio-specific metadata
  audioType?: 'music' | 'voice' | 'effects';
  genre?: string;
  duration?: number;
  // 3D-specific metadata
  objectType?: 'character' | 'object' | 'environment';
  style?: string;
  jobId?: string;
  backendStatus?: string;
  metadata?: { // Add metadata interface
    cost?: number;
    size?: string;
    type?: string;
    style?: string;
    quality?: string;
    instructions?: string;
    originalImageUrl?: string;
    model?: string;
    source?: string;
    isUploaded?: boolean;
    originalFileName?: string;
    fileSize?: number;
    fileType?: string;
    description?: string;
    s3Url?: string;
    documentId?: string;
    sourceImageUrl?: string; // For face swap
    targetImageUrl?: string; // For face swap
    // 3D-specific metadata
    objectType?: 'character' | 'object' | 'environment';
    format?: string;
    polycount?: string;
    textureQuality?: string;
    combinedVideo?: string;
    modelFile?: string;
  };
}

export interface AIStudioState {
  isGenerating: boolean;
  currentGeneration: Generation | null;
  history: Generation[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AIStudioState = {
  isGenerating: false,
  currentGeneration: null,
  history: [],
  isLoading: false,
  error: null,
};

// Helper function to get user ID from Redux state or localStorage
const getUserId = (getState?: () => unknown): string => {
  // First try to get from Redux state if available
  if (getState) {
    const state = getState() as RootState;
    const userId = state.user?.profile?.id;
    if (userId) return userId;
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const userAuthDetails = JSON.parse(localStorage.getItem("userAuthDetails") || "{}");
    if (userAuthDetails.id) return userAuthDetails.id;
  }

  throw new Error('User not authenticated. Please log in to use AI Studio.');
};

// Async thunks
export const generateImage = createAsyncThunk(
  'aiStudio/generateImage',
  async ({ prompt, style, size, quality, cost }: { 
    prompt: string; 
    style?: string; 
    size?: string; 
    quality?: string; 
    cost: number; 
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);
      const response = await aiAxiosClient.post(`/ai-studio/generate-image`, {
        prompt,
        style,
        size,
        quality,
        userId
      });

      // Update user token balance if provided by backend
      if (response.data.data.newBalance !== undefined) {
        dispatch(updateTokenBalance(response.data.data.newBalance));
      }

      const generation: Generation = {
        id: response.data.data.id || `img-${Date.now()}`,
        type: 'image',
        prompt,
        imageUrl: response.data.data.imageUrl,
        status: 'success', // Backend now returns 'success' status
        cost,
        retryCount: 0,
        tokensDeducted: true, // Tokens deducted on first generation
        createdAt: response.data.data.createdAt || new Date().toISOString(),
        isDownloaded: false,
      };

      return generation;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate image');
    }
  }
);

export const enhanceImage = createAsyncThunk(
  'aiStudio/enhanceImage',
  async ({ formData, cost }: { formData: FormData; cost: number }, { getState, dispatch }) => {
    try {
      // userId is already included in formData from frontend

      const response = await aiAxiosClient.post(`/ai-studio/enhance-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Debug logging
      console.log(' enhanceImage API Response:', response.data);
      console.log(' Backend data structure:', {
        id: response.data.data?.id,
        enhancedImageUrl: response.data.data?.enhancedImageUrl,
        originalImageUrl: response.data.data?.originalImageUrl,
        status: response.data.data?.status,
        newBalance: response.data.data?.newBalance
      });
      if (response.data.data.newBalance !== undefined) {
        dispatch(updateTokenBalance(response.data.data.newBalance));
        console.log(' Updated token balance to:', response.data.data.newBalance);
      } else {
        console.log('No newBalance in response, balance not updated');
      }


      const generation: Generation = {
        id: response.data.data.id || `enhanced-${Date.now()}`,
        type: 'enhancement',
        prompt: 'Image Enhancement',
        enhancedImageUrl: response.data.data.enhancedImageUrl, // Backend returns 'enhancedImageUrl'
        status: 'completed',
        cost,
        retryCount: 0,
        tokensDeducted: true, // Tokens deducted on first generation
        createdAt: response.data.data.createdAt || new Date().toISOString(),
        isDownloaded: false,
      };

      return generation;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enhance image');
    }
  }
);

export const imageToImage = createAsyncThunk(
  'aiStudio/imageToImage',
  async ({ formData, cost }: { formData: FormData; cost: number }, { getState, dispatch }) => {
    try {
      // userId is already included in formData from frontend

      const response = await aiAxiosClient.post(`/ai-studio/image-to-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Debug logging
      console.log('🔍 imageToImage API Response:', response.data);
      console.log('🔍 Backend data structure:', {
        id: response.data.data?.id,
        imageUrl: response.data.data?.imageUrl,
        originalImageUrl: response.data.data?.originalImageUrl,
        status: response.data.data?.status,
        newBalance: response.data.data?.newBalance
      });

      // Update user token balance if provided by backend
      if (response.data.data.newBalance !== undefined) {
        dispatch(updateTokenBalance(response.data.data.newBalance));
        console.log('✅ Updated token balance to:', response.data.data.newBalance);
      } else {
        console.log('⚠️ No newBalance in response, balance not updated');
      }

      const generation: Generation = {
        id: response.data.data.id || `transformed-${Date.now()}`,
        type: 'image',
        prompt: 'Image Transformation',
        imageUrl: response.data.data.imageUrl, // Backend returns 'imageUrl', not 'transformedImageUrl'
        status: 'completed',
        cost,
        retryCount: 0,
        tokensDeducted: true, // Tokens deducted on first generation
        createdAt: response.data.data.createdAt || new Date().toISOString(),
        isDownloaded: false,
      };

      return generation;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to transform image');
    }
  }
);

export const generateVideo = createAsyncThunk(
  'aiStudio/generateVideo',
  async ({ prompt, motionType, duration, cost }: { 
    prompt: string; 
    motionType: string; 
    duration: number; 
    cost: number; 
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);

      // Backend now handles token deduction automatically
      const response = await aiAxiosClient.post(`/ai-studio/generate-video`, {
        prompt,
        motionType,
        duration,
        userId
      });

      // Update user token balance if provided by backend
      if (response.data.data.newBalance !== undefined) {
        dispatch(updateTokenBalance(response.data.data.newBalance));
      }

      // The API now returns a jobId for async processing
      const generation: Generation = {
        id: response.data.data.id || `video-${Date.now()}`,
        type: 'video',
        prompt,
        videoUrl: '', // Will be updated when job completes
        thumbnailUrl: '',
        status: 'processing', // Start with processing status
        cost,
        retryCount: 0,
        tokensDeducted: true, // Tokens deducted on first generation
        createdAt: response.data.data.createdAt || new Date().toISOString(),
        isDownloaded: false,
        jobId: response.data.data.jobId, // Store the job ID for status checking
      };

      return generation;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate video');
    }
  }
);

export const imageToVideo = createAsyncThunk(
  'aiStudio/imageToVideo',
  async ({ image, motionType, duration, instructions, cost, s3Url, fileName, fileType }: { 
    image: File; 
    motionType: string; 
    duration: number; 
    instructions?: string; 
    cost: number; 
    s3Url?: string;
    fileName?: string;
    fileType?: string;
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);
      const formData = new FormData();
      
      // If file has S3 URL but no data (due to CORS), send S3 URL instead
      if (s3Url && image.size === 0) {
        console.log('Sending S3 URL for image-to-video:', s3Url);
        formData.append('s3Url', s3Url);
        formData.append('fileName', fileName || image.name);
        formData.append('fileType', fileType || image.type);
      } else {
        formData.append('image', image);
        // Send empty strings for S3 fields when uploading file directly
        formData.append('s3Url', '');
        formData.append('fileName', '');
        formData.append('fileType', '');
      }
      
      formData.append('motionType', motionType);
      formData.append('duration', duration.toString());
      if (instructions) formData.append('instructions', instructions);
      formData.append('userId', userId);

      console.log('🚀 Making API call to:', `/ai-studio/image-to-video`);
      console.log('📤 FormData contents:', {
        image: image.name,
        motionType,
        duration,
        instructions,
        userId
      });

      console.log('🌐 About to make axios POST request...');
      let response;
      try {
        response = await aiAxiosClient.post(`/ai-studio/image-to-video`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Axios request completed successfully');
      } catch (axiosError: any) {
        console.error('❌ Axios request failed:', axiosError);
        throw axiosError;
      }

      console.log('✅ API Response received:', response.data);
      console.log('🔍 Response structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        id: response.data?.data?.id,
        jobId: response.data?.data?.jobId,
        newBalance: response.data?.data?.newBalance
      });

      // Update user token balance if provided by backend
      if (response.data.data.newBalance !== undefined) {
        console.log('💰 Updating token balance:', response.data.data.newBalance);
        dispatch(updateTokenBalance(response.data.data.newBalance));
      }

      console.log('🏗️ Creating Generation object...');
      const generation: Generation = {
        id: response.data.data.id || `img2vid-${Date.now()}`,
        type: 'video',
        prompt: 'Image to Video',
        videoUrl: '', // Will be updated when job completes
        thumbnailUrl: '',
        status: 'processing', // Start with processing status
        cost,
        retryCount: 0,
        tokensDeducted: true, // Tokens deducted on first generation
        createdAt: response.data.data.createdAt || new Date().toISOString(),
        isDownloaded: false,
        jobId: response.data.data.jobId, // Store the job ID for status checking
      };

      console.log('✅ Generation object created:', generation);
      return generation;
    } catch (error: any) {
      console.error('❌ imageToVideo API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.response?.data?.message,
        error: error.message
      });

      // Check if this is a 401 error that should trigger token refresh
      if (error.response?.status === 401) {
        console.log('🔄 401 error detected, attempting manual retry with token refresh...');

        try {
          // Wait a bit for token refresh to complete
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Try the API call again - recreate FormData since it's not accessible here
          console.log('🔄 Retrying API call after token refresh...');
          const retryFormData = new FormData();
          retryFormData.append('image', image);
          retryFormData.append('motionType', motionType);
          retryFormData.append('duration', duration.toString());
          if (instructions) retryFormData.append('instructions', instructions);
          retryFormData.append('userId', getUserId(getState));
          // Send empty strings for S3 fields when uploading file directly
          retryFormData.append('s3Url', '');
          retryFormData.append('fileName', '');
          retryFormData.append('fileType', '');

          const retryResponse = await aiAxiosClient.post(`/ai-studio/image-to-video`, retryFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('✅ Retry API Response received:', retryResponse.data);

          // Update user token balance if provided by backend
          if (retryResponse.data.data.newBalance !== undefined) {
            dispatch(updateTokenBalance(retryResponse.data.data.newBalance));
          }

          const generation: Generation = {
            id: retryResponse.data.data.id || `img2vid-${Date.now()}`,
            type: 'video',
            prompt: 'Image to Video',
            videoUrl: '', // Will be updated when job completes
            thumbnailUrl: '',
            status: 'processing', // Start with processing status
            cost,
            retryCount: 0,
            tokensDeducted: true, // Tokens deducted on first generation
            createdAt: retryResponse.data.data.createdAt || new Date().toISOString(),
            isDownloaded: false,
            jobId: retryResponse.data.data.jobId, // Store the job ID for status checking
          };

          return generation;
        } catch (retryError: any) {
          console.error('❌ Retry also failed:', retryError);
          throw new Error('Authentication failed after retry - please try again');
        }
      }

      // Show more detailed error message for other errors
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create video from image';

      throw new Error(errorMessage);
    }
  }
);

export const checkVideoJobStatus = createAsyncThunk(
  'aiStudio/checkVideoJobStatus',
  async ({ generationId }: { generationId: string }, { getState }) => {
    try {
      const userId = getUserId(getState);
      const response = await aiAxiosClient.get(`/ai-studio/job-status/${generationId}?userId=${userId}`);

      // Debug the response to see the actual structure
      console.log('🔍 Job Status Response:', response.data);

      // Extract status from the correct path in the response
      let status = response.data.data?.status || 'unknown';
      const videoUrl = response.data.data?.resultUrl || response.data.data?.videoUrl || '';
      const thumbnailUrl = response.data.data?.thumbnailUrl || '';

      // Extract backend status from the debug info
      let backendStatus = 'unknown';
      if (response.data.data?.debug?.jobStatusResponse?.data?.status) {
        backendStatus = response.data.data.debug.jobStatusResponse.data.status;
      } else if (response.data.data?.debug?.jobStatusResponse?.status) {
        backendStatus = response.data.data.debug.jobStatusResponse.status;
      } else if (response.data.data?.status) {
        backendStatus = response.data.data.status;
      }

      // Map backend status to frontend status
      if (backendStatus === 'pending') {
        status = 'processing'; // Map pending to processing for frontend polling
      } else if (backendStatus === 'completed') {
        status = 'completed';
      } else if (backendStatus === 'failed') {
        status = 'failed';
      }

      console.log('🔍 Extracted Status:', { status, backendStatus, videoUrl });

      return {
        generationId,
        status,
        videoUrl,
        thumbnailUrl,
        backendStatus,
      };
    } catch (error: any) {
      console.error('❌ Error checking job status:', error);
      throw new Error(error.response?.data?.message || 'Failed to check job status');
    }
  }
);

// Face Swap Job Status Check
export const checkFaceSwapJobStatus = createAsyncThunk(
  'aiStudio/checkFaceSwapJobStatus',
  async ({ generationId }: { generationId: string }, { getState }) => {
    try {
      const userId = getUserId(getState);
      const response = await aiAxiosClient.get(`/v2/faceswap/jobs/${generationId}`);

      console.log('🔍 Face Swap Job Status Response:', response.data);

      // Extract status and result URL from the response
      const status = response.data.status || 'unknown';
      const imageUrl = response.data.resultUrl || response.data.artifactUrls?.[0] || '';
      const errors = response.data.errors || [];
      const error = response.data.error || null;
      const debug = response.data.debug || null;

      console.log('🔍 Face Swap Status:', { status, imageUrl, errors, error, debug });

      // Handle stuck jobs (timeout or error)
      if (status === 'failed' && (error?.includes('timeout') || error?.includes('stuck'))) {
        console.log('⚠️ Face swap job is stuck, attempting to handle...');
        // You can add automatic stuck job handling here if needed
      }

      return {
        generationId,
        status,
        imageUrl,
        errors,
        error,
      };
    } catch (error: any) {
      console.error('❌ Error checking face swap job status:', error);
      throw new Error(error.response?.data?.message || 'Failed to check face swap job status');
    }
  }
);

// Handle stuck FaceSwap jobs
export const handleStuckFaceSwapJob = createAsyncThunk(
  'aiStudio/handleStuckFaceSwapJob',
  async ({ jobId, userId, reason }: { jobId: string; userId: string; reason?: string }, { getState }) => {
    try {
      console.log('🔧 Handling stuck face swap job:', { jobId, userId, reason });
      
      const response = await aiAxiosClient.post(`/v2/faceswap/jobs/${jobId}/handle-stuck`, {
        userId,
        reason: reason || 'Job timeout'
      });

      console.log('✅ Stuck job handled successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error handling stuck job:', error);
      throw new Error(error.response?.data?.message || 'Failed to handle stuck job');
    }
  }
);

export const fetchGenerationHistory = createAsyncThunk(
  'aiStudio/fetchGenerationHistory',
  async (filters: { type?: string; status?: string; page?: number; limit?: number } = {}, { getState }) => {
    try {
      const userId = getUserId(getState);
      const params = new URLSearchParams();
      params.append('userId', userId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await aiAxiosClient.get(`/ai-studio/history?${params.toString()}`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch generation history');
    }
  }
);

export const downloadGeneration = createAsyncThunk(
  'aiStudio/downloadGeneration',
  async ({ generationId, type }: { generationId: string; type: 'image' | 'video' | 'enhancement' | 'audio' | 'music' | '3d' }, { getState }) => {
    try {
      const response = await aiAxiosClient.post(`/ai-studio/download`, {
        generationId,
        type
      });
      return { generationId, downloadUrl: response.data.data.downloadUrl };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download generation');
    }
  }
);

export const downloadItem = createAsyncThunk(
  'aiStudio/downloadItem',
  async ({ url, filename }: { url: string; filename?: string }, { getState }) => {
    try {
      // Direct download without API call
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `ai-generation-${Date.now()}.${url.split('.').pop() || 'file'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { url, success: true };
    } catch (error: any) {
      throw new Error('Failed to download item');
    }
  }
);

export const getTokenBalance = createAsyncThunk(
  'aiStudio/getTokenBalance',
  async (_, { getState }) => {
    try {
      const userId = getUserId(getState);
      const response = await aiAxiosClient.get(`/ai-studio/wallet/balance?userId=${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get token balance');
    }
  }
);

export const regenerate = createAsyncThunk(
  'aiStudio/regenerate',
  async ({ generationId, modifiedPrompt, parameters }: {
    generationId: string;
    modifiedPrompt?: string;
    parameters?: string;
  }, { getState }) => {
    try {
      const userId = getUserId(getState);
      const response = await aiAxiosClient.post(`/ai-studio/regenerate/${generationId}`, {
        generationId,
        modifiedPrompt,
        parameters,
        userId
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to regenerate');
    }
  }
);

export const deleteGeneration = createAsyncThunk(
  'aiStudio/deleteGeneration',
  async (generationId: string) => {
    // Note: Delete endpoint not implemented in backend yet
    // For now, just return the ID to remove from local state
    return generationId;
  }
);

// Delete Document
export const deleteDocument = createAsyncThunk(
  'aiStudio/deleteDocument',
  async (documentId: string, { rejectWithValue, getState }) => {
    try {
      console.log('🗑️ Deleting document:', documentId);
      
      const userId = getUserId(getState);
      const response = await aiAxiosClient.post(`/documents/${documentId}/delete`, {
        userId: userId
      });
      
      console.log('✅ Document deleted successfully:', response.data);
      return documentId;
    } catch (error: any) {
      console.error('❌ Delete document error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    }
  }
);

// Audio Generation
export const generateAudio = createAsyncThunk(
  'aiStudio/generateAudio',
  async ({ prompt, audioType, genre, duration, cost }: { 
    prompt: string; 
    audioType: 'music' | 'voice' | 'effects';
    genre?: string;
    duration?: number;
    cost: number;
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);
      console.log('Starting audio generation:', { prompt, audioType, genre, duration, cost });

      // Check if user has enough tokens before starting generation
      const initialState = getState() as RootState;
      const initialBalance = initialState.user?.profile?.tokenBalance || initialState.user?.tokenBalance || 0;
      if (initialBalance < cost) {
        throw new Error(`Insufficient tokens. Required: ${cost}, Available: ${initialBalance}`);
      }

      let response;
      if (audioType === 'music') {
        // Use the real backend API for music generation
        response = await aiAxiosClient.post('/ai-prompt/v2/music/generate', {
          content: prompt,
          title: `Generated Music - ${new Date().toLocaleString()}`
        });
      } else if (audioType === 'voice') {
        // For voice/audiobook, use mock API for now (no backend API available)
        const { tts } = await import('@/src/lib/studio/api');
        const audioResult = await tts({
          script: prompt,
          voice: 'default'
        });
        response = { data: { data: audioResult } };
      } else {
        // For sound effects, use the existing music rhythm API
        response = await aiAxiosClient.post('/v2/music/rhythm', {
          prompt,
          generationType: 'sound_effect',
          effectType: genre || 'general',
          bpm: 120,
          bars: 2,
          format: 'audio',
          stems: false,
          metadata: {
            userId,
            type: 'sound_effect',
            effectType: genre || 'general'
          }
        });
      }

      // Extract music URL from the correct response structure
      let musicUrl = '';
      let generationId = '';
      let status: 'processing' | 'completed' | 'success' | 'failed' = 'completed';

      if (audioType === 'effects') {
        // For sound effects using rhythm API
        generationId = response.data.rhythmId || `audio-${Date.now()}`;
        status = response.data.status === 'queued' ? 'processing' : 'completed';
        // For sound effects, we need to poll for completion
        if (status === 'processing') {
          // Start polling for completion
          setTimeout(async () => {
            try {
              const statusResponse = await aiAxiosClient.get(`/v2/music/rhythm/${generationId}`);
              if (statusResponse.data.status === 'succeeded' && statusResponse.data.audioUrl) {
                // Update the generation with the final URL
                // This would need to be handled by the component that calls this
                console.log('Sound effect completed:', statusResponse.data.audioUrl);
              }
            } catch (error) {
              console.error('Error polling sound effect status:', error);
            }
          }, 3000);
        }
        musicUrl = response.data.audioUrl || '';
      } else {
        // For music and voice
        musicUrl = response.data.musicUrl || response.data.audioUrl || response.data.data?.url || '';
        generationId = response.data.data?.id || `audio-${Date.now()}`;
      }

      const generation: Generation = {
        id: generationId,
        type: audioType === 'music' ? 'music' : 'audio',
        prompt,
        audioUrl: musicUrl,
        musicUrl: audioType === 'music' ? musicUrl : undefined,
        status,
        cost,
        retryCount: 0,
        tokensDeducted: true,
        createdAt: new Date().toISOString(),
        isDownloaded: false,
        audioType,
        genre,
        duration: duration || 30,
        jobId: audioType === 'effects' ? generationId : undefined, // Store rhythmId for polling
      };

      console.log('Music generation response:', response.data);
      console.log('Extracted musicUrl:', musicUrl);
      console.log('Final generation object:', generation);
      console.log('Generation type:', generation.type);
      console.log('Music URL in generation:', generation.musicUrl);

      // Only deduct tokens after successful generation
      // Get current balance from state and subtract cost
      const finalState = getState() as RootState;
      const finalBalance = finalState.user?.profile?.tokenBalance || finalState.user?.tokenBalance || 0;
      const newBalance = Math.max(0, finalBalance - cost); // Prevent negative balance
      dispatch(updateTokenBalance(newBalance));
      console.log(`✅ Tokens deducted: -${cost}, Previous balance: ${finalBalance}, New balance: ${newBalance}`);

      console.log('✅ Audio generation completed:', generation);
      return generation;
    } catch (error: any) {
      console.error('❌ Audio generation error:', error);
      throw new Error(error.message || 'Failed to generate audio');
    }
  }
);

// 3D Generation
export const generate3D = createAsyncThunk(
  'aiStudio/generate3D',
  async ({ prompt, objectType, style, cost }: { 
    prompt: string; 
    objectType: 'character' | 'object' | 'environment';
    style: string;
    cost: number;
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);
      console.log('🎨 Starting 3D generation:', { prompt, objectType, style, cost });

      // Import and use generate3D from api.ts
      const { generate3D } = await import('@/src/lib/studio/api');
      const threeDResult = await generate3D(prompt);

      const generation: Generation = {
        id: threeDResult.id || `3d-${Date.now()}`,
        type: '3d',
        prompt,
        threeDUrl: threeDResult.url || '',
        status: 'completed',
        cost,
        retryCount: 0,
        tokensDeducted: true,
        createdAt: new Date().toISOString(),
        isDownloaded: false,
        objectType,
        style,
        metadata: {
          ...threeDResult.meta,
          objectType,
          style,
          format: threeDResult.meta?.format || 'glb',
          polycount: threeDResult.meta?.polycount || 'medium',
          textureQuality: threeDResult.meta?.textureQuality || '2k',
        },
      };
      const finalState = getState() as RootState;
      const finalBalance = finalState.user?.profile?.tokenBalance || finalState.user?.tokenBalance || 0;
      const newBalance = Math.max(0, finalBalance - cost);
      dispatch(updateTokenBalance(newBalance));
      console.log(`✅ Tokens deducted: -${cost}, Previous balance: ${finalBalance}, New balance: ${newBalance}`);


      console.log('✅ 3D generation completed:', generation);
      return generation;
    } catch (error: any) {
      console.error('❌ 3D generation error:', error);
      throw new Error(error.message || 'Failed to generate 3D model');
    }
  }
);

// Image-to-3D Generation
export const generateImageTo3D = createAsyncThunk(
  'aiStudio/generateImageTo3D',
  async ({ prompt, image, objectType, style, cost }: { 
    prompt: string; 
    image: File;
    objectType: 'character' | 'object' | 'environment';
    style: string;
    cost: number;
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);
      console.log(' Starting Image-to-3D generation:', { prompt, objectType, style, cost });

      // Import and use create3DJob and poll3DJobStatus from api.ts
      const { create3DJob, poll3DJobStatus } = await import('@/src/lib/studio/api');
      
      // Step 1: Create the job (this will show "Generating..." immediately)
      const { jobId } = await create3DJob(prompt, style, 'glb', 'medium', '2k', [image]);
      
      // Step 2: Poll for completion (this continues showing "Generating...")
      const threeDResult = await poll3DJobStatus(jobId);

      const generation: Generation = {
        id: threeDResult.id || `img2obj-${Date.now()}`,
        type: '3d',
        prompt,
        threeDUrl: threeDResult.url || '',
        status: 'completed',
        cost,
        retryCount: 0,
        tokensDeducted: true,
        createdAt: new Date().toISOString(),
        isDownloaded: false,
        objectType,
        style,
        metadata: {
          ...threeDResult.meta,
          objectType,
          style,
          format: threeDResult.meta?.format || 'glb',
          polycount: threeDResult.meta?.polycount || 'medium',
          textureQuality: threeDResult.meta?.textureQuality || '2k',
          sourceImageUrl: image.name,
        },
      };

      const finalState = getState() as RootState;
      const finalBalance = finalState.user?.profile?.tokenBalance || finalState.user?.tokenBalance || 0;
      const newBalance = Math.max(0, finalBalance - cost);
      dispatch(updateTokenBalance(newBalance));
      console.log(` Tokens deducted: -${cost}, Previous balance: ${finalBalance}, New balance: ${newBalance}`);

      console.log(' Image-to-3D generation completed:', generation);
      return generation;
    } catch (error: any) {
      console.error(' Image-to-3D generation error:', error);
      throw new Error(error.message || 'Failed to generate 3D model from image');
    }
  }
);

// Face Swap Generation
export const generateFaceSwap = createAsyncThunk(
  'aiStudio/generateFaceSwap',
  async ({ sourceImage, targetImage, prompt, cost }: { 
    sourceImage: File; 
    targetImage: File;
    prompt: string;
    cost: number;
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);
      console.log(' Starting face swap generation:', { prompt, cost });

      // Check if user has enough tokens before starting generation
      const initialState = getState() as RootState;
      const initialBalance = initialState.user?.profile?.tokenBalance || initialState.user?.tokenBalance || 0;
      if (initialBalance < cost) {
        throw new Error(`Insufficient tokens. Required: ${cost}, Available: ${initialBalance}`);
      }

      // Upload images to S3 using the working image upload API
      const uploadImage = async (file: File, type: 'source' | 'target') => {
        // Check if file has S3 URL but empty size (due to CORS or previous upload)
        if ((file as any).s3Url && file.size === 0) {
          console.log(`Using existing S3 URL for ${type} image:`, (file as any).s3Url);
          return (file as any).s3Url;
        }
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', userId);
        formData.append('description', `Face swap ${type} image`);
        
        const response = await aiAxiosClient.post('/ai-studio/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log(`📋 Upload response for ${type} image:`, response.data);
        return response.data.data.imageUrls[0];
      };

      console.log('📤 Uploading source image...', { 
        name: sourceImage.name, 
        size: sourceImage.size, 
        type: sourceImage.type,
        hasS3Url: !!(sourceImage as any).s3Url 
      });
      const sourceImageUrl = await uploadImage(sourceImage, 'source');
      console.log('✅ Source image uploaded:', sourceImageUrl);

      console.log('📤 Uploading target image...', { 
        name: targetImage.name, 
        size: targetImage.size, 
        type: targetImage.type,
        hasS3Url: !!(targetImage as any).s3Url 
      });
      const targetImageUrl = await uploadImage(targetImage, 'target');
      console.log('✅ Target image uploaded:', targetImageUrl);

      // Validate URLs before creating face swap job
      if (!sourceImageUrl || !targetImageUrl) {
        throw new Error('Failed to upload images - missing URLs');
      }
      
      if (!sourceImageUrl.startsWith('http') || !targetImageUrl.startsWith('http')) {
        throw new Error('Invalid image URLs - must be HTTP/HTTPS');
      }
      
      // Check if URLs have valid image extensions
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const sourceHasValidExt = validExtensions.some(ext => sourceImageUrl.toLowerCase().includes(ext));
      const targetHasValidExt = validExtensions.some(ext => targetImageUrl.toLowerCase().includes(ext));
      
      if (!sourceHasValidExt || !targetHasValidExt) {
        console.warn('⚠️ URLs may not have valid image extensions:', {
          sourceImageUrl,
          targetImageUrl,
          sourceHasValidExt,
          targetHasValidExt
        });
      }

      // Create face swap job
      console.log('🚀 Creating face swap job...');
      console.log('📋 Face swap job data:', {
        sourceFace: sourceImageUrl,
        targetMedia: targetImageUrl,
        sourceFaceType: typeof sourceImageUrl,
        targetMediaType: typeof targetImageUrl,
        sourceFaceValid: sourceImageUrl && typeof sourceImageUrl === 'string' && sourceImageUrl.startsWith('http'),
        targetMediaValid: targetImageUrl && typeof targetImageUrl === 'string' && targetImageUrl.startsWith('http')
      });
      
      const faceSwapResponse = await aiAxiosClient.post('/v2/faceswap/jobs', {
        sourceFace: sourceImageUrl,
        targetMedia: targetImageUrl,
        strength: 0.75,
        blendMode: 'natural',
        preserveLighting: true,
        webhookUrl: 'https://webhook.site/abc123',
        metadata: {
          projectId: 'faceswap-demo',
          userId: userId
        }
      });

      console.log('✅ Face swap job created:', faceSwapResponse.data);

      const generation: Generation = {
        id: faceSwapResponse.data.jobId || `faceswap-${Date.now()}`,
        type: 'image',
        prompt: prompt || 'Face Swap',
        status: 'processing', // Start with processing status
        cost,
        retryCount: 0,
        tokensDeducted: true,
        createdAt: new Date().toISOString(),
        isDownloaded: false,
        jobId: faceSwapResponse.data.jobId, // Store job ID for status checking
        metadata: {
          originalImageUrl: targetImageUrl, // Show target as original
          model: 'Qubico/image-toolkit',
          type: 'face_swap',
          sourceImageUrl,
          targetImageUrl,
        }
      };

      // Deduct tokens after successful job creation
      const finalState = getState() as RootState;
      const finalBalance = finalState.user?.profile?.tokenBalance || finalState.user?.tokenBalance || 0;
      const newBalance = Math.max(0, finalBalance - cost);
      dispatch(updateTokenBalance(newBalance));
      console.log(` Tokens deducted: -${cost}, Previous balance: ${finalBalance}, New balance: ${newBalance}`);

      return generation;
    } catch (error: any) {
      console.error('Face swap generation error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create face swap job');
    }
  }
);

// Slice
const aiStudioSlice = createSlice({
  name: 'aiStudio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCurrentGeneration: (state) => {
      state.currentGeneration = null;
    },
  },
  extraReducers: (builder) => {
    // Generate Image
    builder
      .addCase(generateImage.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateImage.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generateImage.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate image';
      });

    // Enhance Image
    builder
      .addCase(enhanceImage.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(enhanceImage.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(enhanceImage.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to enhance image';
      });

    // Image to Image
    builder
      .addCase(imageToImage.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(imageToImage.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(imageToImage.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to transform image';
      });

    // Generate Video
    builder
      .addCase(generateVideo.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateVideo.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generateVideo.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate video';
      });

    // Image to Video
    builder
      .addCase(imageToVideo.pending, (state) => {
        console.log('🔄 imageToVideo.pending - Setting isGenerating to true');
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(imageToVideo.fulfilled, (state, action) => {
        console.log('✅ imageToVideo.fulfilled - Payload:', action.payload);
        console.log('✅ imageToVideo.fulfilled - Setting currentGeneration to:', action.payload);
        console.log('✅ imageToVideo.fulfilled - Setting isGenerating to false');

        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);

        console.log('✅ imageToVideo.fulfilled - Final state:', {
          isGenerating: state.isGenerating,
          currentGeneration: state.currentGeneration,
          historyLength: state.history.length
        });
      })
      .addCase(imageToVideo.rejected, (state, action) => {
        console.log('❌ imageToVideo.rejected - Error:', action.error.message);
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to create video from image';
      });

    // Check Video Job Status
    builder
      .addCase(checkVideoJobStatus.fulfilled, (state, action) => {
        console.log('Video job status update received:', action.payload);
        
        // Update the generation in both currentGeneration and history
        if (state.currentGeneration?.id === action.payload.generationId) {
          console.log('Updating currentGeneration with video status:', {
            id: state.currentGeneration.id,
            oldStatus: state.currentGeneration.status,
            newStatus: action.payload.status,
            videoUrl: action.payload.videoUrl,
            thumbnailUrl: action.payload.thumbnailUrl
          });
          
          state.currentGeneration.status = action.payload.status;
          state.currentGeneration.backendStatus = action.payload.backendStatus;
          if (action.payload.videoUrl) {
            state.currentGeneration.videoUrl = action.payload.videoUrl;
            state.currentGeneration.thumbnailUrl = action.payload.thumbnailUrl;
          }
        }

        const historyGeneration = state.history.find(g => g.id === action.payload.generationId);
        if (historyGeneration) {
          console.log('Updating history generation with video status:', {
            id: historyGeneration.id,
            oldStatus: historyGeneration.status,
            newStatus: action.payload.status,
            videoUrl: action.payload.videoUrl,
            thumbnailUrl: action.payload.thumbnailUrl
          });
          
          historyGeneration.status = action.payload.status;
          historyGeneration.backendStatus = action.payload.backendStatus;
          if (action.payload.videoUrl) {
            historyGeneration.videoUrl = action.payload.videoUrl;
            historyGeneration.thumbnailUrl = action.payload.thumbnailUrl;
          }
        }
      });

    // Check Face Swap Job Status
    builder
      .addCase(checkFaceSwapJobStatus.fulfilled, (state, action) => {
        console.log('Face swap job status update received:', action.payload);
        
        // Map backend status to frontend status
        let mappedStatus = action.payload.status;
        if (action.payload.status === 'failed') {
          mappedStatus = 'failed';
        } else if (action.payload.status === 'completed' || action.payload.status === 'success') {
          mappedStatus = 'completed';
        } else if (action.payload.status === 'pending' || action.payload.status === 'processing') {
          mappedStatus = 'processing';
        }
        
        // Update the generation in both currentGeneration and history
        if (state.currentGeneration?.id === action.payload.generationId) {
          console.log('Updating currentGeneration with face swap status:', {
            id: state.currentGeneration.id,
            oldStatus: state.currentGeneration.status,
            newStatus: mappedStatus,
            imageUrl: action.payload.imageUrl
          });
          
          state.currentGeneration.status = mappedStatus; // ✅ Use mapped status
          if (action.payload.imageUrl) {
            state.currentGeneration.imageUrl = action.payload.imageUrl;
            state.currentGeneration.resultUrl = action.payload.imageUrl;
          }
        }

        const historyGeneration = state.history.find(g => g.id === action.payload.generationId);
        if (historyGeneration) {
          console.log('Updating history generation with face swap status:', {
            id: historyGeneration.id,
            oldStatus: historyGeneration.status,
            newStatus: mappedStatus,
            imageUrl: action.payload.imageUrl
          });
          
          historyGeneration.status = mappedStatus; // ✅ Use mapped status
          if (action.payload.imageUrl) {
            historyGeneration.imageUrl = action.payload.imageUrl;
            historyGeneration.resultUrl = action.payload.imageUrl;
          }
        }
      });

    // Handle Stuck FaceSwap Job
    builder
      .addCase(handleStuckFaceSwapJob.fulfilled, (state, action) => {
        console.log('Stuck face swap job handled:', action.payload);
        
        // Update the generation status to failed
        if (state.currentGeneration && state.currentGeneration.jobId === action.payload.generationId) {
          state.currentGeneration.status = 'failed';
        }

        const historyGeneration = state.history.find(g => g.jobId === action.payload.generationId);
        if (historyGeneration) {
          historyGeneration.status = 'failed';
        }
      })
      .addCase(handleStuckFaceSwapJob.rejected, (state, action) => {
        console.error('Failed to handle stuck face swap job:', action.error);
      });

    // Fetch History
    builder
      .addCase(fetchGenerationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGenerationHistory.fulfilled, (state, action) => {
        state.isLoading = false;

        // Transform backend data to match frontend expectations
        const transformedHistory = action.payload.map((item: any) => {
          const transformed = {
            ...item,
            // Map backend fields to frontend fields
            videoUrl: item.resultUrl || item.videoUrl || '', // Backend uses resultUrl
            imageUrl: item.resultUrl || item.imageUrl || '', // For images
            // Map backend status to frontend status
            status: item.status === 'success' ? 'completed' : 
                    item.status === 'failed' ? 'failed' : 
                    item.status === 'processing' ? 'processing' : 'processing',
            // Use cost from backend (should always be provided)
            cost: item.cost || 0, // Fallback to 0 if not provided
            // Extract backend status from metadata
            backendStatus: item.metadata?.status || item.status,
            // Extract job ID from metadata
            jobId: item.metadata?.jobId || item.jobId
          };

          // Debug logging for video items
          if (item.type === 'video') {
            console.log('🔍 Video Item Transformation:', {
              original: { resultUrl: item.resultUrl, videoUrl: item.videoUrl },
              transformed: { videoUrl: transformed.videoUrl, status: transformed.status }
            });
          }

          return transformed;
        });

        // Merge with local updates
        const localHistory = state.history;
        const localUpdates = new Map();
        localHistory.forEach(item => {
          if (item.videoUrl || item.status !== 'processing') {
            localUpdates.set(item.id, item);
          }
        });

        // Merge backend data with local updates
        const mergedHistory = transformedHistory.map((backendItem: any) => {
          const localUpdate = localUpdates.get(backendItem.id);
          if (localUpdate) {
            // Merge backend data with local updates
            return {
              ...backendItem,
              videoUrl: localUpdate.videoUrl || backendItem.videoUrl,
              thumbnailUrl: localUpdate.thumbnailUrl || backendItem.thumbnailUrl,
              status: localUpdate.status || backendItem.status,
              backendStatus: localUpdate.backendStatus || backendItem.backendStatus,
              cost: localUpdate.cost || backendItem.cost
            };
          }
          return backendItem;
        });

        state.history = mergedHistory;
      })
      .addCase(fetchGenerationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch history';
      });

    // Download Generation
    builder
      .addCase(downloadGeneration.fulfilled, (state, action) => {
        const generation = state.history.find(g => g.id === action.payload.generationId);
        if (generation) {
          generation.isDownloaded = true;
        }
        if (state.currentGeneration && state.currentGeneration.id === action.payload.generationId) {
          state.currentGeneration.isDownloaded = true;
        }
      });

    // Get Token Balance
    builder
      .addCase(getTokenBalance.fulfilled, (state, action) => {
        // Handle successful token balance retrieval if needed
      });

    // Regenerate
    builder
      .addCase(regenerate.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(regenerate.fulfilled, (state, action) => {
        state.isGenerating = false;
        // Update the generation in history with new retry count and media URLs
        const generation = state.history.find(g => g.id === action.payload.id);
        if (generation) {
          generation.retryCount = action.payload.retryCount;
          generation.status = action.payload.status;
          generation.jobId = action.payload.jobId;
          
          // Update media URLs if provided in the response
          if (action.payload.imageUrl) {
            generation.imageUrl = action.payload.imageUrl;
          }
          if (action.payload.videoUrl) {
            generation.videoUrl = action.payload.videoUrl;
          }
          if (action.payload.enhancedImageUrl) {
            generation.enhancedImageUrl = action.payload.enhancedImageUrl;
          }
          if (action.payload.thumbnailUrl) {
            generation.thumbnailUrl = action.payload.thumbnailUrl;
          }
        }

        // Update current generation if it matches
        if (state.currentGeneration && state.currentGeneration.id === action.payload.id) {
          state.currentGeneration.retryCount = action.payload.retryCount;
          state.currentGeneration.status = action.payload.status;
          state.currentGeneration.jobId = action.payload.jobId;
          
          // Update media URLs if provided in the response
          if (action.payload.imageUrl) {
            state.currentGeneration.imageUrl = action.payload.imageUrl;
          }
          if (action.payload.videoUrl) {
            state.currentGeneration.videoUrl = action.payload.videoUrl;
          }
          if (action.payload.enhancedImageUrl) {
            state.currentGeneration.enhancedImageUrl = action.payload.enhancedImageUrl;
          }
          if (action.payload.thumbnailUrl) {
            state.currentGeneration.thumbnailUrl = action.payload.thumbnailUrl;
          }
        }
      })
      .addCase(regenerate.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to regenerate';
        state.isGenerating = false;
      });

    // Delete Generation
    builder
      .addCase(deleteGeneration.fulfilled, (state, action) => {
        state.history = state.history.filter(g => g.id !== action.payload);
        if (state.currentGeneration && state.currentGeneration.id === action.payload) {
          state.currentGeneration = null;
        }
      });

    // Delete Document
    builder
      .addCase(deleteDocument.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isGenerating = false;
        // Remove document from history
        state.history = state.history.filter(g => g.id !== action.payload);
        if (state.currentGeneration && state.currentGeneration.id === action.payload) {
          state.currentGeneration = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string || 'Failed to delete document';
      });

    // Audio Generation
    builder
      .addCase(generateAudio.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateAudio.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generateAudio.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate audio';
      });

    // 3D Generation
    builder
      .addCase(generate3D.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generate3D.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generate3D.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate 3D model';
      });

    // Image-to-3D Generation
    builder
      .addCase(generateImageTo3D.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateImageTo3D.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generateImageTo3D.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to generate 3D model from image';
      });

    // Face Swap Generation
    builder
      .addCase(generateFaceSwap.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateFaceSwap.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generateFaceSwap.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to create face swap job';
      });

    // Upload Document
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.currentGeneration = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.error.message || 'Failed to upload document';
      });

    // Fetch Documents
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge fetched documents with existing history
        const existingIds = new Set(state.history.map(item => item.id));
        const newDocuments = action.payload.documents.filter((doc: any) => !existingIds.has(doc.id));
        state.history = [...newDocuments, ...state.history];
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      });

    // Add Uploaded File (Legacy)
    builder
      .addCase(addUploadedFile.fulfilled, (state, action) => {
        // Add uploaded file to the beginning of history (first position)
        state.history.unshift(action.payload);
      });
  }
});

// Document Upload API
export const uploadDocument = createAsyncThunk(
  'aiStudio/uploadDocument',
  async ({ file, title, description, documentType, isPublic, tags }: { 
    file: File; 
    title?: string; 
    description?: string;
    documentType: string;
    isPublic?: boolean;
    tags?: string[];
  }, { getState, dispatch }) => {
    try {
      const userId = getUserId(getState);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name.split('.')[0] || 'Untitled');
      formData.append('description', description || '');
      formData.append('documentType', documentType);
      formData.append('isPublic', (isPublic ?? true).toString());
      if (tags && tags.length > 0) {
        formData.append('tags', tags.join(','));
      }

      console.log('🚀 Uploading document:', { title, documentType, fileSize: file.size });

      const response = await aiAxiosClient.post('/ai-studio/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Document upload response:', response.data);

      // Create a Generation object for the uploaded document
      const uploadedGeneration: Generation = {
        id: response.data.data.id || `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 
              file.type.startsWith('audio/') ? 'audio' : 'image',
        prompt: response.data.data.title || title || file.name.split('.')[0] || 'Untitled',
        imageUrl: file.type.startsWith('image/') ? response.data.data.s3Url : undefined,
        videoUrl: file.type.startsWith('video/') ? response.data.data.s3Url : undefined,
        audioUrl: file.type.startsWith('audio/') ? response.data.data.s3Url : undefined,
        status: 'completed',
        cost: 0, // Uploaded files have no cost
        retryCount: 0,
        tokensDeducted: false,
        createdAt: response.data.data.createdAt || new Date().toISOString(),
        isDownloaded: false,
        metadata: {
          source: 'upload',
          originalFileName: response.data.data.originalFileName || file.name,
          fileSize: response.data.data.fileSize || file.size,
          fileType: response.data.data.mimeType || file.type,
          description: response.data.data.description || description || '',
          isUploaded: true, // Flag to identify uploaded files
          s3Url: response.data.data.s3Url,
          documentId: response.data.data.id,
        }
      };

      return uploadedGeneration;
    } catch (error: any) {
      console.error('❌ Document upload error:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

// Fetch Documents API
export const fetchDocuments = createAsyncThunk(
  'aiStudio/fetchDocuments',
  async (filters: { 
    page?: number; 
    limit?: number; 
    documentType?: string; 
    status?: string; 
    search?: string; 
  } = {}, { getState }) => {
    try {
      const userId = getUserId(getState);
      const params = new URLSearchParams();
      params.append('userId', userId);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.documentType) params.append('documentType', filters.documentType);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await aiAxiosClient.get(`/ai-studio/documents?${params.toString()}`);
      
      // Transform documents to Generation format
      const documents = response.data.data.documents.map((doc: any) => ({
        id: doc.id,
        type: doc.documentType === 'pdf' || doc.documentType === 'txt' ? 'image' : 
              doc.documentType === 'mp4' || doc.documentType === 'avi' ? 'video' : 
              doc.documentType === 'mp3' || doc.documentType === 'wav' ? 'audio' : 'image',
        prompt: doc.title || 'Untitled',
        imageUrl: doc.documentType === 'pdf' || doc.documentType === 'txt' ? doc.s3Url : undefined,
        videoUrl: doc.documentType === 'mp4' || doc.documentType === 'avi' ? doc.s3Url : undefined,
        audioUrl: doc.documentType === 'mp3' || doc.documentType === 'wav' ? doc.s3Url : undefined,
        status: 'completed',
        cost: 0,
        retryCount: 0,
        tokensDeducted: false,
        createdAt: doc.createdAt,
        isDownloaded: false,
        metadata: {
          source: 'upload',
          originalFileName: doc.originalFileName,
          fileSize: doc.fileSize,
          fileType: doc.mimeType,
          description: doc.description || '',
          isUploaded: true,
          s3Url: doc.s3Url,
          documentId: doc.id,
        }
      }));

      return {
        documents,
        total: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
      };
    } catch (error: any) {
      console.error('❌ Fetch documents error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

// Add uploaded file to history (Legacy - for local file handling)
export const addUploadedFile = createAsyncThunk(
  'aiStudio/addUploadedFile',
  async ({ file, title, description }: { 
    file: File; 
    title?: string; 
    description?: string; 
  }) => {
    // Create a data URL for the uploaded file
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // Create a Generation object for the uploaded file
    const uploadedGeneration: Generation = {
      id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 
            file.type.startsWith('audio/') ? 'audio' : 'image',
      prompt: title || file.name.split('.')[0] || 'Untitled',
      imageUrl: file.type.startsWith('image/') ? dataUrl : undefined,
      videoUrl: file.type.startsWith('video/') ? dataUrl : undefined,
      audioUrl: file.type.startsWith('audio/') ? dataUrl : undefined,
      status: 'completed',
      cost: 0, // Uploaded files have no cost
      retryCount: 0,
      tokensDeducted: false,
      createdAt: new Date().toISOString(),
      isDownloaded: false,
      metadata: {
        source: 'upload',
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        description: description || '',
        isUploaded: true, // Flag to identify uploaded files
      }
    };

    return uploadedGeneration;
  }
);

export const { clearError, resetCurrentGeneration } = aiStudioSlice.actions;
export default aiStudioSlice.reducer;