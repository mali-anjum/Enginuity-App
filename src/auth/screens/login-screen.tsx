import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuthSubtitle } from '@/auth/molecules/auth-subtitle';
import { AuthOauthSection } from '@/auth/organisms/auth-oauth-section';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { ROUTES } from '@/sharedModules/navigation/routes';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Welcome back</ThemedText>
        <AuthSubtitle>Sign in with the same method you used when you created your account.</AuthSubtitle>
        <AuthOauthSection />
        <AppButton label="Continue with email" onPress={() => router.push(ROUTES.authLoginEmail as never)} />
        <View style={styles.links}>
          <ThemedText type="link" onPress={() => router.push(ROUTES.authForgotPassword as never)}>
            Forgot password?
          </ThemedText>
          <ThemedText type="link" onPress={() => router.replace(ROUTES.authSignup)}>
            Don&apos;t have an account? Sign up
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 14,
  },
  links: {
    gap: 10,
    marginTop: 4,
  },
});
