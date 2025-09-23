import { paymentAxiosClient } from "@/src/app/apis/auth/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface UserIdPayload {
  userId: string;
  to: any;
  type: string;
  nftId: string;
  nftAmount: any;
}

interface TransferNftState {
  loading: boolean;
  error: string | null;
}

const initialState: TransferNftState = {
  loading: false,
  error: null,
};

export const transferNft = createAsyncThunk(
  "rewardDistribute/transfer",
  async (transferPayload: UserIdPayload, { rejectWithValue }) => {
    try {
      const response = await paymentAxiosClient.post(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/rewardDistribute`,
        transferPayload
      );
      console.log("response", response);
      return response.data;
    } catch (error: any) {
      const errorMessage = error || "Failed to transfer";
      return rejectWithValue(errorMessage);
    }
  }
);

const transferNftSlice = createSlice({
  name: "rewardDistribute",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(transferNft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferNft.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(transferNft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default transferNftSlice.reducer;
