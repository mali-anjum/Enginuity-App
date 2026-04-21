import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

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
      {decodedUrl ? (
        <ScrollView
          style={styles.zoomWrap}
          contentContainerStyle={styles.zoomContent}
          minimumZoomScale={1}
          maximumZoomScale={4}
          pinchGestureEnabled>
          <Image source={{ uri: decodedUrl }} style={styles.image} contentFit="contain" />
        </ScrollView>
      ) : (
        <ThemedText>No attachment URL provided.</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, gap: 12 },
  zoomWrap: { flex: 1, width: '100%' },
  zoomContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
});
