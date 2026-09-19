import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import { selectAuthError, selectAuthStatus, signupThunk } from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors, Spacing } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { mapFocusAreasToAuthDiscipline } from '@/onboarding/types/profileDraft';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function SignupEmailScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const focusAreas = useAppSelector((s) => s.onboarding.profileDraft.focusAreas);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const isLoading = authStatus === 'loading';

  const discipline = mapFocusAreasToAuthDiscipline(focusAreas.length > 0 ? focusAreas : ['other']);

  const handleSignup = async () => {
    if (isLoading) return;
    setLocalError(null);
    if (!name.trim() || !email.trim() || !password) {
      setLocalError('Name, email, and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const action = await dispatch(
      signupThunk({
        email,
        password,
        name,
        discipline,
      }),
    );
    if (signupThunk.fulfilled.match(action)) {
      router.replace(ROUTE_PATHS.AUTH_LOGIN_WITH_NOTICE('check-email'));
    }
  };

  return (
    <ScreenContainer>
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">Sign up with email</ThemedText>
      <ThemedText type="caption" style={[styles.subtitle, { color: themeColors.mutedText }]}>
        We will send a confirmation link to your inbox. Verify your email, then sign in to continue.
      </ThemedText>
      <AuthTextInput placeholder="Full name" value={name} onChangeText={setName} />
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
        secureToggle
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <AuthTextInput
        placeholder="Confirm password"
        secureToggle
        autoCapitalize="none"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <AppButton label={isLoading ? 'Creating account...' : 'Create account'} onPress={handleSignup} disabled={isLoading} />
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
      <View style={styles.footer}>
        <ThemedText type="link" onPress={() => router.replace(ROUTES.AUTH_SIGNUP)}>
          Other sign-up options
        </ThemedText>
        <ThemedText type="link" onPress={() => router.replace(ROUTES.AUTH_LOGIN)}>
          Already have an account? Sign in
        </ThemedText>
      </View>
    </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg + 2,
    paddingTop: Spacing.xxl + 4,
    paddingBottom: Spacing.xxxl + Spacing.sm,
    gap: Spacing.md,
  },
  subtitle: {
    marginBottom: Spacing.xs,
  },
  footer: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
