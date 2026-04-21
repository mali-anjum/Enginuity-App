import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { colorForTag } from '@/sharedModules/constants/engineering-tags';

type TagChipProps = {
  label: string;
  onPress?: () => void;
};

export function TagChip({ label, onPress }: TagChipProps) {
  const content = (
    <View style={[styles.chip, { backgroundColor: colorForTag(label) }]}>
      <ThemedText type="defaultSemiBold" style={styles.label} lightColor="#FFFFFF" darkColor="#FFFFFF">
        {label}
      </ThemedText>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  label: { fontSize: 12, lineHeight: 16 },
});
