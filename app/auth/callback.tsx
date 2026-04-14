import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { exchangeOAuthCodeForSession } from '@/features/auth/services/authCallback';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const hasExchangedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On web, this helps close the popup once the redirect lands here.
    WebBrowser.maybeCompleteAuthSession();

    const codeParam = params.code;
    const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;
    const errorDescriptionParam = (params.error_description ?? params.error) as
      | string
      | string[]
      | undefined;

    if (!code) {
      const errText = Array.isArray(errorDescriptionParam)
        ? errorDescriptionParam[0]
        : errorDescriptionParam;
      if (errText) setError(errText);
      return;
    }

    if (hasExchangedRef.current) return;
    hasExchangedRef.current = true;

    exchangeOAuthCodeForSession(code)
      .then(() => {
        // Send user to the main tabs screen after a successful login.
        router.replace('/(tabs)/index');
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'OAuth exchange failed';
        setError(message);
      });
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ThemedText type="title">Signing you in…</ThemedText>
      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 32,
    gap: 12,
  },
  errorText: {
    color: '#b00020',
  },
});

