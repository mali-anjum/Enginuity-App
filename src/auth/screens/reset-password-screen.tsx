import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import { resetPasswordThunk, selectAuthError, selectAuthStatus } from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function ResetPasswordScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isLoading = authStatus === 'loading';

  const handleReset = async () => {
    if (isLoading) return;
    const action = await dispatch(resetPasswordThunk({ password, confirmPassword }));
    if (resetPasswordThunk.fulfilled.match(action)) {
      setSuccessMessage('Password has been reset. You can sign in now.');
      setTimeout(() => {
        router.replace(ROUTES.AUTH_LOGIN);
      }, 700);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.container}>
      <ThemedText type="title">Reset password</ThemedText>
      <ThemedText type="caption" style={{ color: themeColors.mutedText }}>
        Set a new password for your account.
      </ThemedText>
      <AuthTextInput
        placeholder="New password"
        secureToggle
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <AuthTextInput
        placeholder="Confirm new password"
        secureToggle
        autoCapitalize="none"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <AppButton
        label={isLoading ? 'Updating password...' : 'Reset password'}
        onPress={handleReset}
        disabled={isLoading}
      />
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
