import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { TagChip } from '@/common/atoms/tag-chip';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { searchNotesThunk, selectAllNotes } from '@/notes/state/notesSlice';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

type SortBy = 'recent' | 'title';

export default function NotesListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotes);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? notes.filter(
          (note) =>
            note.title.toLowerCase().includes(q) ||
            note.body.toLowerCase().includes(q) ||
            note.tags.some((tag) => tag.toLowerCase().includes(q)),
        )
      : notes;

    if (sortBy === 'title') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...list].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [notes, query, sortBy]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Notes</ThemedText>
          <Link href={'/notes/create' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Create Note</ThemedText>
          </Link>
        </View>
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            void dispatch(searchNotesThunk(text));
          }}
          placeholder="Search notes..."
          placeholderTextColor={themeColors.mutedText}
          style={[styles.searchInput, { borderColor: themeColors.border, color: themeColors.text }]}
        />

        <View style={styles.sortRow}>
          {(['recent', 'title'] as SortBy[]).map((option) => {
            const active = sortBy === option;
            return (
              <Pressable
                key={option}
                onPress={() => setSortBy(option)}
                style={[
                  styles.sortChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{option}</ThemedText>
              </Pressable>
            );
          })}
          <Link href={'/notes/tags' as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Browse Tags</ThemedText>
          </Link>
        </View>

        <View style={styles.list}>
          {filteredNotes.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No notes found.</ThemedText>
          ) : (
            filteredNotes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}` as Href} asChild>
                <Pressable
                  style={[
                    styles.card,
                    { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                  ]}>
                  <ThemedText type="defaultSemiBold">{note.title}</ThemedText>
                  <ThemedText numberOfLines={2} style={{ color: themeColors.mutedText }}>
                    {note.body}
                  </ThemedText>
                  {note.tags.length > 0 ? (
                    <View style={styles.tagRow}>
                      {note.tags.slice(0, 4).map((tag) => (
                        <TagChip key={`${note.id}-${tag}`} label={tag} />
                      ))}
                    </View>
                  ) : (
                    <ThemedText style={{ color: themeColors.subtleText }}>No tags</ThemedText>
                  )}
                </Pressable>
              </Link>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  sortRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  sortChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  list: { gap: 10 },
  card: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, gap: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
});
