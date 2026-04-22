import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import type { OAuthProviderConfig, OAuthProviderKey } from '@/auth/services/oauthProviders';
import { OAUTH_PROVIDER_CONFIG } from '@/auth/services/oauthProviders';
import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

const CALLBACK_PATH = '/auth/callback';
const RESET_PASSWORD_PATH = '/auth/reset-password';

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

  private getResetPasswordRedirectUrl(): string {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}${RESET_PASSWORD_PATH}`;
    }
    return Linking.createURL(RESET_PASSWORD_PATH);
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

  async signInWithPassword(email: string, password: string): Promise<void> {
    const { error } = await withSupabaseClient((client) =>
      client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async signUpWithPassword(params: {
    email: string;
    password: string;
    name: string;
    discipline?: string | null;
  }): Promise<void> {
    const email = params.email.trim().toLowerCase();
    const name = params.name.trim();

    const { data, error } = await withSupabaseClient((client) =>
      client.auth.signUp({
        email,
        password: params.password,
        options: {
          emailRedirectTo: this.getRedirectUrl(),
          data: {
            full_name: name,
            discipline: params.discipline ?? null,
          },
        },
      }),
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Signup did not return a user object.');
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await withSupabaseClient((client) =>
      client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: this.getResetPasswordRedirectUrl(),
      }),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await withSupabaseClient((client) =>
      client.auth.updateUser({
        password: newPassword,
      }),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await withSupabaseClient((client) => client.auth.signOut());
    if (error) {
      throw new Error(error.message);
    }
  }

  async deactivateAccount(userId: string): Promise<void> {
    const { error } = await withSupabaseClient(async (client) => {
      return await client
        .from('users')
        .update({ is_active: false } as never)
        .eq('id', userId);
    });
    if (error) {
      throw new Error(error.message);
    }
    await this.signOut();
  }
}

export const oauthAuthService = new OAuthAuthService();
