import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAxiosClient } from '@/src/app/apis/auth/axios';

interface ProductPaymentResponse {
  url: string;
  qrCode: string;
  paymentId: string;
  status: string;
}

interface ProductPaymentPayload {
  amount: number;
  userId: string;
  currency: string;
  paymentType: string;
  orderId: string;
  paymentMethod?: string;
}

export interface ProductPaymentState {
  paymentData: ProductPaymentResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductPaymentState = {
  paymentData: null,
  loading: false,
  error: null
};

export const createProductPayment = createAsyncThunk(
  'productPayment/create',
  async (paymentPayload: ProductPaymentPayload, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.post(
        '/createPaymentForToken',
        paymentPayload
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to create payment');
    }
  }
);

const productPaymentSlice = createSlice({
  name: 'productPayment',
  initialState,
  reducers: {
    clearProductPayment: (state) => {
      state.paymentData = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductPayment.fulfilled, (state, action) => {
        state.paymentData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createProductPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearProductPayment } = productPaymentSlice.actions;
export default productPaymentSlice.reducer; 