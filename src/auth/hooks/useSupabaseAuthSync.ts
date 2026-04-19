import { useCallback, useEffect } from 'react';

import {
  authStateChanged,
  authSyncStarted,
  fetchProfileThunk,
  setAuthError,
} from '@/auth/state/authSlice';
import { clearExperimentData, fetchExperimentsThunk } from '@/experiment/state/experimentSlice';
import { clearHardwareData, fetchHardwareThunk } from '@/hardware/state/hardwareSlice';
import { resetOnboarding, setOnboardingCompleted } from '@/onboarding/state/onboardingSlice';
import { clearProjectData, fetchProjectsThunk } from '@/project/state/projectSlice';
import {
  SupabaseNotInitializedError,
  getSupabaseClientOrNull,
  withSupabaseClient,
} from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch } from '@/sharedModules/state/hooks';

const mapSessionToAuthState = (session: {
  access_token?: string;
  expires_at?: number;
  user?: { id?: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } };
} | null) => {
  if (!session?.user?.id || !session.access_token) {
    return { user: null, session: null };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.user_metadata?.full_name ?? session.user.email ?? 'User',
      discipline: null,
      avatarUrl: session.user.user_metadata?.avatar_url ?? null,
      bio: '',
    },
    session: {
      token: session.access_token,
      expiresAt: session.expires_at ?? null,
    },
  };
};

export function SupabaseAuthSync() {
  const dispatch = useAppDispatch();

  const clearWorkspaceDomain = useCallback(() => {
    dispatch(clearProjectData());
    dispatch(clearExperimentData());
    dispatch(clearHardwareData());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    dispatch(authSyncStarted());
    const syncOnboardingStatus = async (userId: string) => {
      const { data, error } = await withSupabaseClient(async (client) => {
        return await client
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', userId)
          .maybeSingle();
      });

      if (!isMounted) return;
      if (error) {
        dispatch(setAuthError(error.message));
        return;
      }

      const profile = data as { onboarding_completed?: boolean } | null;
      dispatch(setOnboardingCompleted(Boolean(profile?.onboarding_completed)));
    };

    if (!getSupabaseClientOrNull()) {
      dispatch(authStateChanged({ user: null, session: null }));
      clearWorkspaceDomain();
      return () => {
        isMounted = false;
      };
    }

    withSupabaseClient((client) => client.auth.getSession(), {
      returnOnUnavailable: { data: { session: null }, error: null },
    })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          dispatch(setAuthError(error.message));
          return;
        }
        dispatch(authStateChanged(mapSessionToAuthState(data.session)));
        if (data.session?.user?.id) {
          void dispatch(fetchProfileThunk());
          void syncOnboardingStatus(data.session.user.id);
          void dispatch(fetchProjectsThunk());
          void dispatch(fetchHardwareThunk());
          void dispatch(fetchExperimentsThunk());
          return;
        }
        dispatch(resetOnboarding());
        clearWorkspaceDomain();
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to initialize authentication session.';
        dispatch(setAuthError(message));
      });

    let data:
      | {
          subscription: {
            unsubscribe: () => void;
          };
        }
      | undefined;
    try {
      const client = getSupabaseClientOrNull();
      if (!client) {
        return () => {
          isMounted = false;
        };
      }
      ({ data } = client.auth.onAuthStateChange((event, session) => {
      void event;
      dispatch(authStateChanged(mapSessionToAuthState(session)));
      if (session?.user?.id) {
        void dispatch(fetchProfileThunk());
        void syncOnboardingStatus(session.user.id);
        void dispatch(fetchProjectsThunk());
        void dispatch(fetchHardwareThunk());
        void dispatch(fetchExperimentsThunk());
        return;
      }
      dispatch(resetOnboarding());
      clearWorkspaceDomain();
      }));
    } catch (error) {
      if (error instanceof SupabaseNotInitializedError) {
        return () => {
          isMounted = false;
        };
      }
      throw error;
    }

    return () => {
      isMounted = false;
      data?.subscription.unsubscribe();
    };
  }, [dispatch, clearWorkspaceDomain]);

  return null;
}
