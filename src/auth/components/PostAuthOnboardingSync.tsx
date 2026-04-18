import { useEffect } from 'react';

import { selectIsAuthenticated } from '@/auth/state/authSlice';
import { selectHasCompletedOnboarding } from '@/onboarding/state/selectors';
import { flushOnboardingDraftThunk } from '@/onboarding/thunks/flushOnboardingDraftThunk';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

/**
 * After sign-in, persists the pre-auth onboarding questionnaire to Supabase (once applicable).
 */
export function PostAuthOnboardingSync() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const completed = useAppSelector(selectHasCompletedOnboarding);

  useEffect(() => {
    if (!isAuthenticated || !userId || completed) {
      return;
    }
    void dispatch(flushOnboardingDraftThunk());
  }, [completed, dispatch, isAuthenticated, userId]);

  return null;
}
