import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store } from '@/state/store';
import { persistor } from '@/state/persistor';
import { SupabaseAuthSync } from '@/features/auth/hooks/useSupabaseAuthSync';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SupabaseAuthSync />
        {children}
      </PersistGate>
    </Provider>
  );
}

