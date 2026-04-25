/**
 * Background persistence after optimistic Redux updates (e.g. status chip).
 */

import { patchExperimentStatusForUser } from '@/experiment/services/experimentSupabaseService';
import { getSupabaseClientOrNull } from '@/sharedModules/services/supabase/supabaseClient';
import { store } from '@/store/store';
import { isUuid } from '@/sharedModules/utils/uuid';

export function enqueueExperimentRemoteSync(experimentId: string): void {
  queueMicrotask(() => {
    void persistExperimentRemote(experimentId);
  });
}

async function persistExperimentRemote(experimentId: string): Promise<void> {
  try {
    const experiment = store.getState().experiment.experiments.find((item) => item.id === experimentId);
    if (!experiment || !isUuid(experimentId)) return;

    const client = getSupabaseClientOrNull();
    if (!client) return;

    await patchExperimentStatusForUser(client, experimentId, experiment.status);
  } catch {
    // Optimistic UI already advanced; reconcile on next fetch.
  }
}
