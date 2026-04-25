import { Link, type Href } from 'expo-router';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { signOut } from '@/auth/services/oauth';
import { selectIsAuthenticated } from '@/auth/state/authSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppSelector } from '@/store/hooks';

import { SectionSpacer } from '../atoms/section-spacer';
import { WelcomeTitleRow } from '../molecules/welcome-title-row';

export function HomeIntroStack() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <>
      <WelcomeTitleRow />
      <ThemedView style={styles.stepContainer}>
        <Link href={ROUTES.ONBOARDING as Href}>
          <ThemedText type="subtitle">Preview onboarding</ThemedText>
        </Link>
        <Link href={ROUTES.AUTH_LOGIN as Href}>
          <ThemedText type="subtitle">Login with Google</ThemedText>
        </Link>
        {isAuthenticated ? (
          <Pressable
            style={[styles.signOutButton, { borderColor: themeColors.border }]}
            onPress={() => {
              void signOut();
            }}>
            <ThemedText type="defaultSemiBold" style={{ color: themeColors.mutedText }}>
              Sign out
            </ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>
      <SectionSpacer />
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">src/dashboard/screens/home-screen.tsx</ThemedText> to see
          changes. Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
