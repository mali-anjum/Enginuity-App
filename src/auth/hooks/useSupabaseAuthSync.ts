import { useEffect } from 'react';

import { authStateChanged, authSyncStarted, setAuthError } from '@/auth/state/authSlice';
import { resetOnboarding, setOnboardingCompleted } from '@/onboarding/state/onboardingSlice';
import { supabase } from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch } from '@/sharedModules/state/hooks';

export function SupabaseAuthSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;
    dispatch(authSyncStarted());
    const syncOnboardingStatus = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMounted) return;
      if (error) {
        dispatch(setAuthError(error.message));
        return;
      }

      const profile = data as { onboarding_completed?: boolean } | null;
      dispatch(setOnboardingCompleted(Boolean(profile?.onboarding_completed)));
    };

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          dispatch(setAuthError(error.message));
          return;
        }
        dispatch(authStateChanged({ event: 'INITIAL_SESSION', session: data.session }));
        if (data.session?.user?.id) {
          void syncOnboardingStatus(data.session.user.id);
          return;
        }
        dispatch(resetOnboarding());
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to initialize authentication session.';
        dispatch(setAuthError(message));
      });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(authStateChanged({ event: event ?? 'INITIAL_SESSION', session }));
      if (session?.user?.id) {
        void syncOnboardingStatus(session.user.id);
        return;
      }
      dispatch(resetOnboarding());
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}
