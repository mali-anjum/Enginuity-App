# Enginuity

**Enginuity** is a cross-platform ([Expo](https://expo.dev)) engineering workspace for students and researchers: organize **projects**, run **experiments**, manage a **hardware** library, take **notes** (with tags), **search** across entities, and sync profile and settings with **Supabase**. The app uses **Expo Router** (file-based routes under `src/app`), **Redux Toolkit** for client state, and **Supabase Auth** (email/password plus Google, Facebook, and GitHub OAuth).

This document describes how the repository is structured, how we work week to week, how quality gates fit together, and how releases roll out—so a new contributor can onboard without tribal knowledge.

---

## Feature overview (current app surface)

Routes and screens are declared under `src/app`; feature UI and domain logic live in named folders under `src/` (see [Source layout](#source-layout)).

| Area                 | What it provides                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auth**             | Login, signup, forgot/reset password, OAuth (Google / Facebook / GitHub), splash and callback handling. Session is synced with Supabase.   |
| **Onboarding**       | Discipline selection and welcome flow before the main app.                                                                                 |
| **Dashboard (Home)** | Project stats, filters, recent experiments, quick search overlay, FAB for quick create. Second tab is **Explore** (shared explore screen). |
| **Projects**         | List, create, detail, edit; links forward to experiments and notes where relevant.                                                         |
| **Experiments**      | List, create, detail, edit; hardware picker; CSV preview and attachment viewer flows.                                                      |
| **Hardware**         | Library list, add, detail, edit—reused when composing experiments.                                                                         |
| **Notes**            | List, create, detail, edit; tag browser; optional knowledge-style overview components live alongside notes.                                |
| **Search**           | Global search and results (client-side aggregation; database supports FTS-related migrations under `supabase/`).                           |
| **Profile**          | Overview, edit profile, avatar picker, account statistics.                                                                                 |
| **Settings**         | Appearance, notifications, storage & sync, account, about.                                                                                 |

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

### MVP (recommended now)

Use **one local file** so daily work stays simple:

1. `cp .env.example .env`
2. Paste your Supabase URL and anon key (**Project Settings → API**).
3. Run **`yarn start`**. Expo loads `.env` automatically—no extra scripts.

Committed templates: **`.env.example`** (canonical), **`.env.staging.example`** (optional, when you add a staging Supabase project).

### When you outgrow a single `.env`

Copy the same keys into **gitignored** files only when you need **different backends** at the same time (e.g. dev vs QA vs prod smoke-tests):

| File               | Yarn script          | Typical use                                                                                                                                                       |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.development` | `yarn start:dev`     | Team dev Supabase project                                                                                                                                         |
| `.env.staging`     | `yarn start:staging` | Pre-release QA (optional at MVP; add when you create a staging project)                                                                                           |
| `.env.production`  | `yarn start:prod`    | Local smoke-test against prod-like config only—**real releases should use [EAS secrets](https://docs.expo.dev/build-reference/variables/)**, not a committed file |

You can create `.env.development` by copying from `.env.example`—no separate template file is required, to avoid duplicated docs.

**Never commit** `.env`, `.env.development`, `.env.staging`, `.env.production`, or `*.local` overrides (see `.gitignore`). Only `*.example` files belong in Git.

---

## Scripts

| Script                                   | Description                                                    |
| ---------------------------------------- | -------------------------------------------------------------- |
| `yarn start`                             | Expo dev server (loads `.env` if present).                     |
| `yarn start:dev`                         | Expo with `.env.development` (requires that file).             |
| `yarn start:staging`                     | Expo with `.env.staging`.                                      |
| `yarn start:prod`                        | Expo with `.env.production` (local checks only).               |
| `yarn android` / `yarn ios` / `yarn web` | Same as `start`, then choose platform—or pass `--android` etc. |
| `yarn lint`                              | ESLint on `src/`, `App.tsx`, `index.ts`.                       |
| `yarn typecheck`                         | `tsc --noEmit`.                                                |

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
5. **Release readiness** — decide what ships in the next train (see [Release strategy and timeline](#release-strategy-day-based-timeline-qa-optimization-and-budget)).

This mirrors how large product teams structure time: predictable integration windows instead of random drops.

---

## Quality and testing

Quality is layered so issues are caught at the cheapest stage first.

| Stage                    | What we run                                                                                      | Goal                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Local (every change)** | `yarn lint`, `yarn typecheck`, manual exercise of touched flows on iOS/Android/web as applicable | Fast feedback; keep main healthy.                         |
| **PR review**            | Peer review + CI-friendly checks when wired                                                      | Catch logic and API misuse before merge.                  |
| **Integration**          | Supabase-backed flows on a shared dev project                                                    | Validate auth, RLS expectations, and migrations together. |
| **Pre-release**          | Exploratory testing on real devices; verify OAuth redirects and deep links                       | Reduce production surprises.                              |

Automated unit/UI tests are not yet wired to a full suite in-repo; Jest dependencies are present for when we add `*.test.ts(x)` and a Jest config. New features should favor small testable pure functions where possible.

---

## Release strategy, day-based timeline, QA, optimization, and budget

We aim for **predictable release trains**: small, frequent ships—similar in spirit to **release trains** (Google Chrome), **steady mobile rhythms** (large consumer apps), and **gated deployments** (Azure DevOps / enterprise release management)—scaled down for Expo and a small team.

### Where to read “how many days until the next release?”

- Set a **target ship date** (or “train departure”) at **kickoff** of each cycle and track it in **GitHub Milestones** / **Linear** / your board—this README keeps **default phase lengths in days** so the whole team shares one mental model.
- **Next update date** ≈ **kickoff date** + **sum of phase days below** + **buffer** + **store review time** (Apple/Google review is outside your control; often ~1–3 days after submission for updates, longer for new apps).
- When priorities change, **update the phase day counts** in planning and briefly note the change in the milestone description so budget and dates stay aligned.

### Default phase lengths (business days)

Use **business days** (Monday–Friday) for engineering estimates; use **calendar dates** when communicating ship targets externally.

| Phase | Days (recommended default) | What happens |
| ----- | -------------------------- | ------------ |
| **1 — Development & integration** | **10** | Scoped features on short-lived branches; merge to a release candidate line; `yarn lint` / `yarn typecheck`; dogfood against dev/staging Supabase. |
| **2 — QA, regression, bugfix** | **5** | QA (or rotating reviewers) runs checklists on real devices; bugs are filed → fixed → verified; loop until exit criteria are met. |
| **3 — Hardening & code optimization** | **3** | Performance-sensitive paths, bundle size, readability, Supabase usage review; **no new product features** unless release-blocking. |
| **4 — Release candidate, build, staged rollout** | **2** | EAS builds, internal / staged rollout %, crash and auth monitoring; optional **dependency freeze** on the release branch except security fixes. |
| **Buffer (risk, CI flakes, store resubmits)** | **2** | Keeps the train on rails when scope slips slightly or stores ask for metadata fixes. |
| **Typical minor release (sum)** | **22 business days** | About **4.5 calendar weeks**, excluding holidays—adjust per team size. |

**Illustrative timeline (not a promise—replace with your milestone dates):**

| Milestone | Approx. day offset (business days from kickoff) |
| --------- | ------------------------------------------------ |
| Kickoff / scope locked | 0 |
| Feature complete / merge to RC branch | 10 |
| QA exit (Sev1/Sev2 cleared or waived) | 15 |
| Optimization & final review complete | 18 |
| Builds submitted / phased rollout begins | 20–22 |

So: **after ~10 days** you aim to be **done adding features** for that train; **after ~15 days** QA has had a full pass and **critical bugs are addressed**; **after ~18 days** the codebase has had an **optimization / review pass**; **around days 20–22** the **release** goes out (plus store review).

### End-to-end flow (development → QA → optimization → release)

1. **Development window (days 1–10)** — Engineers implement the agreed backlog for this train. If work won’t fit, **cut scope** (“fixed time, flexible scope”) rather than silently slipping quality—same trade-off principle large orgs use in sprint planning.
2. **QA window (days 11–15)** — Treat the codebase as frozen for feature additions except release blockers; focus on finding defects and verifying fixes.
3. **Optimization & whole-code review (days 16–18)** — Reduce debt introduced during the sprint: perf, accessibility touchpoints, error handling, migration safety.
4. **Release (days 19–22)** — RC binaries, staged rollout, watch dashboards; **hotfix branch** only for severe production issues.

### Budget and how it updates when scope changes

- Track effort in **person-days** (engineering) and **QA-days** (testing). Example: **10 development days** per engineer on the train during phase 1 is a planning anchor—multiply by headcount for capacity.
- **More features than capacity** → increase phase 1–2 **days**, **move the ship date**, or **defer** work to the **next train**—document which option you chose in the milestone.
- **Fewer features** → shorten the cycle or invest spare capacity in reliability, tests, or docs.
- **Re-budget triggers**: new surfaces for QA (extra QA-days), heavy schema changes (extra migration review), new OAuth providers or stores (extra certification time). Revisit estimates when the backlog changes mid-cycle.

### Engineering hygiene (versioning, branching, changelog, build)

1. **Versioning** — Semantic versioning (`MAJOR.MINOR.PATCH`) aligned with `app.json` `expo.version`.
2. **Branching** — `main` stays releasable; feature branches merge via PR; optional `release/x.y` for hotfixes.
3. **Changelog** — `CHANGELOG.md` or GitHub Releases for user-visible changes each train.
4. **Build** — [EAS Build](https://docs.expo.dev/build/introduction/) with secrets for production; never commit production keys.
5. **Rollout** — Phased release in Play Console / App Store until metrics look stable.
6. **Cadence** — Prefer the **weekly engineering day** plus the **release train above**; emergency patches bypass the train only for severity.

---

## Roadmap and building stage

The codebase mixes **shipping-quality flows** (auth, navigation, core CRUD slices) with **ongoing expansion** (full multi-workspace collaboration, deeper offline/sync, richer analytics). Treat README feature lists as “what exists in tree today”; product priority is decided in planning, not here.

---

## Contributing

1. Fork / branch from `main`.
2. Install deps: `yarn`.
3. Copy `.env.example` to `.env` and add Supabase credentials.
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
