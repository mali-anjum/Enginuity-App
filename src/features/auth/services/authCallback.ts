import { supabase } from '@/services/supabase/supabaseClient';

export async function exchangeOAuthCodeForSession(authCode: string): Promise<void> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.session) {
    // For safety: Supabase should still set session on success.
    throw new Error('OAuth exchange did not return a session.');
  }
}

