import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type ProjectFilter = 'active' | 'completed' | 'favourites';

type HomeProjectFilterSheetProps = {
  isOpen: boolean;
  activeFilter: ProjectFilter;
  onSelectFilter: (filter: ProjectFilter) => void;
  onClose: () => void;
};

const FILTER_OPTIONS: { value: ProjectFilter; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'favourites', label: 'Favourites' },
];

export function HomeProjectFilterSheet({
  isOpen,
  activeFilter,
  onSelectFilter,
  onClose,
}: HomeProjectFilterSheetProps) {
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
        <ThemedText type="subtitle">Project Filter</ThemedText>
        <View style={styles.options}>
          {FILTER_OPTIONS.map((option) => {
            const isActive = option.value === activeFilter;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelectFilter(option.value)}
                style={[
                  styles.optionButton,
                  {
                    borderColor: isActive ? themeColors.primary : themeColors.border,
                    backgroundColor: isActive ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText type="defaultSemiBold">{option.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
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
    gap: 12,
    minHeight: 170,
  },
  options: {
    gap: 8,
  },
  optionButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
