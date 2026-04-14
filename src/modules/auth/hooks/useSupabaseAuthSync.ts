import { useEffect } from 'react';

import { authStateChanged } from '@/modules/auth/state/authSlice';
import { supabase } from '@/shared/services/supabase/supabaseClient';
import { useAppDispatch } from '@/shared/state/hooks';

export function SupabaseAuthSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(authStateChanged({ event: event ?? 'INITIAL_SESSION', session }));
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}
