/** Ordered cycle for quick status updates (e.g. detail chip tap). */
export const EXPERIMENT_STATUSES = ['pending', 'in_progress', 'completed', 'failed'] as const;

export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
};

export function experimentStatusLabel(status: ExperimentStatus): string {
  return EXPERIMENT_STATUS_LABELS[status];
}

export function nextExperimentStatus(status: ExperimentStatus): ExperimentStatus {
  const idx = EXPERIMENT_STATUSES.indexOf(status);
  const safe = idx >= 0 ? idx : 0;
  return EXPERIMENT_STATUSES[(safe + 1) % EXPERIMENT_STATUSES.length];
}
