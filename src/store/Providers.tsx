import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { PostAuthOnboardingSync } from '@/auth/organisms/post-auth-onboarding-sync';
import { SupabaseAuthSync } from '@/auth/hooks/useSupabaseAuthSync';
import { NetworkStatusBanner } from '@/sharedModules/organisms/network-status-banner';
import { OfflineSyncReconciler } from '@/sharedModules/organisms/offline-sync-reconciler';
import { SharedProjectsRealtimeSync } from '@/sharedModules/organisms/shared-projects-realtime-sync';
import { WebSafeAreaProvider } from '@/sharedModules/organisms/web-safe-area-provider';
import { initializeSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { persistor } from '@/store/persistor';
import { store } from '@/store/store';

// Must run before any child mounts (SupabaseAuthSync reads the client in its own
// mount effect, and child effects fire before parent effects in React) — so this
// runs at module load instead of inside a useEffect here.
initializeSupabaseClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}>
        <SupabaseAuthSync />
        <PostAuthOnboardingSync />
        <OfflineSyncReconciler />
        <SharedProjectsRealtimeSync />
        <WebSafeAreaProvider>
          <View style={styles.root}>
            {children}
            <NetworkStatusBanner />
          </View>
        </WebSafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
