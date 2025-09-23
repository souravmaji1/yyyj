import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Tag {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

interface TagResponse {
    statusCode: number;
    message: string;
    data: Tag[];
    pagination: PaginationInfo;
}

interface TagState {
    items: Tag[];
    pagination: PaginationInfo;
    loading: boolean;
    error: string | null;
    message: string | null;
}

const initialState: TagState = {
    items: [],
    pagination: {
        currentPage: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1
    },
    loading: true,
    error: null,
    message: null
};

export const fetchTags = createAsyncThunk(
    'tags/fetchTags',
    async ({ page, limit }: { page: number; limit: number }) => {
        const response = await axios.get<TagResponse>(`${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/tags`, {
            params: {
                page,
                limit,
            },
        });
        return response.data;
    }
);

const tagSlice = createSlice({
    name: 'tags',
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
            .addCase(fetchTags.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTags.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
                state.message = action.payload.message;
            })
            .addCase(fetchTags.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch tags';
            });
    },
});

export const { setPage, setPageSize } = tagSlice.actions;
export default tagSlice.reducer;
