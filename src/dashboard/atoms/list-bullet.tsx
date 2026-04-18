import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

type ListBulletProps = {
  label: string;
};

export function ListBullet({ label }: ListBulletProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: themeColors.mutedText }]} />
      <ThemedText>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
