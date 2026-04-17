import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/sharedModules/state/store';

type ProjectFilter = 'active' | 'completed' | 'favourites';

export type Project = {
  id: string;
  title: string;
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

export const createProjectThunk = createAsyncThunk<Project, Pick<Project, 'title'>>(
  'project/createProjectThunk',
  async ({ title }) => ({
    id: `project-${Date.now()}`,
    title,
    isCompleted: false,
    isFavourite: false,
    updatedAt: new Date().toISOString(),
  }),
);

export const updateProjectThunk = createAsyncThunk<Project, Project>(
  'project/updateProjectThunk',
  async (project) => ({ ...project, updatedAt: new Date().toISOString() }),
);

export const deleteProjectThunk = createAsyncThunk<string, string>(
  'project/deleteProjectThunk',
  async (projectId) => projectId,
);

export const toggleFavouriteThunk = createAsyncThunk<string, string>(
  'project/toggleFavouriteThunk',
  async (projectId) => projectId,
);

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
      });
  },
});

export const { setSelectedProjectId, setProjectFilter } = projectSlice.actions;
export default projectSlice.reducer;

export const selectAllProjects = (state: RootState) => state.project.projects;
export const selectFilteredProjects = (state: RootState) => {
  const { projects, filter } = state.project;
  if (filter === 'favourites') return projects.filter((item) => item.isFavourite);
  if (filter === 'completed') return projects.filter((item) => item.isCompleted);
  return projects.filter((item) => !item.isCompleted);
};
export const selectProjectById = (projectId: string) => (state: RootState) =>
  state.project.projects.find((item) => item.id === projectId) ?? null;
export const selectProjectStats = (state: RootState) => {
  const total = state.project.projects.length;
  const completed = state.project.projects.filter((item) => item.isCompleted).length;
  const favourites = state.project.projects.filter((item) => item.isFavourite).length;
  return { total, completed, favourites, active: total - completed };
};
