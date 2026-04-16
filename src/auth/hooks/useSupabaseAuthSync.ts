import { useEffect } from 'react';

import { authStateChanged } from '@/auth/state/authSlice';
import { supabase } from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch } from '@/sharedModules/state/hooks';

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
