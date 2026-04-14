import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { signInWithGoogle } from '@/features/auth/services/oauth';

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Pressable
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        pressed && !loading ? styles.buttonPressed : null,
        loading ? styles.buttonDisabled : null,
      ]}
      onPress={async () => {
        if (loading) return;
        setLoading(true);
        try {
          await signInWithGoogle();
        } finally {
          setLoading(false);
        }
      }}>
      <ThemedText type="defaultSemiBold">
        {loading ? 'Opening Google…' : 'Continue with Google'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

