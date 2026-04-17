import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import {
  selectHasInitializedAuth,
  selectIsAuthenticated,
} from '@/auth/state/authSlice';
import { ThemedView } from '@/common/atoms/themed-view';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { NavigationThemes } from '@/common/constants/theme';
import { selectHasCompletedOnboarding } from '@/onboarding/state/selectors';
import { ROOT_STACK_SCREENS } from '@/sharedModules/navigation/root-stack-options';
import { useAppSelector } from '@/sharedModules/state/hooks';
import { AppProviders } from '@/sharedModules/state/Providers';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const hasInitializedAuth = useAppSelector(selectHasInitializedAuth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hasCompletedOnboarding = useAppSelector(selectHasCompletedOnboarding);

  const [primarySegment = '', secondarySegment = ''] = Array.from(segments) as string[];
  const isAuthRoute = primarySegment === 'auth';
  const isCallbackRoute = isAuthRoute && secondarySegment === 'callback';
  const isLoginRoute = isAuthRoute && secondarySegment === 'login';
  const isOnboardingRoute = primarySegment === 'onboarding';

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      if (!isOnboardingRoute) {
        router.replace('/onboarding');
      }
      return;
    }

    if (!hasInitializedAuth) {
      return;
    }

    if (!isAuthenticated) {
      if (!isLoginRoute && !isCallbackRoute) {
        router.replace('/auth/login');
      }
      return;
    }

    if (isOnboardingRoute || isAuthRoute) {
      router.replace('/');
    }
  }, [
    hasCompletedOnboarding,
    hasInitializedAuth,
    isAuthenticated,
    isOnboardingRoute,
    isAuthRoute,
    isLoginRoute,
    isCallbackRoute,
    router,
  ]);

  if (hasCompletedOnboarding && !hasInitializedAuth) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={NavigationThemes[colorScheme ?? 'light']}>
      <Stack>
        <Stack.Screen
          name={ROOT_STACK_SCREENS.tabs.name}
          options={ROOT_STACK_SCREENS.tabs.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.onboarding.name}
          options={ROOT_STACK_SCREENS.onboarding.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.authLogin.name}
          options={ROOT_STACK_SCREENS.authLogin.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.authCallback.name}
          options={ROOT_STACK_SCREENS.authCallback.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.modal.name}
          options={ROOT_STACK_SCREENS.modal.options}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
