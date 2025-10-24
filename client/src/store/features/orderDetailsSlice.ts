import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

export const createOrderDetails = createAsyncThunk('orderDetails/createOrderDetails', async (formData: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/order-details', formData);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const updateOrderDetails = createAsyncThunk('orderDetails/updateOrderDetails', async (formData: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/order-details/${formData.orderId}`, formData);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const fetchOrderDetails = createAsyncThunk('orderDetails/fetchOrderDetails', async (orderId: string, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/order-details/${orderId}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export interface IOrderDetails {
    _id: number;
    orderId: number;
    entry: string | null;
    login: string | null;
    password: string | null;
    code: string | null;
    server: string;
    nickname: string;
    userInGameId: number | null;
}

interface IOrderDetailsState {
    orderDetails: IOrderDetails | null;
    loading: boolean;
    error: string | null;
}

const initialState: IOrderDetailsState = {
    orderDetails: null,
    loading: false,
    error: null,
};

const orderDetailsSlice = createSlice({
    name: 'orderDetails',
    initialState,
    reducers: {
        // Define your synchronous actions here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.orderDetails = action.payload;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default orderDetailsSlice.reducer;