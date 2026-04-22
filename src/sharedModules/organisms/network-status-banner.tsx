import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { useNetworkStatus } from '@/sharedModules/hooks/use-network-status';

export function NetworkStatusBanner() {
  const { isOffline, showSynced } = useNetworkStatus();

  if (!isOffline && !showSynced) return null;

  const isSuccess = showSynced && !isOffline;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isSuccess ? '#16A34A' : '#D97706',
        },
      ]}>
      <ThemedText style={styles.text} lightColor="#FFFFFF" darkColor="#FFFFFF">
        {isSuccess
          ? 'Synced'
          : 'You are offline. Changes will sync when connected.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});
