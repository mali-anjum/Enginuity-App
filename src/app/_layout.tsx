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
  const isSignupRoute = isAuthRoute && secondarySegment === 'signup';
  const isForgotPasswordRoute = isAuthRoute && secondarySegment === 'forgot-password';
  const isResetPasswordRoute = isAuthRoute && secondarySegment === 'reset-password';
  const isAuthSplashRoute = isAuthRoute && secondarySegment === 'splash';
  const isOnboardingRoute = primarySegment === 'onboarding';

  useEffect(() => {
    if (!hasInitializedAuth) {
      return;
    }

    if (!isAuthenticated) {
      if (
        !isLoginRoute &&
        !isCallbackRoute &&
        !isSignupRoute &&
        !isForgotPasswordRoute &&
        !isResetPasswordRoute &&
        !isAuthSplashRoute
      ) {
        router.replace('/auth/login');
      }
      return;
    }

    if (!hasCompletedOnboarding) {
      if (!isOnboardingRoute) {
        router.replace('/onboarding');
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
    isSignupRoute,
    isForgotPasswordRoute,
    isResetPasswordRoute,
    isAuthSplashRoute,
    isCallbackRoute,
    router,
  ]);

  if (!hasInitializedAuth) {
    return <AuthLoadingState />;
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
          name={ROOT_STACK_SCREENS.projectList.name}
          options={ROOT_STACK_SCREENS.projectList.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.projectCreate.name}
          options={ROOT_STACK_SCREENS.projectCreate.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.projectDetail.name}
          options={ROOT_STACK_SCREENS.projectDetail.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.projectEdit.name}
          options={ROOT_STACK_SCREENS.projectEdit.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.experimentList.name}
          options={ROOT_STACK_SCREENS.experimentList.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.experimentCreate.name}
          options={ROOT_STACK_SCREENS.experimentCreate.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.experimentDetail.name}
          options={ROOT_STACK_SCREENS.experimentDetail.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.experimentEdit.name}
          options={ROOT_STACK_SCREENS.experimentEdit.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.experimentAttachmentViewer.name}
          options={ROOT_STACK_SCREENS.experimentAttachmentViewer.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.experimentCsvPreview.name}
          options={ROOT_STACK_SCREENS.experimentCsvPreview.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.authLogin.name}
          options={ROOT_STACK_SCREENS.authLogin.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.authSplash.name}
          options={ROOT_STACK_SCREENS.authSplash.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.authSignup.name}
          options={ROOT_STACK_SCREENS.authSignup.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.authForgotPassword.name}
          options={ROOT_STACK_SCREENS.authForgotPassword.options}
        />
        <Stack.Screen
          name={ROOT_STACK_SCREENS.authResetPassword.name}
          options={ROOT_STACK_SCREENS.authResetPassword.options}
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

function AuthLoadingState() {
  return (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
