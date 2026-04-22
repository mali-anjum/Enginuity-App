import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { PostAuthOnboardingSync } from '@/auth/organisms/post-auth-onboarding-sync';
import { SupabaseAuthSync } from '@/auth/hooks/useSupabaseAuthSync';
import { NetworkStatusBanner } from '@/sharedModules/organisms/network-status-banner';
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
        <View style={styles.root}>
          {children}
          <NetworkStatusBanner />
        </View>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
