import { StyleSheet } from 'react-native';

import { ThemedView } from '@/common/atoms/themed-view';

import { WorkspaceOverview } from '../organisms/workspace-overview';

export default function WorkspaceHomeScreen() {
  return (
    <ThemedView style={styles.screen}>
      <WorkspaceOverview />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
  },
});
