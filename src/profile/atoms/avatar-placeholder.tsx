import { StyleSheet, View } from 'react-native';

export function AvatarPlaceholder() {
  return <View style={styles.circle} />;
}

const styles = StyleSheet.create({
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CBD5E1',
  },
});
