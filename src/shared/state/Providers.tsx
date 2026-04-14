import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { SupabaseAuthSync } from '@/modules/auth/hooks/useSupabaseAuthSync';
import { persistor } from '@/shared/state/persistor';
import { store } from '@/shared/state/store';

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
