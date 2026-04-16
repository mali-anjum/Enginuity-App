import { StyleSheet, View } from 'react-native';

import { TagChip } from '../atoms/tag-chip';

const SAMPLE_TAGS = ['PID', 'MPU6050', 'Firmware'] as const;

export function TagRow() {
  return (
    <View style={styles.row}>
      {SAMPLE_TAGS.map((tag) => (
        <TagChip key={tag} label={tag} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});
