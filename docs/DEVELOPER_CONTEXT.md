# Developer Context Handbook

This document is a fast context reference for day-to-day implementation, debugging, and review work.

## 1) Core Architecture Decisions

- **Routing:** Expo Router with file-based routes in `src/app`.
- **Feature logic:** Lives outside `src/app` inside feature modules (`auth`, `project`, `experiment`, etc.).
- **Global state:** Redux Toolkit + persist; providers initialized through `src/sharedModules/state/Providers.tsx`.
- **Backend:** Supabase client/services under `src/sharedModules/services/supabase`.
- **UI strategy:** Shared UI in `common`/`ui`; feature-specific UI in each module.

## 2) Non-Negotiable Folder Rules

- Keep **route files only** inside `src/app`.
- Keep tests, services, selectors, and business logic in feature folders (for example `src/auth/services`).
- Prefer feature-local organization from `docs/MODULE_STRUCTURE.md`.
- Keep reusable test helpers in `src/testing`; keep feature tests near the feature.

## 3) Current Module Responsibility Map

- `auth` - authentication, auth flows, redirect policy.
- `onboarding` - onboarding sequence and completion state.
- `project` - project CRUD and project state.
- `experiment` - experiment lifecycle, attachments, exports.
- `hardware` - hardware catalog and related flows.
- `notes` - note CRUD and tags.
- `search` - global cross-entity search.
- `profile` - profile details, avatar, stats.
- `settings` - user settings and sync preferences.
- `dashboard` - home-tab aggregate views and quick actions.
- `monetization` - upgrade/paywall/subscription-related logic.
- `sharedModules` - app-wide infra: store, providers, navigation constants, API clients.
- `common` / `ui` - shared atoms, molecules, themes, cross-feature UI patterns.

## 4) High-Value Debugging Playbook

### A) Web white screen / Expo Router issues

1. Check Metro output for route loading errors.
2. Confirm no `*.test.*`, service files, or utilities exist in `src/app`.
3. Verify route files have valid default exports when required.
4. Restart Metro after structural changes (`Ctrl+C` then `yarn start`).

### B) Native-only package crashing web

1. Avoid top-level imports for native-only libraries in shared files.
2. Add platform guards (`Platform.OS`) for unsupported platforms.
3. Use lazy/dynamic imports in function scope where needed.

### C) TypeScript mismatch after dependency changes

1. Run `yarn typecheck`.
2. If Expo warns about package compatibility, run `npx expo install <pkg>`.
3. Re-run `yarn typecheck` and verify the target error is gone.

## 5) Command Checklist Before Finalizing Work

- `yarn lint` (or at least lint changed files through IDE diagnostics).
- `yarn typecheck` (note unrelated pre-existing failures if present).
- Run/refresh the relevant platform (`yarn start`, web or native flow).
- Confirm no route misuse under `src/app`.
- Update docs when architecture/rules changed.

## 6) Definition of Done for Typical Tasks

- Fix is implemented in the correct module location.
- Relevant runtime issue is reproduced then no longer reproduced.
- No new lint problems introduced in edited files.
- Type-level impact checked.
- User-facing explanation includes root cause + fix + verification status.

## 7) Related Docs

- `README.md` - full project setup, scripts, and release process.
- `docs/MODULE_STRUCTURE.md` - module/folder standards.
- `docs/TESTING_STRATEGY.md` - where tests live and priority matrix.
- `docs/APP_FLOW_NOTES.md` - routing/auth guard flow details.
