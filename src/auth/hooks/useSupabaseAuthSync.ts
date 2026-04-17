import { useEffect } from 'react';

import { authStateChanged, authSyncStarted, setAuthError } from '@/auth/state/authSlice';
import { supabase } from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch } from '@/sharedModules/state/hooks';

export function SupabaseAuthSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;
    dispatch(authSyncStarted());

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          dispatch(setAuthError(error.message));
          return;
        }
        dispatch(authStateChanged({ event: 'INITIAL_SESSION', session: data.session }));
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to initialize authentication session.';
        dispatch(setAuthError(message));
      });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(authStateChanged({ event: event ?? 'INITIAL_SESSION', session }));
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}
