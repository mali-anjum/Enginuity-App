import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { supabase } from '@/shared/services/supabase/supabaseClient';

const CALLBACK_PATH = '/auth/callback';

export function getOAuthRedirectUrl(): string {
  return Linking.createURL(CALLBACK_PATH);
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = getOAuthRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const authUrl = data?.url;
  if (!authUrl) {
    throw new Error('Missing OAuth URL from Supabase.');
  }

  await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
}
