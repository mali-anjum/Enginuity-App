import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import { selectAuthError, selectAuthStatus, signupThunk } from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';
import { mapFocusAreasToAuthDiscipline } from '@/onboarding/types/profileDraft';

export default function SignupEmailScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
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
      router.replace('/auth/login?notice=check-email');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">Sign up with email</ThemedText>
      <ThemedText style={styles.subtitle}>
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
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <AuthTextInput
        placeholder="Confirm password"
        secureTextEntry
        autoCapitalize="none"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <AppButton label={isLoading ? 'Creating account...' : 'Create account'} onPress={handleSignup} disabled={isLoading} />
      {localError ? <ThemedText style={styles.errorText}>{localError}</ThemedText> : null}
      {authError ? <ThemedText style={styles.errorText}>{authError}</ThemedText> : null}
      <View style={styles.footer}>
        <ThemedText type="link" onPress={() => router.replace('/auth/signup')}>
          Other sign-up options
        </ThemedText>
        <ThemedText type="link" onPress={() => router.replace('/auth/login')}>
          Already have an account? Sign in
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
  },
  footer: {
    gap: 8,
    marginTop: 8,
  },
});
