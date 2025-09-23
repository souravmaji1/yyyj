import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentAxiosClient } from "@/src/app/apis/auth/axios";

export interface AdminSetting {
  id: number;
  keyName: string;
  keyValue: number;
  keyComment: string;
  costAdsvideoPerday?: number | null;
    // AI Studio Generation Costs
  aiStudioImageCost?: number | null;
  aiStudioVideoCost?: number | null;
  aiStudioEnhancementCost?: number | null;
  aiStudioDownloadCost?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminSettingsResponse {
  success: boolean;
  data: AdminSetting[];
}

export interface AdminSettingState {
  settings: AdminSetting[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminSettingState = {
  settings: [],
  loading: false,
  error: null,
};

export const fetchAdminSettings = createAsyncThunk(
  "adminSettings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.get<AdminSettingsResponse>(
        "/getAllAdminSettings"
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Admin settings fetch error:", error);
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch admin settings"
      );
    }
  }
);

const adminSettingSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {
    clearAdminSettings: (state) => {
      state.settings = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAdminSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminSettings } = adminSettingSlice.actions;
export default adminSettingSlice.reducer; 