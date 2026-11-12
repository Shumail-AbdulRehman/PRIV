# Inventory: what already exists

Built from the code on 2026-11-11; the redesign's fragments (`inventory/NN-*.md`, specs 01 to 52, 54, 55) were folded in by spec 53 on 2026-11-12 under "Added by the redesign" below, and the fragments deleted. Check this file before creating anything. A later plan that adds fragments folds them in the same way. Paths are under `frontend-mobile/` unless they start with `backend/`.

## Components

### language-choice
`src/components/LanguageChoice.tsx`. Old English/اردو buttons. Replaced on new screens by `LanguageToggle` (spec 21); no importer left (spec 49).
### text
`src/components/ui/text.tsx`. Translates plain string children through `translateText`, sets font and RTL alignment. New code uses `StaffText` (spec 14), which builds on the same rules.
### button
`src/components/ui/button.tsx`. Old blue button with variants. New code uses `ActionButton` (spec 19).
### input
`src/components/ui/input.tsx`. Old input with icon. New code uses `Field` (spec 22).
### icon
`src/components/ui/icon.tsx`. `Icon` renders a Lucide icon by name (`LucideIconName`). Reuse it everywhere; do not import Lucide icons one by one.
### attendance-camera
`src/components/AttendanceCamera.tsx`. Front camera selfie with duplicate-capture guard and retry. Restyled by spec 31; its behaviour is tested by `tests/attendanceCamera.test.mjs`.
### photo-capture-controls
`src/components/PhotoCaptureControls.tsx`. `PhotoCaptureControls` (shutter), `CaptureFrame`, `PhotoStepProgress`. Restyled by spec 45.
### photo-guide
`src/components/PhotoGuide.tsx`. Fixture illustration beside an instruction. Restyled by spec 45.
### legacy-parts
`TaskCard`, `StaffBrand`, `ScreenHeader`, `StatCard`, `FactRow`, `StatusBadge`, `EmptyState`, `LoadingState` were deleted by spec 49. `ui/card`, `ui/badge`, `ui/separator`, `ui/skeleton`, `ui/input` remain in `src/components/` with no importer (see spec 49 below). Use the design parts below instead.
### launch-recovery
`src/launch/LaunchRecovery.tsx`. One-use manager access code handoff and own password replacement form. Restyled by spec 27; used by sign in, forced password change and change password.

## Screens

`src/screens/HomeScreen.tsx` (My day, spec 46), `TasksScreen.tsx` (32), `StartTaskScreen.tsx` (QR start, 34), `LoginScreen.tsx` (28), `HelpScreen.tsx` (39), `verification/VerificationScreen.tsx` (photo flow, 45), `verification/VerificationProgress.tsx` (photo list, 35), `verification/SubmissionReceipt.tsx` (36), `task/TaskDetailScreen.tsx` (33), `profile/ProfileScreen.tsx`, `TaskAlertsScreen.tsx`, `ChangePasswordScreen.tsx`, `ProfileMonth.tsx`, `ProfileWork.tsx` (37, 38, 40, 44), `history/HistoryScreen.tsx`, `TaskHistoryView.tsx`, `AttendanceHistoryView.tsx`, `HistoryTaskScreen.tsx` (47, 41, 42, 43), `day/*` (15, 16, 29, 30, 31), `verification/SpatialDiagnosticScreen.tsx` (dev only, unchanged). Details per spec below.

## Hooks and context

- `useAuth()` (`src/auth/AuthContext.tsx`): `user` (`id`, `name`, `email`, `companyId`, `locationId`), `logout()`, `passwordChangeRequired`, `isBootstrapping`.
- `useLanguage()` (`src/i18n/LanguageProvider.tsx`): `language`, `isRTL`, `setLanguage`, `t(text, values)`.
- `useMyAttendanceQuery(staffId, enabled)`, `useTodaysTasksQuery(staffId, enabled)` (`src/queries/staff.ts`) and `staffQueryKeys`. Task query returns `data`, `counts`, `hasNextPage`, `fetchNextPage`.
- `useNotifications()` (`src/notifications/NotificationProvider.tsx`).

## API and services

- `client`, `uploadFormData`, `configureApiAuth` (`src/api/client.ts`). Axios client with token refresh. Every new fetcher uses `client`.
- `startCleaning` (`src/api/startCleaning.ts`): confirm a task QR and start.
- `readAttendance`, `replaceOwnPassword`, `completeStaffHandoff` (`src/launch/launchApi.ts`).
- `attendanceResult`, `reconcileAttendance`, `photoAuthority`, `photoResultAction`, `reconcileSubmission`, `validReplacementPassword` (`src/launch/recoveryPolicy.ts`).
- `verificationManifest`, `openCaptureSession`, `uploadPhoto`, `finishSubmission` and others (`src/verification/api.ts`).
- `registerPhoneAlerts`, `clearPhoneAlerts` (`src/notifications/native.ts`).
- `currentLocation` (`src/verification/location.ts`): high-accuracy fix with a watch.
- Server: `staffMobileTasks`, `staffMobileAttendance`, `mobileTaskSummary` (`backend/src/services/mobile/staffMobile.service.ts`); `getStaffSelfProfile` (`backend/src/controllers/staffSelf.controller.ts`, route `GET /api/staff/profile/me`); `getStaffSelfAttendance` (`backend/src/controllers/attendanceSelf.controller.ts`); `getZonedDayRange`, `getZonedMonthRange` (`backend/src/utils/dateTime.ts`); `staffTaskPresentation` (`backend/src/services/verification-v2/sequentialPolicy.ts`).

## Utils

- `getCheckInOpenAt`, `getLateDeadline`, `getMinimumCheckoutAt`, `getRecommendedCheckoutAt`, `getRelevantAttendanceRecord`, `canCheckInNow`, `hasOpenCheckout`, `EARLY_CHECKIN_MINUTES` (30), `LATE_CHECKIN_GRACE_MINUTES` (15), `MIN_CHECKOUT_MINUTES` (30) (`src/utils/attendance.ts`). The only source of attendance windows.
- `formatClockTime`, `formatTaskWindow`, `formatShortDate`, `formatShortDateTime` (`src/utils/format.ts`). Spec 05 adds the design's formats beside them.
- `taskCardStatus` (`src/utils/taskStatus.ts`). Superseded on new screens by `taskState` (spec 06).
- `photoStatuses`, `statusLabel`, `assessmentDetail` (`src/verification/presentation.ts`); `photoFeedback`, `requiredPhotoIds`, `photoCorrection` (`src/verification/feedback.ts`); `captureAllowed`, `checkedPhotoState`, `objectSecondsRemaining` (`src/verification/policy.ts`).
- `verificationErrorMessage` (`src/verification/errors.ts`).
- `createImagePart` (`src/utils/upload.ts`). `cn` (`src/lib/utils.ts`).

## Constants

- `v5Colors` (`src/theme.ts`): old palette for native APIs. New code uses `tokens.ts`.
- `NativeFontsReady`, `nativeFontFamily` (`src/fonts.ts`). Extended by spec 03.
- `urdu`, `translate`, `translateText` (`src/i18n/translations.ts`); `launchUrdu` (`src/launch/launchTranslations.ts`).
- `notificationDestination` (`src/notifications/model.ts`): maps alerts to `Shift` or `Tasks`.

## Types

`src/types.ts`: `StaffUser`, `AttendanceRecord`, `AttendanceStatus`, `TaskInstance`, `TaskStatus`, `StaffTabsParamList`, `RootStackParamList`, `ApiEnvelope`. `src/verification/types.ts`: `Manifest`, `Requirement`, `RequirementState`, `QueueRow`, `QueueState`, `LocalSession`. `src/queries/mobileWork.ts`: `TaskCounts`, `MobileTaskPage`.

## Test helpers

`tests/support/nativeHarness.mjs` (spec 01, below) is the shared module-mock and render harness; `tests/nativeComposition.test.mjs` keeps the older hand-written pattern. `scripts/check-staff-ui.mjs` is now only a pointer to `npm run test:e2e` (spec 52, below).

## Added by the redesign

Folded from `inventory/NN-*.md` by spec 53. Each block keeps its fragment's entries; headings were demoted one level.

### Test harness

#### Spec 01: spec 01 test harness (`01-test-harness.md`)

All exports live in `frontend-mobile/tests/support/nativeHarness.mjs`. Use instead of copying `registerHooks` mock code into each test file.

| Export | Purpose | Use instead of |
|---|---|---|
| `installMocks(overrides)` | Registers module mocks (react-native, safe-area, reanimated, expo-haptics/camera/location, react-navigation, react-query, `/i18n/LanguageProvider`, `/auth/AuthContext`). Overrides are merged key by key over a default module, or add a module; keys starting with `/` match by path suffix. Call before dynamically importing any component; overrides are bound at import time. | temp-dir `.cjs` mock blocks in each test |
| `setLanguage('en' \| 'ur')` | Sets the language the `useLanguage` mock returns (real `translate`, `isRTL` true for Urdu). | a local `language` variable |
| `setWindowSize(width, height)` | Changes the default `useWindowDimensions` (390 by 844) live. Ignored if you overrode `useWindowDimensions`. | hand-written dimension mocks |
| `render(element, { fontsReady })` | Mounts inside `NativeFontsReady.Provider` and `act`; returns the renderer (`fontsReady` defaults true). | local `mount` helper |
| `allText(renderer)` | All rendered text in order, joined by spaces. | `JSON.stringify(renderer.toJSON())` regexes |
| `findPressable(renderer, label)` | First `Pressable` with an `onPress` whose `accessibilityLabel` or text equals `label`. | `findAllByType(...).find(...)` |
| `press(node)` | Calls `onPress` inside `act`. | manual `act` plus `props.onPress()` |
| `navigationCalls()` | Array of `{ name, args }` recorded from the `useNavigation` mock (`navigate`, `goBack`, `replace`, `reset`, `setOptions`). | custom navigation recorders |
| `hapticsCalls()` | Array of `{ name, args }` recorded from `expo-haptics`. | custom haptics spies |
| `resetCalls()` | Clears both recorders. | n/a |

Usage in words: call `installMocks()` first, then `await import()` the component and `render` it. Use `setLanguage('ur')` before rendering to assert Urdu text. Find a button with `findPressable`, `await press` it, then assert on `navigationCalls()`.

Test command: `npm test --prefix frontend-mobile` now runs `src/**/*.test.ts` and `tests/**/*.test.mjs`, so a new test anywhere under those folders is picked up.

### Tokens, fonts, Urdu copy and formatting

#### Spec 02: spec 02, design tokens (`02-design-tokens.md`)

All in `frontend-mobile/src/design/tokens.ts`. Plain deep-frozen data and pure helpers; no React or React Native imports, so it is safe in `node:test` tests and in `StyleSheet.create`. Use these instead of any raw hex, size or duration in new code, and instead of `src/theme.ts` / NativeWind classes.

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `colors` (type `ColorToken`) | `src/design/tokens.ts` | Every colour in `DESIGN-SYSTEM.md#colour`, same names and values (6- or 8-digit hex). Keys: `ink`, `muted`, `subtle`, `offDay`, `future`, `pillText`, `line`, `lineStrong`, `canvas`, `segmentTrack`, `surface`, `soft`, `blue`, `blueDeep`, `blueWash`, `onBlue`, `onDarkSoft`, `onCamera`, `bannerSoft`, `yellow`, `yellowPress`, `yellowWash`, `yellowInk`, `ok`, `okWash`, `bad`, `badDeep`, `badWash`, `warn`, `warnWash`, `late`, `night`, `night2`, `tintBg`, `tintFg`, `scrim`, `cameraButton`. White is `surface`. | Raw hex, `src/theme.ts` colours |
| `type` (types `TypeRole`, `TypeVariant`, `TypeMetrics`, `TypeRoleName`, `TypeLanguage`, `FontFamilyKey`) | `src/design/tokens.ts` | One entry per role in `DESIGN-SYSTEM.md#type`, read as `type[role].en` / `type[role].ur`. Each variant: `family` (role key), `size`, `lineHeight` (px); optional `compact` (`nowTitle`, `nowTitleLong`), `narrow` (`calendarHead` Urdu below 375). Role-level `maxLines` (`nowTitleLong`: 3). Roles: `nowTitle`, `nowTitleCompact`, `nowTitleLong`, `pageTitle`, `headline`, `moment`, `cameraTitle`, `sheetTitle`, `sectionTitle`, `barTitle`, `groupTitle`, `action`, `body`, `rowTitle`, `meta`, `label`, `fieldLabel`, `input`, `badge`, `calendarHead`. | Hand-set `fontSize` / `lineHeight` |
| `FontFamilyKey` mapping | `src/design/tokens.ts` | Follows spec 03: `title` = Manrope ExtraBold, `titleBold` = Manrope Bold, `body`/`bodySemi`/`bodyBold`/`bodyExtra` = Inter Regular/SemiBold/Bold/ExtraBold, `urdu`/`urduBold` = Noto Arabic Regular/Bold. Urdu variants use `urdu`/`urduBold`, except `input` and `badge`, which keep Latin keys (`body`, `bodyBold`). | Font file names |
| `space` | `src/design/tokens.ts` | `gutter` 20, `gutterNarrow` 16, `narrowWidth` 375, `rowMinHeight` 76, `rowMinHeightCompact` 64, `rowPadV` 13, `rowPadVCompact` 8, `markerSize` 34, `rowGap` 14, `rowGapNarrow` 12, `actionHeight` 64, `ghostHeight` 52, `dockPadTop` 10, `dockPadSide` 16, `dockPadBottom` 12 (+ safe area), `fieldHeight` 60, `chipHeight` 44, `segmentHeight` 44, `segmentTrackPad` 4, `touchMin` 44, `touchMinIcon` 48, `tabMinHeight` 60, `tabPipWidth` 62, `tabPipHeight` 32, `workSheetOverlap` 26, `tileSize` 42, `badgeOkSize` 96, `shutter` 80, `shutterGap` 4, `shutterRing` 4, `avatar` 44, `avatarCompact` 38, `avatarProfile` 76. | Raw layout numbers |
| `radius` | `src/design/tokens.ts` | `actionRadius` 18, `fieldRadius` 16, `chipRadius` 22, `segmentTrackRadius` 14, `segmentThumbRadius` 11, `tabPipRadius` 16, `sheetRadius` 26, `workSheetRadius` 28, `cardRadius` 18, `tileRadius` 12, `badgeOkRadius` 30, `pillRadius` 999. | Raw `borderRadius` |
| `motion` (type `CubicBezier`) | `src/design/tokens.ts` | `motion.duration` ms: `press` 120, `nowChange` 220, `sheet` 280, `scrim` 200, `dialog` 180, `snack` 200, `busy` 180, `scanLine` 1900, `locateRing` 1500, `badge` 340, `tickDraw` 300, `tickDelay` 120, `reducedFade` 120. `motion.easing.easeOut` [0.23, 1, 0.32, 1], `motion.easing.drawer` [0.32, 0.72, 0, 1] (spread into `Easing.bezier(...)`). `motion.scale.press` 0.97, `motion.scale.shutter` 0.93. | Literal durations and curves |
| `contrast(fg, bg)` | `src/design/tokens.ts` | WCAG contrast ratio of two 6-digit hex colours; throws on anything else (so not for `scrim` / `cameraButton`). For tests. | Hand-rolled contrast maths |
| `isNarrow(width)` | `src/design/tokens.ts` | True below `space.narrowWidth` (375). | `width < 375` |
| `gutterFor(width)` | `src/design/tokens.ts` | 16 below 375, else 20. | Inline gutter ternaries |
| `tokens` | `src/design/tokens.ts` | `{ colors, type, space, radius, motion }` in one frozen object, for `tokens.type[role][language]` style access. | — |

Not tokens (still raw in DESIGN-SYSTEM components/states, owned by their component specs): top bar height 56, sheet grab handle 40 by 4, sheet glyph tile 50 radius 16, empty-state glyph tile 88 radius 26, message bar radius 14, pill padding 3 by 10 (9 Urdu), calendar gap 3 and padding 8, motion offsets (8, 12) and secondary scales (0.96, 0.9, 1.55).

#### Spec 03: spec 03 fonts (`03-fonts.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `staffFonts` | `frontend-mobile/src/fonts.ts` | Map of all 8 registered font names to bundled files, passed to `useFonts` in `App.tsx`. | a local font map |
| `fontFor(familyKey, language, fontsReady, os?)` | same | Registered family name for a token role key (`body` ... `urduBold`) and language; system fallback until fonts load. | `nativeFontFamily` for new text (spec 14) |
| `fallbackFontFamily(os?)` | same | System font string used before fonts load. | inline `Platform.OS` ternaries |
| `isLatinOnly(text)` | same | True for Latin letters with no Arabic script, so Latin text keeps the Latin face in Urdu mode. | the inline regex in `components/ui/text.tsx` |
| Font names `HygeneInterBold`, `HygeneInterExtraBold`, `HygeneManropeBold`, `HygeneManropeExtraBold` | `frontend-mobile/assets/fonts/` | New bundled weights. | |

#### Spec 04: spec 04 Urdu dictionary (`04-urdu-dictionary.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `staffAppUrdu` | `frontend-mobile/src/i18n/staffAppTranslations.ts` | Urdu for every redesign string (232 entries). Lookup order: launchUrdu, urdu, staffAppUrdu, English. | adding keys to the shared `urdu` object |

New Urdu strings go here only. Use via `t()` / `translate()`; the shared `urdu` wins on key collision.

#### Spec 05: spec 05, format helpers (`05-format-helpers.md`)

All in `frontend-mobile/src/design/format.ts`. Pure, no React. `timeZone` is optional IANA (default device zone); `language` is `'en' | 'ur'` (type `FormatLanguage`). Urdu uses fixed name tables with Latin digits. Use these instead of ad hoc `Intl` or string maths in screens.

| Export | Purpose | Use instead of |
|---|---|---|
| `clock(value, tz?)` | "9:30 AM" (wraps `formatClockTime`, plain spaces) | `formatClockTime` directly |
| `timeRange(start, end, tz?)` | "9:30 – 11:00 AM" (shared suffix said once), "9:30 AM – 1:00 PM" | `formatTaskWindow` |
| `localDate(value, tz?)` | "YYYY-MM-DD" in that zone | `toISOString().slice(0,10)` |
| `shortDay(value, tz?, lang)` | "Tue, 10 Nov" / "منگل، 10 نومبر" | `formatShortDate` |
| `dayLabel(ymd, todayYmd, lang, t)` | Today / Yesterday / weekday, all through passed `t` | inline weekday logic |
| `dayMonth(ymd, lang)` | "9 Nov" / "9 نومبر" | — |
| `monthTitle('2026-11', lang)` | "November 2026" / "نومبر 2026" | — |
| `addMonths(ym, delta)`, `compareMonths(a, b)` | month arithmetic on "YYYY-MM"; comparator | — |
| `duration(minutes, lang)` | "8h 4m" / "8 گھنٹے 4 منٹ" (zero parts dropped) | — |
| `countdown(seconds)` | "4:32" | — |
| `minutesBetween(start, end)` | whole minutes | — |

Keys `t` must resolve for `dayLabel`: Today, Yesterday, Sunday..Saturday.

### Pure decisions

#### Spec 06: spec 06 task display state (`06-task-state.md`)

All in `frontend-mobile/src/design/taskState.ts`. Pure; imports only the `TaskInstance` type, so it is safe in `node:test` and in any layer. Use instead of `taskCardStatus` (`src/utils/taskStatus.ts`) on new screens, and instead of mapping task or History statuses to colours, icons or groups anywhere else.

| Export | Purpose | Use instead of |
|---|---|---|
| `TaskDisplayKind` | Union of the 11 kinds: `notStarted`, `inProgress`, `photosNeeded`, `retake`, `overdue`, `submitted`, `waitingForReview`, `verified`, `acceptedWithExceptions`, `missed`, `cancelled`. | status strings in screens |
| `taskDisplay(task)` | Kind of a task from today's feed (`status`, `verificationState`, `completionOutcome`). Never returns `verified`; overdue wins over any verification state. | `taskCardStatus`, `verificationTaskLabel` for status display |
| `historyDisplay(status)` | Kind of a History item (`MISSED`, `VERIFIED`, `ACCEPTED_WITH_EXCEPTIONS`, `WAITING_FOR_REVIEW`, `SUBMITTED`). | a second History status mapping |
| `HistoryItemStatus` | The five History statuses, structurally equal to spec 10's `TaskHistoryStatus`. | — |
| `displayFor(kind)` | Frozen `TaskDisplay`: `pillLabel` (English key or null), `pillTone` (`PillTone`), `marker` (`MarkerShape`), `markerTone` (colour token name for the marker fill: `canvas`, `blueWash`, `yellow`, `blue`, `ok`, `badWash`), `needsYou`, `open`, `hiddenLabel` ("Not started" when there is no pill). | per-component tone and icon tables (spec 20, 25) |
| `groupTodayTasks(tasks)` | `{ needsYou, toDo, done }` for the Tasks screen, each by `shiftStart` then `id`; in-progress work goes under `needsYou`. Generic, keeps the caller's task type. Does not reorder the input. | hand-written filters and sorts |
| `position(task, tasks)` | 1-based place in the day by `shiftStart` then `id` (the not-started marker number). Works when `task` is not in `tasks`. | `index + 1` from an unsorted list |
| `compareByStart(a, b)` | Day order comparator (instant of `shiftStart`, then `id`). | ad hoc `sort` callbacks |
| Types `TaskDisplay`, `PillTone`, `MarkerShape`, `MarkerTone`, `FeedTask`, `OrderedTask`, `GroupableTask`, `TodayGroups` | Shapes for consumers. | local copies |

Every `pillLabel` and the `hiddenLabel` already has Urdu in `translations.ts` or `staffAppTranslations.ts`.

#### Spec 08: spec 08 photo row state (`08-photo-row-state.md`)

All in `frontend-mobile/src/verification/photoRowState.ts`. Pure; imports only `checkedPhotoState` from `policy.ts` and the `PillTone` type, so it is safe in `node:test` and any layer. Use instead of `statusLabel` (`presentation.ts`) or `photoFeedback` (`feedback.ts`) for labels, tones and icons on redesigned photo screens.

| Export | Purpose | Use instead of |
|---|---|---|
| `photoRow(state)` | Frozen `PhotoRow` `{ kind, label, tone, icon, done, needsYou, spinning }` for a `photoStatuses()` state (queue or server). `label` is an English key for `t()`. `done` comes from `checkedPhotoState`; no queue state is ever `uploaded` or done; `SERVICE_FAILURE` is `review` and done. | per-screen state-to-pill tables (specs 35, 45) |
| `photoSummary(photos)` | `{ total, done, needsYou, sending, checking }` from `{ state }` entries; drives "{n} of {t} photos done". | hand counts over `photoStatuses()` |
| `nextPhotoAction(photos)` | `{ action, index }`: `submit` (non-empty, all done, index null), `waitUpload` (only sending/checking open), then first `clean`, `retake`, `uploadAgain`, else `next`. Index is into the input array. | dock decisions written in screens |
| Types `PhotoRowKind`, `PhotoRowIcon`, `PhotoRowTone`, `PhotoRow`, `PhotoSummary`, `PhotoAction`, `NextPhotoAction` | Shapes for consumers. `PhotoRowIcon` maps to lucide `LoaderCircle`, `CloudUpload`, `Hourglass`, `Check`, `Minus`, `Camera`, `Droplet`. | local copies |

#### Spec 15: spec 15 My day next-step decision (`15-now-state.md`)

All in `frontend-mobile/src/screens/day/nowState.ts`. Pure; no React or React Native. Use instead of `buildAttendanceViewModel` and the `nextTask` sort in `HomeScreen.tsx`, and instead of deciding the My day sentence or button anywhere else.

| Export | Purpose | Use instead of |
|---|---|---|
| `nowState(input)` | `{ tone, title, sub, rail, action, wait }` from `{ hasLocation, record, tasks, now, online, failed, photosAvailable, timeZone? }`. `record` is `getRelevantAttendanceRecord(...)`; `tasks` today's feed. First matching rule wins (spec 15). `online` never changes the result. | `buildAttendanceViewModel`, ad hoc next-task logic |
| `NowState`, `NowTone` (`blue`, `quiet`, `bad`, `ok`) | Result shape and top colour. | local copies |
| `NowText` `{ key, values, name? }` | English key for `t(key, values)`; `values` hold every placeholder already formatted (times via `clock`), entered names included; `name` repeats the entered name (area in titles as `{area}`, place or task title in subs) for `LabeledName` / Urdu line splitting. | final strings |
| `NowRail` `{ checkedInAt: Date, checkOutAt: Date, progress }` | Present only in the checked-in state; `checkOutAt` is `getRecommendedCheckoutAt`; `progress` 0..1 of `expectedStart`..`expectedEnd`. Format with `clock`. | — |
| `NowAction` `{ kind, taskId? }`, `NowActionKind` | `checkIn`, `checkInLate`, `checkOut`, `completeCheckOut`, `startCleaning`, `takePhotos`, `retakePhoto`, `retry`; `taskId` on task kinds. | — |
| `wait` `{ key: "Check-out opens at {time}", values }` or null | Dock's static status when checked in with no open work before check-out time. | — |
| `NowTask`, `NowInput` | Input types (a task needs `id`, `title`, `status`, `shiftStart`, `shiftEnd`; optional `verificationState`, `completionOutcome`, `areaNameSnapshot`, `location`). | — |

Every key it returns already has Urdu (`staffAppTranslations.ts`, `translations.ts` or `launchTranslations.ts`).

### Navigation

#### Spec 07: spec 07, navigation contract (`07-navigation-contract.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `tabRoutes` | `frontend-mobile/src/navigation/routeNames.ts` | Checked tab names: `myDay` → `Shift`, `tasks` → `Tasks`, `history` → `History`, `profile` → `Profile` | string literals in `navigate()` |
| `stackRoutes` | same | Checked stack names: `login`, `staffTabs`, `taskDetail`, `startTask`, `verification`, `helpGuide`, `taskAlerts`, `changePassword`, `historyTask` | string literals in `navigate()` |
| `TabRouteName`, `StackRouteName` | same | Union types of the values above | hand-written unions |
| Param lists | `frontend-mobile/src/types.ts` | `StaffTabsParamList` gains `History`, `Profile` (`Help` stays until spec 48); `RootStackParamList` gains `TaskDetail {taskId}`, `HelpGuide`, `TaskAlerts`, `ChangePassword`, `HistoryTask {taskId, month}`; `StaffTabId` gains `History`, `Profile` | — |

`Shift` and `Tasks` must not be renamed: `notificationDestination` in `src/notifications/model.ts` returns them, and `routeNames.test.ts` pins that.

#### Spec 48: spec 48, navigation wiring (`48-navigation-wiring.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `StaffTabs` (unchanged export) | `frontend-mobile/src/navigation/StaffTabs.tsx` | Tab navigator: `Shift`, `Tasks`, `Profile` (mirrored order in Urdu, `initialRouteName` Shift, back returns to Shift); file-local `TabIcon` (62 by 32 pip) and `TabLabel` (`label` role). Spec 51 adds `History` to the file-local `tabs` list. | A second tab bar or per-screen tab styling |
| `AppNavigator` (unchanged export) | `frontend-mobile/src/navigation/AppNavigator.tsx` | Root stack with `SnackbarProvider` mounted around everything; registers `TaskDetail`, `HelpGuide`, `TaskAlerts`, `ChangePassword` (header hidden), `Verification`, `StartTask`, dev `SpatialDiagnostic`, `Login`; slide, fade under reduced motion. File-local `SessionRestore`, `ForcedPasswordChange`, `useReduceMotion`. Spec 51 registers `HistoryTask` here. | Mounting another `SnackbarProvider`; hiding headers screen by screen for new routes |

`useSnackbar().show` now works on every screen. Test: `frontend-mobile/tests/screens/navigation.test.mjs` (13 tests) shows how to stand in `createBottomTabNavigator` / `createNativeStackNavigator` with plain elements that keep each screen's name and options and render probe screens.

#### Spec 54: spec 54 (`54-fix-return-to-my-day.md`)

- Return to the existing My day from a stacked screen: `navigation.popTo(stackRoutes.staffTabs, { screen: tabRoutes.myDay })` (React Navigation 7: `navigate` pushes a second `StaffTabs`).
- From outside a screen (phone alerts): `staffNavigation.dispatch(StackActions.popTo("StaffTabs", { screen }))`.

### Queries and client contract

#### Spec 09: Spec 09: profile query (`09-profile-query.md`)

- `StaffProfile` type, `parseStaffProfile(value)` (returns null for a malformed body, keeps nulls, drops unknown fields), `fetchStaffProfile(http, signal)` (calls `/staff/profile/me` and parses the envelope), `profileQueryKey(staffId)` (`['staff', staffId, 'profile']`), `useStaffProfileQuery(staffId, enabled)` (5 minute stale time). Path: `frontend-mobile/src/queries/profile.ts`. Use these for the staff's own profile details instead of calling the endpoint again.

#### Spec 10: spec 10, history client contract (`10-history-client-contract.md`)

Types in `frontend-mobile/src/history/types.ts`, parsers in `frontend-mobile/src/history/parse.ts`. Pure, no React, no HTTP. Parsers take the envelope's inner `data`. Use these for every Part 2 response (`/staff/mobile/history`, `/attendance/month`, `/profile`) instead of casting the body.

| Export | Purpose | Use instead of |
|---|---|---|
| `TaskHistoryItem`, `TaskHistoryPage`, `TaskHistoryCounts`, `HistoryRange`, `NamedLocation` | `GET /history` shapes, field for field from `ARCHITECTURE.md#api` | ad hoc row types in history screens |
| `TaskHistoryStatus` + `TASK_HISTORY_STATUSES`, `ReviewState` + `REVIEW_STATES`, `HistoryFilter` + `HISTORY_FILTERS` | closed string unions with their runtime lists (filter chips, exhaustive switches) | string literals typed inline |
| `AttendanceMonth`, `AttendanceMonthRecord`, `AttendanceMonthCounts`, `AttendanceDayState` + `ATTENDANCE_DAY_STATES` | `GET /attendance/month` shapes (no image fields exist) | `AttendanceRecord` from `src/types.ts` for history views |
| `ProfileSummary`, `ProfileMonthFigures` | `GET /profile` shape (company, location, usual shift, manager, month figures) | `StaffProfile` (spec 09) when the screen needs these extra figures |
| `parseTaskHistoryPage(value)` → `ParsedTaskHistoryPage \| null` | page with `dropped` count; null if not an object or `month`, `timezone`, `range`, `counts`, `items` missing/malformed or `nextCursor` has a wrong type; absent `nextCursor` is null | casting `response.data.data` |
| `parseAttendanceMonth(value)` → `ParsedAttendanceMonth \| null` | month with `dropped` count; same page rules with `records` | casting |
| `parseProfileSummary(value)` → `ProfileSummary \| null` | null if any required part is missing or malformed; absent `phone`, `location`, `usualShift`, `manager` become null | casting |
| `parseTaskHistoryItem(value)`, `parseAttendanceMonthRecord(value)` | one row or null (used by the page parsers; reuse for a single-task view) | — |

Rules every parser follows: unknown fields are never copied; unknown `status`, `reviewState` or `state` drops the row; months match `YYYY-MM`, dates `YYYY-MM-DD`, instants must parse as dates, shift clock `HH:mm`; ids are positive integers, counts non-negative integers.

#### Spec 17: Spec 17: history queries (`17-history-queries.md`)

All in `frontend-mobile/src/queries/history.ts`.

- `fetchTaskHistory(http, { month, filter, cursor }, signal)`, `fetchAttendanceMonth(http, month, signal)`, `fetchProfileSummary(http, signal)`: client-injected fetchers for the Part 2 endpoints; unwrap `data`, parse with spec 10, throw `HistoryUnavailableError` ("History is unavailable. Try again.") on a null parse or a 404. Use instead of calling the endpoints directly.
- `historyKeys.tasks/attendance/profile`: query keys under `['staff', staffId, ...]`.
- `useTaskHistory(staffId, month, filter, enabled)` (infinite), `useAttendanceMonth(staffId, month, enabled)`, `useProfileSummary(staffId, enabled)`: cached hooks (60 s, 60 s, 5 min stale; retry once).
- `shouldRetry(failureCount, error)`: false for a 404, true once for other errors.
- `flattenHistoryPages(data)`: flatten infinite pages, de-duplicated by id. Use instead of `flattenTaskPages` for history.
- `taskHistoryOptions(...)`, `HistoryUnavailableError`, `HISTORY_UNAVAILABLE_MESSAGE`.

### Server read models and routes (backend)

#### Spec 11: spec 11 staff task history service (`11-history-service.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `staffMonthContext(actor, monthInput, now, db)` | `backend/src/services/mobile/staffMonth.ts` | Staff-only, tenant-scoped active staff read (same guard as `staffMobileTasks`) plus month resolution: timezone (location, else `Asia/Karachi`), `range { earliestMonth, latestMonth }`, validated `month` (default latest) and UTC `start`/`end` from `getZonedMonthRange`. Returns `{ staff, timezone, month, range, start, end }`; `staff` carries `id`, `companyId`, `createdAt`, `locationId`, `location { id, name, timezone, isActive }`. Errors: 403 `Staff account required`, 403 `Active staff account required`, 400 `Choose a month from your history`. | a second month validator or staff guard in specs 12 and 13 |
| `StaffMonthDb`, `StaffMonthContext`, `StaffMonthRange` | same file | Types for a fake `db` (`Pick<typeof prisma, 'staff'>`) and the returned context. | hand-written types |
| `STAFF_FALLBACK_TIME_ZONE`, `STAFF_HISTORY_MONTHS_BACK`, `STAFF_MONTH_ERROR` | same file | `'Asia/Karachi'`, `12`, the 400 message. | literals |
| `staffTaskHistory(actor, input, now, db)` | `backend/src/services/mobile/staffHistory.service.ts` | Read model for `GET /history`: Zod-parsed `month`, `filter`, `cursor`, `limit`; returns `{ month, timezone, range, counts, items, nextCursor }` with no envelope (the route in spec 18 adds it). | query logic in the route |
| `classifyHistoryTask(task, actorId)` | same file | Pure status and `reviewState` rule from `ARCHITECTURE.md#api`, from the actor's point of view; null for open or not-the-actor's work. | re-deriving history status elsewhere |
| `HISTORY_FILTERS`, `HISTORY_ASSIGNMENT_STATUSES`, types `HistoryFilter`, `TaskHistoryStatus`, `ReviewState`, `StaffHistoryDb` | same file | Shared literals and types for the route's query parsing and tests. | string literals |

Test pattern: `vi.mock('../../prisma/prisma.js')` with a hoisted fake `{ staff: { findFirst }, taskInstance: { findMany } }`; see `staffHistory.service.test.ts`.

#### Spec 12: spec 12 staff attendance month service (`12-attendance-month-service.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `staffAttendanceMonth(actor, input, now, db)` | `backend/src/services/mobile/staffAttendanceMonth.service.ts` | Read model for `GET /attendance/month`: Zod-parsed optional `month`, month context from `staffMonthContext`, one tenant- and actor-scoped `attendance.findMany` (same guard as `getStaffSelfAttendance`). Returns `{ month, timezone, range, counts, records }` with no envelope (the route in spec 18 adds it); records newest first. Never selects or returns `checkInImage`/`checkOutImage`. | attendance query logic in the route |
| `classifyAttendanceDay(row, now)` | same file | Pure per-day `state` from `ARCHITECTURE.md#api` (first match wins); a started shift with no check-in yet is `UPCOMING`. | re-deriving attendance day state elsewhere |
| `hasLateCheckIn(row)` | same file | True when a check-in exists and `isLateCheckIn` or status `LATE`. | ad-hoc late checks |
| `attendanceMonthSelect` | same file | The photo-free attendance `select`. | a hand-written select that might pull image fields |
| `ATTENDANCE_DAY_STATES`, types `AttendanceDayState`, `AttendanceMonthCounts`, `StaffAttendanceMonthDb` | same file | Shared literals and types for the route and tests. | string literals |

Test pattern: `vi.mock('../../prisma/prisma.js')` with a hoisted fake `{ staff: { findFirst }, attendance: { findMany } }`; see `staffAttendanceMonth.service.test.ts`.

#### Spec 13: spec 13 staff profile summary service (`13-profile-summary-service.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `staffProfileSummary(actor, now, db)` | `backend/src/services/mobile/staffProfileSummary.service.ts` | Read model for `GET /profile`: role check before any read, month context from `staffMonthContext` (current month), the actor's staff row with the `getStaffSelfProfile` guard, the location's active same-company manager name through `ManagerLocation`, `usualShift` as `HH:mm` in the location timezone (else `Asia/Karachi`), and five month `count` queries (shifts scheduled/attended/on time, tasks assigned/submitted). Returns the `ARCHITECTURE.md#api` object with no envelope (the route in spec 18 adds it). | profile query logic in the route; extending `GET /api/staff/profile/me` |
| `profileSummaryStaffSelect` | same file | The credential-free staff `select` (with `company.name` and location `id`, `name`, `address`, `timezone`, `isActive`). | a hand-written staff select that might pull `password` or tokens |
| types `StaffProfileSummary`, `StaffProfileMonth`, `StaffProfileSummaryDb` | same file | Response and fake-db types for the route and tests. | re-declared shapes |

Test pattern: `vi.mock('../../prisma/prisma.js')` with a hoisted fake `{ staff: { findFirst }, managerLocation: { findFirst }, attendance: { count }, taskInstance: { count } }`; `staff.findFirst` answers by `select` (the profile read selects `name`, the month-context read does not). See `staffProfileSummary.service.test.ts`.

#### Spec 18: spec 18 staff history, attendance month and profile routes (`18-staff-routes.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `GET /api/staff/mobile/history` | `backend/src/routes/staffMobile.route.ts` | Staff-only route over `staffTaskHistory(req.user, req.query)`; `{ success: true, data }`, `Cache-Control: private, no-store`. | a second history endpoint |
| `GET /api/staff/mobile/attendance/month` | same file | Staff-only route over `staffAttendanceMonth(req.user, req.query)`; literal path registered after `/attendance`, before any parameterised `/attendance/:x`. Same envelope and header. | a second attendance month endpoint |
| `GET /api/staff/mobile/profile` | same file | Staff-only route over `staffProfileSummary(req.user)`; same envelope and header. | a second profile endpoint |

Test pattern: `backend/src/routes/staffMobile.route.test.ts` mounts only this router on a local Express app, signs a token with a test secret, mocks the Prisma principal lookup and every staff mobile service, and calls with `fetch`. Extend it for any new route on this router.

### Shared design parts (`src/design/`)

#### Spec 14: spec 14, text roles and name lines (`14-staff-text.md`)

All in `frontend-mobile/src/design/StaffText.tsx`. Use instead of `components/ui/text.tsx` (legacy `Text`), hand-set `fontFamily` / `fontSize` / `lineHeight`, and inline isolate characters.

| Export | Purpose | Use instead of |
|---|---|---|
| `StaffText` | Role-based text. Props: `role` (key of `tokens.type`), `color` (key of `tokens.colors`, default `ink`), `align` (`start` / `center` / `end`, start = right in Urdu), `numberOfLines` (defaults to the role's `maxLines`), `compact` (compact sizes for `nowTitle`, `nowTitleLong`), `translate` (default true; plain string children go through `t()`), `accessibilityRole`, `accessibilityLiveRegion`, `accessibilityLabel`, `testID`, `style` (layout only). Size and line height from `tokens.type[role][language]` (narrow sizes below 375 wide where the role has them); face from `fontFor`; a Latin-only string in Urdu keeps the English face and English line height; `input` and `badge` keep the Latin face in Urdu; tabular figures on every role; font scaling on, capped at 1.4 for `action`, `label`, `badge`, `calendarHead`; system face with a matching weight before fonts load. | legacy `Text`, raw text styles |
| `StaffTextProps`, `StaffTextAlign`, `StaffTextLayoutStyle` | Prop types for wrappers (buttons, pills). | local copies |
| `NameLine({ role, color, name, numberOfLines?, compact? })` | An entered name on its own line, never translated, wrapped in U+2068 … U+2069, aligned to start. | `StaffText translate={false}` with a hand-built isolate |
| `LabeledName({ role, color, labelKey, name, values?, compact? })` | Label with an `{area}` name. English: one text with the isolated name filled in ("Next: Lobby"). Urdu: the translated label without the placeholder (colon kept), then a `NameLine` below. Other placeholders fill from `values`. | putting an entered name inside an Urdu sentence |
| `isolate(text)` | Wraps text in U+2068 / U+2069 for a time, number or name inside a sentence. | string concatenation with raw names |

Test: `frontend-mobile/tests/design/staffText.test.mjs` (16 tests) shows how to assert role styles through the harness (`StyleSheet.flatten(node.props.style)`).

#### Spec 19: spec 19, action button and dock (`19-action-button.md`)

All in `frontend-mobile/src/design/ActionButton.tsx`. Use instead of `components/ui/button.tsx` and hand-built yellow or blue buttons.

| Export | Purpose | Use instead of |
|---|---|---|
| `ActionButton({ kind, label, icon?, onPress, busy?, accessibilityLabel?, haptic? })` | `kind` is `next` (yellow, light haptic), `form` (blue), `outline`, `ghost` (52 high, no fill) or `danger`. Label is an English key; icon is a Lucide name. Scale to 0.97 on press (none under reduced motion). `busy` swaps the icon for a spinner, ignores presses, reports `accessibilityState.busy`. No `disabled` prop by design. Row reverses in Urdu. | `components/ui/button.tsx`, raw `Pressable` buttons |
| `ActionDock({ hint?, withSafeArea?, children })` | White bottom area with top hairline, `dockPad*` padding (plus bottom inset when `withSafeArea`), optional muted centred hint above the child. | custom footers |
| `DockStatus({ label, icon?, onPress? })` | Non-pressable `canvas` block, muted label, polite live region. Shown instead of an unavailable action (offline, waiting, check-out not open yet). | a disabled button |
| `ActionButtonProps`, `ActionKind`, `ActionDockProps`, `DockStatusProps` | Types. | local copies |

Test: `frontend-mobile/tests/design/actionButton.test.mjs` (9 tests). It mocks `/components/ui/icon` with a stub element because lucide-react-native pulls in react-native-svg, which does not load under node.

#### Spec 20: spec 20, pill, status marker and avatar (`20-status-parts.md`)

All in `frontend-mobile/src/design/`. Presentational only. Tone and marker choice come from `displayFor` (taskState.ts); do not map statuses again.

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `Pill({ tone, label, icon?, spinning? })` | `src/design/Pill.tsx` | Eight-tone status pill (`neutral`, `blue`, `green`, `needsYou`, `needsYouSoft`, `red`, `late`, `warn` with 1.5 outline). `label` is an English key; one line; `row-reverse` and 9 padding in Urdu; icon 14, `spinning` rotates it (static under reduced motion). | Hand-built badges, `StatusBadge`-style pills |
| `PillToneName`, `pillTones` | `src/design/Pill.tsx` | Tone name union and its fill/text token table. | Local tone tables |
| `StatusMarker({ marker, tone, position?, hiddenLabel? })` | `src/design/StatusMarker.tsx` | 34 round filled marker (position number, Droplets, Camera, Clock, Check, CheckCheck, X at 18). Marker is `accessibilityElementsHidden`; `hiddenLabel` (English key) is a sibling visually hidden text. Pass `d.marker`, `d.markerTone`, `d.hiddenLabel` from `displayFor`. | Checkbox-like squares, per-screen status icons |
| `markerGlyph` | `src/design/StatusMarker.tsx` | Glyph colour token for each marker fill. | Local colour maps |
| `Avatar({ size? })`, `AvatarSize` | `src/design/Avatar.tsx` | Round default avatar (44, 38 or 76): `UserRound` at 56% in `tintFg` on `tintBg`, no initials, not accessible. | Initials circles, photos |

Test: `frontend-mobile/tests/design/statusParts.test.mjs` (20 tests). Stands in a plain `Icon` element via `installMocks({ '/components/ui/icon': ... })` because lucide needs react-native-svg.

#### Spec 21: spec 21, top bar and toggles (`21-top-bar-and-toggles.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `TopBar` | `frontend-mobile/src/design/TopBar.tsx` | 56 high back button + one-line `barTitle`; props `title`, `translateTitle`, `onBack`, `backLabel`, `trailing`, `withSafeArea`; arrow mirrors in Urdu. | Per-screen headers and back buttons |
| `SegmentedControl` | `frontend-mobile/src/design/SegmentedControl.tsx` | Tablist of 44 high segments (`options`, `value`, `onChange`, `accessibilityLabel`); order reverses in Urdu. | Hand-made tab or toggle rows |
| `LanguageToggle` | `frontend-mobile/src/design/LanguageToggle.tsx` | English / اردو switch, `appearance` `onBlue` or `onWhite`, calls `setLanguage`. | `components/LanguageChoice.tsx` (removed in spec 49) |

#### Spec 22: spec 22, text field (`22-field.md`)

In `frontend-mobile/src/design/Field.tsx`. Use instead of `components/ui/input.tsx` with a hand-built label and error line.

| Export | Purpose | Use instead of |
|---|---|---|
| `Field({ label, value, onChangeText, kind?, placeholder?, error?, editable?, autoFocus?, returnKeyType?, onSubmitEditing?, maxLength?, accessibilityLabel?, testID? })` | 60 high labelled box (`fieldLabel` above). `kind`: `email`, `password`, `code`, `url`, `text`; sets keyboard, no autocapitalise/autocorrect; `password` and `code` are secure with a 44 eye toggle ("Show password"/"Hide password") and a 128 maxLength default. Border 1.5 `lineStrong`, 2 `blue` focused, 2 `bad` with an inline `CircleAlert` error (polite live region). Input always left-to-right, right-aligned in Urdu. | `components/ui/input.tsx` in forms |
| `FieldProps`, `FieldKind` | Types. | local copies |

Test: `frontend-mobile/tests/design/field.test.mjs` (8 tests). "Hide password" lacks an Urdu key (spec 49).

#### Spec 23: spec 23, bottom sheet and sign-out dialog (`23-bottom-sheet.md`)

Both in `frontend-mobile/src/design/`. Presentational only; the content of each sheet belongs to the screen specs (31, 34, 42, 45, 46). Both render nothing while `visible` is false.

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `BottomSheet({ visible, onDismiss?, glyph?, glyphTone?, title, body?, actions?, children?, haptic? })` | `src/design/BottomSheet.tsx` | The one sheet for problems and choices. `title` / `body` are English keys (translated) or prepared nodes; `glyph` a Lucide name in a 50 tile, `glyphTone` `needsYou` (default), `red`, `blue`, `green`; `actions` are `ActionButton` elements stacked 8 apart (keys added for you); `children` sit between heading and actions. Leave out `onDismiss` for a decision the person must make: back does nothing and the scrim is inert. `haptic: 'warning'` fires one warning notification per opening. Modal, scrim, slide (fade under reduced motion), safe-area bottom padding and modal accessibility are handled. | `Alert.alert`, hand-built modals or overlays |
| `SheetGlyphTone`, `BottomSheetProps` | `src/design/BottomSheet.tsx` | Types. | local copies |
| `useFocusOnOpen(visible, delay)` | `src/design/BottomSheet.tsx` | Returns a `View` ref; moves screen-reader focus to it `delay` ms after `visible` turns true. Put it on an `accessible` header view. | hand-written `sendAccessibilityEvent` timers |
| `ConfirmDialog({ visible, title, body?, confirmLabel, cancelLabel?, destructive?, onConfirm, onCancel })` | `src/design/ConfirmDialog.tsx` | Centred card for sign out only. English keys; `cancelLabel` defaults to "Cancel"; destructive confirm in `bad`; Android back calls `onCancel`; buttons right-aligned, left in Urdu. | `Alert.alert` confirmations |
| `ConfirmDialogProps` | `src/design/ConfirmDialog.tsx` | Type. | local copy |

Test: `frontend-mobile/tests/design/bottomSheet.test.mjs` (12 tests). Shows how to override Reanimated in the harness (`useReducedMotion` toggled per test, `withTiming` recording its config) to assert motion, and how to call a `Modal`'s `onRequestClose` to simulate Android back.

#### Spec 24: spec 24, feedback states (`24-feedback-states.md`)

All in `frontend-mobile/src/design/Feedback.tsx`.

| Export | Purpose | Use instead of |
|---|---|---|
| `SnackbarProvider` / `useSnackbar()` | `show(englishKey, values?)` shows an ink message bar with a yellow check for 2.2 s; a new message replaces the old one. Outside a provider `show` is a no-op. Provider is mounted in spec 48. | `Alert`, ad-hoc toasts, notice strings |
| `useOnline()` | Online rule `isConnected !== false && isInternetReachable !== false` via NetInfo. | local `NetInfo.addEventListener` copies |
| `OfflineBanner` | No props. `night2` bar with WifiOff and two lines; nothing when online. | hand-built offline notices |
| `Skeleton({ width?, height, radius?, tone? })` | Flat placeholder block (`onWhite` line colour, `onBlue` translucent white). No shimmer. | spinners, loading text |
| `EmptyState({ icon, title, body?, action? })` | 88 `blueWash` glyph tile, centred title and muted body, optional ActionButton. | custom empty views |
| `ErrorState({ title?, body?, onRetry })` | EmptyState with default copy and an outline "Try again" button. | custom error views |

Test: `frontend-mobile/tests/design/feedback.test.mjs` (9 tests); mocks `/components/ui/icon` and `@react-native-community/netinfo`.

#### Spec 25: spec 25, task row (`25-task-row.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `TaskRow({ name, kind, position?, start, end, timeZone?, onPress, compact?, separator? })` | `frontend-mobile/src/design/TaskRow.tsx` | One list row for My day, Tasks and History: round marker, entered name (2 lines max), pill (when the kind has one) and `timeRange`, chevron (hidden below 375, mirrored in Urdu), hairline separator after the marker, `soft` when pressed. One button labelled "{name}, {status}, {time}". `kind` comes from `taskDisplay` / `historyDisplay`. | Hand-built task cards, `taskCardStatus` rows |
| `TaskRowProps` | same | Prop type | local copies |

Test: `frontend-mobile/tests/design/taskRow.test.mjs` (10 tests).

#### Spec 26: spec 26, receipt layout (`26-moment.md`)

In `frontend-mobile/src/design/Moment.tsx`.

| Export | Purpose | Use instead of |
|---|---|---|
| `Moment({ badge, icon?, title, subtitle?, pill?, facts?, action?, live? })` | Centred receipt: 96 badge (`blue`/`green`) with animated tick (or a static Lucide `icon`), `moment` title, subtitle, optional `Pill`, white fact table, borderless dock for an `ActionButton`. One success haptic on mount; entrance animation skipped under reduced motion. `facts[].value` is untranslated (entered names); use `valueNode` for prepared nodes. | hand-built success screens |
| `MomentProps`, `MomentFact` | Types. | local copies |

Test: `frontend-mobile/tests/design/moment.test.mjs` (stubs `react-native-svg` and adds `useAnimatedProps` to the reanimated mock).

### My day and attendance

#### Spec 16: spec 16, check-in and check-out action hook (`16-attendance-action.md`)

All in `frontend-mobile/src/screens/day/useAttendanceAction.ts`. Use instead of `handleAttendanceAction` / `submitAttendanceSelfie` in `HomeScreen.tsx` (spec 46 switches over), and instead of calling `readAttendance`, `reconcileAttendance`, `currentLocation` or `uploadFormData('/attendance/...')` from a screen.

| Export | Purpose | Use instead of |
|---|---|---|
| `useAttendanceAction({ staffId, records, now, online })` | Returns `{ phase, mode, result, error, accuracyMeters, start(mode), retryLocation(), continueAnyway(), cancel(), submitSelfie(uri) }`. Same calls in the same order as the old screen; no `Alert`, every old prompt is a phase. | the two HomeScreen functions and their Alerts |
| `AttendanceActionPhase`, `AttendanceActionMode` (`'check-in' \| 'check-out'`), `AttendanceActionResult` (`{ mode, at, late }`), `UseAttendanceActionInput` | Types for screens (spec 31, 46). | local unions |
| `WEAK_SIGNAL_METERS` (50) | Accuracy threshold for `weakSignal`. | the literal 50 |
| `attendanceErrorMessage(error, fallback)` | `ERR_NETWORK` → "Internet needed to continue", else server message, else `error.message`, else fallback. | inline message picking |

`error` is an English key or the server's own message, never pre-translated: render it through `t()` / `StaffText`.

##### Phases

| Phase | Entered when | Leaves by |
|---|---|---|
| `idle` | Mount, `cancel()` (from any phase except `saving`) | `start` |
| `checkingServer` | `start(mode)` online with a relevant record: `readAttendance` → `attendanceResult` → `setQueryData(attendance)`; then camera and location permission requests | `done` if already recorded, `needsPermission`, `locating`, `error` |
| `needsPermission` | Camera refused (`error` "Allow camera access to capture an attendance image.") or location refused (`error` "Allow location access to mark attendance."); camera asked first | `start` again (after Settings), `cancel` |
| `locating` | Permissions granted, or `retryLocation()`: `currentLocation` over `watchPositionAsync({ accuracy: Highest, timeInterval: 1000, distanceInterval: 0 })` | `weakSignal`, `selfie`, `error` |
| `weakSignal` | Fix accuracy > 50 m; `accuracyMeters` holds it | `retryLocation` → `locating`, `continueAnyway` → `selfie`, `cancel` |
| `notAtLocation` | Never entered today: the server's geofence rejection is a 400 with only a message, no code. It arrives as `error` with that message. Reserved for when the server adds a code. | — |
| `selfie` | Location accepted; `accuracyMeters` holds it | `submitSelfie(uri)`, `cancel` |
| `saving` | `submitSelfie(uri)`: FormData `latitude`, `longitude`, `accuracy`, `image` (+ `attendanceId` for check-out), `reconcileAttendance(readAttendance, uploadFormData('/attendance/<mode>', form, 60000))`. `start` and `cancel` are ignored. | `done`, `error` |
| `done` | Server-confirmed record (already recorded, or reconciled upload, then both `staffQueryKeys.attendance` and `tasksToday` invalidated). `result` = `{ mode, at: checkInTime or checkOutTime, late: status === 'LATE' }` | `start`, `cancel` → `idle` |
| `error` | Offline ("Internet needed to continue", nothing called), no record ("Refresh to load your shift before continuing."), shift changed, location failure, upload failure (server message, or "Unable to check in." / "Unable to check out."), unconfirmed upload | `start` again (re-reads the server first), `cancel` |

Busy (a new `start` is ignored): `checkingServer`, `locating`, `weakSignal`, `selfie`, `saving`. A cancelled or unmounted run never changes state when its awaited call returns.

Test: `frontend-mobile/tests/day/attendanceAction.test.mjs` (19 tests) shows how to drive a hook through the harness with a probe component and boundary mocks.

#### Spec 29: spec 29, My day top area (`29-day-header.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `DayHeader({ state, firstName, today, timeZone?, onAvatarPress, loading? })` | `frontend-mobile/src/screens/day/DayHeader.tsx` | My day coloured top: background from `state.tone` (`blue`, `night2`, `badDeep`, `ok`) including the top safe-area inset, faint decorative tick (mirrored in Urdu), greeting row (pressable avatar labelled "Profile", "Salaam, {name}", short date before check-in, `LanguageToggle onBlue`), the `nowState` title and sub, the shift rail when `state.rail` exists, and blue skeletons while `loading`. The sentence fades up when the title changes (fade only under reduced motion). Bottom padding 46 (32 compact); the work sheet (spec 30) overlaps it by 26. | Hand-built My day tops, `buildAttendanceViewModel` rendering in `HomeScreen.tsx` |
| `DayHeaderProps` | same | Prop type. | local copies |

Urdu sub lines: for the three `nowState` subs that carry an entered name (`Your shift starts at {time} at {place}.`, `Take a selfie at {place}. Keep location on.`, `{title}. Finish by {time}.`) the header shows the shorter sentence (`Your shift starts at {time}.`, `Take a selfie at your location. Keep location on.`, `Finish by {time}.`) and the name on its own line, as the design does (place after with a map pin, task title first). Any other sub with a name is one sentence with the name isolated.

Test: `frontend-mobile/tests/day/dayHeader.test.mjs` (12 tests). Stubs `/components/ui/icon`, overrides `/i18n/LanguageProvider` with the real `translate` (placeholder values), and overrides reanimated `withTiming` / `useReducedMotion` to assert the sentence motion. Rerender with `r.update(...)` inside `NativeFontsReady.Provider`, or the tree remounts.

#### Spec 30: spec 30, today's work sheet (`30-today-work.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `TodayWork({ tasks, counts?, compact?, onOpenTask, onSeeAll, loading? })` | `frontend-mobile/src/screens/day/TodayWork.tsx` | White sheet (radius 28, overlaps the top area by 26) with "Today's work", "{n} of {t} submitted" (feed `counts` win when present), a tick strip, up to three `TaskRow`s (open tasks by time, else the first three) and a "See all tasks" link. Empty: short blank sheet. `loading`: four skeleton rows. | Hand-built My day task lists |
| `segmentTones(kinds)` | same | Tick strip tones (`green` `blue` `yellow` `half` `plain`) from display kinds; one per task up to 12, then 12 proportional buckets showing the bucket's most attention-needing tone. | Local tone tables |
| `TodayWorkProps` | same | Prop type | local copies |

Test: `frontend-mobile/tests/day/todayWork.test.mjs` (10 tests). It overrides `/i18n/LanguageProvider` because the shared harness `t()` ignores placeholder values.

#### Spec 31: spec 31, check-in and check-out screens (`31-attendance-views.md`)

Presentational parts drawn from `useAttendanceAction` (spec 16). Wiring into My day is spec 46.

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `AttendanceLocating({ place, onBack })` | `frontend-mobile/src/screens/day/AttendanceLocating.tsx` | `canvas` page for phase `locating`: back button, 120 pin circle with the 1.5 s ring (none under reduced motion), "Finding your location…" live region, the place on its own line. | `ActivityIndicator` / "Finding location" notices |
| `AttendanceCamera({ mode, onCapture, onCancel })` | `frontend-mobile/src/components/AttendanceCamera.tsx` | Dark selfie camera for phase `selfie` / `saving`: close (labelled "Cancel"), title, oval face guide (svg, outside darkened), 80 shutter "Take selfie", "Opening camera…", busy card "Saving your attendance…" while `onCapture` runs, error in the bottom bar. Same guards as before (front camera, one capture, ready check, hardware back ignored while taking). | the old NativeWind camera screen |
| `AttendanceSheets({ phase, mode, error, accuracyMeters, place, start, retryLocation, continueAnyway, cancel })` | `frontend-mobile/src/screens/day/AttendanceSheets.tsx` | One `BottomSheet` for `weakSignal`, `notAtLocation` (reserved), `needsPermission` (opens settings, then cancels) and `error` with a mode ("Attendance not saved", server message, Try again = `start(mode)`). Renders nothing for other phases. Every dismiss calls `cancel`. Props match the hook's return, so `<AttendanceSheets {...action} place={place} />` works. | `Alert.alert` attendance prompts |
| `UnsubmittedWorkSheet({ count, onBack, onCheckOutAnyway, visible? })` | `frontend-mobile/src/screens/day/AttendanceSheets.tsx` | "{n} tasks are not submitted" sheet before check-out; back and dismiss call `onBack`. | the old "unsubmitted tasks" confirm |
| `AttendanceReceipt({ result, record, tasksSubmitted, tasksTotal, place, onDone, timeZone? })` | `frontend-mobile/src/screens/day/AttendanceReceipt.tsx` | `Moment` receipt for phase `done`: check-in (blue, On time / Late pill, Location, Shift) or check-out (green, Missed check-out pill only when the record is `MISSED_CHECKOUT`, In, Out, Time worked unless missed, Tasks submitted, Location). | hand-built success notices |
| `AttendanceSheetsProps`, `UnsubmittedWorkSheetProps`, `AttendanceReceiptProps`, `AttendanceLocatingProps` | same files | Prop types. | local copies |

Test: `frontend-mobile/tests/day/attendanceViews.test.mjs` (12 tests). Mocks `/ui/icon` (matches both `components/ui/icon` import styles), `react-native-svg` (with `Ellipse`) and overrides `/i18n/LanguageProvider` so `t(key, values)` fills placeholders (the default harness `t` ignores values). `tests/attendanceCamera.test.mjs` shows how to hand `CameraView` a fake ref target under the harness.

#### Spec 46: spec 46, My day screen (`46-my-day.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `HomeScreen` (unchanged export) | `frontend-mobile/src/screens/HomeScreen.tsx` | My day (`Shift` tab): composes `nowState`, `useAttendanceAction`, `DayHeader`, `TodayWork`, `AttendanceLocating`, `AttendanceSheets`, `UnsubmittedWorkSheet`, `AttendanceCamera`, `AttendanceReceipt`, `OfflineBanner` and the `ActionDock`. Nothing new exported. | — |

Patterns worth reusing (file-local, not exported):
- `ACTIONS`: `NowActionKind` to dock label key and Lucide icon (`Camera`, `LogOut`, `QrCode`, `RefreshCw`). If another screen needs it, move it next to `nowState` and export it.
- Check-out with open work: outline "Check out" under the task action once `getRecommendedCheckoutAt` has passed, opening `UnsubmittedWorkSheet`.
- Live sentence: `AccessibilityInfo.announceForAccessibility` when the `nowState` title changes.

Tests: `frontend-mobile/tests/screens/myDay.test.mjs` (18 tests) shows how to fix "now" with `mock.timers.enable({ apis: ['Date'] })` plus `process.env.TZ`, and how to stand in `useAttendanceAction` with `installMocks({ '/day/useAttendanceAction': ... })`. `frontend-mobile/tests/attendanceRecovery.test.mjs` (4 tests) drives the real screen and real hook on the shared harness.

### Screens

#### Spec 27: spec 27, launch recovery form (`27-launch-recovery.md`)

`frontend-mobile/src/launch/LaunchRecovery.tsx` (`LaunchRecovery({ handoff?, onComplete, onCancel? })`): access code (handoff) or current password replacement form built from `Field`, `StaffText` and `ActionButton`. Use instead of hand-built `Input` forms for password or code entry. Nothing new exported. Test: `frontend-mobile/tests/screens/launchRecovery.test.mjs` (8 tests; shows stubbing `./launchApi` through `installMocks`).

#### Spec 28: spec 28, sign in screen (`28-sign-in.md`)

`frontend-mobile/src/screens/LoginScreen.tsx` (`LoginScreen`): rebuilt from `Field`, `ActionButton`, `LanguageToggle`, `StaffText` and `LaunchRecovery`. Nothing new exported. Login failures and server-address errors now show inline (no `Alert`). Test: `frontend-mobile/tests/screens/signIn.test.mjs` (13 tests). It shows how to extend the harness `react-native` mock with `Keyboard` and `KeyboardAvoidingView`, mock the logo as `'/assets/hygene-ops-mark.png': 1`, and drive a live language switch with a `useSyncExternalStore` backed `/i18n/LanguageProvider` override.

#### Spec 32: spec 32, Tasks screen (`32-tasks-screen.md`)

No new reusable exports. `TasksScreen` (`frontend-mobile/src/screens/TasksScreen.tsx`, same export) is rebuilt from `groupTodayTasks`, `TaskRow`, `ActionDock`, `Feedback` parts. Pattern worth reusing: a screen dock that only navigates to My day (`tabRoutes.myDay`) for check-in and check-out.

Test: `frontend-mobile/tests/screens/tasks.test.mjs` (14 tests); stubs `/queries/staff`, netinfo, the icon module and the language provider (real `translate`).

#### Spec 33: spec 33, task details screen (`33-task-detail.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `StepPath({ current, allDone? })` | `frontend-mobile/src/design/StepPath.tsx` | Four steps (Scan QR, Clean, Photos, Submit) as numbered 34 circles joined by a 2 px line: done blue with a tick, current yellow, later `canvas`. `row-reverse` and mirrored lines in Urdu. Test ids `step-N-done/current/later`, `step-circle-N`, `step-line-N`. | hand-built progress steps |
| `stepPathSteps` | same | The four English step keys. | local copies |
| `TaskDetailScreen` | `frontend-mobile/src/screens/task/TaskDetailScreen.tsx` | Route `TaskDetail {taskId}`: task from today's feed (detail read when missing or without template), manifest read for "What to clean", notes, one dock button. Not routed until spec 48. | — |
| `stepFor(kind)` | same | Pure map from a `TaskDisplayKind` to `{ current, allDone }`. | local mappings |

Test: `frontend-mobile/tests/screens/taskDetail.test.mjs` (13 tests). Overrides `@tanstack/react-query` (`useQuery` by last key part, `useInfiniteQuery`, `infiniteQueryOptions`), `/components/ui/icon` and `/i18n/LanguageProvider`.

#### Spec 34: spec 34, scan the task QR and cleaning started (`34-qr-scan.md`)

Everything lives in `frontend-mobile/src/screens/StartTaskScreen.tsx`; nothing new is exported. The parts below are file-local. If a later spec needs one, move it to `src/design/` and export it there, then delete the local copy.

| Part | Purpose | Use instead of |
|---|---|---|
| `StartTaskScreen` (screen) | Three states: dark scanner (pending, verification version 2), `BottomSheet` for wrong or failed scans, white "Cleaning started" page with the `Cleaning is finished` dock. Same logic as before: task query, camera permission asked once, 350 ms mount delay, 4 s ready check, `AppState` pause, `inFlight` guard, `startCleaning`, `restart()`, web message, version 1 inventory message. Hides the stack header with `navigation.setOptions({ headerShown: false })`. | — |
| `isWrongTaskQr(failure)` (local) | True when the server's error envelope has `errors[].code === 'AREA_QR_MISMATCH'` (sent by the start route in `backend/src/controllers/taskInstance.controller.ts`). `verificationErrorMessage` cannot tell this case apart. | message text matching |
| `Viewfinder` (local) | 236 square with four white rounded corners and a yellow 3 px scan line (`withRepeat` over `motion.duration.scanLine`, reversing; static in the middle under reduced motion). The spec 45 photo camera does not need it. | — |
| `CameraButton` (local) | 48 round `cameraButton` button for the camera top; `on` fills it `yellow` and sets `accessibilityState.selected`. Same look as the close button in `AttendanceCamera`. | hand-built round camera buttons |
| `AreaSentence` (local) | English: one sentence with `{area}` isolated. Urdu: a separate label key (`Find the code for this task:` or `…, then scan again:`) and then the area on its own line through `NameLine`. Use it when the Urdu label is worded differently from the English template, which `LabeledName` does not support. | `LabeledName` when the Urdu label is a separate key |

Test: `frontend-mobile/tests/screens/qrScan.test.mjs` (14 tests). It overrides the harness `AppState` (to fire background and active), `Platform.OS` (web), `expo-camera` permissions, `withRepeat` and `withTiming` (to check the scan-line motion), and `/i18n/LanguageProvider` (so values fill in). `tests/startTaskLifecycle.test.mjs` now runs on the shared harness too.

#### Spec 35: spec 35 photo list (`35-photo-list.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `VerificationProgress({ manifest, local, rows, online, lastUpdated, onSelect? })` | `frontend-mobile/src/screens/verification/VerificationProgress.tsx` | Redesigned photo list: area header with "{n} of {t} photos done" and 8 high progress bar, one row per required photo (fixture tile, title, view, `Pill` from `photoRow`), correction text under rows that need action, offline note, "Results updated" footer. A finished task renders only the "Work submitted" header. `onSelect(index)` makes rows pressable (index into the filtered list, same order as `photoStatuses`). | the old card-style progress block |

Test: `frontend-mobile/tests/screens/photoList.test.mjs` (10 tests). Overrides `/i18n/LanguageProvider` with the real `translate` so placeholder values are asserted.

#### Spec 36: spec 36, work submitted receipt (`36-submission-receipt.md`)

In `frontend-mobile/src/screens/verification/SubmissionReceipt.tsx`.

| Export | Purpose | Use instead of |
|---|---|---|
| `SubmissionReceipt({ taskId, areaName, submittedAt, timeZone?, photosReceived, photosRequired, hasNextTask, onNext, onDone })` | Blue `Moment` receipt after a staff submission: time subtitle, facts for task, photos received, Submitted ("Yes" blue pill) and Verified ("Not yet" neutral pill), and one `next` action ("Next task" or "Back to my day"). | hand-built "Submission receipt" blocks |
| `SubmissionReceiptProps` | Prop type. | local copies |

Test: `frontend-mobile/tests/screens/submissionReceipt.test.mjs` (6 tests).

#### Spec 37: spec 37, profile screen (`37-profile-screen.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `ProfileScreen({ companyName?, topSlot?, workSlot? })`, `ProfileScreenProps` | `frontend-mobile/src/screens/profile/ProfileScreen.tsx` | Profile tab: avatar header, My details (query, skeleton, error fallback), language toggle, Task alerts / Change password / Help routes, sign-out `ConfirmDialog`, version footer. Slots for specs 44/51. | The account half of the old "Help & account" screen |

Test: `frontend-mobile/tests/screens/profile.test.mjs` (12 tests); stubs `expo-application`, netinfo, `/queries/profile` and `/auth/AuthContext`.

#### Spec 38: spec 38, task alerts screen (`38-task-alerts.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `TaskAlertsScreen` | `frontend-mobile/src/screens/profile/TaskAlertsScreen.tsx` | Route `TaskAlerts`: status note, Camera and Location permission pills (read on focus, never prompts), "Retry phone alerts" (locked, `registerPhoneAlerts(scope, language, true)`), "Open settings" with fallback message. Spec 48 registers it. | The "Task alerts" card in `HelpScreen.tsx` (spec 39 removes it) |

Test: `frontend-mobile/tests/screens/taskAlerts.test.mjs` (9 tests). Overrides `@react-navigation/native` `useFocusEffect` to run in `useEffect`, and mocks `expo-camera` `Camera.getCameraPermissionsAsync`.

#### Spec 39: spec 39, help screen (`39-help-screen.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `HelpScreen` | `frontend-mobile/src/screens/HelpScreen.tsx` | Static help page: `TopBar` "Help", four answers, a Permissions answer, a blueWash manager note. Only action is Back. | The old "Help & account" screen (alerts, account, sign-out) |

#### Spec 40: spec 40, change password screen (`40-change-password.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `ChangePasswordScreen` | `frontend-mobile/src/screens/profile/ChangePasswordScreen.tsx` | "Change password" `TopBar` with back, `LaunchRecovery` replacement form (no handoff), Cancel goes back, a saved change calls `logout()` once; keyboard-safe scroll view. Route `ChangePassword` is registered by spec 48. | A second password form or a Help-screen password flow |

#### Spec 41: Spec 41: task history view (`41-task-history-view.md`)

- `MonthBar({ month, range, onChange })`, `frontend-mobile/src/screens/history/MonthBar.tsx`: previous arrow, "November 2026", next arrow; arrows are 48 buttons, hidden at range ends (or both while `range` is missing), mirrored in Urdu. Use instead of building a month switcher (spec 42 reuses it).
- `TaskHistoryView({ staffId, month, onMonthChange, onOpenTask })`, `frontend-mobile/src/screens/history/TaskHistoryView.tsx`: month bar, status bar and legend, filter chips, day-grouped `TaskRow`s, "Load earlier tasks", loading, empty and error states. Not scrollable vertically: the screen shell (spec 47) scrolls it.

#### Spec 42: Spec 42: attendance history view (`42-attendance-history-view.md`)

- `AttendanceCalendar({ month, records, todayYmd, width })`, `frontend-mobile/src/screens/history/AttendanceCalendar.tsx`: Monday-first month grid, cells coloured by attendance state (late uses the `late` token). Use instead of drawing a month grid elsewhere.
- `STATE_WORDS` (same file): attendance state to English pill/label key ("On time", "Late", "Absent", "Missed check-out", "On shift", "Upcoming").
- `AttendanceHistoryView({ staffId, month, onMonthChange })`, `frontend-mobile/src/screens/history/AttendanceHistoryView.tsx`: month bar, calendar, legend with counts, newest-first day rows, day `BottomSheet`, loading, empty and error states. Not scrollable vertically: the screen shell (spec 47) scrolls it.

#### Spec 43: Spec 43: finished task details (`43-history-task-detail.md`)

- `HistoryTaskScreen()`, `frontend-mobile/src/screens/history/HistoryTaskScreen.tsx`: route `HistoryTask` (params `taskId`, `month`). Finds the item in any cached `useTaskHistory` filter for the month, else refetches the month with filter `all`; top bar, four-step timeline, Submitted / Verified / Review closed table, footnote, loading, error (Try again) and not-found (Back) states. Not registered yet (spec 51). Step and Fact rows are local to the file; use instead of a second finished-task view.

#### Spec 44: spec 44, profile month and work sections (`44-profile-month-work.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `ProfileMonth({ summary, loading, error, onRetry, onSeeHistory })` | `frontend-mobile/src/screens/profile/ProfileMonth.tsx` | "This month" block: three meters with named totals, "No shifts yet"/"No tasks yet" for a zero denominator (no bar), "See my history" link, skeleton and error. `summary` is `ProfileSummary['month']`. | Hand-built progress rows |
| `ProfileWork({ summary, loading })` | `frontend-mobile/src/screens/profile/ProfileWork.tsx` | "My work" block: location and address, usual shift via `timeRange`, manager. No call button. | Ad hoc detail rows |

Test: `frontend-mobile/tests/screens/profileSections.test.mjs` (8 tests). Mounting into Profile is spec 51.

#### Spec 45: spec 45, task photo capture (`45-photo-capture.md`)

| Export | Path | Purpose | Use instead of |
|---|---|---|---|
| `PhotoCaptureControls({ disabled, busy, label, onCapture })` | `frontend-mobile/src/components/PhotoCaptureControls.tsx` | Camera shutter: 80 white face in a white ring (96 across), 0.93 press scale (none under reduced motion), one medium haptic per press, spinner while busy. | hand-built shutters (`AttendanceCamera` has its own copy) |
| `CameraRoundButton({ label, onPress, on?, children })` | same | 48 round `cameraButton` button for dark camera screens; `on` fills it yellow and sets `selected`. | local round camera buttons (spec 34 `CameraButton`) |
| `CaptureFrame()` | same | Scanner viewfinder: four white corners and the moving yellow scan line (still under reduced motion). | spec 34's file-local `Viewfinder` |
| `PhotoStepProgress({ current, total, segments? })`, type `PhotoSegment` | same | Segment strip (white done, yellow current, dim to do) with "3/7" count; labelled "Photo {n} of {t}". | progress dots/bars on camera screens |
| `CaptureBusyCard({ label, centred? })` | same | Dark busy card with spinner and one line, fading in; bottom of the camera or centred. | per-screen `BusyCard` copies |
| `PhotoGuide({ fixture, instruction })` | `frontend-mobile/src/components/PhotoGuide.tsx` | Faint dashed SVG outline of the fixture type, filling its parent; the instruction is its accessibility label. | fixture icons on the camera |

`VerificationScreen.tsx` keeps its parts file-local (`PhotoResults` result sheets, `ListDock`, `ScanView`, `CaptureView`). Test: `frontend-mobile/tests/screens/photoCapture.test.mjs` (17 tests) drives the real screen with the verification API, camera, file system, NetInfo and AppState mocked, and uses `createNodeMock` for the camera ref.

#### Spec 47: spec 47 history screen (`47-history-screen.md`)

| Name | Path | Purpose | Use instead of |
|---|---|---|---|
| `HistoryScreen` | `frontend-mobile/src/screens/history/HistoryScreen.tsx` | History tab: title, Tasks / Attendance `SegmentedControl`, one shared `YYYY-MM` month state, the vertical `ScrollView` with pull to refresh (refetches only the visible view's queries) and tab-press scroll to top. Row press navigates to `HistoryTask` with `{ taskId, month }`. Spec 51 registers it as the `History` tab. | a second screen that wraps `TaskHistoryView` / `AttendanceHistoryView` |

### Retired parts, release check and Part 2 wiring

#### Spec 49: retired parts and kept legacy files (`49-retire-legacy.md`)

Nothing new created for reuse. Deleted (no importer anywhere in `src`, `tests`, `App.tsx`): `TaskCard`, `StaffBrand`, `ScreenHeader`, `StatCard`, `FactRow`, `StatusBadge`, `components/EmptyState`, `LoadingState` (all in `frontend-mobile/src/components/`). Use `src/design/Feedback.tsx` (`EmptyState`, `ErrorState`, `Skeleton`) instead.

Kept, report only (importers):
- `components/LanguageChoice.tsx`: none.
- `components/ui/card.tsx`, `ui/badge.tsx`, `ui/separator.tsx`, `ui/skeleton.tsx`, `ui/input.tsx`: none.
- `components/ui/button.tsx`: `LanguageChoice.tsx`, `screens/verification/SpatialDiagnosticScreen.tsx`, mocked in `tests/verificationLifecycle.test.mjs`.
- `components/ui/text.tsx`: `SpatialDiagnosticScreen.tsx`, `ui/badge.tsx`, `ui/card.tsx`, `ui/button.tsx`.
- `src/theme.ts`: `App.tsx`, `components/ui/button.tsx`.
- `src/utils/taskStatus.ts`: `src/verification/taskStatus.test.ts` only.

Raw hex outside `tokens.ts` in plan folders: only `src/design/tokens.test.ts` (test fixtures); no source finding.

#### Spec 50: Part 1 release check (`50-part1-release-check.md`)

Nothing new created for reuse. Output is the report `docs/plan-project/mobile-redesign/planning/part1-release.md` (gates, screen verdicts, proposed fix spec 54, carried-over follow-ups, no-device note). Edited only the "Staff flow" paragraph of `docs/PRODUCT_UI_RULES.md`.

#### Spec 51: Part 2 wiring (`51-part2-wiring.md`)

Nothing new created for reuse. Wired existing screens: History tab in `StaffTabs.tsx`, `HistoryTask` in `AppNavigator.tsx`, `ProfileMonth`/`ProfileWork` fed by `useProfileSummary` in `ProfileScreen.tsx`.

Deployment order: the backend with spec 18 must be live before an app build containing this spec reaches staff; otherwise History shows its error state.

#### Spec 55: spec 55 (Joined month fix) (`55-fix-joined-month.md`)

No reusable component or helper was created. The fix is an inline `Intl.DateTimeFormat` expression inside `frontend-mobile/src/screens/profile/ProfileScreen.tsx`.

Existing helper for the same job, for later use: `localDate(value, timeZone)` in `frontend-mobile/src/design/format.ts` returns the zone-local `YYYY-MM-DD`, so its first 7 characters are a zone-local month key. Use it instead of a new formatter.

### End-to-end suite

#### Spec 52: end-to-end suite (`52-e2e-suite.md`)

| Name | Path | Purpose | Use instead of |
|---|---|---|---|
| `npm run test:e2e` | `frontend-mobile/package.json`, `frontend-mobile/playwright.config.ts` | Builds the web export into the system temp directory against the reserved host `api.staff-e2e.test`, serves it on a free loopback port and runs `e2e-web/**/*.spec.ts` in Chromium, projects `phone` (390 by 844) and `small` (360 by 700) | `scripts/check-staff-ui.mjs` (now only a pointer) and hand-written headless Chrome scripts |
| `test`, `expect` (with `api` and `open` fixtures) | `frontend-mobile/e2e-web/support/test.ts` | `open({ now, language, signedIn })` fixes the clock, seeds the session and language once per tab, then loads the app; fails the test on any page error | Raw `@playwright/test` imports in a new spec file |
| `StaffApi` (`on`, `callsTo`), `fixture`, `ok`, `fail` | `frontend-mobile/e2e-web/support/api.ts` | Answers every API call from fixtures, records calls, aborts any other non-loopback host, stubs expo-camera's jsQR CDN script | Ad-hoc `page.route` handlers |
| API fixture bodies | `frontend-mobile/e2e-web/fixtures/*.json` | Envelopes shaped like the real routes: current user, login (and wrong password), staff profile, attendance, tasks feed, task, verification manifest, history, attendance month, profile summary, 404 | Inventing response shapes in a test |
| `shift`, `checkedIn`, `attendance`, `task`, `feed` | `frontend-mobile/e2e-web/support/data.ts` | Today's shift and task feed variants with server-computed counts and staff task presentation | Editing fixtures per test |
| `words`, `ur`, `tab`, `button`, `daySentence`, `setNetwork`, `expectNoHorizontalOverflow` | `frontend-mobile/e2e-web/support/test.ts` | Text match that tolerates `isolate()` marks; Urdu from the app dictionary; tab and top-most button locators; My day sentence; offline toggle NetInfo's web module notices; width check including text past either edge | Exact-string text matching on isolated names, hard-coded Urdu |
| Static server | `frontend-mobile/e2e-web/serve.mjs` | Serves an export directory on 127.0.0.1 with index fallback | A dev server or a public host |
