import { StyleSheet, View } from 'react-native';

import { GoogleSignInButton } from '@/auth/atoms/GoogleSignInButton';
import { ThemedText } from '@/common/atoms/themed-text';

import { AuthSubtitle } from '../molecules/auth-subtitle';

export function LoginPanel() {
  return (
    <View style={styles.stack}>
      <ThemedText type="title">Sign in</ThemedText>
      <AuthSubtitle>Continue with your Google account.</AuthSubtitle>
      <GoogleSignInButton />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
});
