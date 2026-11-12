# Spec 67 — Fix: layouts that break only on the Android phone

**Status:** Done
**Depends on:** Spec 66
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/screens/nativeLayout.test.mjs`, `frontend-mobile/tests/nativeStyleScan.test.mjs`, `specs-mobile-redesign/inventory/67-fix-native-layout.md`
**Reuses:** `frontend-mobile/src/screens/profile/ProfileScreen.tsx`, `frontend-mobile/src/screens/profile/ProfileMonth.tsx`, `frontend-mobile/src/design/ConfirmDialog.tsx`, `frontend-mobile/src/screens/history/AttendanceHistoryView.tsx`, `frontend-mobile/src/screens/history/HistoryScreen.tsx`, `frontend-mobile/src/screens/HomeScreen.tsx`, `frontend-mobile/src/screens/day/DayHeader.tsx`, `frontend-mobile/src/navigation/StaffTabs.tsx`, `frontend-mobile/src/components/AttendanceCamera.tsx`, `frontend-mobile/src/screens/LoginScreen.tsx`, `frontend-mobile/src/types.ts`, `frontend-mobile/src/design/TaskRow.tsx`, `frontend-mobile/tests/support/nativeHarness.mjs`, `frontend-mobile/tests/history/attendanceHistory.test.mjs`, `frontend-mobile/tests/screens/profile.test.mjs`, `design/mobile-redesign/v3/style.css`, `design/mobile-redesign/v3/views.js`

## Goal

The owner's Android APK test (2026-11-12) showed layouts the web build and the node tests never caught: Profile's settings rows stacked icon, label and chevron vertically; the History attendance row lost its side gutter and broke onto three lines; headings slid under the status bar; the check-in selfie camera kept the tab bar and its oval covered the title and hint. Fix the causes, not the three screens, and add tests that catch them on the node harness.

## Root causes

1. **Pressable `style` callbacks are dropped on native.** NativeWind's CSS interop (`react-native-css-interop`, babel `jsxImportSource: nativewind`) wraps every `Pressable` on native and copies its inline style with an object spread, so `style={({ pressed }) => [...]}` becomes `{}`: no `flexDirection: 'row'`, no gutter, no height. On web the interop is not used, so the web checks passed. Five sites: Profile's link rows and Sign out, Profile month's "See my history", the confirm dialog's buttons, the History attendance row. `TaskRow` and `ActionButton` already keep the pressed state in React state and pass a plain style.
2. **Scrolling content runs under the status bar.** Android is edge to edge; History, Profile, My day and Sign in put the top inset inside the scroll view, so once scrolled, headings sit under the clock and battery. The design's status bar (`.sbar`) is a fixed band in the screen's top colour.
3. **The attendance camera, locating screen and receipt render inside the My day tab**, so the tab bar stays on screen; the design's `locate`, `selfie` and `checked` views have no tabs.
4. **The face oval is placed by camera-area height only.** With the tab bar taking space, its top rises into the title and hint.

## Scope

- **(a) Pressed state without style callbacks.** Each of the five sites keeps `pressed` in React state (`onPressIn`/`onPressOut`, as `TaskRow`) and passes a plain style array; the rows keep their row direction, gutter, height and pressed wash. The attendance row becomes a small row component (hooks cannot sit inside the map): day and date at the start, time and pill at the end, the pill in a box the row centres (`Pill` aligns itself to the top).
- **(b) Fixed status-bar band.** History (`canvas`), Profile (`surface`), Sign in (screen background) and My day (the sky colour of the current tone, or `night2` offline as today) render a non-scrolling view of height `insets.top` above their scroll view; the scroll content no longer adds `insets.top`. `DayHeader` drops its own `insets.top` padding (the tick moves with it) and exports its sky colour; offline My day loses the extra inset gap it had under the banner.
- **(c) No tab bar over the attendance flow.** `HomeScreen` sets the `Shift` route param `fullScreen` while the attendance phase is `locating`, `selfie`, `saving` or `done`, and clears it after. `StaffTabs` passes a `tabBar` that renders `BottomTabBar` unless the focused route has `fullScreen`. `StaffTabsParamList.Shift` becomes `{ fullScreen?: boolean } | undefined`.
- **(d) Oval below the text.** `AttendanceCamera` measures its top block (close button, title, hint) and exports a pure `faceGuideFrame(width, height, top)`; the oval keeps its 236 by 306 proportions, is centred at 44% when it fits, never starts above `top`, and shrinks when the camera area is short.
- This spec is the **sole later editor** of `ProfileScreen.tsx` (spec 37), `ProfileMonth.tsx` (spec 44), `ConfirmDialog.tsx` (spec 23), `AttendanceHistoryView.tsx` (spec 42) and the two tests that called the old style callbacks (`attendanceHistory.test.mjs`, spec 42; `profile.test.mjs`, spec 37), `HistoryScreen.tsx` (spec 47), `HomeScreen.tsx` (spec 46), `DayHeader.tsx` (spec 29), `StaffTabs.tsx` (spec 48), `AttendanceCamera.tsx` (spec 31), `LoginScreen.tsx` (spec 28) and `types.ts` (spec 07). It changes only: the pressed-state plumbing of the five Pressables and the attendance row's pill box; in the two tests, `style({ pressed: false })` becomes `style`; the top band and scroll padding of the four screens and `DayHeader`'s top padding, tick offset and sky-colour export; the `fullScreen` param in `HomeScreen`, the `tabBar` prop in `StaffTabs` and the `Shift` param type; the oval geometry and top-block measurement in `AttendanceCamera`.

## Explicit non-scope

- Status bar icon colour (`StatusBar style="dark"` over the blue sky) → owner decision; `App.tsx` is not touched (spec 48 owns navigation shell decisions).
- The QR and photo cameras → already stack screens with the text in flow above the frame (spec 62 owns their shared parts).
- The extra `insets.bottom` in tab screens' scroll padding → spec 65 owns the tab-bar offset maths; harmless blank space.
- New strings or translations → none needed (spec 62 owns the shared translation helper).

## Reuse first

- `TaskRow`'s pressed-state pattern; `TopBar withSafeArea` and the Tasks tab's top band as the band model; `BottomTabBar` from `@react-navigation/bottom-tabs`.

## Steps

1. Convert the five Pressables; add the bands; move `DayHeader`'s inset out.
2. Add the `fullScreen` param and the `tabBar` wrapper; the oval geometry.
3. Write the two tests; run the existing suite; render-check in headless Chrome.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/nativeLayout.test.mjs` passes: with a mocked top inset of 24, History, Profile, My day (online and offline) and Sign in render a non-scrolling band of height 24 before the scroll view and no scroll content padding includes 24; Profile's link rows, Sign out, "See my history", the dialog buttons and the attendance row have a plain style with `flexDirection` `row` (`row-reverse` in Urdu) and the attendance row has `marginHorizontal` equal to the gutter; `HomeScreen` sets `fullScreen` true in the selfie, locating and receipt phases and false back on idle; the `tabBar` returns nothing for a focused `fullScreen` route and `BottomTabBar` otherwise; `faceGuideFrame` never starts the oval above `top` and keeps the proportions. Each assertion fails on the tree before the change. [unit]
- [x] `cd frontend-mobile && npx tsx --test tests/nativeStyleScan.test.mjs` passes: no file under `src` gives a `Pressable` a style callback or uses a web-only style (`display` other than `flex`/`none`, `paddingInline`, `marginInline`, `paddingBlock`, `marginBlock`, `inset`, `position` `fixed`/`sticky`, `cursor`, `transition`, `whiteSpace`, `textWrap`, `wordBreak`, `overflowWrap`, `gridTemplate`, `visibility`, `backdropFilter`, `float`, CSS units or `calc()` in strings, `textAlign` `start`/`end`, percentage gaps). [static]
- [x] Existing tests pass; any adapted test keeps every behaviour assertion. [unit]
- [x] `grep -nE "rgba|#[0-9a-fA-F]{3,8}\b"` over the changed source files prints nothing. [static]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Root causes confirmed in `node_modules/react-native-css-interop` (0.1.22): `wrap-jsx` swaps every `Pressable` for its interop wrapper on native, and `native-interop.js` `applyRules` copies a non-rule inline style with `{ ...declaration }`, so a style function becomes `{}`. The five sites were the only callbacks (`grep "pressed" src`). Status-bar: History, Profile, My day and Sign in padded scroll content by `insets.top`; Tasks already had the fixed band. Camera: rendered by `HomeScreen` inside the tab; oval from `height * 0.44` only.
- Changes: `PressRow` in Profile (link rows, Sign out); state-based pressed in `ProfileMonth`, `ConfirmDialog`, `AttendanceRow`; bands in History (canvas), Profile (surface), Sign in (surface), My day (`skyColor`, `night2` offline); `DayHeader` no inset (tick at 40); `fullScreen` param with a `useRoute` guard so a cleared param is set again; `StaffTabBar` uses a namespace import of `@react-navigation/bottom-tabs` because the node mocks of that package only export `createBottomTabNavigator`. Oval: proportions kept, gap 8, minimum half-height 60, centre clamped between the text block and the bottom.
- Tests: `nativeLayout.test.mjs` 15/15, `nativeStyleScan.test.mjs` 3/3. Adapted: `attendanceHistory.test.mjs` (2 lines) and `profile.test.mjs` (2 lines), `style({ pressed: false })` to `style`; same assertions. New assertions fail on the old tree by construction (style callbacks, no band test id, no `setParams`, no `StaffTabBar` or `faceGuideFrame` export); the old tree was not rerun. `npm test --prefix frontend-mobile` 685/685; typecheck 0; `build:web` exit 0 (no expo export running); no raw hex in the changed files.
- Rendered check: scratch copy of `dist` on 127.0.0.1:8767, headless Chromium (playwright-core from `frontend/node_modules`) at 360x700, fake camera and location, all API calls answered from the e2e fixtures, a 24 px top inset simulated through safe-area-context's `getComputedStyle` read. English and Urdu: My day; Check in late to the selfie camera (no tab bar; hint bottom 141, oval top 169 in English, 159 and 187 in Urdu); Cancel brings the tabs back; History Tasks and Attendance, top and scrolled (scrolled content stops at the band); attendance row 16 to 344 at 360, one line, pill centred; Profile top and scrolled, settings rows 60 high on one line; document width 360; no page errors. The scratch `dist` was patched for a web-only expo-location bug (see inventory). Screenshots in `/tmp/claude-1000/-home-shumail-bkacup-16-oct-bkpriv-bk-Priv-PRIV/11e21d90-68c6-452b-b18e-24dce8414728/scratchpad/fix67/`. Server stopped. Not checked on the phone: status-bar icon colour over the blue sky, real camera preview and the oval on the owner's screen size, Android hardware back on the camera with the tab bar hidden.
