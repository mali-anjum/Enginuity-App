import React, { useEffect } from 'react';

import { supabase } from '@/services/supabase/supabaseClient';
import { authStateChanged } from '@/features/auth/state/authSlice';
import { useAppDispatch } from '@/state/hooks';

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

