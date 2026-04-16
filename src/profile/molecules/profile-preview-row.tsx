import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

import { AvatarPlaceholder } from '../atoms/avatar-placeholder';

export function ProfilePreviewRow() {
  return (
    <View style={styles.row}>
      <AvatarPlaceholder />
      <View style={styles.text}>
        <ThemedText type="defaultSemiBold">Your profile</ThemedText>
        <ThemedText style={styles.muted}>Display name, discipline, theme (step 9).</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  muted: {
    opacity: 0.75,
    fontSize: 14,
  },
});
