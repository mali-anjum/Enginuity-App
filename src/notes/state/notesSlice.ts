import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SEEDED_ENGINEERING_TAGS } from '@/sharedModules/constants/engineering-tags';
import { getSupabaseClientOrNull } from '@/sharedModules/services/supabase/supabaseClient';
import { upsertWorkspaceTags } from '@/sharedModules/services/supabase/tagSupabaseService';
import { getPersonalWorkspaceId } from '@/sharedModules/services/supabase/workspaceService';
import type { RootState } from '@/sharedModules/state/store';

export type Note = {
  id: string;
  title: string;
  body: string;
  projectId: string | null;
  experimentId: string | null;
  tags: string[];
  isFavorite: boolean;
  linkedNoteIds: string[];
  updatedAt: string;
};

type NotesState = {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  activeTag: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: NotesState = {
  notes: [],
  selectedNoteId: null,
  searchQuery: '',
  activeTag: null,
  isLoading: false,
  error: null,
};

export const fetchNotesThunk = createAsyncThunk<Note[]>('notes/fetchNotesThunk', async () => []);
export const createNoteThunk = createAsyncThunk<
  Note,
  Pick<Note, 'title' | 'body'> & {
    projectId?: string | null;
    experimentId?: string | null;
    tags?: string[];
  },
  { state: RootState }
>(
  'notes/createNoteThunk',
  async ({ title, body, projectId = null, experimentId = null, tags = [] }, { getState }) => {
    const client = getSupabaseClientOrNull();
    const userId = getState().auth.user?.id;
    if (client && userId) {
      const workspaceId = await getPersonalWorkspaceId(client, userId);
      await upsertWorkspaceTags(client, workspaceId, tags);
    }
    return {
      id: `note-${Date.now()}`,
      title,
      body,
      projectId,
      experimentId,
      tags,
      isFavorite: false,
      linkedNoteIds: [],
      updatedAt: new Date().toISOString(),
    };
  },
);
export const updateNoteThunk = createAsyncThunk<Note, Note, { state: RootState }>(
  'notes/updateNoteThunk',
  async (note, { getState }) => {
    const client = getSupabaseClientOrNull();
    const userId = getState().auth.user?.id;
    if (client && userId) {
      const workspaceId = await getPersonalWorkspaceId(client, userId);
      await upsertWorkspaceTags(client, workspaceId, note.tags);
    }
    return { ...note, updatedAt: new Date().toISOString() };
  },
);
export const deleteNoteThunk = createAsyncThunk<string, string>('notes/deleteNoteThunk', async (noteId) => noteId);
export const toggleNoteFavoriteThunk = createAsyncThunk<Note, string, { state: RootState }>(
  'notes/toggleNoteFavoriteThunk',
  async (noteId, { getState }) => {
    const note = getState().notes.notes.find((item) => item.id === noteId);
    if (!note) throw new Error('Note not found');
    return { ...note, isFavorite: !note.isFavorite, updatedAt: new Date().toISOString() };
  },
);
export const searchNotesThunk = createAsyncThunk<string, string>(
  'notes/searchNotesThunk',
  async (query) => query.trim(),
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSelectedNoteId(state, action: PayloadAction<string | null>) {
      state.selectedNoteId = action.payload;
    },
    setActiveTag(state, action: PayloadAction<string | null>) {
      state.activeTag = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch notes';
      })
      .addCase(createNoteThunk.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      })
      .addCase(updateNoteThunk.fulfilled, (state, action) => {
        const index = state.notes.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.notes[index] = action.payload;
      })
      .addCase(deleteNoteThunk.fulfilled, (state, action) => {
        state.notes = state.notes.filter((item) => item.id !== action.payload);
      })
      .addCase(toggleNoteFavoriteThunk.fulfilled, (state, action) => {
        const index = state.notes.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.notes[index] = action.payload;
      })
      .addCase(searchNotesThunk.fulfilled, (state, action) => {
        state.searchQuery = action.payload;
      });
  },
});

export const { setSelectedNoteId, setActiveTag } = notesSlice.actions;
export default notesSlice.reducer;

export const selectNotesByTag = (tag: string) => (state: RootState) =>
  state.notes.notes.filter((note) => note.tags.includes(tag));
export const selectLinkedNotes = (noteId: string) => (state: RootState) => {
  const note = state.notes.notes.find((item) => item.id === noteId);
  if (!note) return [];
  return state.notes.notes.filter((item) => note.linkedNoteIds.includes(item.id));
};
export const selectNoteById = (noteId: string) => (state: RootState) =>
  state.notes.notes.find((note) => note.id === noteId) ?? null;
export const selectNotesByProject = (projectId: string) => (state: RootState) =>
  state.notes.notes.filter((note) => note.projectId === projectId);
export const selectNotesByExperiment = (experimentId: string) => (state: RootState) =>
  state.notes.notes.filter((note) => note.experimentId === experimentId);
export const selectAllNotes = (state: RootState) => state.notes.notes;
export const selectAllTags = (state: RootState) =>
  Array.from(new Set([...SEEDED_ENGINEERING_TAGS, ...state.notes.notes.flatMap((note) => note.tags)])).sort(
    (a, b) => a.localeCompare(b),
  );
export const selectTagCounts = (state: RootState) => {
  const counts = new Map<string, number>();
  for (const tag of SEEDED_ENGINEERING_TAGS) {
    counts.set(tag, 0);
  }
  for (const note of state.notes.notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
};
