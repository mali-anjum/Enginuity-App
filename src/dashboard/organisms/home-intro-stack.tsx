import { Link, type Href } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';

import { SectionSpacer } from '../atoms/section-spacer';
import { WelcomeTitleRow } from '../molecules/welcome-title-row';

export function HomeIntroStack() {
  return (
    <>
      <WelcomeTitleRow />
      <ThemedView style={styles.stepContainer}>
        <Link href={'/onboarding' as Href}>
          <ThemedText type="subtitle">Preview onboarding</ThemedText>
        </Link>
        <Link href={'/auth/login' as Href}>
          <ThemedText type="subtitle">Login with Google</ThemedText>
        </Link>
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
});
