# App Flow Notes

## Root Composition

- App entry for routing is `src/app/_layout.tsx`.
- Providers are mounted in `src/store/Providers.tsx`.
- `AppProviders` wraps Redux `Provider`, `PersistGate`, auth sync, onboarding sync, offline reconciler, realtime sync, and global UI banners.

## Auth + Route Guard Behavior

- `RootNavigator` in `src/app/_layout.tsx` uses auth state plus current route segments to decide redirects.
- Redirect policy is centralized in `src/app/auth-redirect-policy.ts`.
- Policy outputs one of:
  - `null` (stay on current route)
  - `'/onboarding'`
  - `'/auth/signup'`
  - `'/'`

### Decision Matrix (High Level)

- If auth is not initialized: do not redirect yet.
- If user is unauthenticated:
  - Allow auth/onboarding routes.
  - Redirect all other routes to onboarding or signup based on `hasCompletedPreAuthProfile`.
- If user is authenticated:
  - Redirect away from onboarding to home.
  - Redirect away from auth screens to home once onboarding is complete.

## Why `router.replace` is used

- `router.replace` swaps the current history entry instead of pushing a new one.
- This avoids back-navigation loops (for example, user pressing Back and returning to a blocked route).

## Common White-Screen Causes on Web

- Runtime errors in browser console (not necessarily visible in Metro terminal logs).
- Route guard loops or invalid redirect conditions.
- Invalid icon mappings in web icon bridge (fixed once in `src/sharedModules/ui/atoms/icon-symbol.tsx` by adding missing route icon mapping and fallback).

## Test Coverage for Guard Logic

- Route guard unit tests should live outside `src/app` (for example, under feature `__tests__` folders).
- These tests should be updated whenever auth or onboarding redirect rules change.

## Route Folder Rule (Important)

- Keep `src/app` for Expo Router route files only (`_layout`, route screens, route groups).
- Do not place general services/utils/tests in `src/app`.
- If test files are placed in `src/app`, Expo Router can attempt to bundle them as routes on web, causing runtime errors such as `describe is not defined`.

