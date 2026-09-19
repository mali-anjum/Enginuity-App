import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { AuthSubtitle } from "@/auth/molecules/auth-subtitle";
import { AuthOauthSection } from "@/auth/organisms/auth-oauth-section";
import { AppButton } from "@/common/atoms/app-button";
import { ThemedText } from "@/common/atoms/themed-text";
import { ScreenContainer } from '@/common/molecules/screen-container';
import { ROUTES } from "@/sharedModules/navigation/routes";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Welcome back</ThemedText>
        <AuthSubtitle>
          Sign in with the same method you used when you created your account.
        </AuthSubtitle>
        <AuthOauthSection />
        <AppButton
          label="Continue with email"
          onPress={() => router.push(ROUTES.AUTH_LOGIN_EMAIL as never)}
        />
        <View style={styles.links}>
          <ThemedText
            type="link"
            onPress={() => router.push(ROUTES.AUTH_FORGOT_PASSWORD as never)}
          >
            Forgot password?
          </ThemedText>
          <ThemedText
            type="link"
            onPress={() => router.replace(ROUTES.AUTH_SIGNUP)}
          >
            Don&apos;t have an account? Sign up
          </ThemedText>
        </View>
      </ScrollView>
    </ScreenContainer>
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
