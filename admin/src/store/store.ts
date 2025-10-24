import { configureStore } from "@reduxjs/toolkit";
import gamesReducer from "./features/gamesSlice.ts";
import offersReducer from "./features/offersSlice.ts";
import ordersReducer from "./features/ordersSlice.ts";
import authReducer from "./features/authSlice.ts";

const store = configureStore({
    reducer: {
        // Add your reducers here
        games: gamesReducer,
        offers: offersReducer,
        orders: ordersReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;