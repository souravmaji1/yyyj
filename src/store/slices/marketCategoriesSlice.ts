import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { arenaAxiosClient } from '@/src/app/apis/auth/axios';

interface Category {
  label: string;
  slug: string;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  message: null
};

export const fetchAllCategories = createAsyncThunk(
  'categories/fetchAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await arenaAxiosClient.get('/polymarket/categories');
      console.log('Categories response:', response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const CategoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        console.log(state,'state')
        state.loading = false;
        state.categories = action.payload;
        state.message = 'Categories fetched successfully';
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });
  },
});

export default CategoriesSlice.reducer;