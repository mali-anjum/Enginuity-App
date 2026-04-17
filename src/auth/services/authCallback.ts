import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

export async function exchangeOAuthCodeForSession(authCode: string): Promise<void> {
  const { data, error } = await withSupabaseClient((client) =>
    client.auth.exchangeCodeForSession(authCode),
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.session) {
    throw new Error('OAuth exchange did not return a session.');
  }
}
