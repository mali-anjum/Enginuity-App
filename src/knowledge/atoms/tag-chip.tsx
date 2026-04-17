import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type TagChipProps = {
  label: string;
};

export function TagChip({ label }: TagChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={[styles.chip, { backgroundColor: themeColors.border }]}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
  },
});
