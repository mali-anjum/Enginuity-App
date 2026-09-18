# UI Registry — Enginuity

This is the design-system baseline for the `/imprint` skill. It reflects what is
**actually in the code today** (established via an `/imprint audit` pass on
2026-09-19), not an aspirational spec. New components should match these
patterns; when `/imprint` runs after future component work, it updates the
relevant entry below rather than creating a parallel standard.

Stack note: this is React Native (Expo), not Tailwind/web. There are no
`bg-`/`rounded-`/`text-` classes — instead every visual property comes from
`Colors[colorScheme]` (theme color tokens), `Spacing`/`Radii` (numeric scales),
and `ThemedText`'s `type` prop (typography scale). All three live in
[src/common/constants/theme.ts](../src/common/constants/theme.ts) and
[src/common/atoms/themed-text.tsx](../src/common/atoms/themed-text.tsx). This
file records the *values* of that system and how components consume it — the
equivalent of the class names an `imprint` run would capture on a web stack.

---

## Foundation — Design Tokens

File: `src/common/constants/theme.ts`, `src/common/atoms/themed-text.tsx`

| Token group | Values | Notes |
| --- | --- | --- |
| `Spacing` | xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 | Use for all padding/margin/gap. Don't hand-write pixel numbers for these. |
| `Radii` | sm 8 · md 12 · lg 16 · xl 20 · full 999 | Use for `borderRadius`. Perfect circles (avatars, icon wells) size their own radius as `width / 2` and are exempt. |
| Color tokens | `text`, `background`, `surface`, `surfaceElevated`, `border`, `primary`, `accent`, `accentSoft`, `accentBorder`, `mutedText`, `subtleText`, `danger`, `success`, `heroTint`, `cardShadow`, `buttonPrimaryText`, `buttonSecondaryBackground`, `buttonSecondaryText`, `buttonDangerBackground`, `buttonDangerText`, `buttonGhostBackground` | Always pulled via `Colors[useColorScheme() ?? 'light']`, never a raw hex in a component. Light/dark variants are defined side by side in `theme.ts`. |
| Typography (`ThemedText` `type` prop) | `display` 34/40/700 · `title` 32/32/bold · `heading` 22/28/700 · `subtitle` 20/26/bold · `defaultSemiBold` 16/24/600 · `default` 16/24 · `link` 16/30 (primary color) · `caption` 13/18 (muted, metadata) · `eyebrow` 12/16/700 uppercase tracked (subsection labels) | `display`/`heading`/`caption`/`eyebrow` were added 2026-09-19 to fill gaps in the original 5-type scale — additive, no existing usage changed. |

**Pattern notes:** Every new screen/component should source spacing, radius,
color, and text style from these tokens. A literal `fontSize:`, hex color, or
raw pixel padding/radius outside this file is a drift signal — flag it in
`/imprint audit`.

---

### ThemedText

File: `src/common/atoms/themed-text.tsx`
Last updated: 2026-09-19

| Property | Value |
| --- | --- |
| Types available | `default`, `defaultSemiBold`, `title`, `subtitle`, `link`, `display`, `heading`, `caption`, `eyebrow` |
| Color source | `text` token (or `primary` for `link`), overridable via `lightColor`/`darkColor` props |
| Default type | `default` |

**Pattern notes:** This is the only place font size/weight/line-height are
defined. Never set `fontSize`/`fontWeight` ad hoc on a `Text`/`ThemedText`
instance for anything that recurs across screens — add or reuse a `type`
instead.

---

### ThemedView

File: `src/common/atoms/themed-view.tsx`

| Property | Value |
| --- | --- |
| Background | `background` token, overridable via `lightColor`/`darkColor` |

**Pattern notes:** Thin wrapper — screens should default to this for the root
container instead of a raw `View` with a manual background color.

---

### AppButton

File: `src/common/atoms/app-button.tsx`

| Property | Value |
| --- | --- |
| Border radius | `14` *(hand-written — does not match `Radii.md` 12 or `Radii.lg` 16; see Known Deviations)* |
| Padding | vertical `13`, horizontal `14` |
| Border | `1` solid, color = variant's own background (primary/secondary/ghost/danger all define `backgroundColor`+`borderColor` together) |
| Text | `ThemedText type="defaultSemiBold"`, `fontSize: 15` override |
| Pressed state | `opacity: 0.87`, `scale: 0.99` |
| Disabled state | `opacity: 0.55` |
| Variants | `primary` (theme `primary`), `secondary` (`buttonSecondaryBackground`), `ghost` (`buttonGhostBackground` + `border`), `danger` (`buttonDangerBackground`) |

**Pattern notes:** Variant colors always come in a `{ backgroundColor,
borderColor, textColor }` triple from the theme — never mix a token
background with a hardcoded border. Icon (`iconName`) is optional, rendered at
`size 18` in the variant's text color.

---

### AuthTextInput

File: `src/auth/molecules/auth-text-input.tsx`
Last updated: 2026-09-19

| Property | Value |
| --- | --- |
| Border | `1` solid, `border` token |
| Border radius | `Radii.md` (12) |
| Padding | horizontal `Spacing.md+2` (14), vertical `Spacing.md` (12) |
| Background | `surfaceElevated` |
| Text | `fontSize: 15` (intentional form-input size, shared with the home-screen search input — not on the `ThemedText` scale since it's a native `TextInput`, not a `Text`), color = `text` token, placeholder = `mutedText` |
| Password visibility | `secureToggle` prop renders an absolutely-positioned eye/eye-slash `IconSymbol` (`size 20`, `mutedText` color) inside the field. Hit-area is `TOGGLE_HIT_SIZE` = `Spacing.xxxl + Spacing.md` (44, the recommended minimum touch target), inset `Spacing.xs` from the edge; `inputWithToggle.paddingRight` = hit-area + inset (48) so input text never runs under the icon. |

**Pattern notes:** Any password field in the app should use `secureToggle`
rather than a bare `secureTextEntry` — it is what backs the login and signup
password fields. `reset-password-screen.tsx` and `account-settings-screen.tsx`
still use raw `secureTextEntry` and are known-inconsistent (see below).

---

### TagChip

File: `src/common/atoms/tag-chip.tsx`

| Property | Value |
| --- | --- |
| Border radius | `999` (pill) |
| Padding | horizontal `10`, vertical `5` |
| Background | `colorForTag(label)` — per-tag deterministic color, not a theme token |
| Text | `defaultSemiBold`, `fontSize: 12`, always white (`lightColor`/`darkColor` both `#FFFFFF`) |

**Pattern notes:** This is the one component that intentionally bypasses the
theme token palette (tag colors need to stay stable/distinct regardless of
light/dark mode). Don't "fix" this to use theme tokens — it's deliberate.

---

### Elevated Card (primary content)

Example: project cards in `src/dashboard/screens/home-screen.tsx`
Last updated: 2026-09-19

| Property | Value |
| --- | --- |
| Border | `1` solid, `border` token |
| Border radius | `Radii.lg` (16) |
| Padding | horizontal `14`, vertical `12` |
| Shadow | `shadowColor: cardShadow` token, `shadowOpacity: 1` (alpha is baked into the token itself — don't also apply a fractional opacity), `shadowRadius: 10`, `shadowOffset: {0, 4}`, `elevation: 2` |
| Background | `surfaceElevated` |

**Pattern notes:** Use this treatment for the primary, tappable content of a
screen (things the user came to that screen to look at/act on). Pairs with
"Flat Card" below for secondary content on the same screen, so the two visual
weights read as primary vs. secondary rather than everything looking equally
important.

---

### Flat Card (secondary content)

Example: activity feed rows in `src/dashboard/screens/home-screen.tsx`,
`ListEmptyState` in `src/common/organisms/list-empty-state.tsx`

| Property | Value |
| --- | --- |
| Border | `1` solid, `border` token |
| Border radius | `Radii.md` (12) — `ListEmptyState` uses `16`, see deviation note |
| Padding | varies by content (activity row: vertical `14`/horizontal `12`; empty state: `20` all around) |
| Shadow | none |
| Background | `surfaceElevated` |

**Pattern notes:** No shadow — that's the deliberate difference from the
Elevated Card. Use for supporting/secondary information (activity logs, empty
states, metadata rows).

---

### Status / Badge Chip

Example: `statusChip`, `sharedBadge` in `src/dashboard/screens/home-screen.tsx`

| Property | Value |
| --- | --- |
| Border | `1` solid, semantic color (varies by status: `primary`/`accentBorder`/`border`) |
| Border radius | `Radii.md` (12) |
| Padding | horizontal `Spacing.sm`–`Spacing.sm+2`, vertical `Spacing.xs` |
| Text | `ThemedText type="caption"` + `fontWeight: '600'` style override (unified 2026-09-19 — previously hand-written `fontSize: 11`/`12`) |
| Background | paired semantic soft-background token (`heroTint`, `accentSoft`, `surfaceElevated`) matching the border color's semantic family |

---

## Known Deviations (not yet reconciled)

These predate the `Spacing`/`Radii`/expanded-typography tokens (added
2026-09-19) and haven't been migrated. Listed here so `/imprint audit` doesn't
need to rediscover them, and so new code doesn't copy them by accident:

- **`AppButton` border radius is `14`** — doesn't match `Radii.md` (12) or
  `Radii.lg` (16). Decide whether buttons get their own radius step or should
  snap to `Radii.lg` before reconciling.
- **`reset-password-screen.tsx` and `account-settings-screen.tsx`** use raw
  `secureTextEntry` on password fields instead of `AuthTextInput`'s
  `secureToggle` — inconsistent with login/signup.
- **`ListEmptyState` card radius is `16`** while other "Flat Card" instances
  use `12` — both are pre-token values that happened to land on different
  `Radii` steps.

Resolved 2026-09-19: the Home screen's remaining hand-written
gaps/padding (`projectCardTop`, `activityRow`, `sharedBadge`), the
badge/status-chip label styles (now `type="caption"`), and `AuthTextInput`'s
base radius/padding + `secureToggle` hit-area are all token-derived now — no
longer listed here.

Do not silently "fix" the remaining ones while doing unrelated work — they're either an
intentional design choice not yet confirmed, or a small migration that
deserves its own pass. Flag them if you're touching the file anyway; otherwise
leave them and mention it.
