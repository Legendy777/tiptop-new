import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

export const fetchWithdrawalsByMe = createAsyncThunk('referrals/fetchWithdrawalsByMe', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/withdrawals/me`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const createWithdrawal = createAsyncThunk('payments/createWithdrawal', async (withdrawalData: { amount: number }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/withdrawals', withdrawalData);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});


interface IWithdrawal {
    _id: number;
    userId: number;
    amount: number;
    status: 'pending' | 'completed' | 'rejected';
    currency: 'RUB' | 'USDT';
    createdAt: Date;
    updatedAt: Date;
}

interface IWithdrawalsState {
    withdrawals: IWithdrawal[];
    loading: boolean;
    error: string | null;
}

const initialState: IWithdrawalsState = {
    withdrawals: [],
    loading: false,
    error: null,
};

const withdrawalsSlice = createSlice({
    name: 'withdrawals',
    initialState,
    reducers: {
        // Define your synchronous actions here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWithdrawalsByMe.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWithdrawalsByMe.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawals = action.payload;
            })
            .addCase(fetchWithdrawalsByMe.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createWithdrawal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createWithdrawal.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawals.push(action.payload);
            })
            .addCase(createWithdrawal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

    }
});

export default withdrawalsSlice.reducer;