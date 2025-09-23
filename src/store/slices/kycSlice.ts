import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';
import { RootState } from '@/src/store';
import { updateProfile } from './userSlice';

interface KycState {
  verificationUrl: string | null;
  sessionId: string | null;
  kycStatus: string | null;
  qrCode: string | null;
  loading: boolean;
  error: string | null;
  kycData: any | null;
}

const initialState: KycState = {
  verificationUrl: null,
  sessionId: null,
  kycStatus: null,
  qrCode: null,
  loading: false,
  error: null,
  kycData: null,
};

// Create KYC with userId parameter
export const createKyc = createAsyncThunk(
  'kyc/createKyc',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post('/kyc/createKyc', { userId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create KYC');
    }
  }
);

export const createKycSession = createAsyncThunk(
  'kyc/createSession',
  async (kycPayload: any, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post('/kyc/createKyc', kycPayload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create KYC');
    }
  }
);

export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchStatus',
  async (sessionId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await authAxiosClient.get(`/kyc/status?sessionId=${sessionId}`);
      const status = response.data;
      return status;
    } catch (error: any) {
      return rejectWithValue(error || 'Failed to fetch status');
    }
  }
);

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    clearKyc: (state) => {
      state.verificationUrl = null;
      state.sessionId = null;
      state.kycStatus = null;
      state.loading = false;
      state.error = null;
      state.kycData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create KYC cases
      .addCase(createKyc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKyc.fulfilled, (state, action) => {
        state.kycData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createKyc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create KYC Session cases
      .addCase(createKycSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKycSession.fulfilled, (state, action) => {
        state.verificationUrl = action.payload.verificationUrl;
        state.sessionId = action.payload.sessionId;
        state.qrCode = action.payload.qrCode;
        state.loading = false;
      })
      .addCase(createKycSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        state.kycStatus = action.payload as string;
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearKyc } = kycSlice.actions;
export default kycSlice.reducer;
