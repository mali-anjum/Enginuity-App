import { StyleSheet } from 'react-native';

import { ThemedView } from '@/common/atoms/themed-view';

import { KnowledgeOverview } from '../organisms/knowledge-overview';

export default function KnowledgeHomeScreen() {
  return (
    <ThemedView style={styles.screen}>
      <KnowledgeOverview />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
  },
});
