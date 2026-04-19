/**
 * Background persistence for experiments after optimistic Redux updates.
 * Wire Supabase (or another backend) here without blocking the UI thread.
 */

export function enqueueExperimentRemoteSync(experimentId: string): void {
  queueMicrotask(() => {
    void persistExperimentStub(experimentId);
  });
}

async function persistExperimentStub(experimentId: string): Promise<void> {
  try {
    // Future: load session, map local id → server row, upsert status & updated_at.
    // Local-only ids (e.g. exp-…) skip until unified sync ships.
    void experimentId;
  } catch {
    // Swallow sync errors — optimistic UI already advanced; reconcile on next fetch when wired.
  }
}
