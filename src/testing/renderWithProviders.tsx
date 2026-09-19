import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import authReducer from '@/auth/state/authSlice';
import activityFeedReducer from '@/dashboard/state/activityFeedSlice';
import experimentReducer from '@/experiment/state/experimentSlice';
import hardwareReducer from '@/hardware/state/hardwareSlice';
import monetizationReducer from '@/monetization/state/monetizationSlice';
import notesReducer from '@/notes/state/notesSlice';
import onboardingReducer from '@/onboarding/state/onboardingSlice';
import projectReducer from '@/project/state/projectSlice';
import settingsReducer from '@/settings/state/settingsSlice';
import uiReducer from '@/ui/state/uiSlice';

// Plain (non-persisted) reducers matching `src/store/store.ts`'s shape, so
// smoke-render tests get a real Redux store without needing AsyncStorage /
// redux-persist rehydration wiring.
const testReducers = {
  auth: authReducer,
  onboarding: onboardingReducer,
  activityFeed: activityFeedReducer,
  project: projectReducer,
  experiment: experimentReducer,
  notes: notesReducer,
  hardware: hardwareReducer,
  monetization: monetizationReducer,
  ui: uiReducer,
  settings: settingsReducer,
};

type CombinedTestState = { [K in keyof typeof testReducers]: ReturnType<(typeof testReducers)[K]> };

export type TestPreloadedState = Partial<CombinedTestState>;

export function createTestStore(preloadedState?: TestPreloadedState) {
  return configureStore({
    reducer: testReducers,
    // RTK's combineReducers typing requires every slot to allow `undefined`
    // when preloadedState is a Partial — our slices don't model that, and
    // this helper only exists for tests, so the cast is scoped here.
    preloadedState: preloadedState as CombinedTestState | undefined,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });
}

export async function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: { preloadedState?: TestPreloadedState; store?: ReturnType<typeof createTestStore> } & Omit<
    RenderOptions,
    'wrapper'
  > = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  const result = await render(ui, { wrapper: Wrapper, ...renderOptions });
  return { store, ...result };
}
