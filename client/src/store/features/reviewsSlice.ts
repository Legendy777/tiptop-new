import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

export const createReview = createAsyncThunk('referrals/createReview', async (payload: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/reviews`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const fetchReviews = createAsyncThunk('referrals/fetchReviews', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/reviews`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export interface IReview {
    _id: number;
    userId: number;
    orderId: number;
    username: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

interface IReviewsState {
    reviews: IReview[];
    loading: boolean;
    error: string | null;
}

const initialState: IReviewsState = {
    reviews: [],
    loading: false,
    error: null,
};

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        // Define your synchronous actions here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

    }
});

export default reviewsSlice.reducer;