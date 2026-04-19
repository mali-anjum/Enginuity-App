import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { HardwareCategory } from '@/hardware/constants';
import {
  deleteHardwareForUser,
  fetchHardwareForUser,
  insertHardwareForUser,
  updateHardwareForUser,
} from '@/hardware/services/hardwareSupabaseService';
import type { RootState } from '@/sharedModules/state/store';
import { getSupabaseClientOrNull, withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { isUuid } from '@/sharedModules/utils/uuid';

export type HardwareItem = {
  id: string;
  name: string;
  category: HardwareCategory;
  specs: string;
  /** Optional datasheet link (PDF or vendor page). */
  datasheetUrl: string;
  updatedAt: string;
};

type HardwareState = {
  hardware: HardwareItem[];
  selectedHardwareId: string | null;
  filterByCategory: HardwareCategory | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: HardwareState = {
  hardware: [],
  selectedHardwareId: null,
  filterByCategory: null,
  isLoading: false,
  error: null,
};

export const fetchHardwareThunk = createAsyncThunk<HardwareItem[], void, { state: RootState }>(
  'hardware/fetchHardwareThunk',
  async (_, { getState }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return [];
    return withSupabaseClient((client) => fetchHardwareForUser(client, userId), {
      returnOnUnavailable: [],
    });
  },
);

export const addHardwareThunk = createAsyncThunk<
  HardwareItem,
  Pick<HardwareItem, 'name' | 'category'> & Partial<Pick<HardwareItem, 'specs' | 'datasheetUrl'>>,
  { state: RootState }
>('hardware/addHardwareThunk', async (payload, { getState }) => {
  const user = getState().auth.user;
  const client = getSupabaseClientOrNull();
  if (user && client) {
    return insertHardwareForUser(client, user.id, payload);
  }

  const { name, category, specs = '', datasheetUrl = '' } = payload;
  return {
    id: `hw-${Date.now()}`,
    name,
    category,
    specs,
    datasheetUrl,
    updatedAt: new Date().toISOString(),
  };
});

export const updateHardwareThunk = createAsyncThunk<HardwareItem, HardwareItem, { state: RootState }>(
  'hardware/updateHardwareThunk',
  async (hardware, { getState }) => {
    const next: HardwareItem = { ...hardware, updatedAt: new Date().toISOString() };
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(hardware.id)) {
      return updateHardwareForUser(client, next);
    }
    return next;
  },
);

export const deleteHardwareThunk = createAsyncThunk<string, string, { state: RootState }>(
  'hardware/deleteHardwareThunk',
  async (hardwareId, { getState }) => {
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(hardwareId)) {
      await deleteHardwareForUser(client, hardwareId);
    }
    return hardwareId;
  },
);

const hardwareSlice = createSlice({
  name: 'hardware',
  initialState,
  reducers: {
    setSelectedHardwareId(state, action: PayloadAction<string | null>) {
      state.selectedHardwareId = action.payload;
    },
    setHardwareCategoryFilter(state, action: PayloadAction<HardwareCategory | null>) {
      state.filterByCategory = action.payload;
    },
    clearHardwareData(state) {
      state.hardware = [];
      state.selectedHardwareId = null;
      state.filterByCategory = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHardwareThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHardwareThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hardware = action.payload;
      })
      .addCase(fetchHardwareThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch hardware';
      })
      .addCase(addHardwareThunk.fulfilled, (state, action) => {
        state.hardware.unshift(action.payload);
      })
      .addCase(updateHardwareThunk.fulfilled, (state, action) => {
        const index = state.hardware.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.hardware[index] = action.payload;
      })
      .addCase(deleteHardwareThunk.fulfilled, (state, action) => {
        state.hardware = state.hardware.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setSelectedHardwareId, setHardwareCategoryFilter, clearHardwareData } =
  hardwareSlice.actions;
export default hardwareSlice.reducer;

export const selectAllHardware = (state: RootState) => state.hardware.hardware;

export const selectHardwareByCategory =
  (category: HardwareCategory) => (state: RootState) =>
    state.hardware.hardware.filter((item) => item.category === category);

export const selectHardwareById = (hardwareId: string) => (state: RootState) =>
  state.hardware.hardware.find((item) => item.id === hardwareId) ?? null;

export const selectHardwareCategoryFilter = (state: RootState) =>
  state.hardware.filterByCategory;
