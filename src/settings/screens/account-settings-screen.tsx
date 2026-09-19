import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import {
  deleteAccountThunk,
  logoutThunk,
  resetPasswordThunk,
  selectAuthError,
  selectAuthStatus,
} from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ScreenContainer } from '@/common/molecules/screen-container';
import {
  cancelSubscriptionThunk,
  fetchSubscriptionStatusThunk,
  selectIsCancelLoading,
  selectIsProPlan,
  selectSubscriptionPlan,
} from '@/monetization/state/monetizationSlice';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function AccountSettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const isProPlan = useAppSelector(selectIsProPlan);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const isCancelLoading = useAppSelector(selectIsCancelLoading);
  const isLoading = authStatus === 'loading';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    const action = await dispatch(resetPasswordThunk({ password, confirmPassword }));
    if (resetPasswordThunk.fulfilled.match(action)) {
      setPasswordMessage('Password updated.');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleSignOut = async () => {
    await dispatch(logoutThunk());
    router.replace(ROUTES.AUTH_LOGIN as Href);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will deactivate your account and sign you out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const action = await dispatch(deleteAccountThunk());
            if (deleteAccountThunk.fulfilled.match(action)) {
              router.replace(ROUTES.AUTH_LOGIN as Href);
            }
          },
        },
      ],
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel subscription',
      'You can resubscribe at any time from Upgrade.',
      [
        { text: 'Keep plan', style: 'cancel' },
        {
          text: 'Cancel subscription',
          style: 'destructive',
          onPress: async () => {
            await dispatch(cancelSubscriptionThunk());
            await dispatch(fetchSubscriptionStatusThunk());
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Account</ThemedText>
        <ThemedText type="caption" style={{ color: themeColors.mutedText }}>
          Change password uses your current session (same as reset-password flow when logged in).
        </ThemedText>

        <ThemedText type="heading">Change password</ThemedText>
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
          label={isLoading ? 'Updating…' : 'Update password'}
          onPress={() => void handleChangePassword()}
          disabled={isLoading}
        />
        {authError ? (
          <ThemedText type="caption" style={{ color: themeColors.danger }}>
            {authError}
          </ThemedText>
        ) : null}
        {passwordMessage ? (
          <ThemedText type="caption" style={{ color: themeColors.primary }}>
            {passwordMessage}
          </ThemedText>
        ) : null}

        <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

        <ThemedText type="heading">Subscription</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Current plan: {isProPlan ? subscriptionPlan.replace('_', ' ') : 'free'}
        </ThemedText>
        <AppButton
          label="Manage or upgrade plan"
          variant="secondary"
          onPress={() => router.push(ROUTES.SETTINGS_UPGRADE)}
        />
        {isProPlan ? (
          <AppButton
            label={isCancelLoading ? 'Cancelling...' : 'Cancel subscription'}
            variant="danger"
            disabled={isCancelLoading}
            onPress={handleCancelSubscription}
          />
        ) : null}

        <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

        <AppButton label="Sign out" variant="secondary" onPress={() => void handleSignOut()} />

        <AppButton label="Delete account…" variant="danger" onPress={handleDeleteAccount} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl + Spacing.sm },
  divider: { height: 1, marginVertical: Spacing.sm },
});
