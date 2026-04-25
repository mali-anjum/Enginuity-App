# Module Structure Standard

This document defines the module structure we follow in this project.

## Feature Folder Blueprint (Required)

Each feature module should follow this layout where relevant:

```text
[module]/
├── actions/        – Redux action creators, thunks
├── reducers/       – Legacy Redux reducers (if used)
├── slices/         – Redux Toolkit slices
├── selectors/      – Memoized state selectors
├── route/          – Feature stack/router config
├── screens/        – Route-level screen components
├── components/     – Feature-specific container components
├── atoms/          – Basic UI elements for this feature
├── molecules/      – Composed components
├── organisms/      – Complex components
├── utilities/      – Helper functions
├── services/       – API/external integrations
├── interfaces/     – TypeScript types/interfaces
├── constants/      – Module-specific constants
└── hooks/          – Custom hooks
└── __tests__/      – Module test files (unit/integration)
```

Notes:
- A module does not need all folders on day one.
- Create folders only when the feature actually needs them.
- Prefer `slices/` over `reducers/` for new Redux state.

## Current Modules in This App and Their Responsibilities

- `app/` – Expo Router entrypoints and route layout composition.
- `auth/` – Authentication flow, auth screens, auth state, auth services.
- `common/` – Shared presentation layer (UI primitives/organisms), theme helpers, cross-feature hooks/constants.
- `dashboard/` – Dashboard-specific screens/state and dashboard domain logic.
- `experiment/` – Experiment CRUD, experiment attachments, experiment export/services, experiment state.
- `hardware/` – Hardware inventory feature: screens, state, and supporting services.
- `monetization/` – Upgrade/paywall/subscription-related app logic and UI.
- `notes/` – Notes feature state, screens, and note domain services.
- `onboarding/` – Onboarding flow screens, selectors, and completion logic.
- `profile/` – User profile screens/state/services (avatar, stats, profile details).
- `project/` – Project management feature: project list/detail/edit state and services.
- `search/` – Cross-feature/global search experience.
- `settings/` – App settings screens/state/services (notifications, sync, preferences).
- `sharedModules/` – App-wide shared infrastructure (navigation helpers, sync/client integrations, cross-feature utilities).
- `store/` – Redux setup module (configureStore, persist, middleware registry, typed hooks, provider wiring).
- `testing/` – Shared test utilities and test support helpers.
- `types/` – Cross-feature/global TypeScript types.
- `ui/` – App-wide UI system pieces not scoped to a single feature.

## Alignment With Your Cross-Project Naming

These are equivalent or closest mappings:

- `common` -> `common`
- `profile` -> `profile`
- `onboarding` -> `onboarding`
- `auth` -> `auth`
- `sharedModules` -> `sharedModules`
- `store` (other project) -> now represented by top-level `src/store` in this app
- `paywall/subscription/shop` (other project) -> currently grouped under `monetization` in this app
- `resources` (other project) -> mostly covered by root `assets/` and style/theme files in shared/common areas

## Structure Rule Going Forward

- Keep route files only in `src/app`.
- Keep feature logic/tests outside `src/app` inside feature modules.
- Use the blueprint above as the default for all new modules and refactors.

## Testing Standard (Required)

- Prefer **module-local tests** (inside each feature folder), not one giant root test folder.
- Use `__tests__/` inside each module and group by concern (for example `services`, `state`, `screens`, `utils`).
- Naming:
  - Preferred: `*.test.ts` / `*.test.tsx`
  - Also supported by config: `*.spec.ts` / `*.spec.tsx`
- For this TypeScript codebase, use `.ts` / `.tsx` test extensions (avoid `.spec.js` unless testing JS-only files).
- Keep `src/testing/` only for shared test helpers/stubs and reusable fixtures.
