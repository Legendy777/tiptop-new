import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/orders/me`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const fetchOrder = createAsyncThunk('orders/fetchOrder', async (orderId: string, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const updateOrderStatus = createAsyncThunk('orders/updateOrderStatus', async (data: { orderId: string, status: string }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/orders/${data.orderId}/status/${data.status}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
    }
})

export interface IOrder {
    _id: number;
    paymentId: number;
    userId: number;
    offerId: number;
    orderDetailsId: number | null;
    status: 'pending' | 'process' | 'completed' | 'canceled' | 'invalid';
    currency: 'USDT' | 'RUB';
    gameTitle: string;
    createdAt: string;
    updatedAt: Date;
}

interface IOrdersState {
    orders: IOrder[];
    orderForm: IOrder | null;
    loading: boolean;
    error: string | null;
}

const initialState: IOrdersState = {
    orders: [],
    orderForm: null,
    loading: false,
    error: null,
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        // Define your synchronous actions here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
        builder
            .addCase(fetchOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orderForm = action.payload;
            })
            .addCase(fetchOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default ordersSlice.reducer;