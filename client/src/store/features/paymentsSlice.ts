import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

export const createCryptoPayment = createAsyncThunk('payments/createCryptoPayment', async (paymentData: { gameName: string; offerName: string; price: number }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/payments/crypto', paymentData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

export const createRubPayment = createAsyncThunk('payments/createRubPayment', async (paymentData: { gameName: string; offerName: string; price: number }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/payments/rub', paymentData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

interface IOrdersState {
  paymentLink: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: IOrdersState = {
  paymentLink: null,
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // Define your synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCryptoPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCryptoPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentLink = action.payload.invoice.miniAppInvoiceUrl;
      })
      .addCase(createCryptoPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
        .addCase(createRubPayment.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createRubPayment.fulfilled, (state, action) => {
          state.loading = false;
          state.paymentLink = action.payload.invoice.payUrl;
        })
        .addCase(createRubPayment.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  },
});

export default paymentsSlice.reducer;