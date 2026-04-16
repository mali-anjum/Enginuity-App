import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

type TagChipProps = {
  label: string;
};

export function TagChip({ label }: TagChipProps) {
  return (
    <View style={styles.chip}>
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
    backgroundColor: '#E2E8F0',
  },
  label: {
    fontSize: 12,
  },
});
