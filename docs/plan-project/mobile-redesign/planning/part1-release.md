# Part 1 release check (spec 50)

Date: 2026-11-12. Tree: working tree on `main` (uncommitted Part 1 work). Part 2 (History tab, profile month sections) is paused and is not part of this check.

## Gates

| Gate | Result |
|---|---|
| `npm run typecheck --prefix frontend-mobile` | 0 errors |
| `npm test --prefix frontend-mobile` | 530 tests, 530 pass, 0 fail (duration about 12.7 s) |
| `npm run build:web --prefix frontend-mobile` | passes, "Exported: dist" |

Not from a clean install. The suite ran on the existing install (`node_modules` is a symlink shared with another tool, so `npm ci` was deliberately not run and the network is unreliable). The "clean install" part of the first Done-when box is therefore NOT proven here; spec 53 or the owner should rerun from a clean install if that matters.

## Method for the screen walk

Fresh web export copied to a scratch folder and served on 127.0.0.1; headless Google Chrome driven by `playwright-core` (from `frontend/node_modules`, read only), a fabricated signed-in user in `localStorage`, and every `/api/` call answered by `page.route` (no backend). Windows 360x700 and 390x844, English and Urdu. My day was walked in five states (next task, cleaning, retake, time to check out, all submitted) at 360x700; the other screens at both sizes. Screenshots were read and compared with `design/mobile-redesign/v3` (`views.js`, `style.css`). No screenshot or script is in the repo. Document width equalled the window width on every screen and there were no page errors in any run.

Not covered: the browser is not a phone (no device fonts, safe-area insets, system font scaling, screen reader). The camera, QR scanner and the photo flow screens were not walked (no camera in headless Chrome; covered by unit tests). Offline and error states were not screenshotted.

## Screen verdicts

| Screen | Verdict | Notes |
|---|---|---|
| Sign in | matches | English and Urdu at both sizes; logo, language toggle, fields, button, access-code link, hint, connection settings all present and mirrored in Urdu. |
| My day (next, cleaning, retake, check-out, all submitted) | matches | Three task rows fully visible above the dock at 360x700 in all ten runs; Urdu title and sub on separate lines; dock, wait status and live progress as designed. One small defect below (check-out row time truncated), listed as its own fix. |
| Tasks | matches | Title, count, "To do" group, rows, badge on the tab; Urdu mirrored. |
| Task details | fix (spec 54) | Two defects, below. Layout otherwise matches. |
| Profile | matches | Avatar, name, role, "My details" rows (phone, email, staff number, joined), settings and help list below the fold, tab selected. Urdu mirrored, phone and email stay left-to-right. |
| Task alerts | fix (spec 54) | Permission pills are not centred on their row. |
| Help | matches | Five answers and the "ask your manager" note, Urdu mirrored, back in the correct direction. |
| Change password | matches | Three fields with show/hide, rule line, save button, cancel; Urdu mirrored. The save button and Cancel sit at the bottom edge at 360x700 and need a scroll, as the screen scrolls. (The forced-change page shows the same form with Sign out; also checked, matches.) |

No difference is marked "accepted difference" other than those already accepted in earlier spec Logs (listed under Carried over).

## Fixes (proposed new spec 54, "Part 1 visual fixes"; the lead adds it to README and PROGRESS)

1. Task details, Scan QR step connector: the 2 px line between the step circles is drawn over the digits in English (the digits look struck through), at 360 and 390 wide. Urdu is clean. Owner of the part: `frontend-mobile/src/design/StepPath.tsx` (spec 33). The line should sit behind the circles.
2. Task details, Urdu at 360x700: the current step label "کیو آر اسکین" is cut to "کیو آر اسک..." (fits at 390). Same file; labels must never truncate (DESIGN-SYSTEM).
3. Task alerts: each "Not allowed" pill sits about 18 px above its row (top-right, outside the row centre) in English and Urdu; the design puts the pill inside the row, centred vertically. File: `frontend-mobile/src/screens/TaskAlertsScreen.tsx` (spec 38) or the shared row part it uses.
4. My day, 360x700, English, state "time to check out": the header times read "Checked in 8:14 ..." and "Check-out 12:10 ..." (truncated with an ellipsis) when the two time chips are long. Times must not truncate. File: `DayHeader` (spec 29).

## Carried over, not re-decided here (from PROGRESS Log, for spec 53 or the owner)

- Snackbar entry motion (translateY 12 and fade, 200 ms) and the 96 px bottom offset against the tab bar on large insets.
- Translucent-white token for the `onBlue` skeleton and toggle track.
- "Joined" uses the UTC month of `createdAt`.
- "Take a new photo" with an unsent photo does not open the camera (pre-existing).
- Shared test harness `t()` drops placeholder values.
- Urdu copy was not reviewed by a native reader.

## Device walk

No Android SDK, device or emulator was available on this machine, so no APK was built, installed or walked (check-in, task start scan, photos, submit, check-out). No device evidence is claimed. Device model, Android version and APK version are not recorded. For the record: `frontend-mobile/app.json` is version 2.1.8, Android `versionCode` 11. The device-walk box in spec 50 stays unticked, as its own `[requires: ...]` tag allows.

## Product rules

`docs/PRODUCT_UI_RULES.md`, "Staff flow" only: tabs My day, Tasks, Profile (History with Part 2), Help inside Profile, late check-in in orange. `git diff` shows one changed paragraph.

## Lead addendum, 2026-11-12

The four fixes above were applied as follow-ups to specs 29, 33 and 38 and re-checked at 360x700 in headless Chrome (English and Urdu). Task details and Task alerts now match. Suite 532/532, typecheck 0, build passes.
