import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import { forgotPasswordThunk, selectAuthError, selectAuthStatus } from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function ForgotPasswordScreen() {
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const isLoading = authStatus === 'loading';

  const handleSendReset = async () => {
    if (isLoading) return;
    setSuccessMessage(null);
    setLocalError(null);
    if (!email.trim()) {
      setLocalError('Email is required.');
      return;
    }
    const action = await dispatch(forgotPasswordThunk({ email }));
    if (forgotPasswordThunk.fulfilled.match(action)) {
      setSuccessMessage('Password reset link sent. Check your email.');
    }
  };

  return (
    <ScreenContainer contentStyle={styles.container}>
      <ThemedText type="title">Forgot password</ThemedText>
      <ThemedText type="caption" style={{ color: themeColors.mutedText }}>
        Enter your account email and we will send a reset link.
      </ThemedText>
      <AuthTextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      <AppButton
        label={isLoading ? 'Sending reset link...' : 'Send reset link'}
        onPress={handleSendReset}
        disabled={isLoading}
      />
      {localError ? (
        <ThemedText type="caption" style={{ color: themeColors.danger }}>
          {localError}
        </ThemedText>
      ) : null}
      {authError ? (
        <ThemedText type="caption" style={{ color: themeColors.danger }}>
          {authError}
        </ThemedText>
      ) : null}
      {successMessage ? (
        <ThemedText type="caption" style={{ color: themeColors.success }}>
          {successMessage}
        </ThemedText>
      ) : null}
      <Link href={ROUTES.AUTH_LOGIN}>
        <ThemedText type="link">Back to sign in</ThemedText>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg + 2,
    paddingTop: Spacing.xxl + 4,
    gap: Spacing.md,
  },
});
