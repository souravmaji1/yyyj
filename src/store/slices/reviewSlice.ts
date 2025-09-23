import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAxiosClient from '@/src/app/apis/auth/axios';
// Types
export interface ReviewMedia {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
}

export interface Review {
  id: string;
  user: { id: string; name: string; avatarUrl?: string };
  rating: number;
  text: string;
  media: ReviewMedia[];
  createdAt: string;
  isEditable?: boolean;
  isLocked?: boolean;
  productId?: number;
  orderId?: string;
  helpfulCount?: number;
}

interface ReviewState {
  userReviews: Review[];
  productReviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  userReviews: [],
  productReviews: [],
  loading: false,
  error: null,
};

// Map API review to UI Review type
function mapApiReviewToUI(review: any): Review {
  return {
    id: review.id,
    user: { id: review.userId, name: 'Anonymous' }, // You can enhance this if you fetch user info
    rating: review.rating,
    text: review.content,
    media: [
      ...(Array.isArray(review.images)
        ? review.images.map((url: string, i: number) => ({
            id: `img-${i}`,
            mediaType: 'image',
            mediaUrl: url,
          }))
        : []),
      ...(Array.isArray(review.videos)
        ? review.videos.map((url: string, i: number) => ({
            id: `vid-${i}`,
            mediaType: 'video',
            mediaUrl: url,
          }))
        : []),
    ],
    createdAt: review.createdAt,
    isEditable: review.canEdit,
    isLocked: review.editTimeRemaining === 0,
    productId: review.productId,
    orderId: review.orderId,
  };
}

// Thunks
export const fetchUserReviews = createAsyncThunk('reviews/fetchUserReviews', async (_, { rejectWithValue }) => {
  try {
    const res = await authAxiosClient.get('/reviews/user');
    const arr = Array.isArray(res.data.data) ? res.data.data : [];
    return arr.map(mapApiReviewToUI);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchProductReviews = createAsyncThunk(
    'reviews/fetchProductReviews',
    async (productId: string, { rejectWithValue }) => {
      try {
        const res = await authAxiosClient.get(`/reviews/product/${productId}`);
        const arr = Array.isArray(res.data.data) ? res.data.data : [];
        return arr.map(mapApiReviewToUI);
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );

export const createReview = createAsyncThunk('reviews/createReview', async (data: any, { rejectWithValue }) => {
  try {
    const res = await authAxiosClient.post('/reviews/with-files', data);
    // Handle different response structures
    const reviewData = res.data?.data || res.data;
    return mapApiReviewToUI(reviewData);
  } catch (err: any) {
    const errorMessage = err
    return rejectWithValue(errorMessage);
  }
});

export const updateReview = createAsyncThunk('reviews/updateReview', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
  try {
    const res = await authAxiosClient.put(`/reviews/${id}`, data);
    return mapApiReviewToUI(res.data);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const deleteReview = createAsyncThunk('reviews/deleteReview', async (id: string, { rejectWithValue }) => {
  try {
    const res = await authAxiosClient.delete(`/reviews/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const addReviewMedia = createAsyncThunk('reviews/addReviewMedia', async ({ id, file }: { id: string; file: File }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await authAxiosClient.post(`/reviews/${id}/media`, formData);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch user reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews.unshift(action.payload);
        // Also add to product reviews if it matches the current product
        if (action.payload.productId) {
          state.productReviews.unshift(action.payload);
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.userReviews.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.userReviews[idx] = action.payload;
        // Also update in product reviews
        const productIdx = state.productReviews.findIndex(r => r.id === action.payload.id);
        if (productIdx !== -1) state.productReviews[productIdx] = action.payload;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const reviewId = action.meta.arg;
        state.userReviews = state.userReviews.filter(r => r.id !== reviewId);
        state.productReviews = state.productReviews.filter(r => r.id !== reviewId);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add review media
      .addCase(addReviewMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReviewMedia.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the review's media here
      })
      .addCase(addReviewMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reviewSlice.reducer; 