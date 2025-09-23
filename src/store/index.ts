import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'user',      // User profile and authentication data
    'cart',      // Cart items and state
    'kioskCart', // Kiosk cart items and state
    'payment',   // Payment information
    'order',     // Order data
    'coupon',    // Coupon/discount data
    'kyc',       // KYC verification data
    'adminSettings', // Admin settings
    'product',
    'ui',           // Don't persist UI state
    'catalog',      // Don't persist catalog data (can be fetched)
    'tags',         // Don't persist tags (can be fetched)
    'productFilter', // Don't persist filters (user preference)
    'productPayment', // Don't persist product payment (temporary)
    'allNft',       // Don't persist NFT data (can be fetched)
    'transfer',
    'notifications', // Notification data
    'adManagement', // Ad management access and data
    'tryon' // Try-on jobs and state
  ],
  blacklist: [
    // Don't persist transfer data (temporary)
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        ignoredPaths: ['user', 'cart', 'payment', 'order'], // Ignore serialization check for persisted data
      },
    }),
  devTools: process.env.NEXT_PUBLIC_ENVIROMENT !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
