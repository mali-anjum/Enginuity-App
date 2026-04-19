import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { createExperimentThunk, updateExperimentThunk } from '@/experiment/state/experimentSlice';
import type { RootState } from '@/sharedModules/state/store';

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

export const fetchProjectsThunk = createAsyncThunk<Project[]>('project/fetchProjectsThunk', async () => []);

export const createProjectThunk = createAsyncThunk<
  Project,
  Pick<Project, 'title'> & Partial<Pick<Project, 'description' | 'startDate' | 'dueDate' | 'status'>>
>(
  'project/createProjectThunk',
  async ({ title, description = '', startDate = null, dueDate = null, status = 'active' }) => ({
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
  }),
);

export const updateProjectThunk = createAsyncThunk<Project, Project>(
  'project/updateProjectThunk',
  async (project) => ({
    ...project,
    isCompleted: project.status === 'completed',
    updatedAt: new Date().toISOString(),
  }),
);

export const deleteProjectThunk = createAsyncThunk<string, string>(
  'project/deleteProjectThunk',
  async (projectId) => projectId,
);

export const toggleFavouriteThunk = createAsyncThunk<string, string>(
  'project/toggleFavouriteThunk',
  async (projectId) => projectId,
);
export const toggleProjectStatusThunk = createAsyncThunk<string, string>(
  'project/toggleProjectStatusThunk',
  async (projectId) => projectId,
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
        const project = state.projects.find((item) => item.id === action.payload);
        if (project) {
          project.isFavourite = !project.isFavourite;
          project.updatedAt = new Date().toISOString();
        }
      })
      .addCase(toggleProjectStatusThunk.fulfilled, (state, action) => {
        const project = state.projects.find((item) => item.id === action.payload);
        if (!project) return;
        project.isCompleted = !project.isCompleted;
        project.status = project.isCompleted ? 'completed' : 'active';
        project.updatedAt = new Date().toISOString();
      })
      .addCase(createExperimentThunk.fulfilled, (state, action) => {
        const project = state.projects.find((item) => item.id === action.payload.projectId);
        if (project) project.updatedAt = new Date().toISOString();
      })
      .addCase(updateExperimentThunk.fulfilled, (state, action) => {
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

export const { setSelectedProjectId, setProjectFilter } = projectSlice.actions;
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
