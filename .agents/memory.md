# Memory — Design System Foundation + Password Visibility Toggle

Last updated: 2026-09-19

## What was built

- **Design tokens** (`src/common/constants/theme.ts`): added `Spacing` (xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32) and `Radii` (sm 8 · md 12 · lg 16 · xl 20 · full 999) scales.
- **Typography scale** (`src/common/atoms/themed-text.tsx`): expanded `ThemedText`'s `type` prop from 5 to 9 values — added `display`, `heading`, `caption`, `eyebrow` alongside the existing `default`, `defaultSemiBold`, `title`, `subtitle`, `link`. Purely additive; the 129/53/30/17 existing call sites for `defaultSemiBold`/`title`/`subtitle`/`link` were not touched.
- **Home screen hierarchy fix** (`src/dashboard/screens/home-screen.tsx`): `Projects`/`Activity feed` section headers switched to `heading` type; `My Projects`/`Shared with Me` subsection labels switched to `eyebrow` type (previously same visual weight as the project titles they grouped); project cards got a subtle shadow (elevated) while activity-feed cards stayed flat, establishing primary-vs-secondary visual weight; timestamps/"Open" link switched from inline `fontSize: 12` to `caption` type; all spacing/radius magic numbers replaced with `Spacing`/`Radii` tokens.
- **Password visibility toggle**: added `secureToggle` prop to the shared `AuthTextInput` (`src/auth/molecules/auth-text-input.tsx`) — renders an eye/eye-slash icon inside the field that toggles visibility. Wired into the login screen's password field (`src/auth/organisms/login-panel.tsx`) and the signup screen's password + confirm-password fields (`src/auth/screens/signup-email-screen.tsx`). Added `eye`/`eye.slash` → `visibility`/`visibility-off` mapping to `src/sharedModules/ui/atoms/icon-symbol.tsx`.
- **`.agents` skill data files**: created `.agents/ui-registry.md` (design-system baseline for `/imprint`/`/review` — actual current component patterns plus a "Known Deviations" section) and this file, `.agents/memory.md`. Root now has exactly one entry-point file, `CLAUDE.md`, which points to `docs/DEVELOPER_CONTEXT.md`, `docs/MODULE_STRUCTURE.md`, `docs/APP_FLOW_NOTES.md`, `docs/TESTING_STRATEGY.md`, `.agents/ui-registry.md`, and `.agents/memory.md`, plus how the six `.agents/skills/*` skills fit this repo. Both data files originally lived at project root and were consolidated under `.agents/` on request, to keep the root to a single entry file.

## Decisions made

- Token additions are additive-only — never redefine or repurpose an existing `ThemedText` type or token value, since dozens of screens depend on the current ones staying stable.
- Visual hierarchy convention: **elevated card = primary content, flat bordered card = secondary content**. Established on the Home screen; reuse this pairing on other screens instead of inventing a new one.
- `ui-registry.md` documents the codebase *as it actually is*, including inconsistencies, rather than an aspirational spec — deviations are listed and left alone unless the developer asks to reconcile them.
- `CLAUDE.md` is a pointer/index into the existing `docs/` folder (which was already thorough), not a duplicate of it — avoids two sources of truth drifting apart.
- Password visibility toggle lives once in the shared `AuthTextInput` molecule (`secureToggle` prop), not duplicated per screen.

## Problems solved

- Verified the shared `ThemedText`/`theme.ts` changes didn't break existing screens by screenshotting the onboarding flow before and after via headless Chrome — pixel-identical.
- Home screen itself sits behind Supabase auth, so it couldn't be screenshotted live without real credentials — verified via `tsc --noEmit` + `eslint` instead (both clean) rather than a live screenshot.

## Current state

- App runs via `yarn web` (Expo web, Metro on `localhost:8081`); confirmed working via headless-Chrome screenshots of onboarding, `/auth/login-email`, and `/auth/signup-email`.
- All changes typecheck clean (`npx tsc --noEmit`) and lint clean (`npx eslint`) as of this session.
- Nothing from this session has been committed to git yet — all edits are in the working tree (`git status` shows the files listed above as modified/untracked).

## Next session starts with

- Ask whether to extend the `Spacing`/`Radii`/typography-scale pattern beyond the Home screen to other screens (project, experiment, notes) — the developer previously scoped this session to "foundation + Home screen only."
- If touching `AppButton`, the badge/status-chip labels, `reset-password-screen.tsx`/`account-settings-screen.tsx`, or `ListEmptyState`, check `ui-registry.md`'s "Known Deviations" section first — those four inconsistencies were identified but deliberately not auto-fixed.

## Open questions

- Whether to commit the current working-tree changes (code edits + new `CLAUDE.md`/`ui-registry.md`/`memory.md`) — not yet asked/confirmed.
- Whether to apply `secureToggle` to `reset-password-screen.tsx` and `account-settings-screen.tsx` for consistency with login/signup (mentioned as a follow-up option, not yet requested).
