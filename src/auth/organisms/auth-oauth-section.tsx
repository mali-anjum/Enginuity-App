import { StyleSheet, View } from 'react-native';

import { AppleSignInButton } from '@/auth/atoms/AppleSignInButton';
import { FacebookSignInButton } from '@/auth/atoms/FacebookSignInButton';
import { GitHubSignInButton } from '@/auth/atoms/GitHubSignInButton';
import { GoogleSignInButton } from '@/auth/atoms/GoogleSignInButton';

export function AuthOauthSection() {
  return (
    <View style={styles.stack}>
      <GoogleSignInButton />
      <AppleSignInButton />
      <FacebookSignInButton />
      <GitHubSignInButton />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
});
