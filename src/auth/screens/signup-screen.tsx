import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AUTH_DISCIPLINE_OPTIONS } from '@/auth/constants/discipline-options';
import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import { selectAuthError, selectAuthStatus, signupThunk, type AuthDiscipline } from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function SignupScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [discipline, setDiscipline] = useState<AuthDiscipline>('software');
  const [localError, setLocalError] = useState<string | null>(null);
  const isLoading = authStatus === 'loading';

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
      router.replace('/auth/login');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title">Create account</ThemedText>
      <ThemedText style={styles.subtitle}>Sign up with email and choose your discipline.</ThemedText>
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
      <View style={styles.disciplineWrap}>
        <ThemedText type="defaultSemiBold">Discipline</ThemedText>
        <View style={styles.disciplineRow}>
          {AUTH_DISCIPLINE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.chip,
                {
                  borderColor: themeColors.border,
                  backgroundColor:
                    discipline === option.value ? themeColors.primary : themeColors.surfaceElevated,
                },
              ]}
              onPress={() => setDiscipline(option.value)}>
              <ThemedText
                lightColor={discipline === option.value ? themeColors.buttonPrimaryText : themeColors.text}
                darkColor={discipline === option.value ? themeColors.buttonPrimaryText : themeColors.text}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
      <AppButton label={isLoading ? 'Creating account...' : 'Sign up'} onPress={handleSignup} disabled={isLoading} />
      {localError ? <ThemedText style={[styles.errorText, { color: themeColors.danger }]}>{localError}</ThemedText> : null}
      {authError ? <ThemedText style={[styles.errorText, { color: themeColors.danger }]}>{authError}</ThemedText> : null}
      <Link href="/auth/login">
        <ThemedText type="link">Already have an account? Sign in</ThemedText>
      </Link>
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
  },
  disciplineWrap: {
    gap: 8,
  },
  disciplineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 13,
  },
});
