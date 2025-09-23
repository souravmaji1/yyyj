import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiAxiosClient } from '@/src/app/apis/auth/axios';

// Types
export interface TryOnHistoryJob {
  id: string;
  userId: string;
  piTaskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  inputMeta?: {
    usage?: {
      type: string;
      frozen: number;
      consume: number;
    };
    options?: {
      quality: string;
    };
    ended_at?: string;
    created_at?: string;
    started_at?: string;
    modelImageUrl?: string;
    garmentImageUrl?: string;
    is_using_private_pool?: boolean;
  };
  outputMeta?: {
    type?: string;
    works?: Array<{
      type: string;
      image: {
        width: number;
        height: number;
        duration: number;
        resource: string;
        resource_without_watermark: string;
      };
      status: number;
      content_type: string;
    }>;
    status?: number;
    artifactUrls?: string[];
  };
  warnings: string[];
  errors: string[];
  idempotencyKey?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TryOnHistoryResponse {
  jobs: TryOnHistoryJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TryOnHistoryState {
  jobs: TryOnHistoryJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  loading: boolean;
  error: string | null;
}

const initialState: TryOnHistoryState = {
  jobs: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  error: null,
};

// Async thunk for fetching try-on history
export const fetchTryOnHistory = createAsyncThunk(
  'tryonHistory/fetchHistory',
  async (params: { page?: number; limit?: number; sort?: 'asc' | 'desc' }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sort) queryParams.append('sort', params.sort);

      const response = await aiAxiosClient.get(`/v1/tryon/history?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch try-on history');
    }
  }
);

const tryonHistorySlice = createSlice({
  name: 'tryonHistory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearHistory: (state) => {
      state.jobs = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTryOnHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTryOnHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.jobs = action.payload.jobs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTryOnHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearHistory } = tryonHistorySlice.actions;
export default tryonHistorySlice.reducer;
