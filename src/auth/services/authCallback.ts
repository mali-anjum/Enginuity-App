import { oauthAuthService } from '@/auth/services/oauthAuthService';

export async function exchangeOAuthCodeForSession(authCode: string): Promise<void> {
  await oauthAuthService.exchangeOAuthCodeForSession(authCode);
}
