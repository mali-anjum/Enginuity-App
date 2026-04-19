import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { HardwareCategory } from '@/hardware/constants';
import type { RootState } from '@/sharedModules/state/store';

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

export const fetchHardwareThunk = createAsyncThunk<HardwareItem[]>(
  'hardware/fetchHardwareThunk',
  async () => [],
);

export const addHardwareThunk = createAsyncThunk<
  HardwareItem,
  Pick<HardwareItem, 'name' | 'category'> & Partial<Pick<HardwareItem, 'specs' | 'datasheetUrl'>>
>(
  'hardware/addHardwareThunk',
  async ({ name, category, specs = '', datasheetUrl = '' }) => ({
    id: `hw-${Date.now()}`,
    name,
    category,
    specs,
    datasheetUrl,
    updatedAt: new Date().toISOString(),
  }),
);

export const updateHardwareThunk = createAsyncThunk<HardwareItem, HardwareItem>(
  'hardware/updateHardwareThunk',
  async (hardware) => ({ ...hardware, updatedAt: new Date().toISOString() }),
);

export const deleteHardwareThunk = createAsyncThunk<string, string>(
  'hardware/deleteHardwareThunk',
  async (hardwareId) => hardwareId,
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

export const { setSelectedHardwareId, setHardwareCategoryFilter } = hardwareSlice.actions;
export default hardwareSlice.reducer;

export const selectAllHardware = (state: RootState) => state.hardware.hardware;

export const selectHardwareByCategory =
  (category: HardwareCategory) => (state: RootState) =>
    state.hardware.hardware.filter((item) => item.category === category);

export const selectHardwareById = (hardwareId: string) => (state: RootState) =>
  state.hardware.hardware.find((item) => item.id === hardwareId) ?? null;

export const selectHardwareCategoryFilter = (state: RootState) =>
  state.hardware.filterByCategory;
