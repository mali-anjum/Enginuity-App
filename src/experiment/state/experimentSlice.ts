import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { nextExperimentStatus } from '@/experiment/constants';
import type { ExperimentStatus } from '@/experiment/constants';
import {
  deleteExperimentForUser,
  fetchExperimentsForUser,
  insertExperimentForUser,
  updateExperimentForUser,
} from '@/experiment/services/experimentSupabaseService';
import type { RootState } from '@/sharedModules/state/store';
import { getSupabaseClientOrNull, withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { isUuid } from '@/sharedModules/utils/uuid';

export type Experiment = {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  observations: string;
  /** Git commit SHA or GitHub URL for this run. */
  githubCommit: string;
  status: ExperimentStatus;
  hardwareIds: string[];
  attachmentUrls: string[];
  /** Set once when the experiment is created. */
  createdAt: string;
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

export const fetchExperimentsThunk = createAsyncThunk<Experiment[], void, { state: RootState }>(
  'experiment/fetchExperimentsThunk',
  async (_, { getState }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return [];
    return withSupabaseClient((client) => fetchExperimentsForUser(client, userId), {
      returnOnUnavailable: [],
    });
  },
);

export const createExperimentThunk = createAsyncThunk<
  Experiment,
  Pick<Experiment, 'title' | 'projectId'> &
    Partial<
      Pick<
        Experiment,
        | 'objective'
        | 'observations'
        | 'githubCommit'
        | 'status'
        | 'hardwareIds'
        | 'attachmentUrls'
      >
    >,
  { state: RootState }
>('experiment/createExperimentThunk', async (payload, { getState }) => {
  const user = getState().auth.user;
  const client = getSupabaseClientOrNull();
  const {
    title,
    projectId,
    objective = '',
    observations = '',
    githubCommit = '',
    status = 'pending',
    hardwareIds = [],
    attachmentUrls = [],
  } = payload;

  if (user && client && isUuid(projectId)) {
    return insertExperimentForUser(client, user.id, {
      title,
      projectId,
      objective,
      observations,
      githubCommit,
      status,
      hardwareIds,
      attachmentUrls,
    });
  }

  const now = new Date().toISOString();
  return {
    id: `exp-${Date.now()}`,
    projectId,
    title,
    objective,
    observations,
    githubCommit,
    status,
    hardwareIds,
    attachmentUrls,
    createdAt: now,
    updatedAt: now,
  };
});

export const updateExperimentThunk = createAsyncThunk<Experiment, Experiment, { state: RootState }>(
  'experiment/updateExperimentThunk',
  async (experiment, { getState }) => {
    const next: Experiment = { ...experiment, updatedAt: new Date().toISOString() };
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(experiment.id)) {
      return updateExperimentForUser(client, next);
    }
    return next;
  },
);

export const deleteExperimentThunk = createAsyncThunk<string, string, { state: RootState }>(
  'experiment/deleteExperimentThunk',
  async (experimentId, { getState }) => {
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(experimentId)) {
      await deleteExperimentForUser(client, experimentId);
    }
    return experimentId;
  },
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
    /** One-tap status cycle for list chips (synchronous optimistic update). */
    cycleExperimentStatus(
      state,
      action: PayloadAction<{ experimentId: string; projectId: string }>,
    ) {
      const experiment = state.experiments.find((item) => item.id === action.payload.experimentId);
      if (!experiment) return;
      experiment.status = nextExperimentStatus(experiment.status);
      experiment.updatedAt = new Date().toISOString();
    },
    clearExperimentData(state) {
      state.experiments = [];
      state.selectedExperimentId = null;
      state.filterByProject = null;
      state.filterByStatus = null;
      state.filterByHardware = null;
      state.error = null;
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
  cycleExperimentStatus,
  clearExperimentData,
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
export const selectAllExperiments = (state: RootState) => state.experiment.experiments;
