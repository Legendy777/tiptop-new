import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance.ts';
import type {RootState} from "../store.ts";

interface AuthState {
    token: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('adminToken'),
    loading: false,
    error: null,
};

export const loginAdmin = createAsyncThunk(
    'auth/loginAdmin',
    async (credentials: { username: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/admin/login', credentials);
            localStorage.setItem('adminToken', response.data.token);
            return response.data.token;
        } catch {
            return rejectWithValue('Invalid credentials');
        }
    }
);

export const checkToken = createAsyncThunk(
    'auth/checkToken',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const token = state.auth.token;
        if (!token) return rejectWithValue('No token');

        try {
            await axiosInstance.get('/admin/protected', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return token;
        } catch {
            return rejectWithValue('Invalid token');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.token = null;
            localStorage.removeItem('adminToken');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.token = action.payload;
                state.loading = false;
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(checkToken.rejected, (state) => {
                state.token = null;
                localStorage.removeItem('adminToken');
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
