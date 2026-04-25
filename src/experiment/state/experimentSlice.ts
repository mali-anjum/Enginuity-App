import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { nextExperimentStatus } from '@/experiment/constants';
import type { ExperimentStatus } from '@/experiment/constants';
import {
  deleteExperimentForUser,
  fetchExperimentsForUser,
  insertExperimentForUser,
  uploadExperimentAttachmentForUser,
  updateExperimentForUser,
} from '@/experiment/services/experimentSupabaseService';
import { upsertWorkspaceTags } from '@/sharedModules/services/supabase/tagSupabaseService';
import { getPersonalWorkspaceId } from '@/sharedModules/services/supabase/workspaceService';
import type { RootState } from '@/store/store';
import { getSupabaseClientOrNull, withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { createLocalUuidV4, isUuid } from '@/sharedModules/utils/uuid';

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
  attachments: {
    url: string;
    fileName: string;
    fileType: string | null;
    fileSize: number | null;
    uploadedAt: string;
  }[];
  tags: string[];
  pendingSync: boolean;
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
    | 'attachments'
        | 'tags'
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
    attachments = [],
    tags = [],
  } = payload;

  if (user && client && isUuid(projectId)) {
    try {
      const workspaceId = await getPersonalWorkspaceId(client, user.id);
      await upsertWorkspaceTags(client, workspaceId, tags);
      const created = await insertExperimentForUser(client, user.id, {
        title,
        projectId,
        objective,
        observations,
        githubCommit,
        status,
        hardwareIds,
        attachmentUrls,
        attachments,
        tags,
      });
      return { ...created, pendingSync: false };
    } catch {
      // fall through to local pending record when offline/unreachable
    }
  }

  const now = new Date().toISOString();
  return {
    id: createLocalUuidV4(),
    projectId,
    title,
    objective,
    observations,
    githubCommit,
    status,
    hardwareIds,
    attachmentUrls,
    attachments,
    tags,
    pendingSync: true,
    createdAt: now,
    updatedAt: now,
  };
});

export const syncPendingExperimentsThunk = createAsyncThunk<
  { synced: Array<{ tempId: string; server: Experiment }>; idMap: Record<string, string> },
  void,
  { state: RootState }
>('experiment/syncPendingExperimentsThunk', async (_, { getState }) => {
  const user = getState().auth.user;
  const client = getSupabaseClientOrNull();
  if (!user || !client) {
    return { synced: [], idMap: {} };
  }

  const pendingExperiments = getState().experiment.experiments.filter((experiment) => experiment.pendingSync);
  const synced: Array<{ tempId: string; server: Experiment }> = [];
  const idMap: Record<string, string> = {};

  for (const experiment of pendingExperiments) {
    if (!isUuid(experiment.projectId)) {
      continue;
    }
    try {
      const workspaceId = await getPersonalWorkspaceId(client, user.id);
      await upsertWorkspaceTags(client, workspaceId, experiment.tags);
      const serverExperiment = await insertExperimentForUser(client, user.id, {
        title: experiment.title,
        projectId: experiment.projectId,
        objective: experiment.objective,
        observations: experiment.observations,
        githubCommit: experiment.githubCommit,
        status: experiment.status,
        hardwareIds: experiment.hardwareIds,
        attachmentUrls: experiment.attachmentUrls,
        attachments: experiment.attachments,
        tags: experiment.tags,
      });
      synced.push({ tempId: experiment.id, server: { ...serverExperiment, pendingSync: false } });
      idMap[experiment.id] = serverExperiment.id;
    } catch {
      // keep pending records as-is for next retry
    }
  }

  return { synced, idMap };
});

export const updateExperimentThunk = createAsyncThunk<Experiment, Experiment, { state: RootState }>(
  'experiment/updateExperimentThunk',
  async (experiment, { getState }) => {
    const next: Experiment = { ...experiment, updatedAt: new Date().toISOString() };
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(experiment.id)) {
      const workspaceId = await getPersonalWorkspaceId(client, user.id);
      await upsertWorkspaceTags(client, workspaceId, experiment.tags);
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
  {
    experimentId: string;
    attachment: {
      url: string;
      fileName: string;
      fileType: string | null;
      fileSize: number | null;
      uploadedAt: string;
    };
  },
  {
    experimentId: string;
    localUri: string;
    fileName?: string;
    fileType?: string | null;
    fileSize?: number | null;
  },
  { state: RootState }
>(
  'experiment/uploadAttachmentThunk',
  async ({ experimentId, localUri, fileName, fileType, fileSize }, { getState }) => {
  const user = getState().auth.user;
  const client = getSupabaseClientOrNull();
  if (!user || !client || !isUuid(experimentId)) {
    throw new Error('Upload unavailable');
  }
  const attachment = await uploadExperimentAttachmentForUser(client, user.id, experimentId, {
    localUri,
    fileName,
    fileType,
    fileSize,
  });
  return { experimentId, attachment };
});

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
    remapExperimentProjectIds(state, action: PayloadAction<Record<string, string>>) {
      const idMap = action.payload;
      state.experiments = state.experiments.map((experiment) => ({
        ...experiment,
        projectId: idMap[experiment.projectId] ?? experiment.projectId,
      }));
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
        state.experiments = action.payload.map((experiment) => ({ ...experiment, pendingSync: false }));
      })
      .addCase(fetchExperimentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch experiments';
      })
      .addCase(createExperimentThunk.fulfilled, (state, action) => {
        state.experiments.unshift(action.payload);
      })
      .addCase(syncPendingExperimentsThunk.fulfilled, (state, action) => {
        for (const item of action.payload.synced) {
          const index = state.experiments.findIndex((experiment) => experiment.id === item.tempId);
          if (index >= 0) {
            state.experiments[index] = item.server;
          }
        }
        if (state.selectedExperimentId && action.payload.idMap[state.selectedExperimentId]) {
          state.selectedExperimentId = action.payload.idMap[state.selectedExperimentId];
        }
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
          if (!experiment.attachments) {
            experiment.attachments = [];
          }
          experiment.attachments.push(action.payload.attachment);
          if (action.payload.attachment.fileType?.startsWith('image/')) {
            experiment.attachmentUrls.push(action.payload.attachment.url);
          }
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
  remapExperimentProjectIds,
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
export const selectExperimentsByTag = (tag: string) => (state: RootState) =>
  state.experiment.experiments.filter((item) => item.tags.includes(tag));
