import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { exchangeOAuthCodeForSession } from '@/auth/services/authCallback';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ScreenContainer } from '@/common/molecules/screen-container';
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
    <ScreenContainer contentStyle={styles.container}>
      <ThemedText type="title">
        {isExchanging ? 'Signing you in...' : error ? 'Sign-in issue' : 'Email confirmation complete'}
      </ThemedText>
      {error ? (
        <ThemedText style={{ color: themeColors.danger, lineHeight: 22 }}>{error}</ThemedText>
      ) : null}
      {!error && infoMessage ? (
        <ThemedText style={{ color: themeColors.mutedText, lineHeight: 22 }}>{infoMessage}</ThemedText>
      ) : null}
      {!isExchanging ? (
        <AppButton label="Return to login" onPress={() => router.replace(ROUTES.AUTH_LOGIN)} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg + 2,
    paddingTop: Spacing.xxl + 8,
    gap: Spacing.md,
  },
});
