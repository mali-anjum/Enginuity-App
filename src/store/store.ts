import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  configureStore,
  type Middleware,
  type MiddlewareAPI,
  type UnknownAction,
} from '@reduxjs/toolkit';
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
import { getRetryThunk, isAutoRetryType } from '@/store/retryRegistry';
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

const reducers = {
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
};

export type RootState = {
  [K in keyof typeof reducers]: ReturnType<(typeof reducers)[K]>;
};

type RejectedAsyncAction = UnknownAction & {
  type: string;
  payload?: unknown;
  error?: { message?: unknown };
  meta?: { arg?: unknown };
};

type FulfilledAsyncAction = UnknownAction & {
  type: string;
  meta?: { arg?: unknown };
};

function hasTypeSuffix(
  action: unknown,
  suffix: '/rejected' | '/fulfilled',
): action is UnknownAction & { type: string } {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof (action as { type?: unknown }).type === 'string' &&
    (action as { type: string }).type.endsWith(suffix)
  );
}

function isRejectedAsyncAction(action: unknown): action is RejectedAsyncAction {
  return hasTypeSuffix(action, '/rejected');
}

function isFulfilledAsyncAction(action: unknown): action is FulfilledAsyncAction {
  return hasTypeSuffix(action, '/fulfilled');
}

const retryToastMiddleware: Middleware = (
  api: MiddlewareAPI<AppDispatch, RootState>,
) => {
  const retryAttemptsByType = new Map<string, number>();
  const retryAttemptsByTypeAndArg = new WeakMap<object, Map<string, number>>();

  const getRetryAttempt = (typePrefix: string, arg: unknown): number => {
    if (arg !== null && typeof arg === 'object') {
      return retryAttemptsByTypeAndArg.get(arg)?.get(typePrefix) ?? 0;
    }
    return retryAttemptsByType.get(`${typePrefix}::${String(arg ?? '')}`) ?? 0;
  };

  const setRetryAttempt = (typePrefix: string, arg: unknown, value: number): void => {
    if (arg !== null && typeof arg === 'object') {
      const byType = retryAttemptsByTypeAndArg.get(arg) ?? new Map<string, number>();
      byType.set(typePrefix, value);
      retryAttemptsByTypeAndArg.set(arg, byType);
      return;
    }
    retryAttemptsByType.set(`${typePrefix}::${String(arg ?? '')}`, value);
  };

  const clearRetryAttempt = (typePrefix: string, arg: unknown): void => {
    if (arg !== null && typeof arg === 'object') {
      const byType = retryAttemptsByTypeAndArg.get(arg);
      if (!byType) return;
      byType.delete(typePrefix);
      if (byType.size === 0) {
        retryAttemptsByTypeAndArg.delete(arg);
      }
      return;
    }
    retryAttemptsByType.delete(`${typePrefix}::${String(arg ?? '')}`);
  };

  const scheduleAutoRetry = (
    dispatch: AppDispatch,
    typePrefix: string,
    arg: unknown,
    attempt: number,
  ) => {
    const thunk = getRetryThunk(typePrefix);
    if (!thunk || attempt > 3) return;
    const delayMs = 500 * 2 ** (attempt - 1);
    setTimeout(() => {
      dispatch(thunk(arg) as never);
    }, delayMs);
  };

  return (next) => (action) => {
    const result = next(action);

    if (isRejectedAsyncAction(action)) {
      const typePrefix = action.type.slice(0, -'/rejected'.length);
      const retryThunk = getRetryThunk(typePrefix);
      const arg = action.meta?.arg;
      const currentAttempt = getRetryAttempt(typePrefix, arg);
      const nextAttempt = currentAttempt + 1;
      setRetryAttempt(typePrefix, arg, nextAttempt);

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
    } else if (isFulfilledAsyncAction(action)) {
      const typePrefix = action.type.slice(0, -'/fulfilled'.length);
      clearRetryAttempt(typePrefix, action.meta?.arg);

      if (
        action.type === 'settings/manualSync/fulfilled' ||
        action.type === 'settings/processLocalSyncQueue/fulfilled'
      ) {
        api.dispatch(
          addToast({ message: 'Sync completed successfully.', variant: 'success' }),
        );
      }
    }

    return result;
  };
};

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(retryToastMiddleware),
});

export type AppDispatch = typeof store.dispatch;
