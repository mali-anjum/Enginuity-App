import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { Platform } from 'react-native';

import authReducer from '@/auth/state/authSlice';
import activityFeedReducer from '@/dashboard/state/activityFeedSlice';
import experimentReducer from '@/experiment/state/experimentSlice';
import hardwareReducer from '@/hardware/state/hardwareSlice';
import monetizationReducer from '@/monetization/state/monetizationSlice';
import notesReducer from '@/notes/state/notesSlice';
import onboardingReducer from '@/onboarding/state/onboardingSlice';
import projectReducer from '@/project/state/projectSlice';
import settingsReducer from '@/settings/state/settingsSlice';
import { getRetryThunk, isAutoRetryType } from '@/sharedModules/state/retryRegistry';
import uiReducer, { addToast } from '@/ui/state/uiSlice';

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
  whitelist: [
    'hasCompletedOnboarding',
    'hasCompletedPreAuthProfile',
    'selectedDiscipline',
    'selectedDisciplines',
    'profileDraft',
  ],
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
    activityFeed: activityFeedReducer,
    project: projectReducer,
    experiment: experimentReducer,
    notes: notesReducer,
    hardware: hardwareReducer,
    monetization: monetizationReducer,
    ui: persistedUiReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(() => {
      const retryAttempts = new Map<string, number>();

      const toRetryKey = (typePrefix: string, arg: unknown) =>
        `${typePrefix}::${JSON.stringify(arg ?? null)}`;

      const scheduleAutoRetry = (dispatch: AppDispatch, typePrefix: string, arg: unknown, attempt: number) => {
        const thunk = getRetryThunk(typePrefix);
        if (!thunk || attempt > 3) return;
        const delayMs = 500 * 2 ** (attempt - 1);
        setTimeout(() => {
          dispatch(thunk(arg));
        }, delayMs);
      };

      return (api) => (next) => (action) => {
        const result = next(action);

        if (typeof action.type === 'string' && action.type.endsWith('/rejected')) {
          const typePrefix = action.type.slice(0, -'/rejected'.length);
          const retryThunk = getRetryThunk(typePrefix);
          const arg = action.meta?.arg;
          const retryKey = toRetryKey(typePrefix, arg);
          const currentAttempt = retryAttempts.get(retryKey) ?? 0;
          const nextAttempt = currentAttempt + 1;
          retryAttempts.set(retryKey, nextAttempt);

          if (isAutoRetryType(typePrefix) && nextAttempt <= 3) {
            scheduleAutoRetry(api.dispatch, typePrefix, arg, nextAttempt);
          }

          const payload = action.payload;
          const fallback = action.error?.message;
          const message =
            typeof payload === 'string'
              ? payload
              : typeof fallback === 'string'
                ? fallback
                : 'Something went wrong.';
          api.dispatch(
            addToast({
              message,
              variant: 'error',
              retry: retryThunk
                ? {
                    typePrefix,
                    arg,
                    attempt: nextAttempt,
                    maxAttempts: 3,
                  }
                : undefined,
            }),
          );
        } else if (typeof action.type === 'string' && action.type.endsWith('/fulfilled')) {
          const typePrefix = action.type.slice(0, -'/fulfilled'.length);
          const retryKey = toRetryKey(typePrefix, action.meta?.arg);
          retryAttempts.delete(retryKey);

          if (
            action.type === 'settings/manualSync/fulfilled' ||
            action.type === 'settings/processLocalSyncQueue/fulfilled'
          ) {
            api.dispatch(addToast({ message: 'Sync completed successfully.', variant: 'success' }));
          }
        }

        return result;
      };
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
