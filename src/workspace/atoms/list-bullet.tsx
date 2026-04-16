import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

type ListBulletProps = {
  label: string;
};

export function ListBullet({ label }: ListBulletProps) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
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
    backgroundColor: '#64748B',
  },
});
