import {
  EXPERIMENT_STATUSES,
  EXPERIMENT_STATUS_LABELS,
  experimentStatusLabel,
  nextExperimentStatus,
  type ExperimentStatus,
} from '@/experiment/constants';

describe('experiment status cycle (v0.1 quick-toggle)', () => {
  it('cycles Pending → In Progress → Completed → Failed → Pending', () => {
    let s: ExperimentStatus = EXPERIMENT_STATUSES[0];
    const order: ExperimentStatus[] = [s];
    for (let i = 0; i < EXPERIMENT_STATUSES.length; i += 1) {
      s = nextExperimentStatus(s);
      order.push(s);
    }
    expect(order).toEqual(['pending', 'in_progress', 'completed', 'failed', 'pending']);
  });

  it('maps unknown status to starting at pending when cycling', () => {
    expect(nextExperimentStatus('unknown' as never)).toBe('in_progress');
  });

  it('has a label for every status', () => {
    for (const status of EXPERIMENT_STATUSES) {
      expect(experimentStatusLabel(status)).toBe(EXPERIMENT_STATUS_LABELS[status]);
      expect(EXPERIMENT_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });
});
