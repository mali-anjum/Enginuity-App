import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SEEDED_ENGINEERING_TAGS } from '@/sharedModules/constants/engineering-tags';
import {
  createNote,
  fetchTagUsageCounts,
  getAllNotes,
  removeNote,
  updateNote,
} from '@/notes/services/notesSupabaseService';
import { getSupabaseClientOrNull, withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { getPersonalWorkspaceId } from '@/sharedModules/services/supabase/workspaceService';
import { upsertWorkspaceTags } from '@/sharedModules/services/supabase/tagSupabaseService';
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
  tagCounts: Array<{ tag: string; count: number }>;
  isLoading: boolean;
  error: string | null;
};

const initialState: NotesState = {
  notes: [],
  selectedNoteId: null,
  searchQuery: '',
  activeTag: null,
  tagCounts: [],
  isLoading: false,
  error: null,
};

export const fetchNotesThunk = createAsyncThunk<Note[], void, { state: RootState }>(
  'notes/fetchNotesThunk',
  async (_, { getState }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return [];
    return withSupabaseClient((client) => getAllNotes(client, userId), { returnOnUnavailable: [] });
  },
);
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
      return createNote(client, userId, {
        title,
        body,
        projectId,
        experimentId,
        tags,
      });
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
      return updateNote(client, userId, note.id, note);
    }
    return { ...note, updatedAt: new Date().toISOString() };
  },
);
export const deleteNoteThunk = createAsyncThunk<string, string, { state: RootState }>(
  'notes/deleteNoteThunk',
  async (noteId, { getState }) => {
    const client = getSupabaseClientOrNull();
    const userId = getState().auth.user?.id;
    if (client && userId) await removeNote(client, noteId);
    return noteId;
  },
);
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
export const fetchTagCountsThunk = createAsyncThunk<Array<{ tag: string; count: number }>, void, { state: RootState }>(
  'notes/fetchTagCountsThunk',
  async (_, { getState }) => {
    const client = getSupabaseClientOrNull();
    const userId = getState().auth.user?.id;
    if (!client || !userId) {
      return SEEDED_ENGINEERING_TAGS.map((tag) => ({ tag, count: 0 }));
    }
    const workspaceId = await getPersonalWorkspaceId(client, userId);
    const rows = await fetchTagUsageCounts(client, workspaceId);
    const seeded = SEEDED_ENGINEERING_TAGS.map((tag) => ({ tag, count: 0 }));
    const merged = new Map<string, number>(seeded.map((item) => [item.tag, item.count]));
    for (const row of rows) merged.set(row.tag, row.count);
    return Array.from(merged.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  },
);
export const createCustomTagThunk = createAsyncThunk<string, string, { state: RootState }>(
  'notes/createCustomTagThunk',
  async (tagName, { getState }) => {
    const client = getSupabaseClientOrNull();
    const userId = getState().auth.user?.id;
    const trimmed = tagName.trim();
    if (!trimmed) throw new Error('Tag cannot be empty');
    if (client && userId) {
      const workspaceId = await getPersonalWorkspaceId(client, userId);
      await upsertWorkspaceTags(client, workspaceId, [trimmed]);
    }
    return trimmed;
  },
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
      .addCase(fetchTagCountsThunk.fulfilled, (state, action) => {
        state.tagCounts = action.payload;
      })
      .addCase(createCustomTagThunk.fulfilled, (state, action) => {
        if (!state.tagCounts.some((item) => item.tag === action.payload)) {
          state.tagCounts.push({ tag: action.payload, count: 0 });
          state.tagCounts.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
        }
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
  if (state.notes.tagCounts.length > 0) return state.notes.tagCounts;
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
