import { Link, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { TagChip } from '@/common/atoms/tag-chip';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { NoteRichText } from '@/notes/molecules/note-rich-text';
import { deleteNoteThunk, selectNoteById } from '@/notes/state/notesSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const note = useAppSelector(selectNoteById(noteId ?? ''));
  const dispatch = useAppDispatch();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!note) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Note not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="title">{note.title}</ThemedText>
          <Link href={ROUTE_PATHS.NOTE_EDIT(note.id)}>
            <ThemedText style={{ color: themeColors.primary }}>Edit</ThemedText>
          </Link>
        </View>

        <NoteRichText body={note.body} />

        <View style={styles.metaBlock}>
          <ThemedText type="defaultSemiBold">Tags</ThemedText>
          {note.tags.length === 0 ? (
            <ThemedText style={{ color: themeColors.mutedText }}>No tags</ThemedText>
          ) : (
            <View style={styles.tagRow}>
              {note.tags.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  onPress={() => router.push(ROUTE_PATHS.NOTES_TAGS_WITH_TAG(tag))}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.metaBlock}>
          <ThemedText type="defaultSemiBold">Linked</ThemedText>
          <ThemedText style={{ color: themeColors.mutedText }}>
            Project: {note.projectId ?? '-'} | Experiment: {note.experimentId ?? '-'}
          </ThemedText>
        </View>

        <Pressable
          style={[styles.deleteButton, { borderColor: themeColors.danger }]}
          onPress={() => setIsDeleteDialogOpen(true)}>
          <ThemedText style={{ color: themeColors.danger }}>Delete Note</ThemedText>
        </Pressable>
      </ScrollView>

      <Modal animationType="fade" transparent visible={isDeleteDialogOpen}>
        <View style={styles.dialogOverlay}>
          <ThemedView
            style={[
              styles.dialogCard,
              { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
            ]}>
            <ThemedText type="subtitle">Delete this note?</ThemedText>
            <ThemedText style={{ color: themeColors.mutedText }}>
              This action cannot be undone.
            </ThemedText>
            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.dialogButton, { borderColor: themeColors.border }]}
                onPress={() => setIsDeleteDialogOpen(false)}>
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Link href={ROUTES.NOTES_LIST as Href} asChild>
                <Pressable
                  style={[styles.dialogButton, { borderColor: themeColors.danger }]}
                  onPress={() => {
                    void dispatch(deleteNoteThunk(note.id));
                    setIsDeleteDialogOpen(false);
                  }}>
                  <ThemedText style={{ color: themeColors.danger }}>Delete</ThemedText>
                </Pressable>
              </Link>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaBlock: { gap: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  deleteButton: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  dialogButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
});
