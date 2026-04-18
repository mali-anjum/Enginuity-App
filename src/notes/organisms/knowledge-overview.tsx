import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

import { TagRow } from '../molecules/tag-row';

export function KnowledgeOverview() {
  return (
    <View style={styles.block}>
      <ThemedText type="title">Knowledge</ThemedText>
      <ThemedText>Rich study notes and global search across experiments and tags (steps 7–8).</ThemedText>
      <ThemedText type="subtitle">Example tags</ThemedText>
      <TagRow />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
});
