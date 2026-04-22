import { useEffect } from 'react';

import { fetchExperimentsThunk } from '@/experiment/state/experimentSlice';
import { fetchNotesThunk } from '@/notes/state/notesSlice';
import { getSupabaseClientOrNull } from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export function SharedProjectsRealtimeSync() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);

  useEffect(() => {
    const client = getSupabaseClientOrNull();
    if (!client || !userId) return;

    const channel = client
      .channel(`shared-projects-feed-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'experiments' },
        () => {
          void dispatch(fetchExperimentsThunk());
          void dispatch(fetchNotesThunk());
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [dispatch, userId]);

  return null;
}
