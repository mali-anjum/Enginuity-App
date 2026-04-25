import { Link, type Href } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { selectUser } from '@/auth/state/authSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import { selectAllNotes } from '@/notes/state/notesSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppSelector } from '@/sharedModules/state/hooks';

function disciplineBadgeLabel(discipline: string | null): string {
  if (!discipline) return 'Student';
  const labels: Record<string, string> = {
    electrical: 'Electronics',
    mechanical: 'Robotics',
    software: 'CS',
    civil: 'Physics',
    chemical: 'Chemical',
    other: 'Other',
  };
  return labels[discipline] ?? discipline.replace('_', ' ');
}

export default function ProfileHomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const user = useAppSelector(selectUser);
  const projectCount = useAppSelector(selectAllProjects).length;
  const experimentCount = useAppSelector(selectAllExperiments).length;
  const notesCount = useAppSelector(selectAllNotes).length;
  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Profile</ThemedText>
        <View
          style={[
            styles.card,
            { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
          ]}>
          <View style={styles.avatarRow}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: themeColors.heroTint }]}>
                <ThemedText type="defaultSemiBold">{initials}</ThemedText>
              </View>
            )}
            <View style={styles.avatarInfo}>
              <ThemedText type="subtitle">{user?.name || 'User'}</ThemedText>
              <ThemedText style={{ color: themeColors.mutedText }}>{user?.email || 'No email'}</ThemedText>
              <ThemedText style={{ color: themeColors.mutedText }}>
                {user?.institution?.trim() ? user.institution : 'No institution set'}
              </ThemedText>
              <ThemedText style={[styles.badge, { color: themeColors.primary }]}>
                {disciplineBadgeLabel(user?.discipline ?? null)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={{ color: themeColors.mutedText }}>
            {user?.bio?.trim() ? user.bio : 'No bio yet. Add one from edit profile.'}
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Projects" value={projectCount} />
          <StatPill label="Experiments" value={experimentCount} />
        </View>
        <StatPill label="Notes" value={notesCount} />

        <View style={styles.actions}>
          <Link href={ROUTES.settingsHome as Href} asChild>
            <Pressable style={[styles.actionBtn, { borderColor: themeColors.border }]}>
              <ThemedText>Settings</ThemedText>
            </Pressable>
          </Link>
          <Link href={ROUTES.profileEdit as Href} asChild>
            <Pressable style={[styles.actionBtn, { borderColor: themeColors.border }]}>
              <ThemedText>Edit Profile</ThemedText>
            </Pressable>
          </Link>
          <Link href={ROUTES.profileAvatar as Href} asChild>
            <Pressable style={[styles.actionBtn, { borderColor: themeColors.border }]}>
              <ThemedText>Avatar Picker</ThemedText>
            </Pressable>
          </Link>
          <Link href={ROUTES.profileStatistics as Href} asChild>
            <Pressable style={[styles.actionBtn, { borderColor: themeColors.border }]}>
              <ThemedText>Account Statistics</ThemedText>
            </Pressable>
          </Link>
          <Link href={ROUTES.settingsUpgrade as Href} asChild>
            <Pressable style={[styles.actionBtn, { borderColor: themeColors.border }]}>
              <ThemedText>Upgrade to Pro</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  return (
    <View
      style={[
        styles.statPill,
        { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
      ]}>
      <ThemedText type="defaultSemiBold">{value}</ThemedText>
      <ThemedText style={{ color: themeColors.mutedText }}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInfo: {
    flex: 1,
    gap: 2,
  },
  badge: {
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  actions: {
    gap: 8,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
});
