import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import type { ExperimentStatus } from '@/experiment/constants';
import { experimentStatusLabel } from '@/experiment/constants';

function chipColors(
  theme: (typeof Colors)['light'],
  status: ExperimentStatus,
): { border: string; background: string } {
  switch (status) {
    case 'pending':
      return { border: theme.border, background: theme.surfaceElevated };
    case 'in_progress':
      return { border: theme.primary, background: theme.heroTint };
    case 'completed':
      return { border: theme.accentBorder, background: theme.accentSoft };
    case 'failed':
      return { border: theme.danger, background: theme.surfaceElevated };
    default:
      return { border: theme.border, background: theme.surfaceElevated };
  }
}

type ExperimentStatusChipProps = {
  status: ExperimentStatus;
  onPress: () => void;
};

/** Compact tappable chip for cycling experiment status (list rows). */
export function ExperimentStatusChip({ status, onPress }: ExperimentStatusChipProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const colors = chipColors(themeColors, status);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Status ${experimentStatusLabel(status)}, tap to cycle`}
      hitSlop={10}
      onPress={onPress}
      style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <ThemedText style={styles.chipLabel}>{experimentStatusLabel(status)}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
