import type { RootState } from '@/sharedModules/state/store';

import experimentReducer, {
  createExperimentThunk,
  cycleExperimentStatus,
  selectRecentExperiments,
  type Experiment,
} from '@/experiment/state/experimentSlice';

function experimentFixture(overrides: Partial<Experiment> = {}): Experiment {
  const base: Experiment = {
    id: 'exp-1',
    projectId: 'proj-1',
    title: 'Calibrate IMU',
    objective: '',
    observations: '',
    githubCommit: '',
    status: 'pending',
    hardwareIds: [],
    attachmentUrls: [],
    attachments: [],
    tags: [],
    pendingSync: false,
    createdAt: '2024-06-01T12:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
  };
  return { ...base, ...overrides };
}

describe('experimentSlice — optimistic status toggle & recent feed', () => {
  it('cycleExperimentStatus advances status immediately (no async)', () => {
    let state = experimentReducer(undefined, { type: '@@INIT' });
    const exp = experimentFixture({ id: 'e1', projectId: 'p1', status: 'pending' });
    state = experimentReducer(
      state,
      createExperimentThunk.fulfilled(exp, 'r1', {
        title: exp.title,
        projectId: exp.projectId,
      }),
    );

    state = experimentReducer(
      state,
      cycleExperimentStatus({ experimentId: 'e1', projectId: 'p1' }),
    );

    const updated = state.experiments.find((e) => e.id === 'e1');
    expect(updated?.status).toBe('in_progress');
  });

  it('selectRecentExperiments returns up to 5, most recently updated first', () => {
    const experiments: Experiment[] = [
      experimentFixture({
        id: 'a',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }),
      experimentFixture({
        id: 'b',
        updatedAt: '2024-01-03T00:00:00.000Z',
      }),
      experimentFixture({
        id: 'c',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }),
    ];

    const partial = {
      experiment: {
        experiments,
        selectedExperimentId: null,
        filterByProject: null,
        filterByStatus: null,
        filterByHardware: null,
        isLoading: false,
        error: null,
      },
    } as unknown as RootState;

    const recent = selectRecentExperiments(partial);
    expect(recent.map((e) => e.id)).toEqual(['b', 'c', 'a']);
    expect(recent.length).toBeLessThanOrEqual(5);
  });
});
