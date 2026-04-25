import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import { loginWithPasswordThunk, selectAuthError, selectAuthStatus } from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { AuthSubtitle } from '../molecules/auth-subtitle';

export function LoginPanel() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useLocalSearchParams<{ notice?: string | string[] }>();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = authStatus === 'loading';
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;

  const handleEmailLogin = async () => {
    if (isLoading) return;
    const action = await dispatch(loginWithPasswordThunk({ email, password }));
    if (loginWithPasswordThunk.fulfilled.match(action)) {
      router.replace(ROUTES.HOME);
    }
  };

  return (
    <View style={styles.stack}>
      <ThemedText type="link" onPress={() => router.replace(ROUTES.AUTH_LOGIN)}>
        ← More sign-in options
      </ThemedText>
      <ThemedText type="title">Sign in</ThemedText>
      <AuthSubtitle>Use your email and password.</AuthSubtitle>
      <AuthTextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      <AuthTextInput
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <AppButton label={isLoading ? 'Signing in...' : 'Sign in with email'} onPress={handleEmailLogin} disabled={isLoading} />
      {notice === 'check-email' ? (
        <ThemedText style={styles.noticeText}>
          Check your inbox and click the confirmation link before signing in.
        </ThemedText>
      ) : null}
      {authError ? <ThemedText style={styles.errorText}>{authError}</ThemedText> : null}
      <View style={styles.linksRow}>
        <ThemedText type="link" onPress={() => router.push(ROUTES.AUTH_FORGOT_PASSWORD as never)}>
          Forgot password?
        </ThemedText>
        <ThemedText type="link" onPress={() => router.push(ROUTES.AUTH_SIGNUP as never)}>
          Create account
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  errorText: {
    fontSize: 13,
  },
  noticeText: {
    fontSize: 13,
  },
});
