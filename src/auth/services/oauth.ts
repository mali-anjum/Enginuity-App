import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/sharedModules/services/supabase/supabaseClient';

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

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
  if (result.type === 'cancel') {
    throw new Error('Google sign-in was cancelled. Please try again.');
  }

  if (result.type === 'dismiss') {
    throw new Error('Google sign-in was dismissed. Please try again.');
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
