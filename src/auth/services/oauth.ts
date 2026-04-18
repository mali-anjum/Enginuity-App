import { oauthAuthService } from '@/auth/services/oauthAuthService';
import type { OAuthProviderKey } from '@/auth/services/oauthProviders';

export async function signInWithProvider(providerKey: OAuthProviderKey): Promise<void> {
  await oauthAuthService.signInWithProvider(providerKey);
}

export async function signInWithGoogle(): Promise<void> {
  await oauthAuthService.signInWithProvider('google');
}

export async function signInWithFacebook(): Promise<void> {
  await oauthAuthService.signInWithProvider('facebook');
}

export async function signInWithGitHub(): Promise<void> {
  await oauthAuthService.signInWithProvider('github');
}

export async function signInWithApple(): Promise<void> {
  await oauthAuthService.signInWithProvider('apple');
}

export async function signOut(): Promise<void> {
  await oauthAuthService.signOut();
}
