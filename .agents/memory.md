# Memory — App-Wide Notion-Style Repaint + Test Infrastructure

Last updated: 2026-09-19

## What was built

- **Repalette** (`src/common/constants/theme.ts`): replaced the three-hue
  palette (teal `primary` / blue `accent` / indigo `heroTint`) with a
  monochrome-first, Notion-inspired one — warm neutral grays/near-black text,
  a single blue accent hue reused across `primary`/`accent`/`tint`/
  `tabIconSelected`/`heroTint`/`accentSoft`/`accentBorder`/`heroPrimary`.
  `danger`/`success` kept as separate functional colors. Token **key names
  unchanged** (only values changed) — safe because `heroTint` alone had 50+
  call sites across nearly every module; a rename would have been a much
  larger, riskier change than a value swap. Dropped the confirmed-dead
  `heroSecondary` key and unused `violet500`/`violet600` brand constants.
- **`ScreenContainer`** (`src/common/molecules/screen-container.tsx`, new):
  wraps `ThemedView`, adds a centered `maxWidth` (default 720) on web only —
  the single fix for "content stretches full-bleed on desktop," since no
  screen previously had any width/responsive handling. All 49 screens'
  root containers migrated from `ThemedView` to this (mechanical swap, same
  `style` prop; nested `ThemedView`s inside screens were left alone).
- **Long-tail token sweep**: ~13 files with raw `fontSize:`/hardcoded-pixel
  drift moved onto `ThemedText` types (mostly `caption`) or `Spacing`/`Radii`
  tokens; 5 auth screens that predated the token system entirely
  (`forgot-password-screen.tsx`, `signup-email-screen.tsx`,
  `auth-splash-screen.tsx`, `reset-password-screen.tsx`,
  `oauth-callback-screen.tsx`) migrated onto `ThemedView`/`ThemedText`/
  `AppButton`. `onboarding-intro-screen.tsx`'s hand-rolled primary/secondary
  buttons (radius `14`, same legacy number as old `AppButton`) replaced with
  `AppButton` itself; its hand-rolled `heroEyebrow` style replaced with the
  existing `eyebrow` `ThemedText` type.
- **Elevated Card convention extended**: `project-list-screen.tsx`,
  `hardware-list-screen.tsx`, `notes-list-screen.tsx`,
  `experiment-list-screen.tsx` primary list-item cards now use the same
  radius/shadow treatment as Home's project cards (previously flat/bordered
  only — see `.agents/ui-registry.md` for the exact values).
- **Three known deviations resolved** (see `ui-registry.md`): `AppButton`
  radius snapped to `Radii.lg`; `reset-password-screen.tsx` +
  `account-settings-screen.tsx` migrated to `AuthTextInput`'s `secureToggle`;
  `ListEmptyState` radius snapped to `Radii.md`.
- **Bug fixes found along the way**: `IconSymbol`'s mapping was missing
  `cpu.fill`/`doc.text.fill`/`flask.fill`/`folder.badge.plus` — empty-state
  icons on Hardware/Notes/Experiment/Project list screens were silently
  rendering a generic fallback icon. Fixed the mapping and tightened
  `ListEmptyState`'s `icon` prop from `string` to `IconSymbolName` so this
  class of bug fails at compile time now. `GoogleSignInButton` also had a
  `Colors.light.background`-regardless-of-scheme hack for its label color;
  switched to the `buttonPrimaryText` token.
- **Dead code removed**: two screens were fully unrouted (`grep`-confirmed no
  `src/app` route imports them) and still had unedited Expo-scaffold
  placeholder text — deleted along with their now-orphaned organisms/
  molecules: `dashboard/screens/workspace-home-screen.tsx` (+
  `workspace-overview.tsx`, `feature-list.tsx`) and
  `notes/screens/knowledge-home-screen.tsx` (+ `knowledge-overview.tsx`,
  `tag-row.tsx`).
- **`Explore` tab rebuilt**: it *was* live in the bottom tab bar
  (Home/Explore/Notes) but was still 100% Expo starter-template content. Per
  developer decision (asked directly, not assumed), rebuilt
  `common/screens/explore-screen.tsx` as a real cross-entity discovery hub:
  project quick-stats, hardware-by-category breakdown, browse-notes-by-tag —
  reusing existing selectors (`selectProjectStats`, `selectAllHardware`,
  `selectTagCounts`), no new Redux state.
- **Test infrastructure added from scratch**: the app had zero ability to
  render-test screens before this session (`jest.config.js` used
  `testEnvironment: 'node'` + `ts-jest`, no RN preset, no
  `@testing-library/react-native`). Added `jest-expo` preset, `babel.config.js`
  (`babel-preset-expo` — didn't exist before either; Jest needs it explicitly
  even though Metro doesn't), `@testing-library/react-native` +
  `test-renderer` (a real npm package RNTL 14.x requires as a peer — easy to
  miss). Extended `transformIgnorePatterns` to cover `immer`/`redux-persist`/
  `@reduxjs/toolkit`/`react-redux` (all ship ESM builds Jest can't parse
  untransformed). Mocked `@react-native-async-storage/async-storage` (official
  jest mock) and `react-native-webview` (no official mock; wrote a trivial
  `<View>` stand-in at `src/testing/mocks/react-native-webview.tsx`).
  `expo-router` is mocked once, globally, in `src/testing/jest.setup.ts`
  (`useRouter`/`useLocalSearchParams`/`useSegments`/`Link`/`Stack`/`Tabs`) —
  registered via `setupFiles` so it's in place before any screen module
  requires it.
- **`src/testing/renderWithProviders.tsx`** (new): shared helper — real
  `configureStore` with the app's plain (non-persisted) reducers +
  `Provider`, wraps `@testing-library/react-native`'s `render`. Note RNTL
  14.x's `render` is `async` (breaking change from older versions) — the
  helper and every call site `await` it.
- **One smoke-render test per screen**, all 47 live screens (49 minus the 2
  deleted dead ones), each in its module's `__tests__/screens/` folder:
  renders via `renderWithProviders`, asserts a heading/label is present (or
  the documented not-found state for detail/edit screens hit with no route
  param, e.g. "Project not found."). Not behavior/interaction coverage —
  that's a different, larger effort; this is the "proof it renders under the
  new tokens without crashing" layer.

## Decisions made

- **Token values changed, key names didn't.** Last session's rule
  ("additive-only, never redefine an existing token value") was explicitly
  overridden this session at the developer's request — the whole point was
  fixing colors that "looked weird." But renaming/removing keys was still
  avoided wherever anything still used them, to keep the diff to values only.
- **Monochrome-first**, confirmed with the developer before touching
  `theme.ts`: one accent hue, `danger`/`success` stay as functional colors,
  Notion's own visual language (warm grays, near-black text, hairline
  borders, minimal shadow) as the reference since no screenshots were
  provided.
- **`ScreenContainer` over touching `ThemedView`**: added a new molecule
  instead of changing `ThemedView` itself, so the low-level primitive stays
  simple/single-responsibility and the desktop-width behavior is opt-in per
  screen (all screens opted in via the mechanical swap, but new screens
  could choose not to for a genuinely full-bleed layout).
- **Live-but-placeholder vs. truly-dead code get different treatment.** The
  `Explore` tab was asked about directly (`AskUserQuestion`) because it's
  user-visible feature scope, not just styling — the developer chose
  "repurpose as real screen." `workspace-home-screen.tsx` and
  `knowledge-home-screen.tsx` were *not* asked about — they're unreachable
  from any route, so deleting them is cleanup, not a product decision.
- **Test scope is smoke-render, not full behavior coverage.** Given 47
  screens, writing full interaction test suites (form validation, thunk
  dispatch assertions, navigation assertions) for every one would have been
  a multi-session effort on its own and wasn't what was asked — "proof
  things render correctly post-restyle" was.
- **No commits made.** All changes are in the working tree per explicit
  developer instruction this session.

## Problems solved (test infra debugging, in case it recurs)

- `SyntaxError: Unexpected token 'export'` from `immer`/`react-redux` → their
  ESM builds need to go through `transformIgnorePatterns`, not be excluded.
- `Cannot find module 'test-renderer'` → real package, not a typo; RNTL 14.x
  depends on it directly (name is easy to confuse with `react-test-renderer`,
  which is a different, also-required package that `jest-expo` already
  pulls in transitively).
- `AsyncStorage is null` → needed the official
  `@react-native-async-storage/async-storage/jest/async-storage-mock` wired
  through `moduleNameMapper`, not a custom mock.
- `TurboModuleRegistry.getEnforcing(...): 'RNCWebViewModule' could not be
  found` → `react-native-webview` has no built-in Jest mock; needed a manual
  one.
- `getByText is not a function` → RNTL 14's `render()` is `async`; every
  existing call site needed `await` added, easy to miss since the error
  doesn't say "await this."

## Current state

- `npx tsc --noEmit`, `npx eslint src --ext .ts,.tsx` (0 errors, 6 pre-existing
  unrelated warnings — `Array<T>` style in files this session didn't touch),
  and `npx jest` (57 suites / 70 tests) all pass as of this session.
- All work is uncommitted in the working tree.
- Visual verification was via component tests + `tsc`/`eslint`, not a live
  screenshot pass this session — see "Next session starts with" below.

## Next session starts with

- Consider a live visual pass (`yarn web` + headless screenshots) of a few
  representative screens per module to confirm the repalette reads well in
  practice, not just "renders without throwing." Most screens sit behind
  Supabase auth like last session, so this needs either test credentials or
  screenshotting only the reachable-without-auth flow (onboarding, auth
  screens, the now-rebuilt Explore tab content in isolation).
- The unmemoized-selector console warnings seen during test runs
  (`selectProjectStats`, `selectNotesByExperiment` return new object/array
  references each call) are pre-existing Redux perf issues, not something
  this session touched or fixed — flagged here in case a future session
  wants to add `createSelector` memoization.
- If the developer wants deeper test coverage beyond smoke-render (form
  validation, thunk/dispatch behavior, navigation assertions), that's a
  separate, larger effort using the same `renderWithProviders` foundation.

## Open questions

- None outstanding from this session — the two scope questions (Explore tab
  treatment, palette aggressiveness) were asked and answered before the work
  started.
