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

### Local development

1. `cp .env.example .env.local`
2. Paste your **development** Supabase URL and publishable / anon key (**Project Settings → API Keys**).
3. Run **`yarn start`** (or `yarn android` / `yarn ios` / `yarn web`). Scripts inject `.env.local` via `dotenv-cli` before Expo starts.

If you already have a `.env` from older setup, rename it to `.env.local` (`mv .env .env.local`) so scripts pick it up.

### Production Supabase (separate project)

Keep production credentials in **`.env.production`** (gitignored) for local smoke-tests only:

1. `cp .env.example .env.production`.
2. Paste your **production** project URL and key.
3. Run **`yarn start:prod`** when you need to point the dev client at prod (use sparingly).

**Release builds** should set `EXPO_PUBLIC_*` via **[EAS / CI secrets](https://docs.expo.dev/build-reference/variables/)**, not files in the repo.

### Optional extra environments

| File               | Yarn script          | Typical use                                                                                                                                                       |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.development` | `yarn start:dev`     | Alternate dev file if you prefer not to use `.env.local`                                                                                                                                         |
| `.env.staging`     | `yarn start:staging` | Pre-release QA (optional; add when you have a staging Supabase project)                                                                                           |

Committed template: **`.env.example`** only (copy it to `.env.local`, `.env.production`, or `.env.staging` as needed).

**Never commit** `.env.local`, `.env.production`, `.env.development`, `.env.staging`, or a legacy `.env` with real keys (see `.gitignore`). Only `*.example` files belong in Git.

---

## Scripts

| Script                                   | Description                                                    |
| ---------------------------------------- | -------------------------------------------------------------- |
| `yarn start`                             | Expo dev server (loads `.env.local`).                          |
| `yarn start:dev`                         | Expo with `.env.development`.                               |
| `yarn start:staging`                     | Expo with `.env.staging`.                                      |
| `yarn start:prod`                        | Expo with `.env.production` (local prod smoke-tests only).    |
| `yarn android` / `yarn ios` / `yarn web` | Expo for that platform (loads `.env.local`).                  |
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

**Default here: 9 business days end-to-end** (dev + QA + optimization + rollout). That matches a **focused sprint-like rhythm** common in strong product teams: short cycles, explicit gates, **smaller scope per train** instead of packing a month of work into one release.

### Where to read “how many days until the next release?”

- Set a **target ship date** (or “train departure”) at **kickoff** of each cycle and track it in **GitHub Milestones** / **Linear** / your board—this README keeps **default phase lengths in days** so the whole team shares one mental model.
- **Next update date** ≈ **kickoff date** + **9 business days** (default train below) + **store review time** (Apple/Google review is outside your control; often ~1–3 days after submission for updates, longer for new apps).
- When priorities change, **update the phase day counts** in planning and briefly note the change in the milestone description so budget and dates stay aligned.

### Default phase lengths (business days): **9-day train** (QA + optimization included)

We use a **single short train** so planning stays simple: **development, QA, hardening/optimization, and rollout all fit inside one cycle**—similar to how teams timebox a sprint and **stack** verification work after feature work, except here the numbers are explicit and **≤ 9 working days total** (not “9 days per calendar week”; a week has at most **5 business days** in most locales).

Use **business days** (Monday–Friday) for estimates; use **calendar dates** when communicating with stakeholders.

| Phase | Days | What happens |
| ----- | ---- | ------------ |
| **1 — Development & integration** | **5** | Scoped features on branches; merge toward a release candidate; `yarn lint` / `yarn typecheck`; dogfood on dev/staging Supabase. |
| **2 — QA + regression + bugfix** | **2** | Checklists on devices; bugs filed → fixed → verified; freeze features except release blockers. |
| **3 — Hardening & code optimization** | **1** | Perf hot spots, bundle sanity, readability, Supabase/query review—**no new features** unless blocking. |
| **4 — Release candidate, build, phased rollout** | **1** | EAS build, staged %, monitor crashes/auth. |
| **Typical minor release (sum)** | **9 business days** | About **2 calendar weeks** at one train at a time—**smaller scope per train** than a month-long cycle. |

**Optional tighter cycle (≤ 7 days)** when scope is tiny (doc fixes, single bugfix release): **3 dev + 2 QA + 1 optimization + 1 rollout**—only if you accept less soak time.

**Illustrative milestones (replace dates in your tracker):**

| Milestone | Day offset (business days from kickoff) |
| --------- | --------------------------------------- |
| Kickoff / scope locked | 0 |
| Feature complete / merged for QA | 5 |
| QA exit (critical bugs fixed or waived) | 7 |
| Optimization / review complete | 8 |
| Builds submitted / phased rollout starts | 9 |

So: **after ~5 days** stop adding features for this train (unless blocking); **days 6–7** are QA + fixes; **day 8** is optimization/review; **day 9** is ship—then **store review** follows separately.

### End-to-end flow (stacked inside the same 9 days)

1. **Days 1–5 — Development** — Deliver the smallest valuable slice that fits five days; if it won’t fit, **cut scope** (fixed time, flexible scope).
2. **Days 6–7 — QA + bugfixes** — QA and developers overlap on fixes; no scope expansion except blockers.
3. **Day 8 — Optimization & review** — Short, deliberate pass on performance and clarity introduced this train.
4. **Day 9 — Release** — RC, rollout, watch metrics; hotfix branch only for severe issues.

### Budget and how it updates when scope changes

- Budget in **person-days**: roughly **~5 engineer-days** of focused dev per engineer per train in phase 1 (adjust for headcount); QA is **part of the same 9 days**, not a separate multi-week line item.
- **Scope up** → **defer** to the **next 9-day train**, or **move the ship date**—do not silently compress QA to zero.
- **Need more QA** → either add **half a day** to phases 2–3 and **slip day 9** by one business day, or **shrink dev** to 4.5 days—document the tradeoff.
- **Re-budget triggers**: new user-facing surfaces, risky migrations, or new store capabilities—may require a **second train** or a one-off longer window.

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
3. Copy `.env.example` to `.env.local` and add Supabase credentials.
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
