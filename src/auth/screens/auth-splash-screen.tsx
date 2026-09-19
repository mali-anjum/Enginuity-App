import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Spacing } from '@/common/constants/theme';
import { ScreenContainer } from '@/common/molecules/screen-container';

export default function AuthSplashScreen() {
  return (
    <ScreenContainer contentStyle={styles.container}>
      <ActivityIndicator />
      <ThemedText>Checking session...</ThemedText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm + 2,
  },
});
