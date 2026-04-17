import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Provider } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { supabase } from '@/sharedModules/services/supabase/supabaseClient';

const CALLBACK_PATH = '/auth/callback';

export function getOAuthRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${CALLBACK_PATH}`;
  }
  return Linking.createURL(CALLBACK_PATH);
}

async function signInWithProvider(provider: Provider): Promise<void> {
  const redirectTo = getOAuthRedirectUrl();
  const isWeb = Platform.OS === 'web';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: !isWeb,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const authUrl = data?.url;
  if (!authUrl) {
    throw new Error('Missing OAuth URL from Supabase.');
  }

  if (isWeb) {
    // Web uses browser redirect flow; Supabase handles the navigation.
    return;
  }

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
  if (result.type === 'cancel') {
    throw new Error('Sign-in was cancelled. Please try again.');
  }

  if (result.type === 'dismiss') {
    throw new Error('Sign-in was dismissed. Please try again.');
  }
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithProvider('google');
}

export async function signInWithGitHub(): Promise<void> {
  await signInWithProvider('github');
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
