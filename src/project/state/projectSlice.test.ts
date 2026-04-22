import type { RootState } from '@/sharedModules/state/store';

import projectReducer, {
  fetchProjectsThunk,
  selectFilteredProjects,
  toggleProjectStatusThunk,
  type Project,
} from '@/project/state/projectSlice';

function projectFixture(overrides: Partial<Project> = {}): Project {
  const base: Project = {
    id: 'proj-1',
    workspaceId: 'ws-1',
    ownerId: 'user-1',
    accessRole: 'admin',
    sharedWithMe: false,
    title: 'Drone Nav',
    description: '',
    startDate: null,
    dueDate: null,
    status: 'active',
    fileUrls: [],
    isCompleted: false,
    isFavourite: false,
    pendingSync: false,
    updatedAt: '2024-06-01T12:00:00.000Z',
  };
  return { ...base, ...overrides };
}

describe('projectSlice — list filters & project cards data', () => {
  it('selectFilteredProjects respects active / completed / archived / favourites', () => {
    const projects: Project[] = [
      projectFixture({ id: '1', status: 'active', isFavourite: true }),
      projectFixture({ id: '2', status: 'completed', isCompleted: true }),
      projectFixture({ id: '3', status: 'archived' }),
    ];

    const base = {
      project: {
        projects,
        selectedProjectId: null,
        filter: 'active' as const,
        isLoading: false,
        error: null,
      },
    };

    const s = base as unknown as RootState;
    expect(selectFilteredProjects({ ...s, project: { ...s.project, filter: 'active' } }).map((p) => p.id)).toEqual(
      ['1'],
    );
    expect(selectFilteredProjects({ ...s, project: { ...s.project, filter: 'completed' } }).map((p) => p.id)).toEqual(
      ['2'],
    );
    expect(selectFilteredProjects({ ...s, project: { ...s.project, filter: 'archived' } }).map((p) => p.id)).toEqual(
      ['3'],
    );
    expect(selectFilteredProjects({ ...s, project: { ...s.project, filter: 'favourites' } }).map((p) => p.id)).toEqual(
      ['1'],
    );
  });

  it('merge fetchProjectsThunk.fulfilled replaces project list from server', () => {
    let state = projectReducer(undefined, { type: '@@INIT' });
    const remote = [projectFixture({ id: 'uuid-1', title: 'From API' })];
    state = projectReducer(state, fetchProjectsThunk.fulfilled(remote, 'req-1', undefined));
    expect(state.projects).toHaveLength(1);
    expect(state.projects[0].title).toBe('From API');
  });
});

describe('toggleProjectStatusThunk.fulfilled (local / offline path)', () => {
  it('replaces project when thunk returns full project (no double toggle)', () => {
    let state = projectReducer(undefined, { type: '@@INIT' });
    const p = projectFixture({ id: 'local-p', status: 'active', isCompleted: false });
    state = projectReducer(state, fetchProjectsThunk.fulfilled([p], 'r', undefined));

    const toggled: Project = {
      ...p,
      isCompleted: true,
      status: 'completed',
      updatedAt: '2024-07-01T00:00:00.000Z',
    };

    state = projectReducer(state, toggleProjectStatusThunk.fulfilled(toggled, 'r2', 'local-p'));
    expect(state.projects[0]).toEqual(toggled);
  });
});
