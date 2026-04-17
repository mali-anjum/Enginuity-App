import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/sharedModules/state/store';

export type Experiment = {
  id: string;
  projectId: string;
  title: string;
  status: 'draft' | 'in_progress' | 'completed';
  hardwareIds: string[];
  attachmentUrls: string[];
  updatedAt: string;
};

type ExperimentState = {
  experiments: Experiment[];
  selectedExperimentId: string | null;
  filterByProject: string | null;
  filterByStatus: Experiment['status'] | null;
  filterByHardware: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: ExperimentState = {
  experiments: [],
  selectedExperimentId: null,
  filterByProject: null,
  filterByStatus: null,
  filterByHardware: null,
  isLoading: false,
  error: null,
};

export const fetchExperimentsThunk = createAsyncThunk<Experiment[]>('experiment/fetchExperimentsThunk', async () => []);
export const createExperimentThunk = createAsyncThunk<Experiment, Pick<Experiment, 'title' | 'projectId'>>(
  'experiment/createExperimentThunk',
  async ({ title, projectId }) => ({
    id: `exp-${Date.now()}`,
    projectId,
    title,
    status: 'draft',
    hardwareIds: [],
    attachmentUrls: [],
    updatedAt: new Date().toISOString(),
  }),
);
export const updateExperimentThunk = createAsyncThunk<Experiment, Experiment>(
  'experiment/updateExperimentThunk',
  async (experiment) => ({ ...experiment, updatedAt: new Date().toISOString() }),
);
export const deleteExperimentThunk = createAsyncThunk<string, string>(
  'experiment/deleteExperimentThunk',
  async (experimentId) => experimentId,
);
export const uploadAttachmentThunk = createAsyncThunk<
  { experimentId: string; url: string },
  { experimentId: string; url: string }
>('experiment/uploadAttachmentThunk', async (payload) => payload);

const experimentSlice = createSlice({
  name: 'experiment',
  initialState,
  reducers: {
    setSelectedExperimentId(state, action: PayloadAction<string | null>) {
      state.selectedExperimentId = action.payload;
    },
    setExperimentProjectFilter(state, action: PayloadAction<string | null>) {
      state.filterByProject = action.payload;
    },
    setExperimentStatusFilter(state, action: PayloadAction<Experiment['status'] | null>) {
      state.filterByStatus = action.payload;
    },
    setExperimentHardwareFilter(state, action: PayloadAction<string | null>) {
      state.filterByHardware = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExperimentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExperimentsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.experiments = action.payload;
      })
      .addCase(fetchExperimentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch experiments';
      })
      .addCase(createExperimentThunk.fulfilled, (state, action) => {
        state.experiments.unshift(action.payload);
      })
      .addCase(updateExperimentThunk.fulfilled, (state, action) => {
        const index = state.experiments.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.experiments[index] = action.payload;
      })
      .addCase(deleteExperimentThunk.fulfilled, (state, action) => {
        state.experiments = state.experiments.filter((item) => item.id !== action.payload);
      })
      .addCase(uploadAttachmentThunk.fulfilled, (state, action) => {
        const experiment = state.experiments.find((item) => item.id === action.payload.experimentId);
        if (experiment) {
          experiment.attachmentUrls.push(action.payload.url);
          experiment.updatedAt = new Date().toISOString();
        }
      });
  },
});

export const {
  setSelectedExperimentId,
  setExperimentProjectFilter,
  setExperimentStatusFilter,
  setExperimentHardwareFilter,
} = experimentSlice.actions;
export default experimentSlice.reducer;

export const selectExperimentsByProject = (projectId: string) => (state: RootState) =>
  state.experiment.experiments.filter((item) => item.projectId === projectId);
export const selectExperimentById = (experimentId: string) => (state: RootState) =>
  state.experiment.experiments.find((item) => item.id === experimentId) ?? null;
export const selectRecentExperiments = (state: RootState) =>
  [...state.experiment.experiments]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5);
