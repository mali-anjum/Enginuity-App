import { Link, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  clearSettingsError,
  fetchNotificationSettingsThunk,
  fetchStorageUsageThunk,
  selectSettingsError,
} from '@/settings/state/settingsSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

type SettingsLink = {
  title: string;
  subtitle: string;
  href: Href;
};

const LINKS: SettingsLink[] = [
  {
    title: 'Appearance',
    subtitle: 'Light, dark, or match system',
    href: '/settings/appearance' as Href,
  },
  {
    title: 'Notifications',
    subtitle: 'Push and email preferences (saved to your account)',
    href: '/settings/notifications' as Href,
  },
  {
    title: 'Storage & sync',
    subtitle: 'Usage and manual sync',
    href: '/settings/storage-sync' as Href,
  },
  {
    title: 'Account',
    subtitle: 'Password, sign out, delete account',
    href: '/settings/account' as Href,
  },
  {
    title: 'About',
    subtitle: 'Version, licenses, feedback',
    href: '/settings/about' as Href,
  },
];

export default function SettingsHomeScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const settingsError = useAppSelector(selectSettingsError);

  useEffect(() => {
    void dispatch(fetchNotificationSettingsThunk());
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
        <ThemedText type="title">Settings</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Theme is stored on this device; notification preferences sync with Supabase.
        </ThemedText>

        {settingsError ? (
          <ThemedText style={{ color: themeColors.danger }}>{settingsError}</ThemedText>
        ) : null}

        <View style={styles.list}>
          {LINKS.map((item) => (
            <Link key={item.title} href={item.href} asChild>
              <Pressable
                style={[
                  styles.row,
                  { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                ]}>
                <View style={styles.rowText}>
                  <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                  <ThemedText style={{ color: themeColors.mutedText }}>{item.subtitle}</ThemedText>
                </View>
                <ThemedText style={{ color: themeColors.primary }}>›</ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowText: { flex: 1, gap: 4 },
});
