# Architecture: staff phone app redesign

A visual and interaction rebuild of the staff Android app in `frontend-mobile/` (Part 1), plus History and profile figures backed by three new read-only staff endpoints in `backend/` (Part 2). Derived from the code on 2026-11-11 (`docs/plan-project/mobile-redesign/planning/repo-survey.md`), not decided up front.

## Stack

Expo 54, React Native 0.81, React 19.1, React Navigation 7 (bottom tabs and native stack), TanStack Query 5, Reanimated 4, react-native-svg, lucide-react-native, expo-haptics, expo-camera, expo-location. Server: Express 5, Prisma 7, Zod. **No new runtime dependency** in either app. The e2e spec may add `@playwright/test` as a mobile devDependency (spec 52).

## Folder structure added or changed

```
frontend-mobile/
  assets/fonts/            spec 03 adds Inter Bold, Inter ExtraBold, Manrope Bold, Manrope ExtraBold, Manrope licence
  src/
    design/                shared presentational parts and pure helpers (no data fetching)
      tokens.ts            02  colours, type roles, spacing, motion constants
      format.ts            05  time ranges, dates, durations
      taskState.ts         06  task to marker, pill and grouping
      StaffText.tsx        14  role-based text, NameLine, isolate helpers
      ActionButton.tsx     19  ActionButton, ActionDock, DockStatus
      Pill.tsx StatusMarker.tsx Avatar.tsx          20
      TopBar.tsx SegmentedControl.tsx LanguageToggle.tsx   21
      Field.tsx            22
      BottomSheet.tsx ConfirmDialog.tsx              23
      Feedback.tsx         24  Snackbar provider and hook, OfflineBanner, Skeleton, EmptyState, ErrorState
      TaskRow.tsx          25
      Moment.tsx           26  receipt layout (badge, title, facts)
      StepPath.tsx         33
    i18n/staffAppTranslations.ts       04
    navigation/routeNames.ts           07
    queries/profile.ts                 09 (Part 1 profile read)
    queries/history.ts                 17 (Part 2 reads)
    history/types.ts history/parse.ts  10 (Part 2 client contract)
    verification/photoRowState.ts      08
    screens/
      day/        nowState.ts (15), useAttendanceAction.ts (16), DayHeader.tsx (29), TodayWork.tsx (30),
                  AttendanceLocating.tsx AttendanceSheets.tsx AttendanceReceipt.tsx (31)
      task/       TaskDetailScreen.tsx (33)
      profile/    ProfileScreen.tsx (37), TaskAlertsScreen.tsx (38), ChangePasswordScreen.tsx (40),
                  ProfileMonth.tsx ProfileWork.tsx (44)
      history/    TaskHistoryView.tsx MonthBar.tsx (41), AttendanceHistoryView.tsx AttendanceCalendar.tsx (42),
                  HistoryTaskScreen.tsx (43), HistoryScreen.tsx (47)
      verification/SubmissionReceipt.tsx (36)
      HomeScreen.tsx (46) TasksScreen.tsx (32) StartTaskScreen.tsx (34) LoginScreen.tsx (28) HelpScreen.tsx (39)
      verification/VerificationScreen.tsx (45) verification/VerificationProgress.tsx (35)
  tests/
    support/nativeHarness.mjs   01  shared module-mock and render harness
    design/  screens/  day/     component and hook tests (one file per spec)
  e2e-web/                      52  Playwright against the web export, API mocked
backend/src/
  services/mobile/staffHistory.service.ts           11
  services/mobile/staffAttendanceMonth.service.ts   12
  services/mobile/staffProfileSummary.service.ts    13
  routes/staffMobile.route.ts                       18 (adds three GET routes)
```

## Layers

| Path | Owns | Must never |
|---|---|---|
| `src/design/*` | Presentation parts and pure helpers | Fetch data, read auth, navigate, or hold business rules about attendance or photos |
| `src/screens/**` | Composition of one screen: reads queries, calls hooks, navigates | Re-implement a rule that exists in `utils/attendance.ts`, `verification/*` or `launch/recoveryPolicy.ts` |
| `src/screens/day/nowState.ts`, `src/design/taskState.ts`, `src/verification/photoRowState.ts` | Pure decisions, unit tested | Import React Native |
| `src/queries/*` | TanStack Query keys and fetchers | Hold UI state |
| `src/verification/*`, `src/launch/*`, `src/api/*`, `src/auth/*`, `src/notifications/*` | Existing logic | Be changed by a redesign spec, except where a spec's Owns names the file |
| `backend/src/services/mobile/*` | Staff read models, tenant scoping | Touch `req`/`res`; write data |
| `backend/src/routes/staffMobile.route.ts` | Query parsing and response envelope | Contain query logic |

## State ownership

| State | Owner |
|---|---|
| Server data | TanStack Query. Existing keys in `queries/staff.ts`; new keys in `queries/profile.ts` and `queries/history.ts` under `['staff', staffId, ...]` |
| Identity | `useAuth()` |
| Language | `useLanguage()` (`t`, `language`, `isRTL`) |
| Attendance action progress | `useAttendanceAction` (spec 16) local state |
| Photo flow | `VerificationScreen` local state, unchanged logic |
| Sheet open, filters, selected month, history tab | Local component state |
| Message bar | `Snackbar` context (spec 24), mounted in `AppNavigator` (spec 48) |

## Styling

New code uses React Native `StyleSheet.create` (created outside component bodies) and values from `src/design/tokens.ts`. New code adds no NativeWind classes. Legacy files keep NativeWind until spec 49 removes what is unused. Logical direction: when `isRTL`, rows use `row-reverse` and text aligns right, exactly as the existing `Text` component does.

## Fonts

`src/fonts.ts` (spec 03) exposes `fontFor(role, language)` returning a registered family. `StaffText` (spec 14) is the only component that sets `fontFamily` in new code. Font loading never blocks sign-in (existing `NativeFontsReady` rule).

## Navigation

Route names live in `src/navigation/routeNames.ts` (spec 07) and the param lists in `src/types.ts`. Tab route names `Shift` and `Tasks` stay unchanged because notifications navigate to them. Final shape:

- Tabs: `Shift` (My day), `Tasks`, `History` (Part 2, spec 51), `Profile`.
- Stack over the tabs: `StartTask`, `Verification`, `TaskDetail`, `HelpGuide`, `TaskAlerts`, `ChangePassword`, `HistoryTask` (Part 2), `SpatialDiagnostic` (dev only).

## Part 2 API contract {#api}

Three new `GET` routes on the existing staff router (`/api/staff/mobile`, already `verifyJwt` and `authorize('STAFF')`). Responses use the existing `{ success: true, data }` envelope. All three are tenant-scoped to `req.user.companyId` and to the actor's own records. All three are read-only. Month strings are `YYYY-MM`; dates are `YYYY-MM-DD` in the location's timezone; instants are ISO strings.

**Timezone rule.** Month and day boundaries use the actor's assigned location timezone. If the actor has no location, use `Asia/Karachi` (the `Location.timezone` schema default). `range.latestMonth` is the current month in that timezone; `range.earliestMonth` is the later of the actor's `createdAt` month and 12 months before the current month. A `month` outside the range is a 400 with message "Choose a month from your history".

### `GET /history?month=YYYY-MM&filter=all|verified|waiting|missed&cursor=...&limit=1..50`

Defaults: `month` = latest month, `filter` = `all`, `limit` = 30.

Included tasks: `TaskInstance` rows in the actor's company where `isActive` and `status <> 'CANCELLED'`, `date` within the month, and the actor is responsible: `staffId = actor.id`, or a `TaskAssignment` for the actor has status `STARTED`, `COMPLETED`, `MISSED` or `FAILED`. Still-open work (not submitted, not missed, current assignment still the actor's) is excluded because it lives in the Tasks tab.

Row `status`, first match wins:
1. `MISSED`: not submitted and (`status = 'MISSED'` or the actor's assignment is `MISSED` or `FAILED`).
2. `VERIFIED`: `completionOutcome = 'VERIFIED_COMPLETE'`.
3. `ACCEPTED_WITH_EXCEPTIONS`: `completionOutcome = 'COMPLETED_WITH_EXCEPTIONS'`.
4. `WAITING_FOR_REVIEW`: submitted and the task's `VerificationException.state` is not `RESOLVED`.
5. `SUBMITTED`: submitted (`staffSubmittedAt` set or `status = 'COMPLETED'`), including `LEGACY_RECORDED`.

`reviewState`: `NOT_NEEDED` (no exception), `OPEN` (any state except `RESOLVED`), `CLOSED` (`RESOLVED`).

Filters: `verified` = `VERIFIED` or `ACCEPTED_WITH_EXCEPTIONS`; `waiting` = `WAITING_FOR_REVIEW` or `SUBMITTED`; `missed` = `MISSED`.

Response `data`:
- `month`, `timezone`, `range: { earliestMonth, latestMonth }`
- `counts: { verified, waiting, missed, total }` for the whole month, ignoring `filter`
- `items[]`: `id`, `areaName` (area snapshot, else title), `title`, `date`, `shiftStart`, `shiftEnd`, `timezone` (the task's location), `status`, `reviewState`, `startedAt` (or null), `submittedAt` (or null), `photos: { received, required }` (mandatory evidence requirements on the task; `received` counts those not in `MISSING`), `location: { id, name }`
- `nextCursor`: opaque string or null. Order: `date` desc, `shiftStart` desc, `id` desc. A cursor from another month or filter is a 400 "Refresh your history".

Never returned: photos or photo URLs, AI scores, issue reason codes, manager notes, performance records, other staff.

### `GET /attendance/month?month=YYYY-MM`

`data`: `month`, `timezone`, `range` (as above), `counts: { onTime, late, absent, missedCheckout }`, `records[]` ordered by `date` desc: `id`, `date`, `expectedStart`, `expectedEnd`, `checkInTime`, `checkOutTime`, `lateMinutes` (or null), `location: { id, name }`, `state`.

`state`, first match wins: `UPCOMING` (`expectedStart` after now and no check-in), `ABSENT` (no check-in and `expectedEnd` before now), `MISSED_CHECKOUT` (status `MISSED_CHECKOUT`), `ON_SHIFT` (checked in, not checked out, `expectedEnd` after now), `LATE` (`isLateCheckIn` or status `LATE`), `ON_TIME`. Counts: `onTime` = `ON_TIME` plus `ON_SHIFT` that were not late; `late` = any record with a late check-in; `absent`; `missedCheckout`. No image fields are ever returned.

### `GET /profile`

`data`: `id`, `name`, `email`, `phone` (or null), `joinedAt`, `company: { name }`, `location: { id, name, address, timezone }` or null, `usualShift: { start: 'HH:mm', end: 'HH:mm' }` or null (staff `shiftStart`/`shiftEnd` read in the location timezone), `manager: { name }` or null (the active `Manager` linked to the actor's location through `ManagerLocation`), and `month` for the current month: `{ month, shiftsScheduled, shiftsAttended, onTime, tasksAssigned, tasksSubmitted }`. Scheduled counts attendance rows whose `expectedStart` is not in the future, leaving out a shift still in progress with no check-in yet (it is Upcoming in the calendar until check-in or its end); attended counts those with a check-in; on time counts attended without a late check-in; tasks are the actor's active, non-cancelled tasks dated in the month, submitted as above.

## Test seams

- Mobile pure modules: `npx tsx --test <file>` with `node:test`.
- Mobile components and hooks: `tests/support/nativeHarness.mjs` (spec 01) mocks `react-native`, safe area, navigation, query client, language, auth, haptics, camera and location, and renders with `react-test-renderer`. Assert on text, accessibility labels and props, never snapshots.
- Backend services: Vitest with `../../prisma/prisma.js` mocked (pattern `controllers/selfAuthorization.test.ts`). Routes: Express app plus signed token (pattern `routes/launch.route.test.ts`).
- E2E: Playwright against `expo export --platform web`, API answered by fixtures through `page.route` (spec 52). Never a real backend or production.

## Protected files

Do not edit unless your spec's Owns names them: `frontend-mobile/App.tsx` (spec 03 only), `frontend-mobile/package.json` (spec 01; spec 52 may add its devDependency and script), `src/types.ts` (spec 07; specs 48 and 51 named as later sole editors), `src/i18n/translations.ts` (spec 04, lookup functions only), `src/navigation/*` (specs 07, 48, 51), anything in `backend/` except specs 11, 12, 13, 18, `frontend/` (never), `backend/prisma/` (never).

## Invariants: violating one is a defect

1. **No feature loss.** Every action, message, permission prompt, recovery path, setting and dev tool the app has today stays reachable: server address settings on sign in, manager access code, forced password change, phone alerts retry, open settings, torch, restart scanner, retry uploads, refresh results, spatial diagnostic in dev builds.
2. **Logic stays where it is.** Attendance windows come from `utils/attendance.ts`; attendance upload reconciliation from `launch/recoveryPolicy.ts`; photo capture, queue, timers and submission from `verification/*`. Redesign specs move or wrap calls; they do not change the rules.
3. **Server stays authoritative.** Never infer upload from a captured photo, verification from submission, or permission from the UI. Show only actions the server allows.
4. **Three separate states.** Submitted, Verified and Review closed are separate words, colours and fields everywhere.
5. **Yellow means "needs you".** It is the next-step button and the needs-you marker and pill. Late is orange (`late`), never yellow.
6. **Entered names never sit inside an Urdu sentence** and are never translated.
7. **Urdu and right-to-left work on every screen.** Urdu body, label and meta text is one step larger than English; Urdu titles keep the sizes in `DESIGN-SYSTEM.md#type` (some smaller than English) with taller line heights.
8. **No attendance or task photos in History or Profile.** The staff app shows no photo it did not just take.
9. **Shared Urdu dictionary unchanged.** `urdu` in `src/i18n/translations.ts` stays deep-equal to the web copy; new strings go to `staffAppTranslations.ts`.
10. **No silently disabled actions.** An unavailable action is replaced by a status that says why and what to do.
11. **No new runtime dependency, no migration, no schema change.**
12. **Every new endpoint is consumed**: `/history` by spec 17 and 41, `/attendance/month` by 17 and 42, `/profile` by 17 and 44.
13. **Tab route names `Shift` and `Tasks` never change** (notification navigation depends on them).
