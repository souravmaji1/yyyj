import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';

// Interfaces
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  machineId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'INITIATED' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  media: Array<{
    mediaType: string;
    mediaUrl: string;
    metadata?: {
      width?: number;
      height?: number;
      size?: number;
      type?: string;
    };
  }>;
  machine?:any
  createdAt: string;
  updatedAt: string;
}

export interface UserAdStats {
  total: number;
  published: number;
  approved: number;
  completed: number;
  initiated: number;
  rejected: number;
  totalAmount: number;
  publishedAmount: number;
  approvedAmount: number;
  completedAmount: number;
  initiatedAmount: number;
  rejectedAmount: number;
  pendingReview: number;
  totalEarnings: number;
  totalPayments: number;
  totalPaidAmount: number;
  statusBreakdown: {
    initiated: { count: number; totalAmount: number; payments: number; paidAmount: number };
    published: { count: number; totalAmount: number; payments: number; paidAmount: number };
    approved: { count: number; totalAmount: number; payments: number; paidAmount: number };
    rejected: { count: number; totalAmount: number; payments: number; paidAmount: number };
    completed: { count: number; totalAmount: number; payments: number; paidAmount: number };
  };
  recentPayments: Array<{
    id: string;
    adId: string;
    adTitle: string;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
}

interface CreateAdRequest {
  title: string;
  description: string;
  machineId: string;
  startDate: string;
  endDate: string;
  amount: number;
  media: Array<{
    mediaType: string;
    mediaUrl: string;
    metadata?: {
      size?: number;
      type?: string;
    };
  }>;
}

interface UpdateAdRequest extends CreateAdRequest {
  id: string;
}

interface CreateAdResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Advertisement;
}

interface FetchAdsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Advertisement[];
}

interface QRCodeResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    qrCode: string;
    machineInfo: {
      id: string;
      machineId: string;
      description: string;
      redirectUrl: string;
    };
  };
}

interface ScreensaverAdsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    ads: Array<{
      id: string;
      title: string;
      description: string;
      videoUrl: string;
      duration: number;
      machineId: string;
      startDate: string;
      endDate: string;
      status: string;
      amount: number;
    }>;
  };
}

interface AdManagementCheckResponse {
  status: boolean;
  message: string;
  data: boolean;
  other: {};
}

// State interface
export interface AdManagementState {
  advertisements: Advertisement[];
  loading: boolean;
  error: string | null;
  createAdLoading: boolean;
  createAdError: string | null;
  createAdSuccess: boolean;
  updateAdLoading: boolean;
  updateAdError: string | null;
  updateAdSuccess: boolean;
  deleteAdLoading: boolean;
  deleteAdError: string | null;
  deleteAdSuccess: boolean;
  publishAdLoading: boolean;
  publishAdError: string | null;
  publishAdSuccess: boolean;
  publishAdResponse: CreateAdResponse | null;
  userStats: UserAdStats | null;
  userStatsLoading: boolean;
  userStatsError: string | null;
  qrCodeData: {
    qrCode: string;
    machineInfo: {
      id: string;
      machineId: string;
      description: string;
      redirectUrl: string;
    };
  } | null;
  qrCodeLoading: boolean;
  qrCodeError: string | null;
  screensaverAds: Array<{
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    machineId: string;
    startDate: string;
    endDate: string;
    status: string;
    amount: number;
  }> | null;
  screensaverAdsLoading: boolean;
  screensaverAdsError: string | null;
  hasAdManagementAccess: boolean | null;
  adManagementCheckLoading: boolean;
  adManagementCheckError: string | null;
}

const initialState: AdManagementState = {
  advertisements: [],
  loading: false,
  error: null,
  createAdLoading: false,
  createAdError: null,
  createAdSuccess: false,
  updateAdLoading: false,
  updateAdError: null,
  updateAdSuccess: false,
  deleteAdLoading: false,
  deleteAdError: null,
  deleteAdSuccess: false,
  publishAdLoading: false,
  publishAdError: null,
  publishAdSuccess: false,
  publishAdResponse: null,
  userStats: null,
  userStatsLoading: false,
  userStatsError: null,
  qrCodeData: null,
  qrCodeLoading: false,
  qrCodeError: null,
  screensaverAds: null,
  screensaverAdsLoading: false,
  screensaverAdsError: null,
  hasAdManagementAccess: null,
  adManagementCheckLoading: false,
  adManagementCheckError: null,
};

// Async thunks
export const fetchAdvertisements = createAsyncThunk(
  'adManagement/fetchAdvertisements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get<FetchAdsResponse>('/ad-management');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch advertisements'
      );
    }
  }
);

export const createAdvertisement = createAsyncThunk(
  'adManagement/createAdvertisement',
  async (adData: CreateAdRequest, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post<CreateAdResponse>('/ad-management', adData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create advertisement'
      );
    }
  }
);

export const updateAdvertisement = createAsyncThunk(
  'adManagement/updateAdvertisement',
  async (adData: UpdateAdRequest, { rejectWithValue }) => {
    try {
      // Extract id for URL and exclude it from request body
      const { id, ...requestBody } = adData;
      const response = await authAxiosClient.put<CreateAdResponse>(`/ad-management/${id}`, requestBody);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update advertisement'
      );
    }
  }
);

export const deleteAdvertisement = createAsyncThunk(
  'adManagement/deleteAdvertisement',
  async (adId: string, { rejectWithValue }) => {
    try {
      await authAxiosClient.delete(`/ad-management/${adId}`);
      return adId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete advertisement'
      );
    }
  }
);

export const publishAdvertisement = createAsyncThunk(
  'adManagement/publishAdvertisement',
  async (adId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.put<CreateAdResponse>(`/ad-management/${adId}/publish`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to publish advertisement'
      );
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'adManagement/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get<{ statusCode: number; success: boolean; message: string; data: UserAdStats }>('/ad-management/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch user statistics'
      );
    }
  }
);

export const generateMachineQRCode = createAsyncThunk(
  'adManagement/generateMachineQRCode',
  async (machineId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get<QRCodeResponse>(`/kiosk/qr-code/${machineId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to generate QR code'
      );
    }
  }
);

export const fetchScreensaverAds = createAsyncThunk(
  'adManagement/fetchScreensaverAds',
  async (machineId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get<ScreensaverAdsResponse>(`/kiosk/screensaver-ads/${machineId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch screensaver ads'
      );
    }
  }
);

export const checkAdManagementAccess = createAsyncThunk(
  'adManagement/checkAdManagementAccess',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get<AdManagementCheckResponse>('/ad-management/check');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to check ad management access'
      );
    }
  }
);

// Slice
const adManagementSlice = createSlice({
  name: 'adManagement',
  initialState,
  reducers: {
    clearAdManagement: (state) => {
      state.advertisements = [];
      state.loading = false;
      state.error = null;
      state.createAdLoading = false;
      state.createAdError = null;
      state.createAdSuccess = false;
      state.updateAdLoading = false;
      state.updateAdError = null;
      state.updateAdSuccess = false;
      state.deleteAdLoading = false;
      state.deleteAdError = null;
      state.deleteAdSuccess = false;
      state.publishAdLoading = false;
      state.publishAdError = null;
      state.publishAdSuccess = false;
      state.publishAdResponse = null;
    },
    clearCreateAdStatus: (state) => {
      state.createAdLoading = false;
      state.createAdError = null;
      state.createAdSuccess = false;
    },
    clearUpdateAdStatus: (state) => {
      state.updateAdLoading = false;
      state.updateAdError = null;
      state.updateAdSuccess = false;
    },
    clearDeleteAdStatus: (state) => {
      state.deleteAdLoading = false;
      state.deleteAdError = null;
      state.deleteAdSuccess = false;
    },
    clearPublishAdStatus: (state) => {
      state.publishAdLoading = false;
      state.publishAdError = null;
      state.publishAdSuccess = false;
      state.publishAdResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch advertisements
      .addCase(fetchAdvertisements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisements.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the nested structure: action.payload.data.ads
        if (action.payload.data && typeof action.payload.data === 'object' && 'ads' in action.payload.data && Array.isArray(action.payload.data.ads)) {
          state.advertisements = action.payload.data.ads;
        } else if (Array.isArray(action.payload.data)) {
          state.advertisements = action.payload.data;
        } else {
          state.advertisements = [];
        }
        state.error = null;
      })
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create advertisement
      .addCase(createAdvertisement.pending, (state) => {
        state.createAdLoading = true;
        state.createAdError = null;
        state.createAdSuccess = false;
      })
      .addCase(createAdvertisement.fulfilled, (state, action) => {
        state.createAdLoading = false;
        state.createAdSuccess = true;
        state.createAdError = null;
        // Add the new advertisement to the list
        if (Array.isArray(state.advertisements)) {
          state.advertisements.unshift(action.payload.data);
        } else {
          state.advertisements = [action.payload.data];
        }
      })
      .addCase(createAdvertisement.rejected, (state, action) => {
        state.createAdLoading = false;
        state.createAdError = action.payload as string;
        state.createAdSuccess = false;
      })
      
      // Update advertisement
      .addCase(updateAdvertisement.pending, (state) => {
        state.updateAdLoading = true;
        state.updateAdError = null;
        state.updateAdSuccess = false;
      })
      .addCase(updateAdvertisement.fulfilled, (state, action) => {
        state.updateAdLoading = false;
        state.updateAdSuccess = true;
        state.updateAdError = null;
        // Update the advertisement in the list
        if (Array.isArray(state.advertisements)) {
          const index = state.advertisements.findIndex(ad => ad.id === action.payload.data.id);
          if (index !== -1) {
            state.advertisements[index] = action.payload.data;
          }
        }
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.updateAdLoading = false;
        state.updateAdError = action.payload as string;
        state.updateAdSuccess = false;
      })
      
      // Delete advertisement
      .addCase(deleteAdvertisement.pending, (state) => {
        state.deleteAdLoading = true;
        state.deleteAdError = null;
        state.deleteAdSuccess = false;
      })
      .addCase(deleteAdvertisement.fulfilled, (state, action) => {
        state.deleteAdLoading = false;
        state.deleteAdSuccess = true;
        state.deleteAdError = null;
        // Remove the advertisement from the list
        if (Array.isArray(state.advertisements)) {
          state.advertisements = state.advertisements.filter(ad => ad.id !== action.payload);
        }
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.deleteAdLoading = false;
        state.deleteAdError = action.payload as string;
        state.deleteAdSuccess = false;
      })
      
      // Publish advertisement
      .addCase(publishAdvertisement.pending, (state) => {
        state.publishAdLoading = true;
        state.publishAdError = null;
        state.publishAdSuccess = false;
      })
      .addCase(publishAdvertisement.fulfilled, (state, action) => {
        state.publishAdLoading = false;
        state.publishAdSuccess = true;
        state.publishAdError = null;
        state.publishAdResponse = action.payload;
        // Update the advertisement in the list
        if (Array.isArray(state.advertisements)) {
          const index = state.advertisements.findIndex(ad => ad.id === action.payload.data.id);
          if (index !== -1) {
            state.advertisements[index] = action.payload.data;
          }
        }
      })
      .addCase(publishAdvertisement.rejected, (state, action) => {
        state.publishAdLoading = false;
        state.publishAdError = action.payload as string;
        state.publishAdSuccess = false;
      })
      
      // Fetch user stats
      .addCase(fetchUserStats.pending, (state) => {
        state.userStatsLoading = true;
        state.userStatsError = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStatsLoading = false;
        state.userStats = action.payload.data;
        state.userStatsError = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.userStatsLoading = false;
        state.userStatsError = action.payload as string;
      })
      
      // Generate QR code
      .addCase(generateMachineQRCode.pending, (state) => {
        state.qrCodeLoading = true;
        state.qrCodeError = null;
        state.qrCodeData = null;
      })
      .addCase(generateMachineQRCode.fulfilled, (state, action) => {
        state.qrCodeLoading = false;
        state.qrCodeData = action.payload.data;
        state.qrCodeError = null;
      })
      .addCase(generateMachineQRCode.rejected, (state, action) => {
        state.qrCodeLoading = false;
        state.qrCodeError = action.payload as string;
        state.qrCodeData = null;
      })

      // Fetch screensaver ads
      .addCase(fetchScreensaverAds.pending, (state) => {
        state.screensaverAdsLoading = true;
        state.screensaverAdsError = null;
        state.screensaverAds = null;
      })
      .addCase(fetchScreensaverAds.fulfilled, (state, action) => {
        state.screensaverAdsLoading = false;
        state.screensaverAds = action.payload.data.ads;
        state.screensaverAdsError = null;
      })
      .addCase(fetchScreensaverAds.rejected, (state, action) => {
        state.screensaverAdsLoading = false;
        state.screensaverAdsError = action.payload as string;
        state.screensaverAds = null;
      })

      // Check ad management access
      .addCase(checkAdManagementAccess.pending, (state) => {
        state.adManagementCheckLoading = true;
        state.adManagementCheckError = null;
        state.hasAdManagementAccess = null;
      })
      .addCase(checkAdManagementAccess.fulfilled, (state, action) => {
        state.adManagementCheckLoading = false;
        state.hasAdManagementAccess = action.payload.data;
        state.adManagementCheckError = null;
      })
      .addCase(checkAdManagementAccess.rejected, (state, action) => {
        state.adManagementCheckLoading = false;
        state.adManagementCheckError = action.payload as string;
        state.hasAdManagementAccess = false;
      });
  },
});

export const { 
  clearAdManagement, 
  clearCreateAdStatus, 
  clearUpdateAdStatus, 
  clearDeleteAdStatus,
  clearPublishAdStatus
} = adManagementSlice.actions;

export default adManagementSlice.reducer; 