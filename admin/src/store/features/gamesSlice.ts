import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../api/axiosInstance.ts';

// Add a new game
export const addGame = createAsyncThunk('games/addGame', async (data: any, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/games', data);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

// Async thunk to fetch games from an API
export const fetchGames = createAsyncThunk('games/fetchGames', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/games');
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

export const fetchActiveGames = createAsyncThunk(
    'games/fetchActiveGames',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/games/active');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchDiscountedGames = createAsyncThunk(
    'games/fetchDiscountedGames',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/games/discounts');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


// Thunk to search games
export const searchGames = createAsyncThunk(
    'games/searchGames',
    async (query: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/games/search`, {
                params: { query },
            });
            return response.data;
        } catch (error : any) {
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to fetch game by id from an API
export const fetchGame = createAsyncThunk('games/fetchGame', async (gameId: number, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/games/${gameId}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data);
        }
        return rejectWithValue(error.message);
    }
});

interface IGame {
    _id: number;
    title: string;
    imageUrl: string;
    gifUrl: string;
    hasDiscount: boolean;
    isActual: boolean;
    isEnabled: boolean;
    appleStoreUrl: string;
    googlePlayUrl: string;
    trailerUrl: string;
}

interface IGamesState {
    games: Array<IGame>,
    gamesCount: number,
    game: IGame | null,
    loading: boolean,
    error: string | null | undefined,
}

const initialState: IGamesState = {
    games: [],
    gamesCount: 0,
    game: null,
    loading: false,
    error: null,
};

const gamesSlice = createSlice({
    name: 'games',
    initialState,
    reducers: {
        // Define your synchronous actions here if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGames.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGames.fulfilled, (state, action) => {
                state.loading = false;
                state.games = action.payload;
                state.gamesCount = action.payload.length; // Assuming the payload contains the games array
            })
            .addCase(fetchGames.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
        builder
            .addCase(searchGames.pending, (state) => {
                state.loading = true;
            })
            .addCase(searchGames.fulfilled, (state, action) => {
                state.loading = false;
                state.games = action.payload;
            })
            .addCase(searchGames.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
        builder
            .addCase(fetchGame.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGame.fulfilled, (state, action) => {
                state.loading = false;
                state.game = action.payload;
            })
            .addCase(fetchGame.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
        builder
            .addCase(fetchActiveGames.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchActiveGames.fulfilled, (state, action) => {
                state.loading = false;
                state.games = action.payload;
            })
            .addCase(fetchActiveGames.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
        builder
            .addCase(fetchDiscountedGames.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDiscountedGames.fulfilled, (state, action) => {
                state.loading = false;
                state.games = action.payload;
            })
            .addCase(fetchDiscountedGames.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default gamesSlice.reducer;