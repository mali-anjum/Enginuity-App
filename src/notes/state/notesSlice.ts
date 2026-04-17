import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/sharedModules/state/store';

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
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
export const createNoteThunk = createAsyncThunk<Note, Pick<Note, 'title' | 'body'>>(
  'notes/createNoteThunk',
  async ({ title, body }) => ({
    id: `note-${Date.now()}`,
    title,
    body,
    tags: [],
    linkedNoteIds: [],
    updatedAt: new Date().toISOString(),
  }),
);
export const updateNoteThunk = createAsyncThunk<Note, Note>(
  'notes/updateNoteThunk',
  async (note) => ({ ...note, updatedAt: new Date().toISOString() }),
);
export const deleteNoteThunk = createAsyncThunk<string, string>('notes/deleteNoteThunk', async (noteId) => noteId);
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
export const selectAllTags = (state: RootState) =>
  Array.from(new Set(state.notes.notes.flatMap((note) => note.tags))).sort((a, b) =>
    a.localeCompare(b),
  );
