import { Link, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { SkeletonShimmer } from '@/common/atoms/skeleton-shimmer';
import { TagChip } from '@/common/atoms/tag-chip';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ListEmptyState } from '@/common/organisms/list-empty-state';
import { selectAllExperiments } from '@/experiment/state/experimentSlice';
import {
  searchNotesThunk,
  selectAllNotes,
  selectAllTags,
  setActiveTag,
  toggleNoteFavoriteThunk,
} from '@/notes/state/notesSlice';
import { selectAllProjects } from '@/project/state/projectSlice';
import { ROUTES, ROUTE_PATHS } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

type NoteFilter = 'all' | 'project' | 'tag' | 'favourites';

export default function NotesListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotes);
  const projects = useAppSelector(selectAllProjects);
  const experiments = useAppSelector(selectAllExperiments);
  const tags = useAppSelector(selectAllTags);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<NoteFilter>('all');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const isLoading = useAppSelector((state) => state.notes.isLoading);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const searched = q
      ? notes.filter(
          (note) =>
            note.title.toLowerCase().includes(q) ||
            note.body.toLowerCase().includes(q) ||
            note.tags.some((tag) => tag.toLowerCase().includes(q)),
        )
      : notes;

    let filtered = searched;
    if (activeFilter === 'project') {
      filtered = selectedProjectId ? searched.filter((note) => note.projectId === selectedProjectId) : [];
    } else if (activeFilter === 'tag') {
      filtered = selectedTag ? searched.filter((note) => note.tags.includes(selectedTag)) : [];
    } else if (activeFilter === 'favourites') {
      filtered = searched.filter((note) => Boolean(note.isFavorite));
    }

    return [...filtered].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [activeFilter, notes, query, selectedProjectId, selectedTag]);

  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project.title])), [projects]);
  const experimentMap = useMemo(
    () => new Map(experiments.map((experiment) => [experiment.id, experiment.title])),
    [experiments],
  );

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Notes</ThemedText>
          <Link href={ROUTES.NOTES_CREATE as Href}>
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
          {(['all', 'project', 'tag', 'favourites'] as NoteFilter[]).map((option) => {
            const active = activeFilter === option;
            return (
              <Pressable
                key={option}
                onPress={() => setActiveFilter(option)}
                style={[
                  styles.sortChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{option === 'favourites' ? 'Favourites' : option === 'all' ? 'All' : `By ${option[0].toUpperCase()}${option.slice(1)}`}</ThemedText>
              </Pressable>
            );
          })}
          <Link href={ROUTES.NOTES_TAGS as Href}>
            <ThemedText style={{ color: themeColors.primary }}>Browse Tags</ThemedText>
          </Link>
        </View>
        {activeFilter === 'project' ? (
          <View style={styles.sortRow}>
            {projects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => setSelectedProjectId(project.id)}
                style={[
                  styles.sortChip,
                  {
                    borderColor: selectedProjectId === project.id ? themeColors.primary : themeColors.border,
                    backgroundColor:
                      selectedProjectId === project.id ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{project.title}</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
        {activeFilter === 'tag' ? (
          <View style={styles.sortRow}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => {
                  setSelectedTag(tag);
                  dispatch(setActiveTag(tag));
                }}
                style={[
                  styles.sortChip,
                  {
                    borderColor: selectedTag === tag ? themeColors.primary : themeColors.border,
                    backgroundColor: selectedTag === tag ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{tag}</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.list}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View
                key={`note-skeleton-${index}`}
                style={[
                  styles.card,
                  { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                ]}>
                <View style={styles.cardHeader}>
                  <SkeletonShimmer style={styles.noteTitleSkeleton} />
                  <SkeletonShimmer style={styles.starSkeleton} />
                </View>
                <SkeletonShimmer style={styles.noteLineSkeleton} />
                <SkeletonShimmer style={styles.noteLineShortSkeleton} />
                <View style={styles.tagRow}>
                  <SkeletonShimmer style={styles.noteTagSkeleton} />
                  <SkeletonShimmer style={styles.noteTagSkeleton} />
                </View>
              </View>
            ))
          ) : filteredNotes.length === 0 ? (
            <ListEmptyState
              icon="doc.text.fill"
              headline="Capture your first engineering note"
              body="Document decisions, findings, and lessons so future experiments move faster."
              ctaLabel="Create Note"
              onPressCta={() => router.push(ROUTES.NOTES_CREATE as Href)}
            />
          ) : (
            filteredNotes.map((note) => (
              <Link key={note.id} href={ROUTE_PATHS.NOTE_DETAIL(note.id)} asChild>
                <Pressable
                  style={[
                    styles.card,
                    { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
                  ]}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="defaultSemiBold">{note.title}</ThemedText>
                    <Pressable onPress={() => void dispatch(toggleNoteFavoriteThunk(note.id))}>
                      <ThemedText style={{ color: themeColors.primary }}>
                        {note.isFavorite ? '★' : '☆'}
                      </ThemedText>
                    </Pressable>
                  </View>
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
                  <ThemedText style={{ color: themeColors.subtleText }}>
                    Project: {note.projectId ? (projectMap.get(note.projectId) ?? note.projectId) : '—'} | Experiment:{' '}
                    {note.experimentId ? (experimentMap.get(note.experimentId) ?? note.experimentId) : '—'}
                  </ThemedText>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  noteTitleSkeleton: { height: 16, borderRadius: 6, width: '58%' },
  starSkeleton: { height: 16, width: 16, borderRadius: 8 },
  noteLineSkeleton: { height: 12, borderRadius: 6, width: '96%', marginTop: 3 },
  noteLineShortSkeleton: { height: 12, borderRadius: 6, width: '71%', marginTop: 3 },
  noteTagSkeleton: { height: 22, borderRadius: 11, width: 56, marginTop: 4 },
});
