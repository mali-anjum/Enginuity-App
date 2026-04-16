import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

import { ProfilePreviewRow } from '../molecules/profile-preview-row';

export function ProfileOverview() {
  return (
    <View style={styles.block}>
      <ThemedText type="title">Profile & settings</ThemedText>
      <ProfilePreviewRow />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 16,
  },
});
