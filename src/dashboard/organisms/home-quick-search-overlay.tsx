import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
};

type HomeQuickSearchOverlayProps = {
  isOpen: boolean;
  query: string;
  results: SearchResultItem[];
  onClose: () => void;
};

export function HomeQuickSearchOverlay({
  isOpen,
  query,
  results,
  onClose,
}: HomeQuickSearchOverlayProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <ThemedView
        style={[
          styles.sheet,
          {
            backgroundColor: themeColors.surfaceElevated,
            borderColor: themeColors.border,
          },
        ]}>
        <ThemedText type="subtitle">Quick Search</ThemedText>
        <ThemedText style={{ color: themeColors.subtleText }}>
          {query.trim() ? `Results for "${query}"` : 'Type in the search bar to find projects and activity.'}
        </ThemedText>
        <View style={styles.results}>
          {results.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No matching results yet.</ThemedText>
          ) : (
            results.map((item) => (
              <View key={item.id} style={[styles.resultRow, { borderColor: themeColors.border }]}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={{ color: themeColors.mutedText }}>{item.subtitle}</ThemedText>
              </View>
            ))
          )}
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.36)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 10,
    minHeight: 220,
  },
  results: {
    gap: 8,
    marginTop: 4,
  },
  resultRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
});
