import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export interface CatalogItem {
  id: number;
  name: string;
  thumbnail: string;
  ageRestriction: boolean;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string;
  productcount: number;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface CatalogResponse {
  statusCode: number;
  message: string;
  data: CatalogItem[];
  pagination: PaginationInfo;
}

interface CatalogState {
  items: CatalogItem[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: CatalogState = {
  items: [],
  pagination: {
    currentPage: 1,
    pageSize: 3,
    totalItems: 0,
    totalPages: 1
  },
  loading: true,
  error: null,
  message: null
};

export const fetchCatalog = createAsyncThunk(
  'catalog/fetchCatalog',
  async ({ page, limit, productType, machineId }: { page: number; limit: number; productType: 'digital' | 'physical' | 'NFT' | 'online'; machineId: string }) => {
    const response = await axios.get<CatalogResponse>(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/catalog`, {
      params: {
        page,
        limit,
        productType,
        machineId: machineId || null
      },
    });
    return response.data;
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
        state.message = action.payload.message;
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch catalog';
      });
  },
});

export default catalogSlice.reducer;  // Add this line at the end