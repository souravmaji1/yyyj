import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define specific types for our sort and view options
export type SortOptionType = 
  | 'default'
  | 'newest'
  | 'best-selling'
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'popularity';

export type ViewType = 'grid' | 'list';

// Define interface for filter options from API
interface FilterOptions {
  catalogs: string[];
  colors: string[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

// Enhanced interface with proper types
interface FilterState {
  priceRange: [number, number];
  view: ViewType;
  itemsPerPage: string;
  currentPage: number;
  selectedCatalogs: string[];
  selectedColors: string[];
  selectedSizes: string[];
  searchQuery: string;
  sortOption: SortOptionType;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  // Add available options
  availableFilters: {
    catalogs: string[];
    colors: string[];
    sizes: string[];
  };
  isLoadingFilters: boolean;
  filterError: string | null;
}

const initialState: FilterState = {
  priceRange: [0, 1000000],
  view: 'grid',
  itemsPerPage: '12',
  currentPage: 1,
  selectedCatalogs: [],
  selectedColors: [],
  selectedSizes: [],
  searchQuery: '',
  sortOption: 'default',
  totalItems: 1000, // Default total items
  isLoading: false,
  error: null,
  // Add initial state for available options
  availableFilters: {
    catalogs: [],
    colors: [],
    sizes: [],
  },
  isLoadingFilters: false,
  filterError: null
};

// Create thunk for fetching filter options
export const fetchFilterOptions = createAsyncThunk(
  'productFilter/fetchFilterOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<FilterOptions>(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/custom/all-products-for-user`, {
        params: {
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Failed to fetch filter options',
        error: error
      });
    }
  }
);

const productFilterSlice = createSlice({
  name: 'productFilter',
  initialState,
  reducers: {
    updateFilter: (
      state,
      action: PayloadAction<{ key: keyof FilterState; value: any }>
    ) => {
      const { key, value } = action.payload;
      
      // Type-safe updates with specific handling for different keys
      switch (key) {
        case 'itemsPerPage':
          state.itemsPerPage = String(value);
          state.currentPage = 1; // Reset page when changing items per page
          break;
        
        case 'sortOption':
          state.sortOption = value as SortOptionType;
          state.currentPage = 1; // Reset page when changing sort
          break;
        
        case 'currentPage':
          state.currentPage = Number(value);
          break;
        
        case 'view':
          state.view = value as ViewType;
          break;
        
        case 'priceRange':
          state.priceRange = value as [number, number];
          state.currentPage = 1; // Reset page when changing price range
          break;
        
        case 'selectedCatalogs':
        case 'selectedColors':
        case 'selectedSizes':
          state[key] = value as string[];
          state.currentPage = 1; // Reset page when changing filters
          break;
        
        case 'searchQuery':
          state.searchQuery = value as string;
          state.currentPage = 1; // Reset page when searching
          break;
        
        default:
          (state[key] as any) = value;
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },

    resetFilters: (state) => {
      return {
        ...initialState,
        view: state.view, // Preserve view preference
        itemsPerPage: state.itemsPerPage // Preserve items per page preference
      };
    },

    // Add a new action to update multiple filters at once
    updateMultipleFilters: (
      state,
      action: PayloadAction<Partial<FilterState>>
    ) => {
      Object.entries(action.payload).forEach(([key, value]) => {
        (state[key as keyof FilterState] as any) = value;
      });
      state.currentPage = 1; // Reset to first page when bulk updating filters
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilterOptions.pending, (state) => {
        state.isLoadingFilters = true;
        state.filterError = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.isLoadingFilters = false;
        state.availableFilters = {
          catalogs: action.payload.catalogs,
          colors: action.payload.colors,
          sizes: action.payload.sizes,
        };
        // Update price range if provided
        if (action.payload.priceRange) {
          state.priceRange = [action.payload.priceRange.min, action.payload.priceRange.max];
        }
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.isLoadingFilters = false;
        state.filterError = action.error.message || 'Failed to fetch filter options';
      });
  },
});

// Export actions
export const {
  updateFilter,
  setLoading,
  setError,
  setTotalItems,
  resetFilters,
  updateMultipleFilters
} = productFilterSlice.actions;

// Export reducer
export default productFilterSlice.reducer;

// Selector helpers
export const selectProductFilter = (state: { productFilter: FilterState }) => state.productFilter;

export const selectPaginationInfo = (state: { productFilter: FilterState }) => {
  const { currentPage, itemsPerPage, totalItems } = state.productFilter;
  const startItem = (currentPage - 1) * Number(itemsPerPage) + 1;
  const endItem = Math.min(currentPage * Number(itemsPerPage), totalItems);
  
  return {
    startItem,
    endItem,
    totalItems,
    currentPage,
    itemsPerPage: Number(itemsPerPage)
  };
};

