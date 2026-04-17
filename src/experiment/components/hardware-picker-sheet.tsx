import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import type { HardwareItem } from '@/hardware/state/hardwareSlice';

type HardwarePickerSheetProps = {
  isOpen: boolean;
  hardwareItems: HardwareItem[];
  selectedHardwareIds: string[];
  onToggle: (hardwareId: string) => void;
  onClose: () => void;
};

export function HardwarePickerSheet({
  isOpen,
  hardwareItems,
  selectedHardwareIds,
  onToggle,
  onClose,
}: HardwarePickerSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  if (!isOpen) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <ThemedView
        style={[
          styles.sheet,
          { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
        ]}>
        <ThemedText type="subtitle">Hardware Picker</ThemedText>
        <View style={styles.list}>
          {hardwareItems.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>
              No hardware in your library yet.
            </ThemedText>
          ) : (
            hardwareItems.map((hardware) => {
              const selected = selectedHardwareIds.includes(hardware.id);
              return (
                <Pressable
                  key={hardware.id}
                  onPress={() => onToggle(hardware.id)}
                  style={[
                    styles.row,
                    {
                      borderColor: selected ? themeColors.primary : themeColors.border,
                      backgroundColor: selected ? themeColors.heroTint : themeColors.background,
                    },
                  ]}>
                  <ThemedText type="defaultSemiBold">{hardware.name}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>{hardware.type}</ThemedText>
                </Pressable>
              );
            })
          )}
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 35, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.36)' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
    minHeight: 220,
  },
  list: { gap: 8 },
  row: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10, gap: 2 },
});
