import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentAxiosClient } from "@/src/app/apis/auth/axios";

interface PaymentResponse {
  url: string;
  qrCode: string;
  paymentId: string;
}

interface PaymentPayload {
  userId: string;
  amount: number;
  currency: string;
  redirect: string;
  totalAmount: number;
  addressId: string | null;
  discountAmount: number;
  message: string;
  orderItems: {
    productId: string;
    unitPrice: number;
    quantity: number;
    variantId?: string;
  }[];
}

interface TokenPaymentPayload {
  userId: string;
  amount: number;
  currency: string;
  paymentType: string;
  tokenAmount?: number
}

interface TokenTransferPayload {
  userId: string;
  amount: number;
  to: string;
  orderId?: string;
}

export interface PaymentState {
  paymentData: PaymentResponse | null;
  crpOrderId: string | null;
  loading: boolean;
  error: string | null;
  verifiedSessions: Record<string, boolean>;
  userPayments: any[];
}

const initialState: PaymentState = {
  paymentData: null,
  crpOrderId: null,
  loading: false,
  error: null,
  verifiedSessions: {},
  userPayments: [],
};

export const createStripePayment = createAsyncThunk(
  "payment/createStripePayment",
  async (paymentPayload: PaymentPayload, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.post(
        "/createStripePayment",
        paymentPayload
      );
      return response.data;
    } catch (error: any) {
      console.error("Payment error:", error);
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create payment"
      );
    }
  }
);

export const createTokenPayment = createAsyncThunk(
  "payment/createTokenPayment",
  async (paymentPayload: TokenPaymentPayload, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.post(
        "/createPaymentForToken",
        paymentPayload
      );
      return response.data;
    } catch (error: any) {
      console.error("Token payment error:", error);
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create token payment"
      );
    }
  }
);

export const transferToken = createAsyncThunk(
  "payment/transferToken",
  async (payload: TokenTransferPayload, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.post(
        "/transferToken",
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("Token transfer error:", error);
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to transfer tokens"
      );
    }
  }
);

export const checkStripePayment = createAsyncThunk(
  "payment/checkStripeProductPayment",
  async (sessionId: string, { getState, rejectWithValue }) => {
    const state = getState() as { payment: PaymentState };

    // Check if session was already verified
    if (state?.payment?.verifiedSessions[sessionId]) {
      return { success: true, isAlreadyProcessed: true };
    }
    try {
      const response = await paymentAxiosClient.get(
        `/checkStripeProductPayment?session_id=${sessionId}`
      );
      // Consider "Transaction already completed" as a success case
      if (
        response.data.success &&
        response.data.message === "Transaction already completed"
      ) {
        return { success: true, message: response.data.message };
      }
      return response.data;
    } catch (error: any) {
      console.error("Payment verification error:", error);
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to verify payment"
      );
    }
  }
);

export const createCryptoPayment = createAsyncThunk(
  "payment/createCryptoPayment",
  async (paymentPayload: { amount: number; currency: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.post(
        "/createCoinbasePayment",
        paymentPayload
      );
      return response.data;
    } catch (error: any) {
      console.error("Crypto payment error:", error);
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create crypto payment"
      );
    }
  }
);


const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.paymentData = null;
      state.loading = false;
      state.error = null;
      state.verifiedSessions = {};
    },
    setPaymentData: (state, action) => {
      state.paymentData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCrpOrderIdData: (state, action) => {
      state.crpOrderId = action.payload;
      //   state.loading = false;
      //   state.error = null;
    },
    setPaymentError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStripePayment.fulfilled, (state, action) => {
        state.paymentData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createStripePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTokenPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTokenPayment.fulfilled, (state, action) => {
        state.paymentData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createTokenPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkStripePayment.fulfilled, (state, action) => {
        if (action.payload.success) {
          if (!state.verifiedSessions) {
            state.verifiedSessions = {};
          }
          state.verifiedSessions[action.meta.arg] = true;
        }
      })
      .addCase(transferToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferToken.fulfilled, (state, action) => {
        state.paymentData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(transferToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCryptoPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCryptoPayment.fulfilled, (state, action) => {
        state.paymentData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createCryptoPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserPaymentDetails.fulfilled, (state, action) => {
        state.userPayments = action.payload;
      });
  },
});

// Add at the top with other thunks
export const fetchUserPaymentDetails = createAsyncThunk(
  "payment/fetchUserPaymentDetails",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.get(`/getUserPaymentDetails/${userId}`);
      if (response.data.success) {
        return response.data.data.payments;
      } else {
        return rejectWithValue(response.data.message || "Failed to fetch payment details");
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
// Add this to your paymentSlice.ts

export const exportUserPaymentsCsv = createAsyncThunk(
  "payment/exportUserPaymentsCsv",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.get(
        `/user/${userId}/payments/export-csv`,
        {
          responseType: "blob", // Important for file download
        }
      );
      return response.data; // This will be the blob
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to export CSV");
    }
  }
);

export const {
  clearPayment,
  setPaymentData,
  setPaymentError,
  setCrpOrderIdData,
} = paymentSlice.actions;
export default paymentSlice.reducer;
