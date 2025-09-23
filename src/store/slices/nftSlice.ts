import { getClientCookie } from '@/src/core/config/localStorage';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface NFTsItem {
  id: number;
  nftName: string;
  nftId: string | null;
  userId: string;
  collectionName: string;
  collectionId: number;
  supply: number;
  nftImgUrl: string;
  nftAttribute: string; // This is actually a stringified JSON
  nftTags: string; // This is actually a stringified JSON
  nftGame: string;
  description: string;
  isApproved: string;
  sold: number;
  price: number | null;
  discount: number | null;
  public: number | null;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  createdBy: string;
  isEligibleForDiscount?: boolean;
  purchaseDate?: string;
  rewardDate?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  count: number;
}

interface NftsResponse {
  error: boolean;
  message: string;
  data: NFTsItem[];
  meta: PaginationInfo;
}

interface NftState {
  nftItems: NFTsItem[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: NftState = {
  nftItems: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    count: 0,
  },
  loading: false,
  error: null,
  message: null,
};

export const fetchAllnfts = createAsyncThunk(
  "nfts/fetchAll",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<NftsResponse>(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getPublicNft`,
        {
          params: {
            page,
            count: limit,
            sort: "desc",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch NFTs"
      );
    }
  }
);

// New thunk to fetch NFTs for a specific user
export const fetchUserNfts = createAsyncThunk(
  'nfts/fetchUser',
  async (
    { userId }: { userId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = getClientCookie('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getUserBuyNft/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.error || !response.data.data) {
        return {
          data: [],
          meta: { currentPage: 1, totalPages: 1, count: 0 },
          message: response.data.msg || '',
        };
      }
      return {
        data: response.data.data,
        meta: { currentPage: 1, totalPages: 1, count: response.data.data.length },
        message: response.data.msg || '',
      };
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return {
          data: [],
          meta: { currentPage: 1, totalPages: 1, count: 0 },
          message: 'No NFTs available for discount',
        };
      }
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch user NFTs');
    }
  }
);

export const transferNftForDiscount = createAsyncThunk(
  'nfts/transferNftForDiscount',
  async ({ 
    nftId, 
    userId, 
    orderId 
  }: { 
    nftId: string; 
    userId: string; 
    orderId: string;
  }, { rejectWithValue }) => {
    try {
      const token = getClientCookie('accessToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/rewardDistribute`,
        {
          type: 'nft',
          nftId: nftId,
          userId: userId,
          orderId: orderId,
          action: 'transfer_for_discount'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to transfer NFT');
    }
  }
);

// Interface for getAllNft parameters
interface GetAllNftParams {
  nftGame: string; // Required - will be passed dynamically from hover
  sort?: string;
  page?: number;
  limit?: number;
}

// New thunk to fetch all NFTs with specific game filter
export const getAllNft = createAsyncThunk(
  'nfts/getAllNft',
  async (
    { 
      nftGame,
      sort = 'desc',
    }: GetAllNftParams,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<NftsResponse>(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getAllNft`,
        {
          params: {
            nftGame: nftGame,
            sort,
          },
        }
      );
      console.log(response.data,'response.data')
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch NFTs"
      );
    }
  }
);

const NftSlice = createSlice({
  name: "allNft",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      // Note: Your API uses 'count' instead of 'pageSize'
      state.pagination.count = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllnfts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllnfts.fulfilled, (state, action) => {
        state.loading = false;
        state.nftItems = action.payload.data;
        state.pagination = {
          currentPage: action.payload.meta.currentPage,
          totalPages: action.payload.meta.totalPages,
          count: action.payload.meta.count,
        };
        state.message = action.payload.message;
      })
      .addCase(fetchAllnfts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch NFTs';
      })
      .addCase(fetchUserNfts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNfts.fulfilled, (state, action) => {
        state.loading = false;
        state.nftItems = action.payload.data;
        state.pagination = {
          currentPage: action.payload.meta.currentPage,
          totalPages: action.payload.meta.totalPages,
          count: action.payload.meta.count
        };
        state.message = action.payload.message;
      })
      .addCase(fetchUserNfts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user NFTs';
      })
      .addCase(getAllNft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllNft.fulfilled, (state, action) => {
        state.loading = false;
        state.nftItems = action.payload.data;
        state.pagination = {
          currentPage: action.payload.meta.currentPage,
          totalPages: action.payload.meta.totalPages,
          count: action.payload.meta.count,
        };
        state.message = action.payload.message;
      })
      .addCase(getAllNft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch NFTs';
      });
  },
});

export default NftSlice.reducer;
