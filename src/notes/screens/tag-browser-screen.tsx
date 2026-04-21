import { useMemo } from 'react';
import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TagChip } from '@/common/atoms/tag-chip';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectNotesByTag, selectTagCounts } from '@/notes/state/notesSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export default function TagBrowserScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();
  const tags = useAppSelector(selectTagCounts);
  const { tag: activeTag = '' } = useLocalSearchParams<{ tag?: string }>();
  const filteredNotes = useAppSelector(selectNotesByTag(activeTag));

  const grouped = useMemo(() => {
    return {
      high: tags.filter((item) => item.count >= 3),
      medium: tags.filter((item) => item.count > 0 && item.count < 3),
      seeded: tags.filter((item) => item.count === 0),
    };
  }, [tags]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Tag Browser</ThemedText>
        <ThemedText style={{ color: themeColors.mutedText }}>
          Engineering tags are grouped by usage frequency. Tap a tag to filter notes by that topic.
        </ThemedText>
        {tags.length === 0 ? (
          <ThemedText style={{ color: themeColors.mutedText }}>No tags found yet.</ThemedText>
        ) : (
          <>
            <TagGroup
              title="Most Used"
              items={grouped.high}
              activeTag={activeTag}
              onPress={(tag) => router.replace(`/notes/tags?tag=${encodeURIComponent(tag)}` as Href)}
            />
            <TagGroup
              title="Used Recently"
              items={grouped.medium}
              activeTag={activeTag}
              onPress={(tag) => router.replace(`/notes/tags?tag=${encodeURIComponent(tag)}` as Href)}
            />
            <TagGroup
              title="Seeded Engineering Tags"
              items={grouped.seeded}
              activeTag={activeTag}
              onPress={(tag) => router.replace(`/notes/tags?tag=${encodeURIComponent(tag)}` as Href)}
            />
          </>
        )}
        {activeTag ? (
          <View style={[styles.tagSection, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
            <View style={styles.activeHeader}>
              <ThemedText type="defaultSemiBold">Filtered Notes</ThemedText>
              <Pressable onPress={() => router.replace('/notes/tags' as Href)}>
                <ThemedText style={{ color: themeColors.primary }}>Clear</ThemedText>
              </Pressable>
            </View>
            <TagChip label={activeTag} />
            {filteredNotes.length === 0 ? (
              <ThemedText style={{ color: themeColors.mutedText }}>No notes matched this tag.</ThemedText>
            ) : (
              filteredNotes.map((note) => (
                <Link key={note.id} href={`/notes/${note.id}` as Href}>
                  <ThemedText style={{ color: themeColors.primary }}>{note.title}</ThemedText>
                </Link>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

type TagCount = { tag: string; count: number };

function TagGroup({
  title,
  items,
  activeTag,
  onPress,
}: {
  title: string;
  items: TagCount[];
  activeTag: string;
  onPress: (tag: string) => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  if (items.length === 0) return null;

  return (
    <View style={[styles.tagSection, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <View style={styles.tagWrap}>
        {items.map((item) => (
          <View key={item.tag} style={styles.tagItem}>
            <TagChip label={item.tag} onPress={() => onPress(item.tag)} />
            <ThemedText
              style={[
                styles.countLabel,
                { color: activeTag === item.tag ? themeColors.primary : themeColors.mutedText },
              ]}>
              {item.count} note{item.count === 1 ? '' : 's'}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  tagSection: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagItem: { gap: 4, alignItems: 'flex-start' },
  countLabel: { fontSize: 12 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
