import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { videoRewardsService } from '@/src/app/apis/videoRewardsService';
import { RootState } from '@/src/store';

// Types
export interface VideoWatchLog {
  id: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  channelId: string;
  channelName: string;
  videoDuration: number;
  watchStartedAt: string;
  watchCompletedAt: string;
  rewardAmount: number;
  status: 'pending' | 'validated' | 'rejected' | 'reward_dispatched';
  rejectionReason?: string;
  rewardDispatchedAt?: string;
  adminId?: string;
  adminName?: string;
  validationFlags?: Record<string, any>;
  watchData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface VideoRewardsStats {
  totalWatches: number;
  totalRewardsEarned: number;
  pendingRewards: number;
  completedRewards: number;
  rejectedRewards: number;
}

interface VideoRewardsState {
  watchHistory: VideoWatchLog[];
  currentWatch: VideoWatchLog | null;
  stats: VideoRewardsStats;
  loading: boolean;
  error: string | null;
  watchInProgress: boolean;
  currentVideoId: string | null;
  watchStartTime: Date | null;
  antiCheatFlags: {
    seekDetected: boolean;
    speedChanged: boolean;
    tabSwitched: boolean;
    refreshDetected: boolean;
  };
}

const initialState: VideoRewardsState = {
  watchHistory: [],
  currentWatch: null,
  stats: {
    totalWatches: 0,
    totalRewardsEarned: 0,
    pendingRewards: 0,
    completedRewards: 0,
    rejectedRewards: 0,
  },
  loading: false,
  error: null,
  watchInProgress: false,
  currentVideoId: null,
  watchStartTime: null,
  antiCheatFlags: {
    seekDetected: false,
    speedChanged: false,
    tabSwitched: false,
    refreshDetected: false,
  },
};

// Async thunks
export const createVideoWatch = createAsyncThunk(
  'videoRewards/createVideoWatch',
  async (watchData: {
    videoId: string;
    videoTitle: string;
    channelId: string;
    channelName: string;
    videoDuration: number;
    watchStartedAt: Date;
    watchCompletedAt: Date;
    rewardAmount?: number;
    validationFlags?: Record<string, any>;
    watchData?: Record<string, any>;
  }, { rejectWithValue }) => {
    try {
      const response = await videoRewardsService.createVideoWatch(watchData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserVideoHistory = createAsyncThunk(
  'videoRewards/fetchUserVideoHistory',
  async (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}, { rejectWithValue }) => { 
    try {
      const response = await videoRewardsService.getUserVideoHistory(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getVideoWatchLog = createAsyncThunk(
  'videoRewards/getVideoWatchLog',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await videoRewardsService.getUserVideoWatchLog(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const videoRewardsSlice = createSlice({
  name: 'videoRewards',
  initialState,
  reducers: {
    // Start watching a video
    startVideoWatch: (state, action: PayloadAction<{ videoId: string; videoTitle: string; channelId: string; channelName: string; videoDuration: number }>) => {
      state.watchInProgress = true;
      state.currentVideoId = action.payload.videoId;
      state.watchStartTime = new Date();
      state.antiCheatFlags = {
        seekDetected: false,
        speedChanged: false,
        tabSwitched: false,
        refreshDetected: false,
      };
    },

    // Stop watching a video
    stopVideoWatch: (state) => {
      state.watchInProgress = false;
      state.currentVideoId = null;
      state.watchStartTime = null;
    },

    // Set anti-cheat flags
    setAntiCheatFlag: (state, action: PayloadAction<{ flag: keyof typeof state.antiCheatFlags; value: boolean }>) => {
      state.antiCheatFlags[action.payload.flag] = action.payload.value;
    },

    // Reset anti-cheat flags
    resetAntiCheatFlags: (state) => {
      state.antiCheatFlags = {
        seekDetected: false,
        speedChanged: false,
        tabSwitched: false,
        refreshDetected: false,
      };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update stats
    updateStats: (state, action: PayloadAction<Partial<VideoRewardsStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create video watch
      .addCase(createVideoWatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVideoWatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWatch = action.payload;
        state.watchHistory.unshift(action.payload);
        state.stats.totalWatches += 1;
        state.stats.pendingRewards += 1;
      })
      .addCase(createVideoWatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch user video history
      .addCase(fetchUserVideoHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserVideoHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.watchHistory = action.payload.logs || [];
        state.stats = action.payload.stats || state.stats;
      })
      .addCase(fetchUserVideoHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get video watch log
      .addCase(getVideoWatchLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideoWatchLog.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWatch = action.payload;
      })
      .addCase(getVideoWatchLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  startVideoWatch,
  stopVideoWatch,
  setAntiCheatFlag,
  resetAntiCheatFlags,
  clearError,
  updateStats,
} = videoRewardsSlice.actions;

// Selectors
export const selectVideoRewards = (state: RootState) => state.videoRewards;
export const selectWatchHistory = (state: RootState) => state.videoRewards.watchHistory;
export const selectCurrentWatch = (state: RootState) => state.videoRewards.currentWatch;
export const selectVideoRewardsStats = (state: RootState) => state.videoRewards.stats;
export const selectWatchInProgress = (state: RootState) => state.videoRewards.watchInProgress;
export const selectAntiCheatFlags = (state: RootState) => state.videoRewards.antiCheatFlags;
export const selectVideoRewardsLoading = (state: RootState) => state.videoRewards.loading;
export const selectVideoRewardsError = (state: RootState) => state.videoRewards.error;

export default videoRewardsSlice.reducer;
