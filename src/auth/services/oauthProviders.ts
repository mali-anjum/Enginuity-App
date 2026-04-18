import type { Provider } from '@supabase/supabase-js';

export type OAuthProviderKey = 'google' | 'facebook' | 'github' | 'apple';

export type OAuthProviderConfig = {
  key: OAuthProviderKey;
  provider: Provider;
  label: string;
  loadingLabel: string;
  errorFallbackMessage: string;
  scopes?: string;
};

export const OAUTH_PROVIDER_CONFIG: Record<OAuthProviderKey, OAuthProviderConfig> = {
  google: {
    key: 'google',
    provider: 'google',
    label: 'Continue with Google',
    loadingLabel: 'Opening Google…',
    errorFallbackMessage: 'Google sign-in failed. Please try again.',
    scopes: 'openid profile email',
  },
  facebook: {
    key: 'facebook',
    provider: 'facebook',
    label: 'Continue with Facebook',
    loadingLabel: 'Opening Facebook…',
    errorFallbackMessage: 'Facebook sign-in failed. Please try again.',
    scopes: 'email public_profile',
  },
  github: {
    key: 'github',
    provider: 'github',
    label: 'Continue with GitHub',
    loadingLabel: 'Opening GitHub…',
    errorFallbackMessage: 'GitHub sign-in failed. Please try again.',
    scopes: 'read:user user:email',
  },
  apple: {
    key: 'apple',
    provider: 'apple',
    label: 'Continue with Apple',
    loadingLabel: 'Opening Apple…',
    errorFallbackMessage: 'Apple sign-in failed. Please try again.',
    scopes: 'name email',
  },
};
