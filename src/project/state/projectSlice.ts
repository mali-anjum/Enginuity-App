import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  createExperimentThunk,
  cycleExperimentStatus,
  updateExperimentThunk,
} from '@/experiment/state/experimentSlice';
import {
  deleteProjectForUser,
  fetchProjectsForUser,
  insertProjectForUser,
  updateProjectForUser,
} from '@/project/services/projectSupabaseService';
import type { RootState } from '@/sharedModules/state/store';
import { getSupabaseClientOrNull, withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';
import { isUuid } from '@/sharedModules/utils/uuid';

export type ProjectFilter = 'active' | 'completed' | 'archived' | 'favourites';
export type ProjectStatus = 'active' | 'completed' | 'archived';

export type Project = {
  id: string;
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  status: ProjectStatus;
  fileUrls: string[];
  isCompleted: boolean;
  isFavourite: boolean;
  updatedAt: string;
};

type ProjectState = {
  projects: Project[];
  selectedProjectId: string | null;
  filter: ProjectFilter;
  isLoading: boolean;
  error: string | null;
};

const initialState: ProjectState = {
  projects: [],
  selectedProjectId: null,
  filter: 'active',
  isLoading: false,
  error: null,
};

export const fetchProjectsThunk = createAsyncThunk<Project[], void, { state: RootState }>(
  'project/fetchProjectsThunk',
  async (_, { getState }) => {
    const userId = getState().auth.user?.id;
    if (!userId) return [];
    return withSupabaseClient((client) => fetchProjectsForUser(client, userId), {
      returnOnUnavailable: [],
    });
  },
);

export const createProjectThunk = createAsyncThunk<
  Project,
  Pick<Project, 'title'> & Partial<Pick<Project, 'description' | 'startDate' | 'dueDate' | 'status'>>,
  { state: RootState }
>('project/createProjectThunk', async (payload, { getState }) => {
  const user = getState().auth.user;
  const client = getSupabaseClientOrNull();
  if (user && client) {
    return insertProjectForUser(client, user.id, payload);
  }

  const { title, description = '', startDate = null, dueDate = null, status = 'active' } = payload;
  return {
    id: `project-${Date.now()}`,
    title,
    description,
    startDate,
    dueDate,
    status,
    fileUrls: [],
    isCompleted: status === 'completed',
    isFavourite: false,
    updatedAt: new Date().toISOString(),
  };
});

export const updateProjectThunk = createAsyncThunk<Project, Project, { state: RootState }>(
  'project/updateProjectThunk',
  async (project, { getState }) => {
    const next: Project = {
      ...project,
      isCompleted: project.status === 'completed',
      updatedAt: new Date().toISOString(),
    };
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(project.id)) {
      return updateProjectForUser(client, next);
    }
    return next;
  },
);

export const deleteProjectThunk = createAsyncThunk<string, string, { state: RootState }>(
  'project/deleteProjectThunk',
  async (projectId, { getState }) => {
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(projectId)) {
      await deleteProjectForUser(client, projectId);
    }
    return projectId;
  },
);

export const toggleFavouriteThunk = createAsyncThunk<Project, string, { state: RootState }>(
  'project/toggleFavouriteThunk',
  async (projectId, { getState }) => {
    const project = getState().project.projects.find((item) => item.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    const next: Project = {
      ...project,
      isFavourite: !project.isFavourite,
      updatedAt: new Date().toISOString(),
    };
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(projectId)) {
      return updateProjectForUser(client, next);
    }
    return next;
  },
);
export const toggleProjectStatusThunk = createAsyncThunk<Project, string, { state: RootState }>(
  'project/toggleProjectStatusThunk',
  async (projectId, { getState }) => {
    const project = getState().project.projects.find((item) => item.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    const isCompleted = !project.isCompleted;
    const next: Project = {
      ...project,
      isCompleted,
      status: isCompleted ? 'completed' : 'active',
      updatedAt: new Date().toISOString(),
    };
    const user = getState().auth.user;
    const client = getSupabaseClientOrNull();
    if (user && client && isUuid(projectId)) {
      return updateProjectForUser(client, next);
    }
    return next;
  },
);
export const attachProjectFileThunk = createAsyncThunk<
  { projectId: string; fileUrl: string },
  { projectId: string; fileUrl: string }
>('project/attachProjectFileThunk', async (payload) => payload);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProjectId(state, action: PayloadAction<string | null>) {
      state.selectedProjectId = action.payload;
    },
    setProjectFilter(state, action: PayloadAction<ProjectFilter>) {
      state.filter = action.payload;
    },
    clearProjectData(state) {
      state.projects = [];
      state.selectedProjectId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjectsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch projects';
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(updateProjectThunk.fulfilled, (state, action) => {
        const index = state.projects.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.projects = state.projects.filter((item) => item.id !== action.payload);
      })
      .addCase(toggleFavouriteThunk.fulfilled, (state, action) => {
        const index = state.projects.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.projects[index] = action.payload;
      })
      .addCase(toggleProjectStatusThunk.fulfilled, (state, action) => {
        const index = state.projects.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.projects[index] = action.payload;
      })
      .addCase(createExperimentThunk.fulfilled, (state, action) => {
        const project = state.projects.find((item) => item.id === action.payload.projectId);
        if (project) project.updatedAt = new Date().toISOString();
      })
      .addCase(updateExperimentThunk.fulfilled, (state, action) => {
        const project = state.projects.find((item) => item.id === action.payload.projectId);
        if (project) project.updatedAt = new Date().toISOString();
      })
      .addCase(cycleExperimentStatus, (state, action) => {
        const project = state.projects.find((item) => item.id === action.payload.projectId);
        if (project) project.updatedAt = new Date().toISOString();
      })
      .addCase(attachProjectFileThunk.fulfilled, (state, action) => {
        const project = state.projects.find((item) => item.id === action.payload.projectId);
        if (!project) return;
        project.fileUrls.unshift(action.payload.fileUrl);
        project.updatedAt = new Date().toISOString();
      });
  },
});

export const { setSelectedProjectId, setProjectFilter, clearProjectData } = projectSlice.actions;
export default projectSlice.reducer;

const sortByLastActivity = (projects: Project[]) =>
  [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

export const selectAllProjects = (state: RootState) => state.project.projects;

/** All projects sorted by most recently touched (updatedAt descending). */
export const selectProjectsSortedByLastActivity = (state: RootState) =>
  sortByLastActivity(state.project.projects);

export const selectFilteredProjects = (state: RootState) => {
  const { projects, filter } = state.project;
  if (filter === 'favourites') return sortByLastActivity(projects.filter((item) => item.isFavourite));
  if (filter === 'completed')
    return sortByLastActivity(projects.filter((item) => item.status === 'completed'));
  if (filter === 'archived')
    return sortByLastActivity(projects.filter((item) => item.status === 'archived'));
  return sortByLastActivity(projects.filter((item) => item.status === 'active'));
};
export const selectProjectById = (projectId: string) => (state: RootState) =>
  state.project.projects.find((item) => item.id === projectId) ?? null;
export const selectProjectStats = (state: RootState) => {
  const projects = state.project.projects;
  const total = projects.length;
  const completed = projects.filter((item) => item.status === 'completed').length;
  const favourites = projects.filter((item) => item.isFavourite).length;
  const active = projects.filter((item) => item.status === 'active').length;
  return { total, completed, favourites, active };
};
export const selectProjectFilter = (state: RootState) => state.project.filter;
