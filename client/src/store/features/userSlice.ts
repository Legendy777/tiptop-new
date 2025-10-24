import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

// create new user
export const createUser = createAsyncThunk('user/createUser', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/users');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

// Update user language
export const updateLanguage = createAsyncThunk('user/updateLanguage', async (lang: 'ru' | 'en', { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put('/users/language', {language: lang});
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

// Async thunk to fetch game by id from an API
export const fetchUser = createAsyncThunk('user/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/users/me`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

interface IUser {
  _id: number;
  username: string;
  language: string;
  isBanned: boolean;
  isSubscribed: boolean;
  avatarUrl?: string;
  balanceRUB: number;
  balanceUSDT: number;
  ordersCount: number;
  referralCode?: string;
  referralPercent: number;
  acceptedPrivacyConsent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserState {
  user: IUser | null;
  isAuth: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: IUserState = {
  user: null,
  isAuth: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Define your synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuth = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
        .addCase(updateLanguage.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateLanguage.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload;
          state.isAuth = true;
        })
        .addCase(updateLanguage.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  }
});

export default userSlice.reducer;