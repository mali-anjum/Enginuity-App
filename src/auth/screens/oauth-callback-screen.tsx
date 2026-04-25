import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { exchangeOAuthCodeForSession } from '@/auth/services/authCallback';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ROUTES } from '@/sharedModules/navigation/routes';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const hasExchangedRef = useRef(false);
  const [isExchanging, setIsExchanging] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();

    const codeParam = params.code;
    const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;
    const errorDescriptionParam = (params.error_description ?? params.error) as
      | string
      | string[]
      | undefined;
    const flowTypeParam = params.type;
    const flowType = Array.isArray(flowTypeParam) ? flowTypeParam[0] : flowTypeParam;

    if (!code) {
      const errText = Array.isArray(errorDescriptionParam)
        ? errorDescriptionParam[0]
        : errorDescriptionParam;

      if (errText) {
        setError(errText);
        setIsExchanging(false);
        return;
      }

      if (flowType === 'signup') {
        setInfoMessage('Your email is confirmed. Please sign in to continue.');
      } else {
        setInfoMessage('If you just confirmed your email, return to login and sign in again.');
      }
      setIsExchanging(false);
      return;
    }

    if (hasExchangedRef.current) return;
    hasExchangedRef.current = true;

    exchangeOAuthCodeForSession(code)
      .then(() => {
        router.replace(ROUTES.HOME);
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'OAuth exchange failed';
        setError(message);
      })
      .finally(() => {
        setIsExchanging(false);
      });
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ThemedText type="title">
        {isExchanging ? 'Signing you in...' : error ? 'Sign-in issue' : 'Email confirmation complete'}
      </ThemedText>
      {error ? <ThemedText style={[styles.errorText, { color: themeColors.danger }]}>{error}</ThemedText> : null}
      {!error && infoMessage ? <ThemedText style={styles.infoText}>{infoMessage}</ThemedText> : null}
      {!isExchanging ? (
        <Pressable
          style={[
            styles.button,
            { backgroundColor: themeColors.primary },
          ]}
          onPress={() => router.replace(ROUTES.AUTH_LOGIN)}>
          <ThemedText style={styles.buttonText} lightColor={Colors.light.background} darkColor={Colors.light.background}>
            Return to login
          </ThemedText>
        </Pressable>
      ) : null}
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
    lineHeight: 22,
  },
  infoText: {
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: Colors.light.background,
  },
});
