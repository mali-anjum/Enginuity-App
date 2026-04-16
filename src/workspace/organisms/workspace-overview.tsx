import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

import { FeatureList } from '../molecules/feature-list';

export function WorkspaceOverview() {
  return (
    <View style={styles.block}>
      <ThemedText type="title">Workspace</ThemedText>
      <ThemedText>
        Project creation, experiment logging, and reusable hardware entries will live here (steps 4–6).
      </ThemedText>
      <FeatureList />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
});
