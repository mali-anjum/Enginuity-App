import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { PostAuthOnboardingSync } from '@/auth/components/PostAuthOnboardingSync';
import { SupabaseAuthSync } from '@/auth/hooks/useSupabaseAuthSync';
import { initializeSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { persistor } from '@/sharedModules/state/persistor';
import { store } from '@/sharedModules/state/store';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeSupabaseClient();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SupabaseAuthSync />
        <PostAuthOnboardingSync />
        {children}
      </PersistGate>
    </Provider>
  );
}
