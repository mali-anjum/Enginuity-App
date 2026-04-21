import { Link, useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TagChip } from '@/common/atoms/tag-chip';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { selectExperimentsByTag } from '@/experiment/state/experimentSlice';
import { selectAllTags, selectNotesByTag } from '@/notes/state/notesSlice';
import { useAppSelector } from '@/sharedModules/state/hooks';

export default function TagBrowserScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const tags = useAppSelector(selectAllTags);
  const { tag: activeTag } = useLocalSearchParams<{ tag?: string }>();
  const filteredTags = activeTag ? tags.filter((tag) => tag === activeTag) : tags;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Tag Browser</ThemedText>
        {filteredTags.length === 0 ? (
          <ThemedText style={{ color: themeColors.mutedText }}>No tags found yet.</ThemedText>
        ) : (
          filteredTags.map((tag) => <TagSection key={tag} tag={tag} />)
        )}
      </ScrollView>
    </ThemedView>
  );
}

function TagSection({ tag }: { tag: string }) {
  const notes = useAppSelector(selectNotesByTag(tag));
  const experiments = useAppSelector(selectExperimentsByTag(tag));
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <View style={[styles.tagSection, { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated }]}>
      <TagChip label={tag} />
      {notes.length === 0 && experiments.length === 0 ? (
        <ThemedText style={{ color: themeColors.mutedText }}>No content in this tag yet.</ThemedText>
      ) : (
        <>
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}` as Href}>
              <ThemedText style={{ color: themeColors.primary }}>Note: {note.title}</ThemedText>
            </Link>
          ))}
          {experiments.map((experiment) => (
            <Link key={experiment.id} href={`/experiment/${experiment.id}` as Href}>
              <ThemedText style={{ color: themeColors.primary }}>
                Experiment: {experiment.title}
              </ThemedText>
            </Link>
          ))}
        </>
      )}
      {notes.length === 0 ? null : (
        <ThemedText style={{ color: themeColors.mutedText, fontSize: 12 }}>
          {notes.length} note{notes.length === 1 ? '' : 's'}
        </ThemedText>
      )}
      {experiments.length === 0 ? null : (
        <ThemedText style={{ color: themeColors.mutedText, fontSize: 12 }}>
          {experiments.length} experiment{experiments.length === 1 ? '' : 's'}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  tagSection: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
});
