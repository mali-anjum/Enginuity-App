import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

import authReducer from '@/auth/state/authSlice';
import onboardingReducer from '@/onboarding/state/onboardingSlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['session', 'user', 'status', 'error'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const onboardingPersistConfig = {
  key: 'onboarding',
  storage: AsyncStorage,
  whitelist: ['hasCompletedOnboarding', 'selectedDiscipline'],
};

const persistedOnboardingReducer = persistReducer(onboardingPersistConfig, onboardingReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    onboarding: persistedOnboardingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
