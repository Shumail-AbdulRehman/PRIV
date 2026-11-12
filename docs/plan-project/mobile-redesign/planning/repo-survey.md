# Repo survey, 2026-11-11

Raw output: `.survey-raw.txt` beside this file (git log, status and the staff app source list).

## State of the tree

- Branch `main` at `7694834`. Another session has uncommitted backend edits (`operationsHourlyProgress`, `managerOperations.service.ts`) and the web redesign files. Nothing under `frontend-mobile/` was modified.
- `frontend-mobile` last changed in `d3d1e93` (new logo). App version `2.1.8`, Android `versionCode` 11.

## Staff app facts that shape the plan

| Fact | Where |
|---|---|
| Tests run with `tsx --test` on Node's test runner, listing only `src/api`, `src/auth`, `src/notifications`, `src/queries`, `src/verification` and `tests/*.test.mjs`. A test in any other folder is silently not run. `src/launch/LaunchRecovery.test.ts` is currently never run. | `frontend-mobile/package.json` `scripts.test` |
| Screen tests use `react-test-renderer` and mock modules by hand with `node:module` `registerHooks`, copied into every file. | `frontend-mobile/tests/nativeComposition.test.mjs`, `attendanceCamera.test.mjs`, `startTaskLifecycle.test.mjs` |
| There is no lint script. Typecheck is `npm run typecheck`. Build gate is `npm run build:web` (Expo web export, also used in CI). | `frontend-mobile/package.json`, `.github/workflows/ci.yml` |
| Styling is NativeWind 4 classes with HSL variables in `global.css`, plus `v5Colors` in `src/theme.ts` for native APIs. | `tailwind.config.js`, `global.css`, `src/theme.ts` |
| Fonts bundled: Inter Regular and SemiBold, Noto Sans Arabic Regular and Bold. Loaded in `App.tsx`. `src/fonts.ts` maps language and emphasis to a family. | `App.tsx`, `src/fonts.ts`, `assets/fonts/` |
| `Text` translates plain string children itself through `translateText`, and picks the Latin font for Latin-only strings. | `src/components/ui/text.tsx` |
| The shared Urdu dictionary must stay identical to the web one: `frontend/tests/operationsLanguage.test.mjs` asserts `deepEqual(webUrdu, nativeUrdu)`. | `frontend-mobile/src/i18n/translations.ts` |
| Tabs are `Shift` (My day), `Tasks`, `Help`. Notification taps navigate to `Shift` or `Tasks` by name. | `src/navigation/StaffTabs.tsx`, `src/notifications/model.ts` |
| `HomeScreen.tsx` (758 lines) holds the attendance view model, permissions, GPS and the attendance upload inline. | `src/screens/HomeScreen.tsx` |
| `VerificationScreen.tsx` holds the whole photo flow (modes prepare, scan, locating, capture, progress) with capture sessions, the local queue, timers and submission. | `src/screens/verification/VerificationScreen.tsx` |
| The photo window countdown is real: `seconds` from `objectSecondsRemaining`; at zero the app asks to "Scan task QR to renew photo window". | `VerificationScreen.tsx` |
| Maestro device flows exist but have never run (no device). | `frontend-mobile/e2e/` |
| A browser layout check script exists for the Expo web export. | `frontend-mobile/scripts/check-staff-ui.mjs` |

## Server facts

| Fact | Where |
|---|---|
| Staff feed: `GET /api/staff/mobile/tasks` (today plus carried-over open work) and `GET /api/staff/mobile/attendance` (last 30 records). Router-level `verifyJwt` and `authorize('STAFF')`. | `backend/src/routes/staffMobile.route.ts`, `services/mobile/staffMobile.service.ts` |
| Staff tasks hide the final outcome on purpose: `staffTaskPresentation` sets `completionOutcome` to null. | `services/verification-v2/sequentialPolicy.ts` |
| `GET /api/staff/profile/me` returns name, email, phone, shift times, `locationId`, `createdAt`. | `controllers/staffSelf.controller.ts` |
| `Manager` has no phone field. One manager per location (`ManagerLocation.locationId` is unique). | `prisma/schema.prisma` |
| Month boundaries in a timezone: `getZonedMonthRange(year, monthIndex, timeZone)`. | `utils/dateTime.ts` |
| Review states: `VerificationException.state` in `OPEN`, `STAFF_ACTION_REQUIRED`, `MANAGER_REVIEW`, `WAITING_SERVICE`, `RESOLVED`. Outcomes: `CompletionOutcome` `VERIFIED_COMPLETE`, `COMPLETED_WITH_EXCEPTIONS`, `LEGACY_RECORDED`. | `prisma/schema.prisma` |
| Backend unit tests are Vitest with Prisma mocked; route tests start an Express app and call it with a signed token. | `controllers/selfAuthorization.test.ts`, `routes/launch.route.test.ts` |
| Staff may read a task's photo checklist before starting (`GET /api/task-instance/:taskId/verification`, `requireTaskAccess`). | `routes/verification.route.ts` |
