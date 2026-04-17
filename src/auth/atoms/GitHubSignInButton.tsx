import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { signInWithGitHub } from '@/auth/services/oauth';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

export function GitHubSignInButton() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={styles.stack}>
      <Pressable
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
          pressed && !loading ? styles.buttonPressed : null,
          loading ? styles.buttonDisabled : null,
        ]}
        onPress={async () => {
          if (loading) return;
          setErrorMessage(null);
          setLoading(true);
          try {
            await signInWithGitHub();
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : 'GitHub sign-in failed. Please try again.';
            setErrorMessage(message);
          } finally {
            setLoading(false);
          }
        }}>
        <ThemedText type="defaultSemiBold">
          {loading ? 'Opening GitHub…' : 'Continue with GitHub'}
        </ThemedText>
      </Pressable>
      {errorMessage ? (
        <ThemedText style={[styles.error, { color: themeColors.danger }]}>{errorMessage}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
});
