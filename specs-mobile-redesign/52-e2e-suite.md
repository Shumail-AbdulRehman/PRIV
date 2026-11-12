# Spec 52 — End-to-end suite

**Status:** Done
**Depends on:** 01-51
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend-mobile/playwright.config.ts`, `frontend-mobile/e2e-web/`, `frontend-mobile/e2e/`, `frontend-mobile/scripts/check-staff-ui.mjs`, `specs-mobile-redesign/inventory/52-e2e-suite.md`
**Reuses:** `frontend-mobile/package.json`, `frontend/playwright.config.ts`, `ARCHITECTURE.md#api`

## Goal

The only spec that writes or runs end-to-end tests: every user flow of the redesigned staff app runs in a real browser against the web export with the API answered by fixtures, plus the Maestro device flows updated for the new screens.

## Scope

- Add `@playwright/test` `1.58.2` (the version `frontend/` uses) to `frontend-mobile` devDependencies and a script `test:e2e`. This spec is the sole later editor of `frontend-mobile/package.json` after spec 01, for these two lines only.
- `playwright.config.ts`: `webServer` that runs `npm run build:web` then serves `dist/` statically on a free local port (`reuseExistingServer: !process.env.CI`); `baseURL`; Chromium only; two projects, `phone` (390 by 844) and `small` (360 by 700); `trace: 'on-first-retry'`, screenshot on failure; output under the system temp directory, never committed.
- Test data strategy: `e2e-web/fixtures/` holds JSON bodies shaped exactly like the real API (today's `/staff/mobile/tasks`, `/staff/mobile/attendance`, `/staff/profile/me`, `/common/get-current-user`, login, `/task-instance/:id`, `/task-instance/:id/verification`, and the three Part 2 routes from `ARCHITECTURE.md#api`), served through `page.route` on the API base URL. Never call a real backend. Camera, QR scanning and GPS cannot run in a browser: tests cover every screen around them, and the device flows cover them.
- One file per flow area under `e2e-web/`. Role- and text-based locators; assert after a reload where state persists (language choice); web-first assertions, no fixed sleeps; each test runs alone.
- Replace `scripts/check-staff-ui.mjs` with a pointer to `npm run test:e2e` (or delete it if nothing else references it; CI does not).
- Update the Maestro flows in `e2e/` and `e2e/README.md` to the new labels ("Check in", "My day", "Profile", "Task alerts", "Use manager access code", "Sign in"). They remain unexecuted without a device; the README must still say so.

### Flow table: the coverage contract

| Flow | Built by | Proves |
|---|---|---|
| Sign in, wrong password, manager access code form | 22, 27, 28 | Errors show inline; the code form opens and returns |
| Switch to Urdu and back, persists after reload | 04, 14, 21 | Every visible tab label is Urdu and the layout is right-to-left |
| My day before check-in, check-in open, late, closed | 15, 29, 46 | The right sentence and dock for each time |
| My day on shift: next task, cleaning, retake, overdue | 15, 29, 30, 46 | The sentence names the task; Urdu puts the name on its own line |
| All submitted, time to check out, finished, missed check-out | 15, 46, 31 | Wait status, check-out action, receipts |
| Check-out with open work warning | 31, 46 | "Go back to my work" closes; "Check out anyway" continues |
| Offline banner and dock status | 24, 46, 32 | No dead buttons while offline |
| Tasks tab groups and badge | 06, 25, 32, 48 | Needs you, To do, Done today; badge colour |
| Task details and its start button | 33 | Step path and the right next action |
| Photo list states and submit dock | 08, 35, 45 | Uploaded, Saved uploading, Uploaded checking, Retake; Submit only when done |
| Work submitted receipt | 36, 45 | Submitted Yes and Verified Not yet are separate |
| Profile details, settings rows, sign out dialog | 37, 48 | Cancel keeps the session; confirm signs out |
| Task alerts, help, change password | 38, 39, 40 | Each opens from Profile and returns |
| History tasks: month, filters, finished task details | 41, 43, 47, 51 | Counts in words, filter changes, three states separate |
| History attendance: calendar, late in orange, day sheet | 42, 47, 51 | No yellow day; sheet shows times |
| Profile month and work sections | 44, 51 | Named totals; no call button |
| History on an older server (404) | 17, 41, 51 | Error state with retry, no crash |
| No horizontal overflow at 360 by 700 on every main screen | 01-51 | Page width never exceeds the viewport |

## Explicit non-scope

- Fixing application code → spec 53 records it; each app bug becomes a new numbered fix spec appended to `README.md` and `PROGRESS.md`, and the test is marked `fixme` with that number.
- Unit tests → each spec. Clean-install verification → spec 53.

## Reuse first

- Follow `frontend/playwright.config.ts` conventions where they fit.

## Steps

1. Install, configure, and get one trivial test that loads the sign in screen green.
2. Write the fixtures from the real API shapes (read the services, do not guess).
3. Write a test file per flow area; run headless; triage failures.
4. Update the Maestro flows and README.

## Done when

- [x] `npm run test:e2e --prefix frontend-mobile` passes headless in both projects with 0 failures (excluding `fixme` tests that name a fix spec); the real count and runtime are in the Log. [e2e]
- [x] Every row of the flow table has at least one test, named in the Log. [static]
- [x] Every app bug found has a numbered fix spec in `README.md` and `PROGRESS.md`. [static]
- [x] No test or fixture contains a real email, password, token or production URL. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-12** — Built the suite. `@playwright/test` 1.58.2 added (exact) with `"test:e2e": "playwright test"`; lockfile diff is only `@playwright/test`, `playwright`, `playwright-core` (and the optional `fsevents` entry). `npm install` also reported "added 790 packages": `node_modules` was missing packages the lockfile already listed; no other lockfile entry changed. Chromium came from the existing `~/.cache/ms-playwright` (1208); no browser install.
  - Config: `webServer` runs `npm run build:web -- --output-dir <tmp>/hygene-staff-e2e/dist` with `EXPO_PUBLIC_API_BASE_URL=http://api.staff-e2e.test/api` (reserved `.test` host; overrides `.env`, checked in the bundle), then `e2e-web/serve.mjs` serves it on a free 127.0.0.1 port chosen at config load. Results and screenshots go to `<tmp>/hygene-staff-e2e/results`; list reporter only, nothing written in the repo. Projects `phone` 390x844 and `small` 360x700, workers 2, `trace: on-first-retry`, screenshot on failure, timezone Asia/Karachi, clock fixed per test with `page.clock.setFixedTime` (2026-11-12).
  - Fixtures in `e2e-web/fixtures/` are envelopes read from the services: `staffMobile.service.ts` (tasks feed through `staffTaskPresentation`, attendance select), `staff.controller.ts` login and `staffSelf.controller.ts` profile, `common.controller.ts` current user, the verification route's manifest (shape of `ManifestResponse`), the three Part 2 routes (checked with the app's own `parseTaskHistoryPage`, `parseAttendanceMonth`, `parseProfileSummary`, `parseStaffProfile`). `StaffApi` answers them through `page.route`, records calls, aborts every other non-loopback host (the run fails if any is attempted) and stubs one third-party script (below).
  - Result: `npm run test:e2e --prefix frontend-mobile` 112 tests: 106 passed, 6 skipped (3 `fixme` per project), 0 failed, 1.3 min including the cached build; per project `phone` 53 passed + 3 fixme in 43.1 s, `small` 53 passed + 3 fixme in 43.0 s. Ran the full suite three times, no flake. Typecheck 0 errors. `build:web` exported. Unit suite still 612/612.
  - Flow table coverage (file › test):
    1. Sign in, wrong password, access code: `sign-in.spec.ts` › empty fields; wrong password; manager access code: the form opens and returns (plus right password lands on My day; connection settings stay reachable).
    2. Urdu and back after reload: `language.spec.ts` › switch to Urdu, reload, and back to English (every tab label Urdu, My day tab at the right end, reload keeps it; English restores order); the sign in screen switches to Urdu too.
    3. Before check-in, open, late, closed: `my-day.spec.ts` › before check-in › 4 tests.
    4. On shift next, cleaning, retake, overdue; Urdu name line: `my-day.spec.ts` › on shift › 5 tests (Urdu: label and name are separate lines).
    5. All submitted, time to check out, finished, missed check-out: `my-day.spec.ts` › end of the day › 4 tests. The receipt is reached through check-out's first server read finding the check-out already recorded (`attendanceResult`), so no camera is needed.
    6. Check-out with open work: `my-day.spec.ts` › check-out with open work › "Go back to my work" closes; "Check out anyway" continues (to the receipt, same server path).
    7. Offline: `offline.spec.ts` › My day (banner, dock status instead of Check in, back online), Tasks, photo list.
    8. Tasks groups and badge: `tasks.spec.ts` › groups (order, yellow badge when a task needs the person); badge is blue when nothing needs the person; empty day.
    9. Task details and start button: `tasks.spec.ts` › task details › step 1 and Start cleaning opens the scanner screen (and Back); not checked in: the note and a Check in action; in progress: step 2 and Take task photos; submitted: all steps done, no action.
    10. Photo list states and submit dock: `photos.spec.ts` › each photo shows its own state (Uploaded, Uploaded checking, Retake; no Submit); only checking left: the dock waits.
    11. Work submitted receipt: `photos.spec.ts` › all uploaded: Submit work, then the receipt (Submitted Yes, Verified Not yet, one POST to `/complete`).
    12. Profile details, settings, sign out: `profile.spec.ts` › details and settings rows; sign out: Cancel keeps the session (also after reload); sign out: confirm revokes (POST `/common/logout`) and shows sign in.
    13. Task alerts, Help, Change password: `profile.spec.ts` › each opens from Profile and returns (3 tests).
    14. History tasks: `history.spec.ts` › tasks › month summary counts; a filter changes the list, another month changes the request; finished task details keep Submitted, Verified and Review closed separate.
    15. History attendance: `history.spec.ts` › attendance › calendar (late cell `#f08a3c`, none of 30 cells yellow, legend counts); a day opens its sheet with the times.
    16. Profile month and work: `profile.spec.ts` › This month shows named totals; My work has no call button (and See my history opens History).
    17. Older server 404: `history.spec.ts` › older server without History (error with Try again, the 404 is not retried, Attendance errors too, Profile keeps working with "Figures could not load.").
    18. No horizontal overflow: `layout.spec.ts` › every main screen fits the width (en, ur) and sign in fits the width (en, ur): My day, Tasks, Task details, Task photos, History tasks, History task details, History attendance, Profile, Task alerts, Help, Change password, sign in and access code. Checks document width and every visible text run against both edges (sideways scrollers excepted); proved it fails on an injected wide line.
  - The fix-spec box stays unticked: by the lead's instruction this session does not edit README.md or PROGRESS.md; the lead numbers the specs. Status is Done on that understanding.
  - App bugs (tests marked `test.fixme`; the lead numbers the fix specs in README.md and PROGRESS.md, then replaces the E2E ids in the test comments):
    - **E2E-1 — going "back" to My day pushes a second tab navigator.** `TaskDetailScreen.tsx` ("Check in", line 142) and `VerificationScreen.tsx` (receipt "Next task" / "Back to my day", line 219) call `navigation.navigate(StaffTabs, { screen: Shift })`. React Navigation 7 (`routers` 7.6.4) no longer goes back to an existing route on `navigate`; it pushes a new `StaffTabs`. Steps: Tasks › a not-started task before check-in › Check in (or submit a task › Next task). Expected: the one existing My day, the stack screens closed. Actual: two My day screens mounted (two `day-header-title`), the old tabs and the task screen stay underneath, both My days poll the API, and Back returns to Task details or the receipt. Fix direction: `popTo` or `navigate(..., { pop: true })`. `NotificationNavigation.tsx` line 27 uses the same call (not tested: needs a push). Tests: `tasks.spec.ts` › not checked in: Check in returns to the one My day; `photos.spec.ts` › receipt: Next task returns to the one My day.
    - **E2E-2 — "Joined" shows the UTC month.** `ProfileScreen.tsx` uses `createdAt.slice(0, 7)`. Steps: staff created 2026-02-28T20:00Z (1 March, 01:00 in Karachi) › Profile. Expected "March 2026", actual "February 2026". Already listed in PROGRESS as a follow-up for spec 53; recorded here so it has a test. Test: `profile.spec.ts` › Joined uses the month in the staff member's own time zone.
  - Maestro flows in `e2e/` updated to the new labels (Staff sign in, Email, Password, Sign in, My day, Use manager access code, Set your new password, Access code, Save new password, Check in, Camera is needed, Profile, Task alerts, Retry phone alerts, Help, Back) and `e2e/README.md` rewritten: still says they are unexecuted and lists what only a device can prove. YAML parses; nothing else verified. `scripts/check-staff-ui.mjs` replaced with a pointer to `npm run test:e2e` that exits 1 (not deleted: `docs/plan-project/mobile-redesign/planning/validator-raw.txt` and `design/v5/baseline-hashes.json` still name it; CI does not).
  - Departures from the spec text: (1) the export is built and served from the system temp directory, not `dist/`, so a test build (with the test API host) never overwrites the shared `dist/` other sessions' build gates use; the `build:web` box was checked separately on the default output. (2) NetInfo's web module listens only to `navigator.connection` change events, which Chromium does not fire for an emulated network change, so `setNetwork()` dispatches that event after `setOffline`. (3) expo-camera's web barcode worker loads `jsQR` from `cdn.jsdelivr.net` at start-up; the suite serves a stand-in script for that URL instead of letting it reach the internet (affects only the web build, not the phone app; worth knowing if the web export is ever shipped).
  - Not verified: anything with a real camera, QR scanner or GPS (check-in and check-out uploads, scanning, photo capture, "Saved, uploading" which only exists in the phone's own upload queue, "Take a new photo"); Maestro flows (no device); screen readers; system font scaling; the HTML report and CI mode (`retries: 1`) were not exercised; a cold (uncached) Metro build time. Urdu strings in tests come from the app's own dictionary (`ur()` fails on a missing key) and were not reviewed by a reader.
- **2026-11-12** — Lead: fix specs added. E2E-1 is spec 54, E2E-2 is spec 55, both in `README.md` and `PROGRESS.md`. Lead rerun of `npm run test:e2e`: 106 passed and 6 skipped (the three fixme tests in each project), 1.4 min. Box ticked.
- **2026-11-12** — Lead: after fix specs 54 and 55, removed the three `test.fixme` markers (`photos.spec.ts` receipt Next task, `tasks.spec.ts` Check in, `profile.spec.ts` Joined). `npm run test:e2e`: 112 passed, 0 skipped, 1.3 min.
