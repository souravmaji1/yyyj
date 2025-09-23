import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiAxiosClient } from '@/src/app/apis/auth/axios';

// Types
export interface TryOnRequest {
  modelImage: string;
  model_image_s3_key: string;
  garmentImage: string;
  garment_image_s3_key: string;
  options: {
    quality: 'high' | 'medium' | 'low';
  };
}

export interface TryOnResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  next: {
    statusUrl: string;
    artifactsUrl: string;
  };
}

export interface TryOnJob {
  id: string;
  productId: number;
  variantId: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  modelImage: string;
  garmentImage: string;
  artifacts?: string[];
  error?: string;
}

interface TryOnState {
  jobs: TryOnJob[];
  currentJob: TryOnJob | null;
  loading: boolean;
  error: string | null;
  isGenerating: boolean;
}

const initialState: TryOnState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  isGenerating: false,
};

// API Base URL is handled by aiAxiosClient

// Async thunk for creating try-on job
export const createTryOnJob = createAsyncThunk(
  'tryon/createJob',
  async (request: TryOnRequest, { rejectWithValue }) => {
    try {
      const response = await aiAxiosClient.post('/v1/tryon', request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create try-on job');
    }
  }
);

// Async thunk for checking job status
export const checkTryOnJobStatus = createAsyncThunk(
  'tryon/checkStatus',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await aiAxiosClient.get(`/v1/tryon/${jobId}/status`);
      return { jobId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to check job status');
    }
  }
);

// Async thunk for getting job artifacts
export const getTryOnJobArtifacts = createAsyncThunk(
  'tryon/getArtifacts',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await aiAxiosClient.get(`/v1/tryon/${jobId}/artifacts`);
      return { jobId, artifacts: response.data.artifacts || [] };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to get job artifacts');
    }
  }
);

const tryonSlice = createSlice({
  name: 'tryon',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    addJob: (state, action: PayloadAction<TryOnJob>) => {
      state.jobs.unshift(action.payload);
    },
    updateJobStatus: (state, action: PayloadAction<{ jobId: string; status: string; artifacts?: string[] }>) => {
      const job = state.jobs.find(j => j.id === action.payload.jobId);
      if (job) {
        job.status = action.payload.status as any;
        if (action.payload.artifacts) {
          job.artifacts = action.payload.artifacts;
        }
      }
      if (state.currentJob?.id === action.payload.jobId) {
        state.currentJob.status = action.payload.status as any;
        if (action.payload.artifacts) {
          state.currentJob.artifacts = action.payload.artifacts;
        }
      }
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create try-on job
    builder
      .addCase(createTryOnJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isGenerating = true;
      })
      .addCase(createTryOnJob.fulfilled, (state, action) => {
        state.loading = false;
        state.isGenerating = false;
        state.error = null;
        
        // Create a new job entry
        const newJob: TryOnJob = {
          id: action.payload.jobId,
          productId: 0, // Will be set when dispatching
          variantId: 0, // Will be set when dispatching
          status: action.payload.status,
          createdAt: new Date().toISOString(),
          modelImage: '', // Will be set when dispatching
          garmentImage: '', // Will be set when dispatching
        };
        
        state.jobs.unshift(newJob);
        state.currentJob = newJob;
      })
      .addCase(createTryOnJob.rejected, (state, action) => {
        state.loading = false;
        state.isGenerating = false;
        state.error = action.payload as string;
      });

    // Check job status
    builder
      .addCase(checkTryOnJobStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkTryOnJobStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { jobId, status } = action.payload;
        
        const job = state.jobs.find(j => j.id === jobId);
        if (job) {
          job.status = status;
        }
        if (state.currentJob && state.currentJob.id === jobId) {
          state.currentJob.status = status;
        }
      })
      .addCase(checkTryOnJobStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get job artifacts
    builder
      .addCase(getTryOnJobArtifacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTryOnJobArtifacts.fulfilled, (state, action) => {
        state.loading = false;
        const { jobId, artifacts } = action.payload;
        
        const job = state.jobs.find(j => j.id === jobId);
        if (job) {
          job.artifacts = artifacts;
        }
        if (state.currentJob && state.currentJob.id === jobId) {
          state.currentJob.artifacts = artifacts;
        }
      })
      .addCase(getTryOnJobArtifacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentJob,
  addJob,
  updateJobStatus,
  setGenerating,
} = tryonSlice.actions;

export default tryonSlice.reducer;
