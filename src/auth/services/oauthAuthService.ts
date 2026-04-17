import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import type { OAuthProviderConfig, OAuthProviderKey } from '@/auth/services/oauthProviders';
import { OAUTH_PROVIDER_CONFIG } from '@/auth/services/oauthProviders';
import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

const CALLBACK_PATH = '/auth/callback';

type OAuthStartResult = {
  authUrl: string;
  redirectTo: string;
  providerConfig: OAuthProviderConfig;
  isWeb: boolean;
};

class OAuthAuthService {
  private getRedirectUrl(): string {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}${CALLBACK_PATH}`;
    }
    return Linking.createURL(CALLBACK_PATH);
  }

  private getProviderConfig(providerKey: OAuthProviderKey): OAuthProviderConfig {
    const config = OAUTH_PROVIDER_CONFIG[providerKey];
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${providerKey}`);
    }
    return config;
  }

  private async startOAuth(providerKey: OAuthProviderKey): Promise<OAuthStartResult> {
    const providerConfig = this.getProviderConfig(providerKey);
    const redirectTo = this.getRedirectUrl();
    const isWeb = Platform.OS === 'web';

    const { data, error } = await withSupabaseClient((client) =>
      client.auth.signInWithOAuth({
        provider: providerConfig.provider,
        options: {
          redirectTo,
          skipBrowserRedirect: !isWeb,
          scopes: providerConfig.scopes,
        },
      }),
    );

    if (error) {
      throw new Error(error.message);
    }

    const authUrl = data?.url;
    if (!authUrl) {
      throw new Error(`Missing OAuth URL from Supabase for ${providerConfig.label}.`);
    }

    if (__DEV__) {
      const parsedAuthUrl = new URL(authUrl);
      const supabaseRedirectTarget = parsedAuthUrl.searchParams.get('redirect_to');
      console.log('[OAuth Debug] provider:', providerConfig.provider);
      console.log('[OAuth Debug] platform:', Platform.OS);
      console.log('[OAuth Debug] app redirectTo:', redirectTo);
      console.log('[OAuth Debug] supabase redirect_to param:', supabaseRedirectTarget);
    }

    return { authUrl, redirectTo, providerConfig, isWeb };
  }

  private async ensureSessionAfterInterrupt(providerLabel: string): Promise<void> {
    const { data, error } = await withSupabaseClient((client) => client.auth.getSession());
    if (error) {
      throw new Error(error.message);
    }
    if (!data.session) {
      throw new Error(`${providerLabel} sign-in was interrupted. Please try again.`);
    }
  }

  async signInWithProvider(providerKey: OAuthProviderKey): Promise<void> {
    const { authUrl, redirectTo, providerConfig, isWeb } = await this.startOAuth(providerKey);
    if (isWeb) {
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
    if (result.type === 'success') {
      return;
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      await this.ensureSessionAfterInterrupt(providerConfig.label);
      return;
    }

    throw new Error(`${providerConfig.label} sign-in did not complete. Please try again.`);
  }

  async exchangeOAuthCodeForSession(authCode: string): Promise<void> {
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

  async signOut(): Promise<void> {
    const { error } = await withSupabaseClient((client) => client.auth.signOut());
    if (error) {
      throw new Error(error.message);
    }
  }
}

export const oauthAuthService = new OAuthAuthService();
