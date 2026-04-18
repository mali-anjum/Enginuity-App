import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuthSubtitle } from '@/auth/molecules/auth-subtitle';
import { AuthOauthSection } from '@/auth/organisms/auth-oauth-section';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';

export default function SignupScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Create account</ThemedText>
        <AuthSubtitle>Join with Google, Apple, Facebook, GitHub, or email after your onboarding plan.</AuthSubtitle>
        <AuthOauthSection />
        <AppButton label="Continue with email" onPress={() => router.push('/auth/signup-email' as never)} />
        <View style={styles.footer}>
          <ThemedText type="link" onPress={() => router.replace('/auth/login')}>
            Already have an account? Sign in
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
    paddingTop: 28,
    paddingBottom: 40,
    gap: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
});
