import { StyleSheet, View } from 'react-native';

import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

export function AvatarPlaceholder() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return <View style={[styles.circle, { backgroundColor: themeColors.border }]} />;
}

const styles = StyleSheet.create({
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
