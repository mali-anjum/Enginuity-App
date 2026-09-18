# CLAUDE.md — Enginuity

Enginuity is an Expo/React Native app (`expo-router`, Redux Toolkit + persist,
Supabase backend) — a workspace for engineering students/hobbyists to track
projects, experiments, hardware, and notes.

**This is the single entry point.** It is the only Claude-facing file at the
project root — everything else Claude-specific lives under `.agents/`. This
file doesn't restate content that already lives elsewhere; it says where to
look, in what order, and where each `.agents` skill's data actually is, so
nothing drifts and nothing gets duplicated across two sources of truth.

## Read before writing any code

In order:

1. **[docs/DEVELOPER_CONTEXT.md](docs/DEVELOPER_CONTEXT.md)** — core architecture
   decisions, non-negotiable folder rules, module responsibility map, the
   debugging playbook, and the definition of done. Start here.
2. **[docs/MODULE_STRUCTURE.md](docs/MODULE_STRUCTURE.md)** — the required
   feature-folder blueprint and what each top-level `src/*` module owns.
3. **[docs/APP_FLOW_NOTES.md](docs/APP_FLOW_NOTES.md)** — root composition and
   the auth/onboarding redirect decision matrix.
4. **[docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md)** — where tests
   live, naming conventions, coverage priorities.
5. **[.agents/ui-registry.md](.agents/ui-registry.md)** — before touching
   *any* UI component. Actual design-token values and component patterns in
   use, plus known deviations not yet reconciled. Don't hand-write a font
   size, color hex, or pixel padding/radius that already has a token in
   `src/common/constants/theme.ts` — check the registry first.
6. **[.agents/memory.md](.agents/memory.md)** — if present, the state of the
   most recent session: what was built, decisions made, what's next.

Together, 1–4 are the architecture boundaries and design rules `/architect`
and `/review` mean by "context files" and "the system." Nothing in this file
repeats their content — if a rule needs updating, update it in the doc that
owns it, not here.

## Where `.agents` skill data lives (overrides each skill's own wording)

The skills in `.agents/skills/*` are vendored (pinned by hash in
`skills-lock.json` — don't edit them). Their own instructions say things like
"write to `ui-registry.md`" or "the project root" without knowing this repo
consolidates that data under `.agents/`. Treat this file as the authority on
actual location:

- `/imprint` reads and writes **`.agents/ui-registry.md`**, not a root-level
  copy.
- `/remember save` / `/remember restore` read and write
  **`.agents/memory.md`**, not a root-level copy.
- `/architect`, `/review`, and `/recover` don't own a persistent data file —
  they read the docs above and the current session's conversation.
- The `supabase` skill's own reference material stays where it shipped, under
  `.agents/skills/supabase/`.

If a future skill run creates a root-level `ui-registry.md` or `memory.md`
out of habit, that's drift — merge it into the `.agents/` copy and delete the
root one.

## How the skills fit together in this repo

- **`/architect`** — before building a non-trivial feature. Reads the docs
  above as "what already exists" before asking anything.
- **`/imprint`** — after building or changing any UI component. Updates
  `.agents/ui-registry.md`; resolve conflicts with existing entries rather
  than forking them. `/imprint audit` re-scans the whole codebase.
- **`/review`** — after finishing a feature. Checks the build against the
  `/architect` plan, then against the docs/registry above, then for
  production-readiness. Reports; doesn't fix.
- **`/recover`** — when something's gone wrong and it's unclear whether it's a
  normal bug, a polluted session, or a wrong foundational assumption.
- **`/remember save`** / **`/remember restore`** — session handoff, via
  `.agents/memory.md`.
- **`supabase` skill** — auto-triggers for anything touching Supabase
  (`src/sharedModules/services/supabase`, auth, RLS, migrations). Follow its
  security checklist; don't rely on training data for Supabase API shape.
