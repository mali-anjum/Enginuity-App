import React from 'react';
import { StyleSheet } from 'react-native';

import { GoogleSignInButton } from '@/modules/auth/atoms/GoogleSignInButton';
import { ThemedText } from '@/modules/common/atoms/themed-text';
import { ThemedView } from '@/modules/common/atoms/themed-view';

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
