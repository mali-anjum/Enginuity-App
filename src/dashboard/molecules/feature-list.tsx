import { StyleSheet, View } from 'react-native';

import { ListBullet } from '../atoms/list-bullet';

const ITEMS = ['Projects', 'Experiments', 'Hardware library'] as const;

export function FeatureList() {
  return (
    <View style={styles.wrap}>
      {ITEMS.map((label) => (
        <ListBullet key={label} label={label} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginTop: 12,
  },
});
