import { StyleSheet } from 'react-native';

import { HelloWave } from '@/common/atoms/hello-wave';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';

export function WelcomeTitleRow() {
  return (
    <ThemedView style={styles.row}>
      <ThemedText type="title">Welcome!</ThemedText>
      <HelloWave />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
