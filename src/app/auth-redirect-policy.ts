import { ROUTES } from '@/sharedModules/navigation/routes';

export const HOME_ROUTE = ROUTES.home;
export const ONBOARDING_ROUTE = ROUTES.onboarding;
export const AUTH_SIGNUP_ROUTE = ROUTES.authSignup;

export type AuthRedirectPolicyInput = {
  hasInitializedAuth: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedPreAuthProfile: boolean;
  isAuthRoute: boolean;
  isOnboardingRoute: boolean;
  allowedUnauthenticated: boolean;
};

export function getRedirectRoute(input: AuthRedirectPolicyInput): string | null {
  if (!input.hasInitializedAuth) {
    return null;
  }

  if (!input.isAuthenticated) {
    if (input.allowedUnauthenticated) {
      return null;
    }
    return input.hasCompletedPreAuthProfile ? AUTH_SIGNUP_ROUTE : ONBOARDING_ROUTE;
  }

  if (input.isOnboardingRoute) {
    return HOME_ROUTE;
  }

  if (input.hasCompletedOnboarding && input.isAuthRoute) {
    return HOME_ROUTE;
  }

  return null;
}
