import { StyleSheet } from 'react-native';

import { ThemedView } from '@/common/atoms/themed-view';

import { LoginPanel } from '../organisms/login-panel';

export default function LoginEmailScreen() {
  return (
    <ThemedView style={styles.container}>
      <LoginPanel />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 32,
  },
});
