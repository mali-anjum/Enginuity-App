import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import {
  clearSettingsError,
  fetchStorageUsageThunk,
  manualSyncThunk,
  selectIsSyncing,
  selectSettingsError,
  selectStorageUsedMb,
  selectSyncProgress,
} from '@/settings/state/settingsSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function StorageSyncScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const mb = useAppSelector(selectStorageUsedMb);
  const isSyncing = useAppSelector(selectIsSyncing);
  const settingsError = useAppSelector(selectSettingsError);
  const syncProgress = useAppSelector(selectSyncProgress);

  useEffect(() => {
    void dispatch(fetchStorageUsageThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!settingsError) return;
    const t = setTimeout(() => dispatch(clearSettingsError()), 4000);
    return () => clearTimeout(t);
  }, [dispatch, settingsError]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Storage & sync</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Storage usage comes from your `profiles.storage_used_mb` row. Manual sync enqueues work on
          local queue first, then processes pending items to `sync_queue` in order.
        </ThemedText>

        {settingsError ? (
          <ThemedText style={{ color: themeColors.danger }}>{settingsError}</ThemedText>
        ) : null}

        <ThemedText type="subtitle">Storage used</ThemedText>
        <ThemedText type="title">{mb !== null ? `${mb.toFixed(2)} MB` : '…'}</ThemedText>

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
          disabled={isSyncing}
          onPress={() => void dispatch(manualSyncThunk())}>
          <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
            {isSyncing ? 'Syncing…' : 'Run manual sync'}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.secondaryBtn, { borderColor: themeColors.border }]}
          onPress={() => void dispatch(fetchStorageUsageThunk())}>
          <ThemedText>Refresh usage</ThemedText>
        </Pressable>

        <ThemedText type="subtitle">Sync queue progress</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Processed {syncProgress.processed} / {syncProgress.total}
          {syncProgress.remaining > 0 ? ` · ${syncProgress.remaining} pending` : ' · all synced'}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  primaryBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  secondaryBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});
