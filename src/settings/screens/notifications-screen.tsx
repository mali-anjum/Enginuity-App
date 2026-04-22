import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import {
  clearSettingsError,
  fetchNotificationSettingsThunk,
  saveNotificationSettingsThunk,
  selectNotificationPrefs,
  selectSettingsError,
} from '@/settings/state/settingsSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

type ThemePalette = typeof Colors.light | typeof Colors.dark;

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const prefs = useAppSelector(selectNotificationPrefs);
  const settingsError = useAppSelector(selectSettingsError);

  useEffect(() => {
    void dispatch(fetchNotificationSettingsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!settingsError) return;
    const t = setTimeout(() => dispatch(clearSettingsError()), 4000);
    return () => clearTimeout(t);
  }, [dispatch, settingsError]);

  const patch = (partial: Partial<typeof prefs>) => {
    void dispatch(saveNotificationSettingsThunk({ ...prefs, ...partial }));
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Notifications</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Push notification preference is stored in Supabase under your account (`user_settings`).
        </ThemedText>

        {settingsError ? (
          <ThemedText style={{ color: themeColors.danger }}>{settingsError}</ThemedText>
        ) : null}

        <View style={[styles.card, { borderColor: themeColors.border }]}>
          <Row
            label="Push notifications"
            value={prefs.pushNotificationsEnabled}
            onChange={(v) => patch({ pushNotificationsEnabled: v })}
            themeColors={themeColors}
          />
        </View>

        <Pressable
          style={[styles.secondaryBtn, { borderColor: themeColors.border }]}
          onPress={() => void dispatch(fetchNotificationSettingsThunk())}>
          <ThemedText>Reload from server</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function Row({
  label,
  value,
  onChange,
  themeColors,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  themeColors: ThemePalette;
}) {
  return (
    <View style={styles.row}>
      <ThemedText style={{ flex: 1 }}>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: themeColors.border, true: themeColors.heroTint }}
        thumbColor={value ? themeColors.primary : themeColors.mutedText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  secondaryBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});
