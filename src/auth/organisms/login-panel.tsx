import { StyleSheet, View } from 'react-native';

import { FacebookSignInButton } from '@/auth/atoms/FacebookSignInButton';
import { GitHubSignInButton } from '@/auth/atoms/GitHubSignInButton';
import { GoogleSignInButton } from '@/auth/atoms/GoogleSignInButton';
import { ThemedText } from '@/common/atoms/themed-text';

import { AuthSubtitle } from '../molecules/auth-subtitle';

export function LoginPanel() {
  return (
    <View style={styles.stack}>
      <ThemedText type="title">Sign in</ThemedText>
      <AuthSubtitle>Continue with Google, Facebook, or GitHub.</AuthSubtitle>
      <GoogleSignInButton />
      <FacebookSignInButton />
      <GitHubSignInButton />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
});
