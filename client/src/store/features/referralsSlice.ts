import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

export const fetchReferralsCountByReferId = createAsyncThunk('referrals/fetchReferralsCountByReferId', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/referrals/refer/count`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

interface IReferralsState {
  referralsCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: IReferralsState = {
  referralsCount: 0,
  loading: false,
  error: null,
};

const referralsSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    // Define your synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralsCountByReferId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferralsCountByReferId.fulfilled, (state, action) => {
        state.loading = false;
        state.referralsCount = action.payload;
      })
      .addCase(fetchReferralsCountByReferId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default referralsSlice.reducer;