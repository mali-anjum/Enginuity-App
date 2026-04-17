import { Link, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectAllTags, selectNotesByTag } from '@/notes/state/notesSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export default function TagBrowserScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const tags = useAppSelector(selectAllTags);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Tag Browser</ThemedText>
        {tags.length === 0 ? (
          <ThemedText style={{ color: themeColors.mutedText }}>No tags found yet.</ThemedText>
        ) : (
          tags.map((tag) => <TagSection key={tag} tag={tag} />)
        )}
      </ScrollView>
    </ThemedView>
  );
}

function TagSection({ tag }: { tag: string }) {
  const notes = useAppSelector(selectNotesByTag(tag));
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={[styles.tagSection, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
      <ThemedText type="defaultSemiBold">#{tag}</ThemedText>
      {notes.length === 0 ? (
        <ThemedText style={{ color: themeColors.mutedText }}>No notes in this tag.</ThemedText>
      ) : (
        notes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}` as Href}>
            <ThemedText style={{ color: themeColors.primary }}>{note.title}</ThemedText>
          </Link>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  tagSection: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
});
