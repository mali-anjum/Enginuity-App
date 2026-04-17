import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ExternalLink } from '@/common/molecules/external-link';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

const FEEDBACK_MAILTO = 'mailto:feedback@enginuity.app?subject=Enginuity%20feedback';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const appVersion = Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">About</ThemedText>

        <ThemedText type="subtitle">App version</ThemedText>
        <ThemedText>{appVersion}</ThemedText>

        <ThemedText type="subtitle">Open source</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          This app is built with Expo, React Native, Redux Toolkit, and Supabase.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/">
          <ThemedText type="link">Expo documentation</ThemedText>
        </ExternalLink>
        <ExternalLink href="https://supabase.com/docs">
          <ThemedText type="link">Supabase documentation</ThemedText>
        </ExternalLink>

        <ThemedText type="subtitle">Feedback</ThemedText>
        <Pressable onPress={() => void Linking.openURL(FEEDBACK_MAILTO)}>
          <ThemedText style={{ color: themeColors.primary }}>Send feedback (email)</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});
