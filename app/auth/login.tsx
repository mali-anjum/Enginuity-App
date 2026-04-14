import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign in</ThemedText>
      <ThemedText style={styles.subtitle}>Continue with your Google account.</ThemedText>

      <GoogleSignInButton />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 32,
    gap: 12,
  },
  subtitle: {
    fontSize: 16,
  },
});

