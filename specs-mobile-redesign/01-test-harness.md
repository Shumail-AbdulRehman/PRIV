# Spec 01 — Test command and shared component test harness

**Status:** Done
**Depends on:** Spec 00
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/package.json`, `frontend-mobile/tests/support/nativeHarness.mjs`, `frontend-mobile/tests/support/nativeHarness.test.mjs`, `specs-mobile-redesign/inventory/01-test-harness.md`
**Reuses:** `frontend-mobile/tests/nativeComposition.test.mjs`, `frontend-mobile/tests/attendanceCamera.test.mjs`, `frontend-mobile/tests/startTaskLifecycle.test.mjs`

## Goal

Every test file any later spec adds is run by `npm test`, and component tests share one small harness instead of copying module-mock code into every file.

## Scope

**Test command.** In `frontend-mobile/package.json`, change only `scripts.test` so it runs `tsx --test` with two quoted glob patterns: `src/**/*.test.ts` and `tests/**/*.test.mjs`. The quotes matter: Node expands the patterns itself (Node 24 supports globs in `--test`); an unquoted `**` would be expanded by the shell to one level only. Planning measured on 2026-11-11: the current command runs 115 tests; the glob command runs 130 (it adds the 15 tests in `src/launch/LaunchRecovery.test.ts`, which were never run) and all pass. Do not change any other script, dependency or field. `tests/mobileQueriesBrowser.mjs` and `tests/notificationsBrowser.mjs` are not `*.test.mjs` and must stay out of the run.

**Harness** `tests/support/nativeHarness.mjs`, an ES module that later test files import first. It must provide:

1. `installMocks(overrides)`: registers `node:module` `registerHooks` resolution so that importing these specifiers returns mocks, before any component is imported. Defaults:
   - `react-native`: host components as strings (`View`, `Text`, `ScrollView`, `Pressable`, `Image`, `Modal`, `TextInput`, `ActivityIndicator`, `RefreshControl`), `StyleSheet` (`create` returns its input, `flatten`, `absoluteFill`, `hairlineWidth`), `Platform` (`OS: 'android'`, `select`), `Linking.openSettings`, `Alert.alert`, `AppState` (`currentState: 'active'`, `addEventListener` returning `{ remove }`), `BackHandler.addEventListener`, `AccessibilityInfo`, `useWindowDimensions` (390 by 844 unless overridden), `I18nManager`.
   - `react-native-safe-area-context` (`useSafeAreaInsets` zeros), `react-native-reanimated` (`useReducedMotion` false, `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withRepeat`, `withDelay`, `Easing`, default `Animated.View` as `View`), `expo-haptics` (records calls), `expo-camera`, `expo-location`, `@react-navigation/native` (`useNavigation` returning a recorder, `useIsFocused` true, `useRoute`), `@tanstack/react-query` (`useQuery`, `useInfiniteQuery`, `useQueryClient` from overrides).
   - Project modules matched by path suffix: `/i18n/LanguageProvider` (`useLanguage` built from the real `translate` and a mutable language), `/auth/AuthContext` (`useAuth` from overrides).
   - Overrides can replace any default or add a project module by path suffix, exactly like `tests/nativeComposition.test.mjs` does today.
2. `setLanguage('en' | 'ur')` for the language mock.
3. `render(element, { fontsReady })`: wraps in `NativeFontsReady.Provider`, mounts with `react-test-renderer` inside `act`, returns the renderer.
4. Query helpers on a renderer: `allText(renderer)` (all text in order, joined), `findPressable(renderer, label)` (by `accessibilityLabel` or by its text), `press(node)` (calls `onPress` inside `act`).
5. `navigationCalls()` and `hapticsCalls()` to read what was recorded.
6. Clean-up of the temporary mock directory when the process exits.

It sets `globalThis.React` and `IS_REACT_ACT_ENVIRONMENT` like the existing tests. It must work for `.tsx` components imported through `tsx`.

## Explicit non-scope

- Migrating existing tests to the harness → spec 53 lists candidates; existing tests keep their own mocks.
- Playwright and end-to-end setup → spec 52.
- Any production code change → specs 02 onward.

## Reuse first

- Copy the proven pieces from `tests/nativeComposition.test.mjs` (mock files written to a temp directory, `registerHooks` resolve by suffix). Do not invent a different mocking approach.
- Use the real `translate` from `src/i18n/translations.ts` in the language mock, so tests see real Urdu.

## Steps

1. Run `npm test --prefix frontend-mobile` and record the count (expected 115).
2. Change `scripts.test`. Run it again; record the count (expected at least 130, 0 failures).
3. Write the harness.
4. Write `tests/support/nativeHarness.test.mjs`: mount a tiny inline component that uses `useLanguage`, `useAuth`, `useNavigation`, a `Pressable` and a `Text` from `react-native`, and prove the mocks.
5. Write `inventory/01-test-harness.md` with the exported helpers and a three-line usage example in words.

## Done when

- [x] `npm test --prefix frontend-mobile` runs at least 130 tests with 0 failures, and the Log records the before and after counts. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/support/nativeHarness.test.mjs` passes: English text renders; after `setLanguage('ur')` the same component renders the Urdu translation of "Check in"; pressing a `Pressable` calls its handler; a `navigate` call is recorded; `useWindowDimensions` can be overridden to 360 wide. [unit]
- [x] A new empty-of-logic test file placed at `frontend-mobile/tests/design/probe.test.mjs` is picked up by `npm test` (prove it, then delete the probe). [unit]
- [x] `package.json` differs from before only in `scripts.test` (`git diff` shown in the Log). [static]
- [x] `inventory/01-test-harness.md` lists every exported helper. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — `scripts.test` changed to `tsx --test "src/**/*.test.ts" "tests/**/*.test.mjs"` (only change in package.json, shown by `git diff`). Counts: old command 115 tests, new command 130, 0 failures. Harness `tests/support/nativeHarness.mjs` and `nativeHarness.test.mjs` (4 tests, all pass) written; mocks are generated as ESM files with named exports (a CJS `module.exports=` lookup does not give named imports under tsx), overrides are merged over the default module and are bound when a component is first imported, so call `installMocks` before importing components. Probe `tests/design/probe.test.mjs` was picked up (suite 135 tests, 0 failures) and then deleted; final `npm test` run: 143 tests, 0 failures (130 baseline + 4 harness + 9 from `src/design/tokens.test.ts`, another spec's file). Typecheck: 0 errors. **Not verified:** `npm run build:web` fails in this sandbox with `EACCES: permission denied, mkdir frontend-mobile/.expo/web/cache/...` (environment write restriction, not a code error); the build gate box is left unticked. The 130 figure holds before new test files are added.
- **2026-11-11** — Lead check: `npm test` 143/143 pass, typecheck 0 errors, `package.json` diff is only `scripts.test`. The web build fails for every spec because `frontend-mobile/.expo` links to `.notifications-original-frontend-mobile/.expo`, which is owned by root (`EACCES` on the favicon cache). That is an environment problem outside this spec; the owner was asked to fix the folder owner. Marked Done; the build box stays unticked until the build is rerun.
- **2026-11-11** — Lead: after the owner fixed the `.expo` cache owner, `npm run build:web --prefix frontend-mobile` passed (exit 0, "Exported: dist", new fonts present in `dist/assets/assets/fonts`). Build box ticked.
