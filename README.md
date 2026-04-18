# Enginuity

**Enginuity** is a cross-platform ([Expo](https://expo.dev)) engineering workspace for students and researchers: organize **projects**, run **experiments**, manage a **hardware** library, take **notes** (with tags), **search** across entities, and sync profile and settings with **Supabase**. The app uses **Expo Router** (file-based routes under `src/app`), **Redux Toolkit** for client state, and **Supabase Auth** (email/password plus Google, Facebook, and GitHub OAuth).

This document describes how the repository is structured, how we work week to week, how quality gates fit together, and how releases roll out—so a new contributor can onboard without tribal knowledge.

---

## Feature overview (current app surface)

Routes and screens are declared under `src/app`; feature UI and domain logic live in named folders under `src/` (see [Source layout](#source-layout)).

| Area | What it provides |
|------|------------------|
| **Auth** | Login, signup, forgot/reset password, OAuth (Google / Facebook / GitHub), splash and callback handling. Session is synced with Supabase. |
| **Onboarding** | Discipline selection and welcome flow before the main app. |
| **Dashboard (Home)** | Project stats, filters, recent experiments, quick search overlay, FAB for quick create. Second tab is **Explore** (shared explore screen). |
| **Projects** | List, create, detail, edit; links forward to experiments and notes where relevant. |
| **Experiments** | List, create, detail, edit; hardware picker; CSV preview and attachment viewer flows. |
| **Hardware** | Library list, add, detail, edit—reused when composing experiments. |
| **Notes** | List, create, detail, edit; tag browser; optional knowledge-style overview components live alongside notes. |
| **Search** | Global search and results (client-side aggregation; database supports FTS-related migrations under `supabase/`). |
| **Profile** | Overview, edit profile, avatar picker, account statistics. |
| **Settings** | Appearance, notifications, storage & sync, account, about. |

Backend shape and enums are defined in SQL migrations under `supabase/migrations/` (projects, workspaces, hardware, experiments, notes, profiles, user settings, search helpers, etc.). Generated types for the client are in `src/sharedModules/services/supabase/database.types.ts`.

---

## Tech stack

- **Runtime:** React 19, React Native 0.81, Expo SDK ~54  
- **Navigation:** Expo Router 6 (`src/app`), stack + tabs  
- **State:** Redux Toolkit, redux-persist (auth, onboarding, UI theme)  
- **Backend:** Supabase (`@supabase/supabase-js`)  
- **Forms / validation:** react-hook-form, zod  
- **Tooling:** TypeScript (strict), ESLint (`eslint-config-expo`), Jest/ts-jest listed for future tests  

---

## Prerequisites

- **Node.js** (LTS recommended) and **Yarn** (Classic v1 per `package.json` `packageManager`)  
- **Expo CLI** via `npx` (no global install required)  
- A **Supabase** project (URL + anon key) for auth and data  

---

## Environment variables

Public client configuration is read in `src/sharedModules/utils/env.ts`. Supported keys include **`EXPO_PUBLIC_SUPABASE_URL`** and **`EXPO_PUBLIC_SUPABASE_ANON_KEY`** (with fallbacks for alternate naming conventions used by other tooling).

### Setup

1. Copy the template for the environment you need:

   ```bash
   cp .env.development.example .env.development
   cp .env.production.example .env.production
   ```

2. Replace placeholders with values from the Supabase dashboard (**Project Settings → API**).

3. Start Metro with the file you want loaded:

   | Command | Purpose |
   |---------|---------|
   | `yarn start` | Default Expo start (Expo also loads a root `.env` when present). |
   | `yarn start:dev` | Loads **`.env.development`** explicitly. |
   | `yarn start:prod` | Loads **`.env.production`** (e.g. smoke-testing against prod backend—use carefully). |

   Platform shortcuts: `yarn android:dev`, `yarn ios:dev`, `yarn web:dev` run Expo with `.env.development`.

**Never commit** `.env`, `.env.development`, `.env.production`, or `*.local` overrides—these paths are listed in `.gitignore`. Only the `*.example` files belong in Git.

For **EAS Build / CI**, prefer injecting `EXPO_PUBLIC_*` via [EAS secrets](https://docs.expo.dev/build-reference/variables/) or your CI provider rather than checking in production keys.

---

## Scripts

| Script | Description |
|--------|-------------|
| `yarn start` | Start Expo dev server. |
| `yarn start:dev` / `yarn start:prod` | Start with explicit env file (see above). |
| `yarn android`, `yarn ios`, `yarn web` | Start targeting a platform. |
| `yarn android:dev`, `yarn ios:dev`, `yarn web:dev` | Same with `.env.development`. |
| `yarn lint` | ESLint on `src/`, `App.tsx`, `index.ts`. |
| `yarn typecheck` | `tsc --noEmit` (project-wide typecheck). |

---

## Source layout

High-level map of `src/`:

```
src/
├── app/                 # Expo Router routes (screens composed from feature modules)
├── auth/                # Auth UI, OAuth services, auth Redux slice
├── common/              # Shared atoms, theme, hooks, small molecules
├── dashboard/           # Home tab, FAB/sheets, workspace-style placeholders
├── experiment/          # Experiments domain (slice, screens, forms, CSV/attachments)
├── hardware/            # Hardware library domain
├── notes/               # Notes domain, tags, knowledge-style UI pieces
├── onboarding/          # Onboarding flow and slice
├── profile/             # Profile and statistics
├── project/             # Projects domain
├── search/              # Global search UI and Supabase search helper usage
├── settings/            # Settings screens and user-settings services
├── sharedModules/       # Store, providers, Supabase client, navigation helpers, env utils
└── ui/                  # Cross-cutting UI state (e.g. theme-related slice)
```

- **`App.tsx`** wires `expo-router` with `require.context('./src/app')`.  
- **`index.ts`** registers the root component.  
- **Supabase** client initialization: `sharedModules/services/supabase/supabaseClient.ts`.  

---

## Database and migrations

SQL migrations live in `supabase/migrations/`. Apply them to your Supabase project (CLI or SQL editor) so the client matches the schema. `supabase/seed.sql` can seed reference data when needed.

---

## How we work: weekly engineering day and cadence

We reserve a **fixed day each week** for focused work. That day is not only for writing code—it is for the whole delivery loop:

1. **Implement** — features and fixes merged via short-lived branches and reviewed PRs.  
2. **Understand** — read diffs, align on architecture decisions, document tradeoffs in PR descriptions.  
3. **Optimize** — performance, bundle size, redundant renders, and Supabase query patterns where it matters.  
4. **Test** — see [Quality and testing](#quality-and-testing).  
5. **Release readiness** — decide what ships in the next train (see [Release strategy](#release-strategy)).

This mirrors how large product teams structure time: predictable integration windows instead of random drops.

---

## Quality and testing

Quality is layered so issues are caught at the cheapest stage first.

| Stage | What we run | Goal |
|-------|-------------|------|
| **Local (every change)** | `yarn lint`, `yarn typecheck`, manual exercise of touched flows on iOS/Android/web as applicable | Fast feedback; keep main healthy. |
| **PR review** | Peer review + CI-friendly checks when wired | Catch logic and API misuse before merge. |
| **Integration** | Supabase-backed flows on a shared dev project | Validate auth, RLS expectations, and migrations together. |
| **Pre-release** | Exploratory testing on real devices; verify OAuth redirects and deep links | Reduce production surprises. |

Automated unit/UI tests are not yet wired to a full suite in-repo; Jest dependencies are present for when we add `*.test.ts(x)` and a Jest config. New features should favor small testable pure functions where possible.

---

## Release strategy

We aim for **periodic, boring releases**: small increments on a steady cadence—similar in spirit to **release trains** (Chrome), **regular mobile release rhythms** (Meta/Google-style app updates), and **managed rollout** practices (Microsoft/Azure DevOps-style gated deployments)—adapted to a small team and Expo.

Suggested practice:

1. **Versioning** — Semantic versioning (`MAJOR.MINOR.PATCH`) aligned with `app.json` `expo.version`.  
2. **Branching** — `main` stays releasable; feature branches merge via PR; optional `release/x.y` branches if you need hotfixes.  
3. **Changelog** — Maintain `CHANGELOG.md` or GitHub Releases with user-visible changes (add when you cut releases).  
4. **Build** — Use [EAS Build](https://docs.expo.dev/build/introduction/) with env vars from secrets, not committed `.env.production`.  
5. **Rollout** — Use store **staged rollout** (Play Console / App Store phased release) or internal tracks first; expand percentage as confidence grows.  
6. **Cadence** — Ship on the weekly rhythm after the engineering-day validation gate; emergency patches bypass the schedule only for severity.

---

## Roadmap and building stage

The codebase mixes **shipping-quality flows** (auth, navigation, core CRUD slices) with **ongoing expansion** (full multi-workspace collaboration, deeper offline/sync, richer analytics). Treat README feature lists as “what exists in tree today”; product priority is decided in planning, not here.

---

## Contributing

1. Fork / branch from `main`.  
2. Install deps: `yarn`.  
3. Configure `.env.development` from `.env.development.example`.  
4. Run `yarn lint` and `yarn typecheck` before pushing.  
5. Open a PR with a clear description and screenshots for UI changes.

---

## Learn more

- [Expo documentation](https://docs.expo.dev/)  
- [Expo Router](https://docs.expo.dev/router/introduction/)  
- [Supabase](https://supabase.com/docs)  

---

## License / legal

Private project (`"private": true` in `package.json`). Adjust this section when you publish or open-source.
