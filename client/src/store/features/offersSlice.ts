import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

interface IOffer {
  id: number;
  gameId: number;
  title: string;
  imageUrl: string;
  priceRUB: number;
  priceUSDT: number;
  isEnabled: boolean;
}

interface IOffersState {
  offers: Array<IOffer>;
  offer: IOffer | null;
  loading: boolean;
  error: string | null | undefined;
}

const initialState: IOffersState = {
  offers: [],
  offer: null,
  loading: false,
  error: null,
};

export const addOffer = createAsyncThunk(
    'offers/addOffer',
    async (data: any, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post(`/offers`, data);
        return response.data;
      } catch (error: any) {
        if (error.response && error.response.data) {
          return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
      }
    }
);

// Thunk to fetch offers with query params
export const fetchOffers = createAsyncThunk(
  'offers/fetchOffers',
  async ({ gameId, isEnabled }: { gameId: number; isEnabled?: boolean }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/offers/game/${gameId}`, {
        params: { isEnabled },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOffer = createAsyncThunk(
  'offers/fetchOffer',
  async (gameId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/offers/${gameId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    // Define your synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.offers = [];
        state.error = action.payload as string;
      });
    builder
      .addCase(fetchOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offer = action.payload;
      })
      .addCase(fetchOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default offersSlice.reducer;
