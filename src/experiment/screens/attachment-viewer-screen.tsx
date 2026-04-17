import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

export default function AttachmentViewerScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const decodedUrl = url ? decodeURIComponent(url) : '';

  return (
    <ThemedView style={[styles.screen, { backgroundColor: themeColors.surface }]}>
      <ThemedText type="title">Attachment Viewer</ThemedText>
      <ThemedText style={{ color: themeColors.mutedText }}>
        Fullscreen preview placeholder for image/PDF/CSV attachment.
      </ThemedText>
      <ThemedText>{decodedUrl || 'No attachment URL provided.'}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, gap: 12 },
});
