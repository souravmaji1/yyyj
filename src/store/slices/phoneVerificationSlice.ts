import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';

// Async thunks for phone verification
export const initiatePhoneVerification = createAsyncThunk(
  'phoneVerification/initiate',
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post(
        '/phone-verification/initiate',
        { phoneNumber }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error || 'Failed to initiate phone verification'
      );
    }
  }
);

export const verifyPhoneCode = createAsyncThunk(
  'phoneVerification/verify',
  async ({ sessionId, verificationCode }: { sessionId: string; verificationCode: string }, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post(
        '/phone-verification/verify',
        { sessionId, verificationCode }
      );
      
      // Check if the API response indicates failure
      if (response.data.status === false) {
        return rejectWithValue(response.data.message || 'Verification failed');
      }
      
      return response.data;
    } catch (error: any) {
      // Handle 400 status responses that contain error messages
      if (error.response?.status === 400 && error.response?.data) {
        return rejectWithValue(error.response.data.message || 'Verification failed');
      }
      
      return rejectWithValue(
        error || 'Failed to verify phone code'
      );
    }
  }
);

export const resendPhoneVerification = createAsyncThunk(
  'phoneVerification/resend',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post(
        '/phone-verification/resend',
        { sessionId }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error || 'Failed to resend verification code'
      );
    }
  }
);

interface PhoneVerificationState {
  sessionId: string | null;
  phoneNumber: string | null;
  isVerifying: boolean;
  isVerified: boolean;
  loading: boolean;
  error: string | null;
  resendLoading: boolean;
  resendError: string | null;
}

const initialState: PhoneVerificationState = {
  sessionId: null,
  phoneNumber: null,
  isVerifying: false,
  isVerified: false,
  loading: false,
  error: null,
  resendLoading: false,
  resendError: null,
};

const phoneVerificationSlice = createSlice({
  name: 'phoneVerification',
  initialState,
  reducers: {
    clearPhoneVerification: (state) => {
      state.sessionId = null;
      state.phoneNumber = null;
      state.isVerifying = false;
      state.isVerified = false;
      state.error = null;
      state.resendError = null;
    },
    setVerifying: (state, action) => {
      state.isVerifying = action.payload;
    },
    setVerified: (state, action) => {
      state.isVerified = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Initiate phone verification
    builder
      .addCase(initiatePhoneVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePhoneVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload.data.sessionId;
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(initiatePhoneVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify phone code
    builder
      .addCase(verifyPhoneCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPhoneCode.fulfilled, (state) => {
        state.loading = false;
        state.isVerified = true;
        state.isVerifying = false;
        state.error = null;
      })
      .addCase(verifyPhoneCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Resend verification code
    builder
      .addCase(resendPhoneVerification.pending, (state) => {
        state.resendLoading = true;
        state.resendError = null;
      })
      .addCase(resendPhoneVerification.fulfilled, (state) => {
        state.resendLoading = false;
        state.resendError = null;
      })
      .addCase(resendPhoneVerification.rejected, (state, action) => {
        state.resendLoading = false;
        state.resendError = action.payload as string;
      });
  },
});

export const { clearPhoneVerification, setVerifying, setVerified } = phoneVerificationSlice.actions;
export default phoneVerificationSlice.reducer; 