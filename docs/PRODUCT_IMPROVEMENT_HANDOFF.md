# CleanOps: scoped product-improvement implementation plan

Prepared 2026-09-17 against the current working tree. This is a handoff specification, not permission to redesign the product again or to implement unrelated ideas.

## 1. Read this first: user-approved scope

Implement ONLY these four workstreams, in the phased order below:

1. **Today clarity:** make overdue work and missing check-ins easier to identify using existing status data.
2. **Task-setup usability:** simplify the existing creation form and add a read-only weekly view of cleaning schedules.
3. **First-time setup:** guide an activated administrator through location → team/shift → first task schedule.
4. **Large-workspace performance:** paginate/search the specified lists on the server, split route bundles, and load appropriately sized thumbnails.

### Explicitly excluded by the user

- NO task reassignment controls on Today. Existing automatic scheduling/assignment and existing manual assignment already handle this.
- NO photo approval/rejection screen, human review queue, approval state, or manual override of automatic verification.
- NO original suggestion 4: broad security/reliability audit, monitoring platform, failed-job dashboard, or general test-coverage initiative.
- NO original suggestion 6: notifications, alerts delivered to users, email, push, Slack, or notification preferences.
- NO scheduler rewrite, new scheduling engine, cron changes, different assignment priorities, changes to grace periods, or new recurrence types.
- NO drag-and-drop schedule editing or assignment from the weekly view.
- NO new manual task-instance creation flow.
- NO changes to pricing, Paddle checkout, billing lifecycle, company plans, or signup-first onboarding.
- NO undo/restore/soft deletion. Permanent deletion was explicitly requested and implemented.
- NO new visual identity or another redesign of Home, Features, Pricing, login, or signup.
- NO mobile-app feature work, architecture/framework migration, or general cleanup of unrelated files.

**Scope distinction:** focused tests for the changes in this plan are required. This does not reintroduce the removed broad reliability/testing project. Preserving existing access restrictions is also required; it does not authorize a security-audit workstream.

## 2. Working-tree protection and implementation protocol

The current tree contains uncommitted UI redesign and permanent-deletion work. That is the implementation baseline. Do not restore files to HEAD, discard changes, overwrite whole directories, or assume untracked files are disposable.

Before editing:

1. Read this entire document and applicable AGENTS.md instructions, if any.
2. Run `git status --short` and `git diff --stat`; record the existing work.
3. Read the actual files identified for the current phase. Paths/function names below are verified starting points, not permission to ignore later changes.
4. Run baseline checks from section 12. Record existing failures separately from changes you introduce.
5. Write a short phase plan listing files to touch, expected API changes, and acceptance criteria.
6. Implement one phase at a time. Do not begin the next phase until its acceptance checks pass.
7. When a phase is complete, report changed files, behavior, checks, limitations, and the next phase.
8. If context is running low, save progress in `docs/PRODUCT_IMPROVEMENT_PROGRESS.md`: completed task IDs, exact remaining tasks, decisions, commands/results, unresolved failures. Never claim unfinished work is complete.

Do not run demo seed scripts, database resets, bulk deletion, production migrations, or real payment actions to test this plan. Use isolated fixtures and mocked billing. Add schema migrations only if a phase demonstrates a genuine need; the proposed design generally does not require new schema fields.

### Existing deletion migration

`backend/prisma/migrations/20260917000000_permanent_deletion_media/migration.sql` adds the media cleanup outbox. It belongs to earlier authorized work. The associated implementation is in:

- `backend/src/services/deletion.service.ts`
- `backend/src/services/deletedMedia.service.ts`
- `backend/src/cron/deletedMediaCron.ts`
- `backend/docs/permanent-deletion.md`
- `frontend/src/components/common/DeleteButton.tsx`
- `frontend/src/lib/invalidateWorkspace.ts`

Preserve it. Do not apply it to a live database automatically as part of this UI plan. Test environments need the existing migrations applied before database tests.

## 3. Product architecture and invariants

### Stack and entry points

| Area | Existing implementation |
| --- | --- |
| Web | React, TypeScript, Vite, React Router, TanStack Query, Redux auth, Tailwind, Radix components |
| Route definitions | `frontend/src/main.tsx` — routes are defined here, not in App.tsx |
| Auth/session guards | `frontend/src/App.tsx` |
| Workspace billing gate | `frontend/src/components/onboarding/WorkspaceGate.tsx` |
| Product shell | `frontend/src/components/layout/DashboardLayout.tsx`, `Sidebar.tsx` |
| API | Express + Prisma + PostgreSQL, `backend/src/app.ts` |
| Data model | `backend/prisma/schema.prisma` |
| Tenant/location scope helpers | `backend/src/utils/scope.ts` |
| Time-zone helpers | `backend/src/utils/dateTime.ts`, `backend/src/cron/taskInstanceWindow.ts` |

### Preserve these invariants in every phase

- A guest creates an account before selecting/paying for a plan.
- `/choose-plan` and `/welcome` retain their current access and subscription-confirmation behavior.
- `WorkspaceGate` remains the authority for unpaid new workspaces. A setup checklist must not replace it.
- An existing cancelled/past-due subscriber's billing access must not be accidentally blocked.
- ADMIN has company-wide access; MANAGER sees only assigned locations and related staff/tasks. An empty manager location list means **no locations**, not all locations.
- STAFF access must not be expanded by these changes.
- Existing company IDs and access rules must come from the authenticated server-side user, never from a trusted client-supplied companyId.
- Preserve multipart reference-image uploads, area names, automatic verification data, QR codes, existing task proof links, and permanent deletion.
- Read-only screens never generate task instances, call assignment mutations, or execute a cron job.
- Status values remain existing enums. Friendly labels do not change database values.
- Reference-photo setup is allowed. A new photo-review workflow is excluded.
- Date-only values and timestamp instants are different concepts. Use site time zones for presentation and existing backend conventions for API dates.
- No hardcoded demo totals, artificial charts, guessed assignment results, or fake completed setup steps.

### Shared theme

Keep the current public/product theme:

- Body: Inter Variable; headings: Manrope Variable; existing self-hosted font imports.
- Primary blue `#4264d9`, navy text `#21334b`, muted text `#657286`, border `#e6eaf0`.
- Product background `#f6f8fc`, white surfaces, restrained borders/shadows.
- Source of truth: `frontend/src/index.css`, `marketing.css`, `workspace.css`.
- Reuse `PageHeader`, `SurfaceCard`, `StatCard`, `DataTable`, `Button`, `Input`, and Radix dialogs.
- Avoid promotional hero panels, redundant statistic cards, nested cards, loud gradients, novelty fonts, or a new navigation system.

## 4. Execution order and deliverables

| Phase | Outcome | Dependency |
| --- | --- | --- |
| P0 | Baseline and recorded contracts | None |
| P1 | Clearer Today screen | P0 |
| P2 | Extracted, guided task form with safe partial-failure handling | P0 |
| P3 | Read-only weekly site schedule | P2 |
| P4 | Data-driven first-time setup journey | P2; P3 not technically required |
| P5A | Route/code splitting | P0; do after UI structure settles |
| P5B | Server pagination/search for Team and Attendance | P1/P4 contracts settled |
| P5C | Bounded task-history loading and thumbnails | P3/P5B |
| P6 | Final integration verification and handoff | All preceding phases |

Suggested small implementation units: P1; P2 extraction; P2 wizard; P3 API; P3 UI; P4 status endpoint; P4 UI/form integration; P5A; P5B Team; P5B Attendance; P5C history; P5C images; P6. Each should be independently reviewable. Do not combine all units into one unreviewable rewrite.

## 5. P0 — baseline and contract inventory

Read and record:

- `frontend/src/pages/Manager/{TodayStatusPage.tsx,types.ts,api.ts,queries.ts}`
- `frontend/src/pages/Dashboard/{DashboardPage.tsx,queries.ts}`
- `frontend/src/pages/Location/{LocationDetailPage.tsx,LocationsPage.tsx,api.ts,queries.ts}`
- `frontend/src/pages/Staff/{StaffPage.tsx,StaffDetailPage.tsx,api.ts,queries.ts}`
- `frontend/src/pages/Task/{api.ts,queries.ts,types.ts}`
- `frontend/src/pages/Assignment/{api.ts,queries.ts}`
- `frontend/src/pages/Attendance/{AttendancePage.tsx,api.ts,queries.ts}`
- `backend/src/controllers/{manager,location,staff,attendance,taskTemplate,assignment}.controller.ts`
- Relevant route/validation files; actual response envelopes and query keys.

Record baseline screenshots at 1440px and 390px for Today, location details/creation form, Team, Attendance, dashboard, and an activated empty workspace. Also check 768px.

Record production bundle sizes from a fresh frontend build. Earlier builds produced approximately a 1.1 MB minified aggregate JS chunk, but **remeasure**; this is context, not a promised baseline.

Record exactly which APIs are also consumed by `frontend-mobile`. Existing response shapes must remain compatible.

**P0 complete when:** baseline commands, screenshots, endpoint contracts, existing failures, and touched-file boundaries are recorded. Do not spend this phase implementing new features.

## 6. P1 — Today: make exceptions understandable

### Goal and layout

Within a few seconds, a manager should see who has a missing check-in, work needing attention, and where to open the existing details. Keep Today observational.

Keep this order:

1. Existing title, short explanation, Refresh button.
2. One compact summary row, maximum four values.
3. All staff / Needs attention controls, with a count for the latter.
4. Search, location, attendance, task-state filters.
5. One staff table; an optional concise exception summary inside each row.

Do not add a second collection of exception cards repeating the table. Keep **All staff** as the default; preserve `?view=attention` links from Overview.

### Files

Primary: TodayStatusPage.tsx, Manager/types.ts, DashboardPage.tsx.
Potential new pure helper: `frontend/src/pages/Manager/todayPresentation.ts`.
Backend, only if needed for unambiguous read data: `getTodayStatus` in manager.controller.ts and related typed DTOs.

### Exact status behavior

The current endpoint returns staffStatus entries with attendance, tasks, flags, taskCounts, attentionCount, and attendanceDisplayStatus. Reuse that data.

| Condition | Display/handling |
| --- | --- |
| `flags.isShiftNotStarted` | Neutral “Shift not started”; not absent and not missing check-in |
| `flags.isAbsent` | “Missing check-in”/existing Absent badge; attention needed |
| No attendance record | “No check-in record”; do NOT assert absence solely because the row is missing |
| `flags.isLateAttendance` | “Late check-in”; distinguish it from currently missing check-in |
| Attendance status `MISSED_CHECKOUT` | “Missing check-out”; attention needed |
| Open task PENDING/IN_PROGRESS with existing lateness information | Label precisely: “Late start” when evidence is about starting; only call a task overdue when its end time has actually passed |
| MISSED/NOT_COMPLETED_INTIME | Preserve existing status; show an exception label |
| COMPLETED with historical `isLate` | May remain in existing attention reporting; never label as currently unfinished/overdue |
| CANCELLED | Not currently pending or overdue |
| Unassigned staff | Display “Unassigned”; never fabricate a site or shift |

Important current behavior: `isCurrentlyLate` is computed using `task.isLate || isPendingStartLate`; it is not a reliable standalone “currently unfinished” flag. Inspect task status too. `attentionCount` can count categories that overlap. Do not label it “unique tasks” or sum overlapping reasons into a new misleading total.

Use one shared helper for Today/Overview attention inclusion and row ordering so their people counts agree. Preserve the existing inclusion rule unless a documented display bug requires a narrow fix: absent OR late attendance OR hasAttentionTasks. The new helper must not change automatic task status transitions.

Sort attention rows deterministically by missing check-in first, unfinished overdue work second, other existing exceptions third, then name and ID. Sort all-staff rows by name then ID. Keep a user's chosen filters while refreshing.

Display a short list of reasons in each attention row, e.g. “Missing check-in · 2 late starts”. Cap initial text; show more through an accessible disclosure if necessary. No new action buttons except navigation to existing details.

### Time zones and deep links

- Display times in the staff member's site's time zone. The frontend type includes `staff.location.timezone`, but the backend staff-location select currently needs verification; add that field if missing.
- The endpoint has a single top-level `date` derived from the first site anchor. Do not use that as every site's date when linking a multi-time-zone list to staff details.
- Add an additive per-entry `localDate: YYYY-MM-DD` if needed, computed server-side for that site using one captured request time. An unassigned entry uses the existing explicit fallback time zone.
- Keep existing detail parameters `dateFrom`, `dateTo`, `tab`, `focus=today`. Supply the entry's local day for dateFrom/dateTo.
- Prefer server-provided `asOf` for displayed time calculations; do not use an unreliable client clock to reclassify business state.

### Interaction, state, and tests

- Search is case-insensitive and trimmed; empty search restores results.
- Label every filter. Add Clear filters when any non-default filter is active.
- No-result state distinguishes “no assigned team yet” from “no matches”.
- Error state must not show zero totals as though the request succeeded.
- Refresh pending state must not wipe selected filters or misleadingly show new totals against old rows.
- Test future shift, absent record, missing record, late-but-completed task, cancelled task, missing checkout, mixed exceptions, and two sites on different local dates.
- Test Overview attention count against Today with the same scoped data.

**P1 acceptance:** no reassignment/review controls; no scheduler mutation; consistent counts; correct deep links; clear exception labels; filters/refresh/empty/error work; no whole-page horizontal overflow at 390px.

## 7. P2 — guided task creation without altering scheduling

### Goal

Turn the long creation form into a short sequence. This changes how users enter existing schedule data, not how the scheduler runs.

### Extract before redesigning

`LocationDetailPage.tsx` currently contains TemplatesTab, task creation, task editing, QR code views, assignment controls, and task-history rendering. Do not rewrite the whole file at once.

Suggested files:

- `frontend/src/pages/Task/components/TaskScheduleWizard.tsx`
- `frontend/src/pages/Task/components/TaskScheduleFields.tsx`
- `frontend/src/pages/Task/taskScheduleForm.ts` for pure validation/conversion helpers
- `frontend/src/pages/Location/components/LocationTemplatesTab.tsx`

First extract existing form logic and render it without behavior changes. Verify uploads, edit, assignment, QR, and delete still work. Then implement the wizard.

### Wizard contract

Props: locationId, locationName, timeZone, allowed staff options, open/onOpenChange, and onCreated callback returning the created template ID. When opened from a location, location is preselected and read-only. No redundant site-selection step.

Use four steps:

1. **Task:** title, optional instructions, named reference photos.
2. **Team:** existing optional manual staff choice, with a neutral default such as “Use automatic assignment”. This maps to the existing no-manual-assignee path, not a new algorithm. Do not promise which person will be assigned.
3. **Schedule:** current DAILY/ONCE options, effective date, start/end time, and supported recurrence end date. Show the site time zone beside times.
4. **Review:** human-readable summary; one “Create schedule” submit action.

No database writes when clicking Next or Back. Earlier values/photos persist within the open wizard. Step buttons are keyboard-accessible, and invalid step navigation focuses the first invalid field.

Do not force an assignee. The automatic scheduler remains responsible for its existing work. Do not add automatic task generation to the create success callback.

### Field validation and compatibility

- Title is trimmed and required; instructions remain optional.
- Preserve current reference-image requirements, named areas, allowed file types, configured upload count, plan allowance, and unique-name validation.
- Reject partially filled photo rows instead of silently losing a selected file or its name.
- Use the current allowance/configuration; do not invent a fixed image cap or enlarge limits.
- Keep existing API/form-data field names and aligned `referenceImages` / `referenceNames` ordering.
- Preserve current backend capacity, overlap, effective-date, and assignment validation; show its errors beside the relevant step/field.
- Use site-local time conversion via existing `fromZonedTime` and helpers. Do not call `new Date('YYYY-MM-DDTHH:mm')` and assume browser-local time is correct.
- Existing multipart-create and edit validation paths differ; inspect both before imposing a new rule. Do not silently disable existing valid overnight schedules or add a new interpretation of equal start/end times.
- If an existing time rule is contradictory, isolate it with a small test and record it as a blocker for that case. Do not rewrite cron logic to make the form pass.
- The current `createForm` omits some fields supported by the API. Only surface supported fields after their end-to-end serialization is implemented and tested; never render a control whose value is ignored.
- Edit must preserve stored IDs, existing photos, and assignment rules. Do not turn editing into delete-and-recreate. If replacing reference photos is not supported, keep it unavailable rather than faking it.
- Revoke object preview URLs on file removal, wizard reset, and unmount; do not discard File objects on Back.

### Critical partial-success behavior

Current creation uses POST `/task-template`, then the existing assignment PATCH when a person was selected. It currently tries to delete a created template if assignment fails. Permanent deletion makes this a destructive rollback, potentially racing automatic task generation.

Replace this wizard-level failure handling with explicit states:

`editing → creating → created(id) → assigning(optional) → complete`

- Capture the server-returned template ID immediately after successful POST.
- Never repeat POST once the ID is known.
- If manual assignment fails, retain the ID and show “Schedule created. Staff assignment could not be completed.”
- Provide **Retry assignment**, using the existing assignment API and existing template ID.
- Provide **Keep schedule without manual assignment**, leaving the normal automatic-assignment path intact.
- Do not automatically delete the newly created template to compensate for an assignment failure.
- Do not announce complete manual assignment before PATCH succeeds.
- If creation times out with an unknown outcome, do not automatically retry POST. Explain uncertainty and link to the site's schedule list so the user can check before retrying. Do not claim exactly-once writes without backend idempotency.
- Disable repeated submission while a mutation is pending. Closing during a pending write should be blocked consistently.
- Success invalidates location details, location counts, dashboard, relevant Today/team data, and new setup-status queries. Use the shared invalidation helper.

The existing multipart schema accepts staffId, but directly sending it may bypass the checks/side effects of the assignment endpoint. Do not collapse the requests merely because that field exists. Keep the existing assignment API for this phase.

### Tests and acceptance

Test Back/Next persistence; required fields; upload names/order; a site whose time zone differs from browser; DAILY/ONCE; supported overnight behavior; duplicate submit; creation failure; creation-success/assignment-failure; assignment retry without duplicate POST; unknown network outcome; closing/reopening; existing edit/QR/delete operations.

**P2 acceptance:** a user can create the same valid schedules as before through a simpler flow; scheduler and assignment algorithms are unchanged; automatic assignment remains default-capable; partial assignment failure cannot silently destroy the schedule or create duplicates.

## 8. P3 — read-only weekly schedule at each location

### Placement and behavior

Add **Schedule** as a view within a location, alongside existing team/task-history capabilities. Do not add another top-level sidebar destination.

Controls: Previous week, This week, Next week. Use a Monday–Sunday week in the site's time zone. Show the exact date range and time-zone label. Keep selected week in `?week=YYYY-MM-DD` where the value is the Monday calendar date. Reject invalid date values and normalize valid non-Mondays consistently.

Desktop: seven day columns or a clear seven-day agenda. Mobile: stacked day sections. Each item shows task title, site-local time, actual status if present, and assignee if actually known. Overlapping work must remain legible; stacking/listing is fine. Do not build an hour-by-hour drag-and-drop calendar.

### Important: a future preview is not an actual task

Current DAILY and ONCE schedulers generate task instances on their execution schedule, often for the current day. Future database instances may not exist. The weekly screen must not run the scheduler or pretend missing instances are actual assigned tasks.

Use two explicit item types:

- `actual`: existing TaskInstance; persisted ID, persisted status, persisted/current assignee.
- `planned`: read-only occurrence projected from a valid TaskTemplate; template ID and date, labelled “Planned”. An automatic assignee is **not yet assigned**. A template's manual default can be shown as “Default staff”, not as a guaranteed runtime assignee.

### Proposed additive read endpoint

`GET /api/location/:id/schedule?week=YYYY-MM-DD`

Register the route clearly in `backend/src/routes/location.route.ts`. Authorize ADMIN/MANAGER and reuse existing company/location checks. Add a small dedicated service, e.g. `backend/src/services/schedulePreview.service.ts`, rather than embedding projection in a large controller.

Keep all existing endpoint response shapes unchanged. Proposed new `data` shape inside ApiResponse:

```ts
interface LocationWeekSchedule {
  location: { id: number; name: string; timezone: string };
  weekStart: string; // local YYYY-MM-DD
  weekEndExclusive: string; // local YYYY-MM-DD
  asOf: string; // UTC timestamp
  days: Array<{
    date: string; // local YYYY-MM-DD
    items: Array<{
      key: string; // stable discriminated identity
      kind: 'actual' | 'planned';
      instanceId: number | null;
      templateId: number | null;
      title: string;
      startsAt: string; // UTC ISO instant
      endsAt: string; // UTC ISO instant
      status: string | null; // null for planned; do not invent a DB status
      staff: { id: number; name: string } | null;
      staffMeaning: 'actual' | 'template-default' | 'unassigned';
      continuesFromPreviousDay: boolean;
      continuesIntoNextDay: boolean;
    }>;
  }>;
}
```

Use an actual discriminated union in implementation if practical; above describes the wire contract. The client must not send `kind=planned` anywhere as a database mutation.

### Projection rules

1. Load only the authorized site, relevant templates, and actual instances intersecting the selected week's time interval.
2. Reuse the pure `resolveTaskInstanceWindow` helper from `backend/src/cron/taskInstanceWindow.ts`; do not import a cron module with scheduling side effects.
3. Factor recurrence eligibility into a pure preview helper reflecting the CURRENT DAILY/ONCE rules. Do not change cron recurrence boundary semantics in this phase.
4. Include an earlier day as necessary to display overnight work crossing into Monday. Clip visual segments to the week without altering task start/end timestamps.
5. Use local calendar-day boundaries, not seven fixed 24-hour durations; account for DST.
6. Actual occurrences take precedence over projected occurrences. Match using the same persisted template/date convention the scheduler uses; do not match by title or browser-local date alone.
7. Cancelled, missed, or completed actual instances still suppress a duplicate planned occurrence for the same scheduled occurrence.
8. Actual instances without templateId remain visible as actual history.
9. No projected historical tasks for past days. Missing historical instances are not fabricated. For today/future, valid template occurrences not yet generated may appear as Planned.
10. Ignore deleted/inactive templates; remove expired recurrence projections. Never predict reassignment or verification outcomes.
11. Stable ordering: start instant, title, then stable key. Handle equal start times without item loss.
12. Bound to one week. Do not query all-time task history to render it.

Clicking an actual item navigates to existing task/staff details or expands the existing read-only detail content. Clicking a planned item may show the source schedule details. Neither action changes assignments, status, or dates.

### Test cases

DAILY, ONCE, future effective date, recurrence end, inactive/deleted template, overnight task, staff overnight shift, DST transition, actual-versus-projected deduplication, cancelled actual, template-less actual, empty week, boundary dates, two browser/site time zones, denied manager access, and no writes on GET.

**P3 acceptance:** useful seven-day overview; actual versus planned is unmistakable; no duplicates; no false assignee/status claims; no scheduler writes/changes; mobile readable; all site access restrictions retained.

## 9. P4 — first-time setup after activation

### Goal and eligibility

An ADMIN who has activated their workspace sees a compact, dismissible dashboard checklist. This is guidance, not a new route gate. Managers do not see company-admin setup instructions. Existing users retain access to all allowed pages.

Keep `/welcome` confirmation and billing polling behavior. Its existing dashboard CTA can lead to the dashboard where this checklist appears; no new payment logic is needed.

### Server-derived progress

Add a read-only ADMIN endpoint, e.g. `GET /api/manager/workspace-setup`. Register it before ambiguous dynamic routes. Return a small aggregate response. Do not download all staff/task history to decide whether a step is complete.

Suggested data shape:

```ts
interface WorkspaceSetupStatus {
  eligible: boolean; // active company subscription, ADMIN endpoint
  complete: boolean;
  counts: { locations: number; staffWithSiteAndShift: number; taskSchedules: number };
  suggestedLocationId: number | null;
  steps: {
    location: { complete: boolean };
    team: { complete: boolean };
    schedule: { complete: boolean };
  };
}
```

Completion is based on real usable resources:

- Location: at least one active location in the company.
- Team: at least one active staff member assigned to an active company location with both shift start and shift end set.
- Schedule: at least one valid active task schedule at a location that has a ready team. Preserve current rules for required reference photos; legacy schedules must not be falsely treated as newly created complete examples.
- The readiness chain must refer to a compatible site, not a location in site A plus staff in site B plus a schedule in site C. Select a suggested location deterministically and return coherent step flags.
- A pending scheduler run is not incomplete setup. Creating the schedule successfully is sufficient; no task execution or first proof submission is required.
- Error/loading state must not appear as “0 of 3 completed”.

Do not add a database `setupComplete=true` flag that can drift from real data. No database migration is expected for this phase.

### Checklist UI

New suggested component: `frontend/src/components/onboarding/WorkspaceSetupChecklist.tsx`.
New API/query module may live alongside that feature. Query key: `['workspace-setup', companyId]`.

Three plain steps:

1. Add your first location.
2. Add a team member and their shift.
3. Create your first cleaning schedule.

Each step has a short explanation, completion state, and contextual CTA. Only prerequisites block the next step; users may still navigate elsewhere. Show one main “Continue setup” action for the first incomplete step.

Dismissal may be saved in localStorage using a versioned companyId/userId key. It must not control actual completion or billing access. Provide “Show setup guide” on Overview after dismissal. Handle unavailable localStorage without crashing. A dismissed guide does not reappear on every refetch.

When all steps complete, show a small dismissible completion message. Existing established workspaces should not receive a celebratory overlay or mandatory wizard.

### Reuse existing forms and resume partial work

Use deliberate URL entry parameters, for example:

- `/locations?create=1&setup=1`
- `/staff?create=1&setup=1&locationId=123`
- `/locations/123?tab=templates&createTask=1&setup=1`

Validate these values. A parameter may open a dialog or preselect an allowed site; it must never create/save data by itself.

The current location-detail tab state is local. Add a controlled, validated query-parameter mapping for the known tabs without breaking existing default views. Unsupported values fall back safely.

- Location success in setup mode: refresh setup status and offer the next step using the returned location ID.
- Staff success in setup mode: staff must actually be assigned to the chosen location and have a valid shift. Merely creating a name/email is insufficient for scheduler readiness.
- The current Team create handler performs several operations. Preserve existing APIs, but retain a known created staff ID on partial assignment/shift failure. Retry only the failed operation, not account creation. Surface the saved account and recovery path.
- Allow completing a shift for an existing team member when that is the missing prerequisite; do not force duplicate account creation.
- Task creation success: reuse P2's onCreated outcome and invalidate setup status. A failed optional manual assignment must be disclosed; do not falsely report that the selected staff was assigned.
- Outside `setup=1`, preserve normal after-save behavior. Do not unexpectedly redirect regular users to a setup journey.
- Closing/cancelling any form saves nothing new and leaves the checklist available.
- Refresh/resume must derive progress from the server, not require the same tab/session or remembered checkbox state.

### Tests and acceptance

Test a newly activated empty company; partially set-up company; fully established company; manager role; unpaid admin; billing failure; stale local dismissal from another company; storage unavailable; creating location; existing staff without shift; partial create/assignment failure; deleted resources; and refresh after each step.

**P4 acceptance:** no billing gate regression; real data determines readiness; coherent site/team/task chain; no duplicate resources; regular forms retain normal navigation; setup can be dismissed and resumed.

## 10. P5 — performance without changing results

### P5A: route and heavy-component loading

Files: `frontend/src/main.tsx`, `App.tsx` only where needed, route pages, StaffDetailPage.tsx, LocationDetailPage.tsx.

1. Capture the current production build manifest/chunk sizes and public-page network requests.
2. Keep global providers and auth initialization in their current order. Avoid re-creating QueryClient on navigation.
3. Introduce explicit route-level `React.lazy` imports and accessible Suspense fallbacks, preserving route paths, RequireRole, GuestRoute, ProtectedRoute, and WorkspaceGate nesting.
4. Match actual module exports: named exports need an explicit adapter or router-lazy API support. Do not assume every page has a default export.
5. Public landing navigation should not fetch manager dashboard pages, Recharts, QR code rendering, or task-edit forms at initial load.
6. Load StaffDetail charts only when the relevant visible tab needs them; load QR/evidence content on demand where doing so avoids unused work.
7. Provide a route load-error/reload path for chunk-fetch failures. Do not loop reloads or clear auth to solve a chunk error.
8. Check whether eager imports of Paddle components still pull in billing code. Do not change checkout initialization timing without proving the existing payment flow still works.
9. Keep direct links and refreshes working for `/staff/:id`, `/locations/:id`, `/choose-plan`, and `/welcome`.

**Acceptance:** production network evidence shows unused operational modules excluded from initial public-page load; before/after sizes recorded; successful direct navigation and auth gating; no arbitrary numerical speed claims without measurements.

### P5B: server pagination and search — explicitly bounded scope

First convert the **Team list** and **Attendance history**. Do not globally change existing array endpoints or paginate assignment selectors accidentally. Today remains the P1 endpoint in this plan; optimizing its aggregation is not a license to alter scheduler/status semantics.

Use additive endpoints to keep web/mobile callers compatible:

- `GET /api/staff/search?page=1&pageSize=25&q=...&locationId=...&assignment=all|unassigned`
- `GET /api/attendance/search?page=1&pageSize=25&q=...&staffId=...&locationId=...&from=YYYY-MM-DD&to=YYYY-MM-DD`

Register `/search` before `/:id` routes. Preserve the legacy GET endpoints for existing option lists and mobile callers. Follow the actual attendance router naming when wiring the client.

Both new lists preserve their existing active-staff scope. Do not add an inactive-status filter or an inactive/restore interface. Reject combining `assignment=unassigned` with a concrete locationId as contradictory input.

New endpoint data contract:

```ts
interface PageResult<T, S> {
  items: T[];
  page: number; // 1-based
  pageSize: number; // default 25; allowed 10, 25, 50, 100
  total: number; // all matching rows within permitted scope
  totalPages: number; // zero for an empty set
  summary: S; // documented aggregate; never calculated from just items
}
```

Concrete summary types:

- Team: `{ totalStaff: number; assignedStaff: number; activeStaff: number }`. These count the complete filtered result; with the preserved active-only scope, activeStaff equals totalStaff. Do not change a metric's meaning simply to produce different-looking numbers.
- Attendance: `{ present: number; absent: number; late: number; shiftNotStarted: number }`. Reuse the current AttendancePage status categorization; do not count future-start ABSENT records as already absent. Capture one server request time for this calculation. These are record counts, not distinct people across a multi-day range; label them accordingly.
- Task history: `{ total: number; byStatus: Record<TaskStatus, number>; late: number }` across the complete filtered history. Late can overlap a status; do not sum it into total.

Wrap in existing ApiResponse; the frontend receives `response.data.data` through the project's usual adapter pattern. Write concrete typed DTOs, not any.

Validation/query rules:

- Reject malformed/fractional/negative page parameters, unsupported page sizes, invalid enum/date/ID values, and repeated array query parameters with 400.
- q is trimmed and limited to 100 characters. Team searches name/email/phone; Attendance searches staff name/email. No client regex evaluation or raw string interpolation into SQL.
- Preserve existing time-zone interpretation of attendance date ranges. from > to is a clear 400.
- Apply company and manager-location predicates to both count/summary and item queries. Filters intersect permissions; they never replace them.
- Perform filtering before pagination. Use Prisma skip/take and count, not `findMany()` of everything followed by JS slice.
- Team default stable ordering: name ascending, then id ascending. Attendance: date descending, then id descending.
- Counts/totals are server-derived across the complete filtered dataset. If a summary uses broader scope than search, label it explicitly; the default in this plan is summary uses all current search/filter conditions, excluding pagination.
- Obtain count and rows consistently in a read transaction where appropriate. If page exceeds the last page after deletion, clamp server-side to the last valid page and return the effective page; for total=0 return page=1, items=[], totalPages=0.
- Do not return passwords, tokens, full proof arrays, or unrelated task history in list DTOs.

Frontend:

- New typed search API/query functions; do not silently change useGetStaff used by pickers.
- Query keys include companyId, complete filter/search state, page, and pageSize. Keep keys under the existing `staff`/`attendance` root so shared invalidation still works.
- Debounce search by 300ms; reset page to 1 when search/filter/pageSize changes. Route changes/deletes must not cause a loop.
- Pass TanStack Query's abort signal through Axios to cancel superseded requests where supported by the installed version.
- Preserve previous page data only while clearly marking it as updating and avoiding a misleading new page label. No stale response may replace a newer query's results.
- Add optional controlled pagination props to DataTable or a sibling Pagination component. Unpaginated callers keep current behavior. DataTable never slices server-returned pages a second time.
- Controls: “Showing 26–50 of 137”, Previous, Next, page-size choice. Disabled boundaries, accessible labels, keyboard support, mobile wrapping. For zero results show “0 results”, not “1–0”.
- Preserve search/filter/page in URL where practical; avoid overwriting unrelated deep-link parameters.
- After deletion, refresh rows and aggregate counts and land on a valid page. Billing usage and location counts must still invalidate.
- Make existing search/placeholders explain the actual supported fields.

Tests: more than two pages; matching rows only on a later page; tied names/dates; no results; invalid params; q escaping; location/staff filters; manager with zero locations; denied site; deletion of final row on last page; rapid search changes; preserved old endpoint shapes.

**Acceptance:** initial Team/Attendance responses contain at most requested pageSize rows; search works across the full dataset; counts are not current-page counts; no list-option regressions; no fake client-only pagination.

### P5C: task histories and image loading

#### Task-history loading

The large site/staff detail endpoints currently combine identity, schedules, history, and aggregate data. Add separate bounded task-history read endpoints instead of breaking their current response shapes:

- `GET /api/location/:id/task-history?page=...&pageSize=...&dateFrom=...&dateTo=...`
- `GET /api/staff/:id/task-history?page=...&pageSize=...&dateFrom=...&dateTo=...`

Reuse P5B validation/pagination DTOs and existing date conventions. Preserve instance status, assignee summary, and existing expandable evidence behavior. Fetch individual evidence/area submissions only when expanded using the existing endpoint.

For the web detail screens, add an opt-in lightweight mode or dedicated overview read endpoint that does not embed full task histories. Do not leave the heavy full-history request running in parallel with the new paginated endpoint and call it optimized. Document which old consumers still need the legacy response.

Fetch histories only when their tab is active. Keep date filters, current tab, and existing Today deep links intact. Keep template lists and assignment options complete; do not truncate those just because history is paginated.

Totals on the detail overview must be calculated by server aggregates, not by loaded history-page length. Avoid removing historical rows or changing their dates to make pagination easier.

Test independent overview/history loads, empty history, pagination across months, date-filter changes resetting page, evidence expansion on later pages, deep links, deleted parent, and manager scope.

#### Thumbnails

Suggested helper: `frontend/src/lib/imageUrls.ts`; suggested component: `EvidenceThumbnail.tsx`.

- Use thumbnails for small evidence/check-in/reference-photo list previews, not full original-resolution downloads styled down with CSS.
- For owned Cloudinary URLs, create a display-only transformed URL using a conservative size, automatic format/quality, and fit/crop appropriate for a preview. Parse URL structure; don't blindly replace arbitrary strings or signed paths.
- Preserve stored original URLs and original-image links. Never save thumbnail URLs back to the database or send them to automatic verification.
- For unknown/external URLs, use the original URL safely rather than creating an invalid transformation.
- Provide explicit width/height, meaningful alt text, `loading="lazy"` for offscreen previews, `decoding="async"`, and a stable error placeholder.
- Do not lazy-load the public hero image or defer the first visible important image solely to satisfy a blanket rule.
- Avoid nested click conflicts between image links and clickable table rows.
- Never change media deletion's public-ID parser or queue original/transformed URLs differently as part of a thumbnail-only UI improvement.

**P5C acceptance:** inactive tabs do not download full history; bounded active history responses; no duplicate heavyweight fetch; full originals remain accessible; verification/cleanup URLs are unchanged; network inspector confirms smaller list-preview payloads.

## 11. Cross-cutting integration contract

### Query invalidation

Use `frontend/src/lib/invalidateWorkspace.ts` where an operation affects multiple workspace summaries. Add the `workspace-setup` and new schedule/history query roots where necessary, or nest them under existing roots deliberately.

Document key families. Do not invalidate every query in the application on each keystroke or mutation. Do not clear auth/currentUser to refresh lists.

Creation, edit, assignment, and permanent deletion can all affect setup/schedule/progress data. Check those success handlers explicitly. Deletion must remove expired rows from new weekly/history views and update pagination boundaries.

### Error handling

- Backend errors use the existing ApiError/ApiResponse conventions.
- Display actionable server validation messages; do not expose stack traces or credentials.
- A failed list request is not an empty list. A failed setup query is not an empty workspace.
- Disabled/loading state prevents duplicate writes; read-only navigation remains usable where safe.
- Never auto-delete data to make a failed multi-request UI flow look atomic.

### Accessibility and responsive behavior

- All controls have associated labels; icon-only buttons have accessible names.
- Dialogs trap focus, Escape works when not submitting, closing restores focus appropriately, and invalid fields receive focus.
- Confirmation dialogs for permanent deletion remain unchanged in meaning and default focus stays on Cancel.
- Tables may scroll within their own region. The whole page must not scroll horizontally.
- Wizard footer/buttons remain reachable on a short laptop and mobile keyboard.
- Respect reduced motion; no loading animation is required to understand status.
- Do not rely on color alone for status, selected filters, or completed setup steps.

## 12. Verification commands and evidence

Run appropriate checks for each phase; do not assume previously passing output proves new edits work.

Frontend:

```sh
cd frontend
npm run build
npm run lint
npm test
```

Backend when touched:

```sh
cd backend
npm run build
npx vitest run src
```

`npx vitest run src` avoids counting compiled dist test files as additional independent coverage. Do not claim duplicate test discovery as extra coverage.

For isolated deletion regression, see `backend/docs/permanent-deletion.md` and `backend/tests/deletion.integration.ts`. That test requires `DELETION_TEST_DATABASE_URL` pointing to a disposable `*_deletion_test` database. Never use the normal application DB as a substitute.

Add focused pure-helper tests and backend read-contract tests for new time, pagination, and preview logic. For behavior involving Prisma relations/counts, use isolated database fixtures when feasible; mocks alone cannot prove SQL pagination/cascades.

Browser verification:

- Desktop 1440×900, tablet 768px, mobile 390×844; one 360px check for narrow forms.
- ADMIN and MANAGER with different site access, plus denied/no-location cases.
- Empty company; partial setup; established company; large seeded test workspace.
- One site in Asia/Karachi and another with a different local date; a DST-observing site for schedule tests.
- Browser time zone different from site time zone.
- Actual task statuses include pending, in progress, completed, missed, cancelled, and late history.
- Scheduler behavior regression checks must use controlled fixtures and existing scheduler tests/helpers; do not run cron against production to create evidence.
- All writes/billing tests use isolated/mock data. Never make a real subscription purchase.
- Preserve screenshots and concise before/after measurements in a durable project report, not only a temporary shell log.

Do not assume temporary paths/tools from an earlier agent session exist. Check the project's installed tooling. If Playwright is unavailable, install/use an isolated test harness with documented commands rather than silently skipping browser verification. Avoid committing secrets, generated browser profiles, node_modules, or large fixture databases.

## 13. Stop conditions: do not improvise

Pause the affected unit and report concrete evidence if:

- A proposed form input cannot map to an existing API without changing scheduling semantics.
- Calendar projection cannot match the current recurrence/time-zone conventions.
- You think a new human photo-review or task-reassignment workflow is needed; those features are excluded.
- An existing API has additional consumers you cannot identify well enough to preserve its contract.
- A migration/deployment would touch live customer data.
- Tests fail in a way that suggests records could be deleted, assigned, or charged incorrectly.

Continue independent in-scope work when possible. Do not “fix” unrelated permission/billing/scheduler behavior under this plan. Do not conceal blockers behind mocks, type casts, disabled lint rules, empty catch blocks, or placeholder TODO implementations.

## 14. Final acceptance checklist

- [ ] Removed suggestions stay removed: no Today reassignment, no photo review, no broad audit/monitoring workstream, no notifications.
- [ ] Automatic scheduling and current manual assignment remain unchanged.
- [ ] Today explains exceptions accurately without duplicate dashboard clutter.
- [ ] Site-local dates/times and Today detail links are correct.
- [ ] Task wizard creates real existing schedule entities, preserves photo/reference requirements, and handles partial success without destructive rollback or duplicate POSTs.
- [ ] Weekly view distinguishes actual from planned and never writes scheduling data.
- [ ] Activated admins get optional, accurate, resumable setup guidance.
- [ ] Signup-first/payment confirmation and existing subscriber billing access still work.
- [ ] Team/Attendance/history search and pagination happen on the server, with correct complete-dataset totals.
- [ ] Existing array APIs/mobile consumers and assignment option lists still work.
- [ ] Unused route/chart/QR code does not load initially on public pages.
- [ ] Thumbnails preserve original/verification/deletion URLs.
- [ ] Permanent deletion remains permanent and invalidates all new views.
- [ ] Current unified theme, responsive layout, and keyboard interactions are preserved.
- [ ] Relevant builds/lint/tests pass; browser results and performance evidence are recorded.
- [ ] No unrelated code rewrite, no live-data mutation, no unfinished feature presented as done.

Final report must name each completed phase, changed behavior, verification evidence, and any actual remaining deployment steps or blockers. Do not just say “done” or “optimized”.
