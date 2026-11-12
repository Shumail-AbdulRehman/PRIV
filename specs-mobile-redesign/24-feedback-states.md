# Spec 24 — Message bar, offline banner, skeleton, empty and error states

**Status:** Done
**Depends on:** Spec 19
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/Feedback.tsx`, `frontend-mobile/tests/design/feedback.test.mjs`, `specs-mobile-redesign/inventory/24-feedback-states.md`
**Reuses:** `frontend-mobile/src/design/ActionButton.tsx`, `frontend-mobile/src/design/StaffText.tsx`, `DESIGN-SYSTEM.md#states`, `DESIGN-SYSTEM.md#components`

## Goal

Every screen shows loading, empty, error, offline and short confirmations the same way.

## Scope

All in `src/design/Feedback.tsx`:

- **`SnackbarProvider` and `useSnackbar()`**: `show(messageKey, values)` displays the message bar (ink, white text, yellow `Check` icon, radius 14) 16 from the sides and 96 above the bottom, for 2.2 seconds; a new message replaces the old one. Live region polite. `useSnackbar()` outside a provider returns a no-op `show` (the provider is mounted in spec 48; screens built earlier must not crash).
- **`OfflineBanner`** props: none. Reads connectivity through `@react-native-community/netinfo` the same way `HomeScreen.tsx` does (`isConnected !== false && isInternetReachable !== false`), renders nothing when online, else `night2` banner with `WifiOff`, "Internet needed to continue" and "You are seeing the last saved information." Also export `useOnline()` with the same rule for screens.
- **`Skeleton`** props: `width`, `height`, `radius`, `tone` (`onBlue` translucent white, `onWhite` `line`). No shimmer (no animated data).
- **`EmptyState`** props: `icon`, `title`, `body`, `action` (optional `ActionButton`). Quiet 88 glyph tile, `blueWash`, radius 26; centred title `sectionTitle` and body muted.
- **`ErrorState`** props: `title` (default "Something could not load"), `body` (default "Your saved work is unchanged. Check your internet and try again."), `onRetry`. Outline "Try again" button.

## Explicit non-scope

- Screen-specific skeleton layouts → spec 29 onward (each screen composes `Skeleton` blocks).
- Mounting the provider → spec 48.

## Reuse first

- Connectivity rule copied from `HomeScreen.tsx`; do not add a second definition of online.

## Steps

1. Build the parts.
2. Test with the harness, mocking `netinfo` and timers.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/feedback.test.mjs` passes: `show` renders the translated message and it disappears after 2.2 seconds with mocked timers; a second `show` replaces the first; `useSnackbar` without a provider does not throw; `OfflineBanner` renders nothing online and both lines offline; `ErrorState` calls `onRetry`; `EmptyState` renders its action. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in `Feedback.tsx`. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `Feedback.tsx` and `feedback.test.mjs` (9 tests, all pass). Whole mobile suite: 314 tests, 0 fail. Typecheck 0 errors; `build:web` exported; no raw hex in Feedback.tsx. Notes: the snackbar has no entry animation (spec lists none; kept simple); the skeleton `onBlue` tone uses an rgba string because no token exists for translucent white; defaults "Something could not load" and "Your saved work is unchanged. Check your internet and try again." have no Urdu entry yet (spec 49 sweep), the other strings already exist. Test harness `t` ignores interpolation values, so values were not asserted. 360 by 700 layout not checked in a browser (no screen yet).
