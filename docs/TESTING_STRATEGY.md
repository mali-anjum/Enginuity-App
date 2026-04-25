# Testing Strategy

## Decision: Where tests should live

Use **module-local tests**.

- Put tests inside each feature module under `__tests__/`.
- Avoid a single global `__tests__` folder for the entire app.
- Keep `src/testing/` for shared test utilities only (mocks, stubs, factories, helpers).

This keeps ownership clear and makes onboarding easier because each module contains its logic and tests together.

## Expo Router safety rule

- Do **not** place test files inside `src/app`.
- `src/app` is route-scanned by Expo Router; test files there can be treated as runtime modules.
- Symptom example: `describe is not defined` in Metro/web bundle.
- Correct approach: keep tests in feature folders (for example `src/auth/services/*.test.ts`) or module `__tests__/`.

## Naming convention

- Preferred: `*.test.ts` and `*.test.tsx`
- Also allowed: `*.spec.ts` and `*.spec.tsx`
- In this repo (TypeScript-first), avoid `.spec.js` for normal module tests.

## Suggested test layering per module

- `state/` tests: reducers, selectors, thunks
- `services/` tests: API/client integration boundaries with mocks
- `screens/` tests: rendering and user-flow integration behavior
- `utils/` tests: pure function and edge-case coverage

## Coverage priorities

1. Critical flows (auth guard, navigation redirects, payments, data write paths)
2. State transitions (slice reducers/thunks)
3. Service contracts (error mapping, response parsing)
4. High-traffic screens

## Folder skeleton adopted in this repo

Module-level folders were created for:

- `auth`, `dashboard`, `experiment`, `hardware`, `notes`, `onboarding`, `profile`, `project`, `search`, `settings`, `sharedModules`, `common`, `monetization`, `app`

Each module now includes `__tests__/` and concern-based subfolders (such as `services`, `state`, `screens`).
