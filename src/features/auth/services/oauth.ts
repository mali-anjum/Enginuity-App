import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { supabase } from '@/services/supabase/supabaseClient';

const CALLBACK_PATH = '/auth/callback';

export function getOAuthRedirectUrl(): string {
  // Uses the `scheme` from `app.json`, e.g. `enginuity://auth/callback`.
  return Linking.createURL(CALLBACK_PATH);
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = getOAuthRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      // We open the auth session ourselves (React Native has no `window.location`).
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

