import { configureStore } from "@reduxjs/toolkit";
import gamesReducer from "./features/gamesSlice.ts";
import offersReducer from "./features/offersSlice.ts";
import userReducer from "./features/userSlice.ts";
import ordersReducer from "./features/ordersSlice.ts";
import orderDetailsReducer from "./features/orderDetailsSlice.ts";
import paymentsReducer from "./features/paymentsSlice.ts";
import transactionsReducer from "./features/transactionsSlice.ts";
import referralsReducer from "./features/referralsSlice.ts";
import withdrawalsReducer from "./features/withdrawalsSlice.ts";
import reviewsReducer from "./features/reviewsSlice.ts";

const store = configureStore({
  reducer: {
    // Add your reducers here
    games: gamesReducer,
    offers: offersReducer,
    user: userReducer,
    orders: ordersReducer,
    ordersDetails: orderDetailsReducer,
    payments: paymentsReducer,
    transactions: transactionsReducer,
    referrals: referralsReducer,
    withdrawals: withdrawalsReducer,
    reviews: reviewsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;