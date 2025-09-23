import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { arenaAxiosClient } from '@/src/app/apis/auth/axios';

export interface MarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  active: boolean;
  archived: boolean;
  automaticallyActive: boolean;
  closed: boolean;
  commentCount: number;
  competitive: number;
  createdAt: string;
  creationDate: string;
  cyom: boolean;
  deploying: boolean;
  deployingTimestamp: string;
  enableNegRisk: boolean;
  enableOrderBook: boolean;
  endDate: string;
  featured: boolean;
  gmpChartMode: string;
  icon: string;
  image: string;
  liquidity: number;
  liquidityClob: number;
  markets: any[];
  negRisk: boolean;
  negRiskAugmented: boolean;
  negRiskMarketID: string;
  new: boolean;
  openInterest: number;
  pendingDeployment: boolean;
  resolutionSource: string;
  restricted: boolean;
  series: any[];
  seriesSlug: string;
  showAllOutcomes: boolean;
  showMarketImages: boolean;
  startDate: string;
  startTime: string;
  tags: Array<{
    id: string;
    label: string;
    slug: string;
    forceShow: boolean;
    forceHide?: boolean;
    publishedAt: string;
    updatedAt: string;
    updatedBy?: number;
  }>;
  timestamp: number;
  tweetCount: number;
  updatedAt: string;
  volume: number;
  volume1mo: number;
  volume1wk: number;
  volume1yr: number;
  volume24hr: number;
}

export interface SeriesItem {
  series_ticker: string;
  series_title: string;
  total_series_volume: number;
  total_volume: number;
  event_ticker: string;
  event_subtitle: string;
  event_title: string;
  category: string;
  total_market_count: number;
  product_metadata: {
    categories: string[];
    promoted_milestone_id: string;
    subcategories: Record<string, string[]>;
  };
  product_metadata_derived: Record<string, unknown>;
  events: MarketEvent[];
  is_trending: boolean;
  is_new: boolean;
  is_closing: boolean;
  is_price_delta: boolean;
  search_score: number;
}

interface PaginationInfo {
  hasMore: boolean;
  totalResults: number;
}

interface SeriesResponse {
  events: MarketEvent[];
  pagination: PaginationInfo;
}

interface CategoryData {
  events: MarketEvent[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
}

interface SeriesState {
  categoriesData: Record<string, CategoryData>;
  globalLoading: boolean;
  globalError: string | null;
}

const initialState: SeriesState = {
  categoriesData: {},
  globalLoading: false,
  globalError: null
};

// ✅ Updated async thunk to match your given URL
export const getSeries = createAsyncThunk(
  'series/getseries',
  async (
    params: {
      tag_slug?: string;
      offset?: number;
      limit?: number;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const { tag_slug, offset = 0, limit = 5 } = params;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (tag_slug) {
        queryParams.append('tag_slug', tag_slug);
      }
      if (offset !== undefined) {
        queryParams.append('offset', offset.toString());
      }
      if (limit !== undefined) {
        queryParams.append('limit', limit.toString());
      }
      
      const response = await arenaAxiosClient.post<SeriesResponse>(`/polymarket/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      
      // Return additional metadata to help determine if this is a new category or load more
      return {
        ...response.data,
        isNewCategory: offset === 0,
        categorySlug: tag_slug
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch series');
    }
  }
);

const seriesSlice = createSlice({
  name: 'series',
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.categoriesData = {};
    },
    clearCategoryEvents: (state, action) => {
      const categorySlug = action.payload;
      if (state.categoriesData[categorySlug]) {
        delete state.categoriesData[categorySlug];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSeries.pending, (state, action) => {
        const { tag_slug } = action.meta.arg;
        const categorySlug = tag_slug || 'all';
        
        // Initialize category data if it doesn't exist
        if (!state.categoriesData[categorySlug]) {
          state.categoriesData[categorySlug] = {
            events: [],
            pagination: { hasMore: false, totalResults: 0 },
            loading: false,
            error: null
          };
        }
        
        state.categoriesData[categorySlug].loading = true;
        state.categoriesData[categorySlug].error = null;
      })
      .addCase(getSeries.fulfilled, (state, action) => {
        const { events, pagination, isNewCategory, categorySlug } = action.payload;
        const slug = categorySlug || 'all';
        
        // Ensure category data exists
        if (!state.categoriesData[slug]) {
          state.categoriesData[slug] = {
            events: [],
            pagination: { hasMore: false, totalResults: 0 },
            loading: false,
            error: null
          };
        }
        
        state.categoriesData[slug].loading = false;
        
        // If this is a new category (offset = 0), replace the events
        // If this is load more (offset > 0), append to existing events
        if (isNewCategory) {
          state.categoriesData[slug].events = events || [];
        } else {
          // Append new events to existing ones, avoiding duplicates
          const existingIds = new Set(state.categoriesData[slug].events.map(event => event.id));
          const newEvents = (events || []).filter(event => !existingIds.has(event.id));
          state.categoriesData[slug].events = [...state.categoriesData[slug].events, ...newEvents];
        }
        
        state.categoriesData[slug].pagination = {
          hasMore: pagination?.hasMore || false,
          totalResults: pagination?.totalResults || 0
        };
      })
      .addCase(getSeries.rejected, (state, action) => {
        const { tag_slug } = action.meta.arg;
        const categorySlug = tag_slug || 'all';
        
        if (!state.categoriesData[categorySlug]) {
          state.categoriesData[categorySlug] = {
            events: [],
            pagination: { hasMore: false, totalResults: 0 },
            loading: false,
            error: null
          };
        }
        
        state.categoriesData[categorySlug].loading = false;
        state.categoriesData[categorySlug].error = action.payload as string || 'Failed to fetch series';
      });
  },
});

export const { clearEvents, clearCategoryEvents } = seriesSlice.actions;
export default seriesSlice.reducer;
