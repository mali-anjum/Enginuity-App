import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { PostAuthOnboardingSync } from '@/auth/organisms/post-auth-onboarding-sync';
import { SupabaseAuthSync } from '@/auth/hooks/useSupabaseAuthSync';
import { NetworkStatusBanner } from '@/sharedModules/organisms/network-status-banner';
import { OfflineSyncReconciler } from '@/sharedModules/organisms/offline-sync-reconciler';
import { SharedProjectsRealtimeSync } from '@/sharedModules/organisms/shared-projects-realtime-sync';
import { initializeSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { persistor } from '@/store/persistor';
import { store } from '@/store/store';
import { appTrace } from '@/sharedModules/utils/appTrace';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    appTrace('Providers', 'mount');
    initializeSupabaseClient();
    appTrace('Providers', 'supabase client initialized');

    appTrace('Providers', 'persistor initial state', persistor.getState());
    const unsubscribe = persistor.subscribe(() => {
      const state = persistor.getState();
      appTrace('Providers', 'persistor update', state);
    });
    const watchdog = setTimeout(() => {
      const state = persistor.getState();
      if (!state.bootstrapped) {
        appTrace('Providers', 'persistor still not bootstrapped after 5s', state);
      }
    }, 5000);

    return () => {
      clearTimeout(watchdog);
      unsubscribe();
      appTrace('Providers', 'unmount');
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
        onBeforeLift={() => {
          appTrace('Providers', 'persist gate lifted');
        }}>
        <SupabaseAuthSync />
        <PostAuthOnboardingSync />
        <OfflineSyncReconciler />
        <SharedProjectsRealtimeSync />
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
