import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  deleteAccountThunk,
  logoutThunk,
  resetPasswordThunk,
  selectAuthError,
  selectAuthStatus,
} from '@/auth/state/authSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function AccountSettingsScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const subtleLine = colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)';
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
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
    router.replace('/auth/login' as Href);
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
              router.replace('/auth/login' as Href);
            }
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Account</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Change password uses your current session (same as reset-password flow when logged in).
        </ThemedText>

        <ThemedText type="subtitle">Change password</ThemedText>
        <TextInput
          placeholder="New password"
          placeholderTextColor={themeColors.mutedText}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
        <TextInput
          placeholder="Confirm new password"
          placeholderTextColor={themeColors.mutedText}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
          disabled={isLoading}
          onPress={() => void handleChangePassword()}>
          <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
            {isLoading ? 'Updating…' : 'Update password'}
          </ThemedText>
        </Pressable>
        {authError ? (
          <ThemedText style={{ color: themeColors.danger }}>{authError}</ThemedText>
        ) : null}
        {passwordMessage ? (
          <ThemedText style={{ color: themeColors.primary }}>{passwordMessage}</ThemedText>
        ) : null}

        <View style={[styles.divider, { backgroundColor: subtleLine }]} />

        <Pressable
          style={[styles.secondaryBtn, { borderColor: themeColors.border }]}
          onPress={() => void handleSignOut()}>
          <ThemedText>Sign out</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.dangerBtn, { borderColor: themeColors.danger }]}
          onPress={handleDeleteAccount}>
          <ThemedText style={{ color: themeColors.danger }}>Delete account…</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  primaryBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  secondaryBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  dangerBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  divider: { height: 1, marginVertical: 8 },
});
