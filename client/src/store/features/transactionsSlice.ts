import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

export const fetchTransactionsByReferId = createAsyncThunk('transactions/fetchTransactionsByReferId', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/transactions/refer`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

export interface ITransaction {
  _id: number;
  userId: number;
  username: string;
  referId?: number;
  amount: number;
  currency: 'RUB' | 'USDT';
  earned?: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ITransactionsState {
  transactions: ITransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: ITransactionsState = {
  transactions: [],
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Define your synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsByReferId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByReferId.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionsByReferId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default transactionsSlice.reducer;