import { StyleSheet } from 'react-native';

import { ThemedView } from '@/common/atoms/themed-view';

import { ProfileOverview } from '../organisms/profile-overview';

export default function ProfileHomeScreen() {
  return (
    <ThemedView style={styles.screen}>
      <ProfileOverview />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
  },
});
