# Verification pass (spec 53)

Date: 2026-11-12. Tree: working tree on `main` (`7694834` plus every spec 00 to 55, uncommitted). Another session (Codex) was editing `backend/src/services/managerOperations.service.ts` and `operationsOverviewAggregate.ts` at the same time; neither belongs to this plan.

This pass observes and reports. It changed no application code. Each real defect has a proposed new spec number (56 onward) in the Findings table; the lead writes them into `README.md` and `PROGRESS.md`.

## 1. Clean install and gates

Method: `frontend-mobile/` and `backend/` were copied with `rsync` into a scratch folder outside the repository, leaving out `node_modules`, `dist`, `.expo`, `build-output`, the `android` symlink, `google-services.json` and every `.env*` file. Nothing was installed in the shared tree. Safe environment for every command: `DATABASE_URL='postgresql://none:none@127.0.0.1:1/none' DOTENV_CONFIG_PATH=/dev/null`. No database was reached.

| Gate | Result |
|---|---|
| `npm ci` (frontend-mobile copy) | exit 0, "added 790 packages in 12s" |
| `npm ci` (backend copy) | exit 0, "added 514 packages in 10s" |
| `npm run typecheck` (mobile) | exit 0, 0 errors (8.1 s) |
| `npm run build:web` (mobile) | exit 0, "Exported: dist" (50 s); `dist` holds `Inter-Bold`, `Inter-ExtraBold`, `Manrope-Bold`, `Manrope-ExtraBold` |
| `npx tsc --noEmit -p tsconfig.json` (backend) | first run, straight after `npm ci`: exit 2, 551 errors, all from the missing generated Prisma client (`Cannot find module '.prisma/client/default'` and the implicit-any errors it causes). `npm ci` does not run `prisma generate`. After `npm run build` (which runs `prisma generate`): exit 0, 0 errors. Pre-existing property of the backend, not of this plan. |
| `npm run build` (backend) | exit 0 ("Generated Prisma Client (v7.5.0)", then `tsc`) |

## 2. Suites, each in one go, from the clean install

| Suite | Count |
|---|---|
| Mobile unit, `npm test` | **620/620** pass, 0 fail, 17.2 s |
| Backend unit, `npm test -- --maxWorkers=2` | **2631 passed, 7 skipped, 0 failed** (119 files passed, 1 skipped), 65 s. The plan's own backend tests (`services/mobile/staffMonth`, `staffHistory`, `staffAttendanceMonth`, `staffProfileSummary`, `routes/staffMobile.route`): 66/66 in 5 files. |
| Mobile e2e, `npm run test:e2e` | **112/112** passed (56 per project, `phone` 390x844 and `small` 360x700), 0 skipped, 1.6 min, workers 2 |
| Web parity for the shared Urdu dictionary (real tree, read-only) | `cd frontend && node --experimental-strip-types --test tests/operationsLanguage.test.mjs`: 1/1 pass |

Notes on the runs:

- Backend, first run: 1 file failed, `src/services/releaseReadiness.test.ts`, because it reads `../.github/workflows/ci.yml` and `../docs/implementation/RELEASE_RUNBOOK.md` from outside `backend/`, which the scratch copy did not have. After copying those two files (no secrets in them) beside the copy, the whole suite was rerun in one go with the counts above. A copy artefact, not a defect.
- Mobile unit, first run: the runner could not start because the scratch temp path was too long for `tsx`'s IPC pipe (`EINVAL listen ... .pipe`). Rerun with the default temp directory: 620/620. An environment artefact.
- Mobile e2e, first run: 29 of the first 32 tests failed ("Today could not load", "Something could not load") and the run was stopped. Cause: the e2e web server's build reused the Metro transform cache that the plain `build:web` gate had just written in the same temp directory, so the bundle had no `EXPO_PUBLIC_API_BASE_URL` and called `http://10.0.2.2:8080/api` instead of the fixture host. After deleting the Metro cache: 112/112. The reverse also happens: a plain `expo export` run after the e2e run produced a bundle containing `http://api.staff-e2e.test/api`. This is finding 60.

**Spec 50's open box** ("`npm test --prefix frontend-mobile` passes from a clean install with 0 failures"): **holds**. A clean `npm ci` from the lockfile, then `npm test`: 620/620, 0 failures. The lead can tick it and set spec 50 to Done.

## 3. Done-when walk (specs 00 to 52, 54, 55)

Method: every named test file exists (checked by path) and is inside the 620/620 clean run (the `npm test` glob picks up `src/**/*.test.ts` and `tests/**/*.test.mjs`); every `[static]` box was re-checked against the real tree where it names a file or diff; typecheck and build boxes are covered by section 1; the three `[runtime]` boxes were re-checked on the screenshots in section 6. "Holds" means the box's own claim is true now.

| Spec | Boxes | Verdict |
|---|---|---|
| 00 | 1 | holds |
| 01 | 7 | holds. `package.json` now also carries `test:e2e` and `@playwright/test` 1.58.2, added later by spec 52 as allowed. |
| 02 | 5 | holds; `tokens.ts` imports nothing from React. |
| 03 | 6 | holds; SHA-256 of the four font files matches the Log; `App.tsx` diff is only the font map import and use; `dist` has the four files. |
| 04 | 6 | holds; `translations.ts` diff is one import plus a lookup in `translate` and `translateText`; `urdu` object unchanged; parity 1/1. |
| 05 | 5 | holds; `format.ts` imports no React. |
| 06 | 5 | holds; `taskState.ts` imports no React. |
| 07 | 5 | holds; `types.ts` diff is the param lists and `StaffTabId` (plus the 48/51 edits named in their specs). |
| 08 | 5 | holds; `photoRowState.ts` imports no React. |
| 09, 10 | 4, 5 | hold |
| 11, 12, 13 | 5, 4, 4 | hold (backend suite and `tsc` after `prisma generate`, section 1) |
| 14 | 4 | holds |
| 15 | 5 | holds; `nowState.ts` imports no React. |
| 16, 17 | 4, 4 | hold |
| 18 | 5 | 4 hold. The optional seeded-database box stays unticked and was not run (no database touched). Not a defect. |
| 19 to 26 | 5 each | hold; no raw hex in any of the named files. |
| 27 | 5 | holds |
| 28 | 6 | holds; runtime box re-checked: Sign in and "Use manager access code" visible at 360x700 in English and Urdu without scrolling. |
| 29 | 5 | holds; runtime box re-checked: rail on one line at 360x700, English and Urdu. |
| 30, 31, 32 | 4, 5, 4 | hold |
| 33 | 4 | holds (Done-when). The screen has the Urdu time defect, finding 57. |
| 34, 35 | 5, 5 | hold (Done-when). Photo list has the Urdu 360 word-break defect, finding 59. |
| 36 | 4 | holds (Done-when). The receipt subtitle time is reversed in Urdu, finding 57. |
| 37 to 41 | 4, 4, 5, 4, 4 | hold |
| 42 | 5 | holds; the 360 Urdu box is true. At 390x844 one Urdu day name is truncated, finding 58. |
| 43 | 4 | holds (Done-when). Step times reversed in Urdu, finding 57. |
| 44 | 4 | holds |
| 45 | 6 | holds; `git diff` of `VerificationScreen.tsx` changes imports (hunks at lines 2, 6, 16, 18, 25) and the returned layout (from line 187 on), no logic function body. Wiring of the receipt's "Back to my day" is finding 56. |
| 46 | 6 | holds; runtime box re-checked for the cleaning state at 360x700, English and Urdu (three rows above the dock). |
| 47 | 4 | holds |
| 48 | 6 | holds; `grep -n "Help" src/types.ts` shows only `HelpGuide`. |
| 49 | 6 | holds; raw-hex sweep repeated in section 5. |
| 50 | 6 | 5 ticked hold; the unticked clean-install box now holds (section 2). `git diff docs/PRODUCT_UI_RULES.md` is one line in "Staff flow". That line is now out of date, finding 63. |
| 51 | 6 | holds |
| 52 | 6 | holds; e2e 112/112; no real email, password, token or production URL in `e2e-web/fixtures` (grep). Cache isolation defect is finding 60. |
| 54 | 5 | holds |
| 55 | 5 | holds. The inline `Intl.DateTimeFormat` throws a `RangeError` if a summary ever carried an invalid zone string; the server only sends validated zones, so it is noted under finding 62, not as a defect. |

Boxes that do not hold: **0**. One box not run: spec 18's optional database box.

## 4. Invariants (`ARCHITECTURE.md`)

| # | Invariant | Evidence | Verdict |
|---|---|---|---|
| 1 | No feature loss | grep in `src`: server address settings (`LoginScreen.tsx`, `api/serverAddress.ts`); "Use manager access code" (`LoginScreen.tsx`); forced password change (`passwordChangeRequired` in `AppNavigator.tsx`); `registerPhoneAlerts` retry (`TaskAlertsScreen.tsx`); `Linking.openSettings` (`StartTaskScreen`, `AttendanceSheets`, `VerificationScreen`, `TaskAlertsScreen`); torch and "Restart camera" (`StartTaskScreen`, `VerificationScreen`); "Upload again" (7 uses) and "Refresh results" in `VerificationScreen`; `SpatialDiagnostic` registered in `AppNavigator`. The old "Scan task QR to continue photos / to retake photos" labels became the photo dock's continue action through `nextPhotoAction`. e2e covers sign-in, access code, settings rows. | holds. One action is reachable but does nothing: "Take a new photo" with an unsent photo (pre-existing, finding 64). |
| 2 | Logic stays where it is | `git status`/`git diff HEAD` on `src/utils`, `src/verification`, `src/api`, `src/auth`, `src/launch/recoveryPolicy.ts`: no change except the new `photoRowState.ts`; `launch/LaunchRecovery.tsx` (spec 27, markup only; same `validReplacementPassword`, `completeStaffHandoff`, `replaceOwnPassword` calls) and `notifications/NotificationNavigation.tsx` (spec 54, `navigate` to `dispatch(StackActions.popTo)`). Attendance windows: `nowState.ts`, `HomeScreen.tsx`, `TasksScreen.tsx`, `TaskDetailScreen.tsx`, `useAttendanceAction.ts` all import from `utils/attendance`; no copied constant found. | holds |
| 3 | Server stays authoritative | `photoRowState.test.ts` (no queue state is `uploaded`); `taskState.test.ts` (a feed `completionOutcome` is `submitted`, never `verified`); `VerificationScreen` shows "Photo upload is unavailable…" as a `DockStatus` when `photoAuthority().upload` is false; e2e "only checking left: the dock waits, still no Submit". | holds |
| 4 | Three separate states | `SubmissionReceipt` (Submitted "Yes", Verified "Not yet" as separate pills); `HistoryTaskScreen` three rows; e2e `history.spec.ts` "finished task details keep Submitted, Verified and Review closed separate"; screenshots 06 and 13. | holds |
| 5 | Yellow means "needs you"; Late is orange | `AttendanceCalendar.tsx:42` LATE uses `late`; `Pill` tone `late`; `AttendanceReceipt` Late uses `late`; e2e calendar test (late cell `#f08a3c`, none of 30 cells yellow). Every other `colors.yellow` use (next button, needs-you pill and marker, current step, scan line, camera segment, Tasks badge when needs-you, snackbar tick) matches `v3/style.css`. | holds |
| 6 | Entered names never inside an Urdu sentence | `LabeledName`/`NameLine`/`AreaSentence`/`AreaLine` split label and name in Urdu (My day, QR screens, photo scanner, wrong-place sheet); `DayHeader` splits the place and task-title subs. Only "Salaam, {name}" keeps the name in the greeting line, isolated, exactly as the approved design draws it (`v3/views.js` line 88). | holds |
| 7 | Urdu and RTL on every screen | e2e `language.spec.ts` and `layout.spec.ts` (en and ur, both sizes); screenshots in section 6. Three Urdu defects: times shown in reversed order on three screens (57), one calendar day name truncated at 390 (58), a row's text broken mid-word at 360 (59). | **fails** (findings 57, 58, 59) |
| 8 | No attendance or task photos in History or Profile | The three services' `select`s name no image or URL field (`historyTaskSelect`: ids, times, status, location, assignment status, exception state, requirement state; `attendanceMonthSelect`: no `checkInImage`/`checkOutImage`; `profileSummaryStaffSelect`: no credential or image); grep for `<Image`, `source={`, `uri:` in `src/screens/history`, `src/screens/profile`, `src/history`: none. The only `Image` in a new screen is the unsent photo the person just took (`VerificationScreen` pending page). | holds |
| 9 | Shared Urdu dictionary unchanged | `git diff` of `frontend-mobile/src/i18n/translations.ts` touches only the import and the two lookup functions; parity test 1/1 (`assert.deepEqual(urdu, nativeUrdu)`). | holds |
| 10 | No silently disabled actions | `ActionButton` has no disabled state; unavailable actions use `DockStatus` (offline, upload unavailable, check-out not open, waiting for upload). The only `disabled` in new code is the camera shutter (`PhotoCaptureControls`), dimmed while the camera opens, the photo window is closed or the phone is offline, each with its own message or replacement action in `VerificationScreen` (unchanged logic). | holds |
| 11 | No new runtime dependency, no migration, no schema change | `git diff HEAD -- frontend-mobile/package.json backend/package.json`: mobile adds only `scripts.test` (glob), `scripts.test:e2e` and devDependency `@playwright/test` 1.58.2; backend `package.json` unchanged; `git diff HEAD --stat -- backend/prisma` empty. | holds |
| 12 | Every new endpoint is consumed | `queries/history.ts` calls `/staff/mobile/history`, `/staff/mobile/attendance/month`, `/staff/mobile/profile`; consumed by `TaskHistoryView`, `HistoryTaskScreen` (history), `AttendanceHistoryView` (attendance month), `ProfileScreen` (profile, feeding `ProfileMonth`/`ProfileWork`); routes in `staffMobile.route.ts` lines 16 to 18. | holds |
| 13 | Tab route names `Shift` and `Tasks` never change | `routeNames.ts`: `myDay: "Shift"`, `tasks: "Tasks"`; `StaffTabs.tsx` builds tabs from `tabRoutes`; tab list is `Shift`, `Tasks`, `History`, `Profile` (no `Help`); `routeNames.test.ts` pins `notificationDestination`. | holds |

## 5. Sweeps

**Raw hex** (`grep -rnE "#[0-9a-fA-F]{3,8}\b" src`, excluding tests and `tokens.ts`): only legacy files this plan did not touch: `src/theme.ts`, `src/notifications/channels.ts`, `src/components/ui/input.tsx`, `src/components/ui/button.tsx`. No hex in new code. Raw colour that is not hex: `src/design/Feedback.tsx:123` `'rgba(255,255,255,0.22)'` for the `onBlue` skeleton (carried over, finding 65). `DayHeader.tsx` builds translucent white by appending an alpha suffix to `colors.surface` (logged by spec 29).

**`fontFamily` outside `StaffText`**: `LanguageToggle.tsx:61`, `Field.tsx:92` (a `TextInput`), `StatusMarker.tsx:56`; each logged and accepted in its spec.

**Duplicate parts**

| Part | Result |
|---|---|
| Buttons | `ActionButton` everywhere new; legacy `components/ui/button.tsx` imported only by `SpatialDiagnosticScreen.tsx` (dev tool, unchanged) and the unused `LanguageChoice.tsx`. One button in practice. |
| Text components | `StaffText` everywhere new; legacy `components/ui/text.tsx` imported only by `SpatialDiagnosticScreen.tsx` and legacy `ui/*`. One in practice. |
| Month formatters | `design/format.ts` (`monthTitle`, `localDate`, `addMonths`); `utils/format.ts` is wrapped by it, not duplicated. One duplicate: `ProfileScreen.tsx:153` builds the month key with an inline `Intl.DateTimeFormat` instead of `localDate(createdAt, zone).slice(0, 7)` (spec 55's own note; finding 62). |
| Attendance rules | One source, `utils/attendance.ts`; no copied windows or constants. |
| Camera parts | Duplicate: `StartTaskScreen.tsx` keeps file-local `Viewfinder` and `CameraButton`, while spec 45 exported the same parts as `CaptureFrame` and `CameraRoundButton` (spec 45's inventory says "use instead of spec 34's file-local Viewfinder"). Finding 62. |
| Unused legacy files | No importer: `components/LanguageChoice.tsx`, `components/ui/card.tsx`, `ui/badge.tsx`, `ui/separator.tsx`, `ui/skeleton.tsx`, `ui/input.tsx` (spec 49 kept them as outside its Owns). Finding 62. |

**Inventory fold**: every `inventory/NN-*.md` (54 fragments: 01 to 52, 54, 55) folded into `INVENTORY.md` under its section; the fragments were deleted; `inventory/` holds no fragment.

## 6. Screens compared with the design

Method: scratch-only Playwright spec (never in the repo) on the clean copy's web export with the e2e fixtures, clock fixed at 2026-11-12, at 390x844 and 360x700, English and Urdu; design screenshots from `staff-app-design.html?shot=<board label>&lang=<en|ur>` (the `.phone` element, 390x844). Images, side-by-side comparisons (design en | app 390 en | app 360 en | design ur | app 390 ur | app 360 ur) and the navigation probe are in the scratch folder `clean53/screens/` (`compare/` holds the side-by-sides). The fixture data differ from the design's sample data (names, counts), so only layout, order, copy and colour were compared.

| Screen | Verdict | Differences |
|---|---|---|
| My day, ready to check in | matches | Tasks tab shows no count until the Tasks tab has been opened once (design shows it from launch): finding 61. |
| My day, cleaning (rail) | matches | Same badge difference. Rail on one line at 360 in both languages; three rows above the dock. |
| Tasks | matches | |
| Task details | fix | Urdu: the time reads "PM 1:00 – 12:00" (finding 57). Design puts the photo count at the row end; the app puts "1 photo" under the name (minor, accepted). A Latin manager note in Urdu shows its full stop on the left (".Refill the soap dispensers"); entered text, low priority, listed under 57. |
| Task photos (photo list) | fix | Urdu 360: the "Whole mirror" view text breaks mid-word ("Who / le / mirr / or") beside the long "Uploaded, checking" pill (finding 59). |
| Work submitted | fix | Urdu: subtitle reads "AM 10:41 پر جمع ہوا" (time reversed; the design isolates it) (finding 57). |
| History, tasks | matches | |
| History, finished task | fix | Urdu: "AM 11:00 – 10:00", "AM 10:02", "AM 10:40" (finding 57). |
| History, attendance | fix | Urdu 390x844: "جمعرات" truncated to "جمعرا…" (finding 58). 360 fits. |
| Profile | matches, one accepted difference | Header is centred (avatar above name) where the design puts the avatar beside the name; no Call button (spec 00 decision: `Manager` has no phone). |
| Task alerts, Help, Change password | match | Help has no Call button (spec 00). Change password keeps the "Replace your password" heading and Cancel (accepted in `part1-release.md`). |
| Sign in | matches | Sign-in button sits under the fields instead of in a bottom dock, as accepted in `part1-release.md`. |

Navigation probe: Tasks › the last open task › Take task photos › Submit work › "Back to my day" lands on Task details for the submitted task, in both projects (`phone-probe-after-back-to-my-day.png`). Finding 56.

## 7. Findings (proposed new specs)

| # | Finding |
|---|---|
| 56 | **Receipt "Back to my day" returns to Task details.** `VerificationScreen.tsx` passes `onDone={() => navigation.goBack()}` to `SubmissionReceipt`. Steps: check in › Tasks › the last open task (Task details) › Take task photos › Submit work › "Back to my day". Expected: My day (the one `StaffTabs`, as spec 54 does for "Next task"). Actual: Task details of the task just submitted; reproduced at 390 and 360. From My day's own "Take task photos" the same button works, because the stack is one screen deep. |
| 57 | **Times read backwards in Urdu.** Times rendered without `isolate()` inside right-to-left text. Steps: Urdu › Task details (time line), History › a finished task (Scheduled, Started, Submitted values), Work submitted (subtitle). Expected "12:00 – 1:00 PM", "10:41 AM پر جمع ہوا" as in the design. Actual "PM 1:00 – 12:00", "AM 11:00 – 10:00", "AM 10:02", "AM 10:41 پر جمع ہوا". Files: `TaskDetailScreen.tsx:155`, `HistoryTaskScreen.tsx:128–131`, `SubmissionReceipt.tsx:53`; same pattern, not screenshotted: `StartTaskScreen.tsx:318`, `AttendanceReceipt.tsx:54` subtitle, `AttendanceHistoryView.tsx` day-sheet values. Also: a Latin manager note in Urdu puts its final full stop on the left. |
| 58 | **Urdu calendar day name truncated at 390.** History › Attendance in Urdu at 390x844: "جمعرات" shows as "جمعرا…". `AttendanceCalendar.tsx` uses the 13 px narrow size only below 375. Expected every day name in full at every width (the design fits it at 390). |
| 59 | **Photo row text breaks mid-word in Urdu at 360.** Task photos in Urdu at 360x700: with the "اپ لوڈ ہو گئی، جانچ جاری ہے" pill, the item's view line ("Whole mirror") wraps letter groups ("Who/le/mirr/or"). `VerificationProgress.tsx` row layout: the pill must not squeeze the text column below one word, or should wrap under the title. |
| 60 | **E2E build shares the Metro cache with normal builds.** `playwright.config.ts` `webServer` runs `expo export` with `EXPO_PUBLIC_API_BASE_URL` set but the default Metro cache in the system temp folder. Steps: `npm run build:web`, then `npm run test:e2e` › 29 of the first 32 tests fail (bundle calls `10.0.2.2`). Reverse: `npm run test:e2e`, then `npm run build:web` › the export contains `http://api.staff-e2e.test/api`. Expected: the e2e build uses its own cache (or clears it) and never leaks the test host into another build. |
| 61 | **Tasks tab count missing until Tasks is opened.** `TasksScreen.tsx` sets `tabBarBadge` through `navigation.setOptions`, and tabs mount lazily, so after launch My day shows no count on Tasks (design shows it from launch). Pre-existing behaviour kept by spec 32. Expected: the count comes from the shared task query at the tab level. |
| 62 | **Clean-up of duplicate and dead parts.** (a) `StartTaskScreen.tsx` local `Viewfinder` and `CameraButton` duplicate `CaptureFrame` and `CameraRoundButton` in `PhotoCaptureControls.tsx`; (b) `ProfileScreen.tsx:153` inline `Intl.DateTimeFormat` duplicates `localDate` and would throw on an invalid zone string; (c) unused `LanguageChoice.tsx`, `ui/card`, `ui/badge`, `ui/separator`, `ui/skeleton`, `ui/input`; (d) the shared test harness `t()` drops placeholder values (several test files override it). |
| 63 | **Product rules out of date.** `docs/PRODUCT_UI_RULES.md` "Staff flow" says "My day, Tasks and Profile (History arrives with Part 2)"; the History tab is wired (spec 51). Expected: four tabs listed. |
| 64 | **"Take a new photo" does nothing with an unsent photo** (pre-existing; logged by spec 45). `VerificationScreen.tsx`: `beginPhotos()` sets scan mode, but the camera needs `!pending` and the pending page stays. Needs an owner decision (discard the unsent photo, or hide the button). |
| 65 | **Message bar and translucent colours** (carried over from the PROGRESS Log). `Feedback.tsx` has no entry motion (DESIGN-SYSTEM: translateY 12 and fade, 200 ms), sits at a fixed 96 from the bottom (may overlap the tab bar with a large bottom inset), and uses a raw `rgba(255,255,255,0.22)`; no translucent-white token exists (also used by `DayHeader`, `LanguageToggle` `onBlue`). |

## 8. Never verified

- Physical Android device behaviour: no Android SDK, device or emulator here; no APK built. Camera, QR scanning, GPS, haptics, torch, the "Saved, uploading" queue state, check-in and check-out uploads, push alerts (including the spec 54 `popTo` dispatch from a real alert), Maestro flows in `frontend-mobile/e2e/`.
- Android font scaling at 1.3 (and the 1.4 cap in `StaffText`).
- Screen readers (TalkBack): focus moves, live regions, hidden labels.
- The three new endpoints against a real test database: only mocked-Prisma unit tests ran (spec 18's optional box). Query plans and the in-memory paging of `/history` on a large month are unmeasured.
- Photo checking is still switched off on the server (`docs/CURRENT_CONTEXT.md`: `verificationReleaseConfiguration()` hard-codes `privacyAssessment:false`), so real staff will hit "Task photos are unavailable" and cannot complete the photo steps until the owner decides. The redesign shows that state; it cannot remove it.
- Deployment order for Part 2 (backend with spec 18 before a phone build with spec 51) is a release step, not checked here.
- Urdu copy has not been read by a native reader.
- The web export is a browser, not a phone: device fonts, safe-area insets and Android back were not exercised.

## Lead addendum, 2026-11-12

Findings 56 to 63 are fixed by specs 56 to 63, each checked by the lead. Final checks in the working tree: mobile unit suite 654/654, typecheck 0 errors, `npm run test:e2e` 112/112, `build:web` passes, and `dist` holds no e2e fixture host. Invariant 7 (Urdu and RTL) holds after 57, 58 and 59 (the lead viewed the Urdu calendar at 390 and the Urdu photo list at 360). Still open for the owner: 64 ("Take a new photo" does nothing while a photo is unsent) and 65 (message bar entry motion, bottom offset against the tab bar, translucent-white token). Not verified: a physical Android device, screen reader, font scaling, a native Urdu review, and the three new endpoints against a real database.
