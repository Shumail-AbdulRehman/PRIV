# Staff phone app redesign: spec index

Implementation plan for rebuilding the Hygene Ops staff Android app (`frontend-mobile/`) from the approved design, adding a History tab and a Profile tab, and the three read-only staff endpoints that History and the profile figures need. The web workspace, manager screens, the database schema and the photo-verification product decision are out of scope.

**Handover:** the owner plans to run these specs on GPT Sol 6.1 (`gpt-6.1-sol`) at high effort, one spec per session, with no memory of the planning conversation. Everything an implementer needs is in this folder, `design/mobile-redesign/` and `docs/CURRENT_CONTEXT.md`. Heavy specs are the risky ones: tokens, the task and photo state mappings, navigation, the My day decision and screen, the attendance flow, the photo capture screen, the backend services and routes, the e2e suite and the verification pass.

- **Design (approved 2026-11-11):** open [`../design/mobile-redesign/staff-app-design.html`](../design/mobile-redesign/staff-app-design.html) in a desktop browser and use **All screens**. Source: [`../design/mobile-redesign/v3/`](../design/mobile-redesign/v3/), including "Fixes after review" in `v3/NOTES.md`.
- **Research and planning notes:** [`../docs/plan-project/mobile-redesign/`](../docs/plan-project/mobile-redesign/).
- **Note:** `*.md` is git-ignored in this repository; ask the owner before committing these files (a `!specs-mobile-redesign/**` exception in `.gitignore` is needed).

Track progress in [PROGRESS.md](./PROGRESS.md).

## Two parts

- **Part 1, the new look on today's data (no server change):** specs 01 to 09, 14 to 16, 19 to 40, 45, 46, 48, 49, then the release check 50. Shippable on its own.
- **Part 2, History and profile figures:** server specs 11, 12, 13, 18; phone specs 10, 17, 41 to 44, 47; switched on by 51, which waits for Part 1's release check. Its server and phone specs run in parallel with Part 1 from wave 1, but nothing is visible to staff until spec 51.
- **Finish:** 52 (end-to-end suite) and 53 (verification pass).

## How to run this

Start with `00` (already Done), then work in wave order. Specs in the same wave can run together. One spec per session. Read [AGENT-GUIDE.md](./AGENT-GUIDE.md) first. **Do not commit or push unless the owner says so. Pushing `main` deploys the backend.**

With Orchestro: `orchestro specs graph specs-mobile-redesign/` then `orchestro specs ready specs-mobile-redesign/`. Sequentially: `spec-run status` then `spec-run`.

## Steering docs: read before any spec

| Doc | What it settles |
|---|---|
| [AGENT-GUIDE.md](./AGENT-GUIDE.md) | How to work, commands, test rules, done bar |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folders, layers, state, the Part 2 API contract, invariants |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | The closed token list, components, states, motion |
| [INVENTORY.md](./INVENTORY.md) | What already exists |

## Spec list

`Wave` is the parallel round a spec runs in. `Part` is 1, 2 or both.

| # | Spec | Wave | Part | Model | What it covers |
|---|---|---|---|---|---|
| 00 | [Decisions](./00-mobile-decisions.md) | 0 | both | Heavy | Record every decision for this redesign so no implementing session reopens it. |
| 01 | [Test command and shared component test harness](./01-test-harness.md) | 1 | 1 | Standard | Every test file any later spec adds is run by `npm test`, and component tests share one small harness instead of copying module-mock code into every file. |
| 02 | [Design tokens](./02-design-tokens.md) | 1 | 1 | Heavy | Every value in `DESIGN-SYSTEM.md` exists once, typed, in `src/design/tokens.ts`, so every later spec styles with names instead of numbers and hex. |
| 03 | [Bold Inter and Manrope fonts](./03-fonts.md) | 1 | 1 | Standard | The app bundles and registers every weight the design uses, and one function answers "which family for this text role in this language". |
| 04 | [Urdu copy for the redesign](./04-urdu-dictionary.md) | 1 | 1 | Standard | Every new English string the design uses has a natural Urdu translation in one staff-app-only file, and the app looks it up without touching the dictionary the web shares. |
| 05 | [Time, date and duration formatting](./05-format-helpers.md) | 1 | 1 | Standard | One pure module formats every time, range, date, month and duration the design shows, in English and Urdu, in the right timezone. |
| 06 | [Task display state](./06-task-state.md) | 1 | 1 | Heavy | One pure function decides how any task looks (marker, pill, group, whether it needs the person) from today's feed or from History, so every screen shows the same truth. |
| 07 | [Navigation contract](./07-navigation-contract.md) | 1 | 1 | Heavy | Every route the redesign needs is typed before any screen uses it, so screen specs can navigate with checked names while the navigators are wired later (specs 48 and 51). |
| 08 | [Photo row state](./08-photo-row-state.md) | 1 | 1 | Heavy | A pure mapping turns each photo's real state into the redesigned row label, tone and icon, without ever claiming an upload or a check that has not happened. |
| 09 | [Profile read for Part 1](./09-profile-query.md) | 1 | 1 | Light | The Profile screen can read the staff member's own details from the endpoint that exists today. |
| 10 | [History and profile summary client contract](./10-history-client-contract.md) | 1 | 2 | Heavy | The phone has typed, defensive parsers for the three Part 2 responses, written from the contract so phone and server work can run at the same time. |
| 11 | [Staff task history service](./11-history-service.md) | 1 | 2 | Heavy | A read-only service returns one staff member's finished and missed tasks for a month, with Submitted, Verified and Review closed kept separate, exactly as `ARCHITECTURE.md#api` describes for `GET /history`. |
| 12 | [Staff attendance month service](./12-attendance-month-service.md) | 2 | 2 | Heavy | A read-only service returns one staff member's attendance for a month with a single display state per day and the month's counts, never any photo. |
| 13 | [Staff profile summary service](./13-profile-summary-service.md) | 2 | 2 | Heavy | A read-only service returns what the Profile screen shows beyond today's endpoint: company and location names, usual shift in local time, the location's manager name, and this month's attendance and task figures. |
| 14 | [Text roles and name lines](./14-staff-text.md) | 2 | 1 | Heavy | Every new screen sets text through one component that picks the right face, size, line height, colour and direction for a role, and puts entered names on their own isolated line in Urdu. |
| 15 | [My day next-step decision](./15-now-state.md) | 2 | 1 | Heavy | One pure function decides the My day sentence, its tone, the shift line and the single next action, from attendance, tasks and the clock. It replaces `buildAttendanceViewModel` inside `HomeScreen.tsx` with the design's wording while keeping the same attendance rules. |
| 16 | [Check-in and check-out action hook](./16-attendance-action.md) | 2 | 1 | Heavy | The whole check-in and check-out sequence lives in one hook with explicit phases, so the new screens can show each step, while the rules and server calls stay exactly as `HomeScreen.tsx` does them today. |
| 17 | [History, attendance month and profile summary queries](./17-history-queries.md) | 2 | 2 | Standard | Screens read the three Part 2 endpoints through typed, cached hooks that never crash on an old server. |
| 18 | [Staff history, attendance month and profile routes](./18-staff-routes.md) | 3 | 2 | Heavy | The three Part 2 endpoints are reachable at `/api/staff/mobile/history`, `/api/staff/mobile/attendance/month` and `/api/staff/mobile/profile`, for staff only, with the same envelope and error handling as the existing staff routes. |
| 19 | [Action button and bottom dock](./19-action-button.md) | 3 | 1 | Standard | One button component and one bottom dock give every screen the same big yellow next step, the blue form submit, outline and text-style actions, and a non-pressable status when no action is available. |
| 20 | [Pills, status markers and avatar](./20-status-parts.md) | 3 | 1 | Standard | Small presentational parts that carry status: a pill in eight tones, a round task marker that never looks like a checkbox, and the default avatar. |
| 21 | [Top bar, segmented control and language toggle](./21-top-bar-and-toggles.md) | 3 | 1 | Standard | Screens share one back-and-title bar, one segmented control, and one language switch with two looks (on blue, on white), all mirrored in Urdu. |
| 22 | [Text field](./22-field.md) | 3 | 1 | Standard | Sign in, the access code form and the password forms use one large, clear field with a label, an optional show-password button and an inline error. |
| 23 | [Bottom sheet and sign-out dialog](./23-bottom-sheet.md) | 4 | 1 | Heavy | Problems and choices appear in one accessible bottom sheet (weak GPS, wrong place, camera refused, wrong QR, photo results, unsubmitted work, attendance day), and sign-out confirms in one small dialog. |
| 24 | [Message bar, offline banner, skeleton, empty and error states](./24-feedback-states.md) | 4 | 1 | Standard | Every screen shows loading, empty, error, offline and short confirmations the same way. |
| 25 | [Task row](./25-task-row.md) | 4 | 1 | Standard | My day, Tasks and History list tasks with one row: round status marker, the area name, the status pill and the time, and an arrow. |
| 26 | [Receipt layout](./26-moment.md) | 4 | 1 | Standard | Checked in, Checked out and Work submitted share one calm receipt layout with the one earned animation in the app. |
| 27 | [Access code and password replacement form](./27-launch-recovery.md) | 4 | 1 | Standard | The manager access code form and the password replacement form look like the design ("Set your new password") without changing what they check or send. |
| 28 | [Sign in screen](./28-sign-in.md) | 4 | 1 | Standard | Sign in matches the design (All screens > Sign in, Wrong password, Manager access code) and keeps every function it has today. |
| 29 | [My day top area](./29-day-header.md) | 4 | 1 | Heavy | The coloured top of My day says, in one sentence, what to do now, with the greeting, the language switch, and after check-in a compact shift line, exactly as the design draws every state. |
| 30 | [Today's work sheet on My day](./30-today-work.md) | 5 | 1 | Standard | Under the top area, a white sheet shows today's progress in ticks and the next few tasks, so a person sees their whole day at a glance. |
| 31 | [Check-in and check-out screens](./31-attendance-views.md) | 5 | 1 | Heavy | Every step of checking in and out looks like the design (All screens > Check in and check out) and is driven by the phases of `useAttendanceAction`. |
| 32 | [Tasks screen](./32-tasks-screen.md) | 5 | 1 | Standard | The Tasks tab lists all of today's work in three groups, opens a task's details, and keeps the check-in reminder, paging and the tab badge. |
| 33 | [Task details screen](./33-task-detail.md) | 5 | 1 | Standard | Tapping a task shows what it is, where it is in four steps, the manager's note, what to clean, and the one button to start or continue. |
| 34 | [Scan the task QR and cleaning started](./34-qr-scan.md) | 5 | 1 | Heavy | Starting a task looks like the design (Scan the QR, Wrong QR, Cleaning) while the scanner keeps every safeguard it has today. |
| 35 | [Task photo list](./35-photo-list.md) | 4 | 1 | Standard | The photo progress list (All screens > Task photos: Photo progress, Saved uploading, Ready to submit, Photos unavailable) shows each required photo with its real state. |
| 36 | [Work submitted receipt](./36-submission-receipt.md) | 5 | 1 | Light | After submitting, staff see a clear receipt that keeps Submitted and Verified separate, and one button to the next task. |
| 37 | [Profile screen](./37-profile-screen.md) | 5 | 1 | Standard | A Profile tab where staff see who they are, their details, and every setting and help path that used to live on "Help & account". |
| 38 | [Task alerts screen](./38-task-alerts.md) | 4 | 1 | Standard | Phone alerts and permissions get their own screen with honest wording, using the exact registration logic that is on Help today. |
| 39 | [Help screen](./39-help-screen.md) | 4 | 1 | Light | Help becomes a short, plain page of answers reached from Profile, matching the design (All screens > Profile > Help). |
| 40 | [Change password screen](./40-change-password.md) | 5 | 1 | Light | "Change password" from Profile opens its own screen that uses the existing replacement form and signs the person out afterwards, as Help does today. |
| 41 | [Task history list](./41-task-history-view.md) | 5 | 2 | Standard | Staff can look back month by month at the tasks they finished or missed, filter them, and open one (All screens > History: Task history). |
| 42 | [Attendance history with calendar](./42-attendance-history-view.md) | 6 | 2 | Standard | Staff see each month's attendance as a calendar and a list, and can open any day for its times, with Late in orange, never yellow (All screens > History: Attendance history, Attendance day). |
| 43 | [Finished task details](./43-history-task-detail.md) | 4 | 2 | Standard | Opening a finished task shows what happened, step by step, and the three separate states Submitted, Verified and Review closed (All screens > History: Finished task, Waiting for review, Missed task). |
| 44 | [Profile "This month" and "My work" sections](./44-profile-month-work.md) | 4 | 2 | Standard | Two Profile sections built on the profile summary endpoint: this month's attendance and task figures with named totals, and where and when the person works. |
| 45 | [Task photo capture screen](./45-photo-capture.md) | 6 | 1 | Heavy | Taking task photos looks like the design (All screens > Task photos) while the capture logic, which carries the product's trust rules, stays exactly as it is. |
| 46 | [My day screen](./46-my-day.md) | 6 | 1 | Heavy | My day is the screen staff open all day: one sentence, today's work, and one button, built from the parts of specs 15, 16, 29, 30 and 31 and matching every "Moment in the day" in the design. |
| 47 | [History screen](./47-history-screen.md) | 7 | 2 | Standard | The History tab holds both histories behind one Tasks / Attendance switch and keeps the chosen month as the person moves between them. |
| 48 | [Navigation wiring for Part 1](./48-navigation-wiring.md) | 6 | 1 | Heavy | The app's tabs and stack match the design for Part 1: My day, Tasks and Profile tabs, the new stack screens, the message bar everywhere, and the restyled session restore and forced password screens. |
| 49 | [Retire unused old parts and sweep strings](./49-retire-legacy.md) | 7 | 1 | Standard | Old parts the redesign replaced are removed when nothing uses them, and English strings logged as untranslated by earlier specs get Urdu. |
| 50 | [Part 1 release check](./50-part1-release-check.md) | 8 | 1 | Standard | Part 1 (the new look on today's data) is proven ready to hand to staff before any Part 2 screen is wired in, and the product rules describe the new tabs. |
| 51 | [Part 2 wiring: History tab and profile sections](./51-part2-wiring.md) | 9 | 2 | Standard | Part 2 becomes visible: the History tab, finished task details, and the Profile month and work sections, only after Part 1 has passed its release check and the server routes exist. |
| 52 | [End-to-end suite](./52-e2e-suite.md) | 10 | both | Heavy | The only spec that writes or runs end-to-end tests: every user flow of the redesigned staff app runs in a real browser against the web export with the API answered by fixtures, plus the Maestro device flows updated for the new screens. |
| 54 | [Fix: return to the one My day](./54-fix-return-to-my-day.md) | 11 | both | Standard | Fix E2E-1: going back to My day from a stacked screen returns to the existing tab navigator instead of mounting a second one. |
| 55 | [Fix: Joined month in the staff member's time zone](./55-fix-joined-month.md) | 11 | both | Light | Fix E2E-2: Profile shows the joined month in the staff member's location time zone, not UTC. |
| 53 | [Verification pass](./53-verification-pass.md) | 11 | both | Heavy | The final gate. Prove from a clean state that what this plan promised is true, and record every place it is not. This spec observes and reports; it does not fix. |
| 56 | [Fix: the receipt's "Back to my day" returns to My day](./56-fix-receipt-back-to-my-day.md) | 12 | 1 | Light | Finding 56: the Work submitted receipt's "Back to my day" returns to the one My day instead of Task details. |
| 57 | [Fix: times keep their order in Urdu](./57-fix-urdu-times.md) | 12 | both | Standard | Finding 57: every clock time and range shown inside Urdu text is isolated, as `TaskRow` already does. |
| 58 | [Fix: Urdu calendar day names are never cut off](./58-fix-calendar-day-names.md) | 12 | 2 | Standard | Finding 58: every weekday name in the attendance calendar shows in full at every width from 320. |
| 59 | [Fix: photo row text never breaks mid-word](./59-fix-photo-row-wrap.md) | 12 | 1 | Standard | Finding 59: a long status pill moves under the photo's text instead of squeezing it; the footer time is isolated. |
| 60 | [Fix: the e2e build never shares a bundler cache with real builds](./60-fix-test-build-cache.md) | 12 | both | Standard | Finding 60: the e2e build gets its own temp folder and clean cache, so no normal build can carry the fixture API host. |
| 61 | [Fix: the Tasks tab shows its count from launch](./61-fix-tasks-tab-count.md) | 12 | 1 | Standard | Finding 61: the Tasks badge is set at the tab level from the shared task query, with no extra request. |
| 63 | [Fix: product rules name the four staff tabs](./63-fix-product-rules.md) | 12 | both | Light | Finding 63: the "Staff flow" paragraph lists My day, Tasks, History and Profile. |
| 62 | [Clean-up: duplicate camera parts, Joined month helper, dead files, test `t()`](./62-cleanup-duplicates.md) | 13 | both | Standard | Finding 62: one copy of each camera part, `localDate` for Joined, six unused legacy files removed, the shared test `t()` fills values. |
| 64 | [Fix: no "Take a new photo" while a photo waits to upload](./64-fix-new-photo-while-uploading.md) | 12 | 1 | Light | Finding 64 (owner decision): while a photo is saved but not sent, the dead button is hidden and "This photo is saved on your phone and has not uploaded yet." shows beside Upload again. |
| 65 | [Fix: message bar motion, offset and translucent-white tokens](./65-message-bar-polish.md) | 12 | 2 | Standard | Finding 65: the message bar fades and rises, sits above the tab bar at any inset, and translucent whites are tokens. |
| 66 | [Fix: the message bar shows failures with a failure icon](./66-fix-message-bar-tone.md) | 13 | 1 | Light | The message bar takes an optional tone; failed-refresh messages on My day and Tasks show an alert icon instead of the done tick. |
| 67 | [Fix: layouts that break only on the Android phone](./67-fix-native-layout.md) | 14 | both | Standard | Owner APK test: Pressable style callbacks dropped on native, headings under the status bar, tab bar over the selfie camera, oval over the camera title. |
| 68 | [Fix: a failed photo-QR scan never retries by itself](./68-fix-scan-error-loop.md) | 15 | 1 | Light | Owner APK video: a failing photo-QR scan looped between "Please wait…" and the scanner; now the scanner stops, keeps the error and waits for "Scan again". |
| 69 | [Faster task-photo upload on the server](./69-faster-photo-upload-server.md) | 16 | both | Heavy | Photo-flow timing report rows 1, 2, 6 and 9: storage uploads alongside the AI and unkept copies are deleted, no storage lookup on a fresh attempt, warm Cloudinary connections, one retry for a quick transient vendor failure. |
| 70 | [Block reused task photos before the check](./70-block-reused-photos.md) | 17 | both | Standard | Photo-flow analysis §3.2: a photo whose exact or normalized hash matches a kept photo in the company, or whose perceptual hash is within 2 bits of a kept photo of the same area in the last 48 h, becomes a "This photo was already used" retake before any AI or storage call. |
| 71 | [Faster task photos: camera stays open, fewer round trips, smaller capture](./71-faster-photo-flow-app.md) | 16 | 1 | Standard | Photo-flow timing report rows 3-4: an accepted photo is confirmed over the live camera and the next item is ready with no tap; no manifest read around a normal upload; the item timer starts when the camera is ready; a ~3 MP Android capture is checked after resizing. |
| 72 | [Photo-check progress: stages and a percentage after the shutter](./72-photo-check-progress.md) | 18 | 1 | Standard | Owner request after spec 71: after the shutter the camera shows checking photo quality, uploading (real bytes), checking with AI and the result, with one bar and an honest percentage; green tick or amber shake; reduced motion fades only; English and Urdu. |

## Waves

```
W0  00
W1  01 02 03 04 05 06 07 08 09 10 11
W2  12 13 14 15 16 17
W3  18 19 20 21 22
W4  23 24 25 26 27 28 29 35 38 39 43 44
W5  30 31 32 33 34 36 37 40 41
W6  42 45 46 48
W7  47 49
W8  50
W9  51
W10 52
W11 53
W12 56 57 58 59 60 61 63 64 65
W13 62 66
W14 67
W15 68
W16 69 71
W17 70
W18 72
```

Critical path (12 rounds): 00, 01, 14, 19, 23, 31, 46, 49, 50, 51, 52, 53.

## Dependency order

| Spec | Depends on |
|---|---|
| 00 | — |
| 01 | 00 |
| 02 | 00 |
| 03 | 00 |
| 04 | 00 |
| 05 | 00 |
| 06 | 00 |
| 07 | 00 |
| 08 | 00 |
| 09 | 00 |
| 10 | 00 |
| 11 | 00 |
| 12 | 11 |
| 13 | 11 |
| 14 | 01, 02, 03 |
| 15 | 05, 06 |
| 16 | 01 |
| 17 | 10 |
| 18 | 11, 12, 13 |
| 19 | 02, 14 |
| 20 | 02, 06, 14 |
| 21 | 02, 14 |
| 22 | 02, 14 |
| 23 | 19 |
| 24 | 19 |
| 25 | 05, 20 |
| 26 | 19, 20 |
| 27 | 19, 22 |
| 28 | 19, 21, 22 |
| 29 | 05, 15, 20, 21 |
| 30 | 25 |
| 31 | 16, 23, 26 |
| 32 | 07, 19, 24, 25 |
| 33 | 07, 19, 20, 21, 24 |
| 34 | 19, 21, 23 |
| 35 | 08, 19, 20 |
| 36 | 26 |
| 37 | 07, 09, 20, 21, 23, 24 |
| 38 | 07, 19, 21 |
| 39 | 07, 21 |
| 40 | 07, 21, 27 |
| 41 | 17, 21, 24, 25 |
| 42 | 05, 17, 20, 23, 24, 41 |
| 43 | 07, 17, 20, 21 |
| 44 | 05, 17, 20 |
| 45 | 08, 19, 21, 23, 35, 36 |
| 46 | 15, 16, 19, 23, 24, 29, 30, 31 |
| 47 | 05, 07, 21, 41, 42 |
| 48 | 07, 24, 33, 37, 38, 39, 40 |
| 49 | 28, 32, 34, 45, 46, 48 |
| 50 | 49 |
| 51 | 18, 43, 44, 47, 50 |
| 52 | 01-51 |
| 53 | 00-52 |
| 54 | 52 |
| 55 | 52 |
| 56 | 53 |
| 57 | 53 |
| 58 | 53 |
| 59 | 53 |
| 60 | 53 |
| 61 | 53 |
| 62 | 56, 57, 58, 59, 61 |
| 63 | 53 |
| 64 | 53 |
| 65 | 53 |
| 66 | 65 |
| 67 | 66 |
| 68 | 67 |
| 69 | 68 |
| 70 | 69 |
| 71 | 68 |
| 72 | 70, 71 |

## Status shorthand

- **Not started**: nothing done yet
- **In progress**: actively being worked, or resumed from a stopped session
- **Blocked**: waiting on a decision or another spec
- **Done**: done-when checklist fully checked, and actually verified

## Open questions

- Manager phone and a Call button: accepted by the owner, but `Manager` has no phone field. Needs a separate plan (migration plus the web manager form). Spec 00.
- Photo verification is switched off on the server (`docs/CURRENT_CONTEXT.md`). Until the owner decides, real staff will see "Task photos are unavailable" in the photo steps; the redesign handles that state but cannot remove it.
- Deployment order for Part 2: the backend with spec 18 must be live before a phone build containing spec 51 reaches staff.

## Known gaps

- Validator warnings "creates X but no other spec mentions it" (29) are accepted: they are screens reached through the navigator, existing files restyled in place, legacy files spec 49 deletes, and planning documents.
- Validator warnings "Depends on NN is already implied" (16) are accepted: the extra edges name what the spec directly uses, for a context-free implementer.
- Spec 00 has no GitHub issue by decision (no issues or PRs unless the owner asks).
- Model ids come from `.ai/plan-project/references/model-selection.md`, verified there on 2026-10-14; not re-checked today (`../docs/plan-project/mobile-redesign/research/models.md`).
- No physical Android device was available while planning. Specs 50 and 53 record device checks as `[requires: ...]`.
