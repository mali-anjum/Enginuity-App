import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { Platform } from 'react-native';

import authReducer from '@/auth/state/authSlice';
import experimentReducer from '@/experiment/state/experimentSlice';
import hardwareReducer from '@/hardware/state/hardwareSlice';
import notesReducer from '@/notes/state/notesSlice';
import onboardingReducer from '@/onboarding/state/onboardingSlice';
import projectReducer from '@/project/state/projectSlice';
import uiReducer from '@/ui/state/uiSlice';

const createNoopStorage = () => ({
  getItem: async (_key: string) => null,
  setItem: async (_key: string, value: unknown) => value,
  removeItem: async (_key: string) => undefined,
});

const webStorage =
  Platform.OS === 'web'
    ? typeof window !== 'undefined'
      ? {
          getItem: async (key: string) => window.localStorage.getItem(key),
          setItem: async (key: string, value: string) => window.localStorage.setItem(key, value),
          removeItem: async (key: string) => window.localStorage.removeItem(key),
        }
      : createNoopStorage()
    : AsyncStorage;

const authPersistConfig = {
  key: 'auth',
  storage: webStorage,
  whitelist: ['session', 'user', 'status', 'error'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const onboardingPersistConfig = {
  key: 'onboarding',
  storage: webStorage,
  whitelist: ['hasCompletedOnboarding', 'selectedDiscipline'],
};

const persistedOnboardingReducer = persistReducer(onboardingPersistConfig, onboardingReducer);
const uiPersistConfig = {
  key: 'ui',
  storage: webStorage,
  whitelist: ['theme'],
};
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    onboarding: persistedOnboardingReducer,
    project: projectReducer,
    experiment: experimentReducer,
    notes: notesReducer,
    hardware: hardwareReducer,
    ui: persistedUiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
