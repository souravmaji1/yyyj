import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';

interface CouponResponse {
  code: string;
  discount: number;
  isValid: boolean;
  message?: string;
}

interface CouponPayload {
  code: string;
}

interface CouponState {
  couponData: CouponResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: CouponState = {
  couponData: null,
  loading: false,
  error: null
};

export const validateCoupon = createAsyncThunk(
  'coupon/validate',
  async (couponPayload: CouponPayload, { rejectWithValue }) => {
    try {
      const response = await authAxiosClient.post(
        '/api/coupons/validate',
        couponPayload
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to validate coupon');
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCoupon: (state) => {
      state.couponData = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.couponData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearCoupon } = couponSlice.actions;
export default couponSlice.reducer; 