import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

export default function AuthSplashScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <ThemedText>Checking session...</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
