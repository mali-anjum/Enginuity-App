import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ROOT_STACK_SCREENS } from '@/shared/navigation/root-stack-options';
import { AppProviders } from '@/shared/state/Providers';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProviders>
  );
}
