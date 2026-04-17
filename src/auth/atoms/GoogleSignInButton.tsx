import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { signInWithGoogle } from '@/auth/services/oauth';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

export function GoogleSignInButton() {
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
          { backgroundColor: themeColors.primary },
          pressed && !loading ? styles.buttonPressed : null,
          loading ? styles.buttonDisabled : null,
        ]}
        onPress={async () => {
          if (loading) return;
          setErrorMessage(null);
          setLoading(true);
          try {
            await signInWithGoogle();
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : 'Google sign-in failed. Please try again.';
            setErrorMessage(message);
          } finally {
            setLoading(false);
          }
        }}>
        <ThemedText
          type="defaultSemiBold"
          style={styles.label}
          lightColor={Colors.light.background}
          darkColor={Colors.light.background}>
          {loading ? 'Opening Google…' : 'Continue with Google'}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: Colors.light.background,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
});
