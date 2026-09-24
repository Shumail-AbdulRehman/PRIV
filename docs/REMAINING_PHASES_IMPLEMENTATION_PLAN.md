# CleanOps — detailed implementation plan for P2 through P6

Prepared against the repository on 2026-09-17. This document plans remaining work; none of the units below are marked implemented by writing this document.

## 1. Read order, authority, and completed work

Read the original `PRODUCT_IMPROVEMENT_HANDOFF.md`, the current `PRODUCT_IMPROVEMENT_PROGRESS.md`, then this document completely. The original handoff supplies the exclusions, invariants, detailed wire contracts, and verification rules. This document turns the remaining phases into bounded implementation units. Current code determines existing behavior; do not reproduce a stale description when the code has changed. Record a discrepancy before resolving it. Explicit user instructions take precedence.

P0/P1 are complete according to the progress report. Preserve Today exception reasons, shared Today/Overview attention membership and ordering, server `asOf`, staff `localDate`, location time zones, and the existing detail query parameters. The live two-time-zone database check is still outstanding. Do not claim mocked responses proved database selection.

The login/signup image improvement is also completed: preserve `frontend/src/components/common/AuthShell.tsx` and `frontend/src/assets/auth-cleaning-team.webp`. Keep Inter/Manrope, the shared blue/navy palette, and current public/product layouts. No new branding exercise belongs to these units.

### Hard exclusions

- No reassignment controls on Today or the weekly calendar.
- No human photo approval/rejection workflow or changes to automatic verification.
- No notification system, email/push alerts, monitoring platform, or broad audit project.
- No scheduler/cron rewrite, assignment priority changes, grace-period changes, extra recurrence types, or manually generated task instances.
- No billing, plans, real checkout, signup-first, or payment-confirmation behavior changes.
- No soft deletion, restore/undo, database reset, live fixture insertion, or production migration execution.
- No mobile feature work or unrelated architecture/framework changes.

Focused tests and preservation of access restrictions are required for the requested features. They do not authorize the excluded broader workstreams.

## 2. Execution protocol and unit ordering

Every unit follows this sequence:

1. Read applicable AGENTS.md files, `git status --short`, and `git diff --stat`. Record current changes; never assume an earlier dirty-tree inventory is still current. Preserve tracked and untracked work.
2. Inspect the unit's actual frontend/backend files and their consumers. Record request fields, response envelopes, query keys, permission checks, date conversion, and mutation side effects before changing them.
3. Write a short unit plan in the progress document before editing. Include files, API additions, risks, and checks.
4. Run appropriate baseline checks. Reuse recent evidence only if its code and dependencies have not changed; say exactly what evidence is reused.
5. Implement the complete bounded unit, including loading/error/empty states and its focused tests. Do not leave placeholder controls or ignored form fields.
6. Verify the exit checks, review the diff for unrelated changes, and update the progress record.
7. Report results and stop. Do not begin the next unit without the next user instruction.

| Unit | Deliverable | Dependencies |
| --- | --- | --- |
| P2-A | Existing task-template UI extracted | Completed P0/P1 |
| P2-B | Four-step task wizard and safe failure recovery | P2-A |
| P3-A | Read-only week API and projection tests | P2-B |
| P3-B | Location Schedule view | P3-A |
| P4-A | Admin setup-status API | P2-B; scheduled after P3-B for review order |
| P4-B | Checklist and contextual forms | P4-A |
| P5-A | Route/chart/QR loading improvements | UI units settled |
| P5-B1 | Pagination foundation and Team | P4-B |
| P5-B2 | Attendance pagination | P5-B1 |
| P5-C1 | Task-history pagination and lightweight details | P3-B, P5-B2 |
| P5-C2 | Image thumbnails | P5-C1 |
| P6 | Integration evidence and final handoff | All units above |

P2-A is deliberately an extraction-only checkpoint. The known destructive rollback in task creation is removed in P2-B. Do not present P2-A as the completed task-creation improvement or leave P2-B's required fix undocumented.

## 3. Verified starting contracts and important traps

| Area | Verified current behavior | Implementation consequence |
| --- | --- | --- |
| Routes | `frontend/src/main.tsx` defines routes; `App.tsx` supplies auth guards | Preserve provider order and guard nesting during splitting |
| Task UI | `LocationDetailPage.tsx` contains `TemplatesTab`, create/edit dialogs, QR/assignment behavior | Extract this bounded section; do not rewrite the entire page |
| Template creation | `POST /api/task-template`, multipart; API helper returns `res.data`, created record is under its `data` | Type the envelope and capture `data.id` immediately |
| Manual assignment | `PATCH /api/assignment/task-template/:templateId/staff/:staffId` | Keep its validations and side effects; do not bypass by putting staffId in POST |
| Task rollback | UI currently attempts to delete the new template when a later operation fails | Remove in P2-B; a saved schedule must survive assignment failure |
| Reference photos | Named `referenceImages`/`referenceNames`; router upload cap uses `MAX_REFERENCE_IMAGES`; subscription has `referenceImagesPerTask` | Preserve paired ordering, actual caps, and server allowance checks |
| Task dates | Create uses `createTaskMultipartSchema`; edit uses `editTaskSchema`; these have different refinements | Do not assume the stricter unused create schema governs multipart requests |
| Team creation | `StaffPage` → `Staff/api.ts` sends one POST with locationId and shift fields; backend performs one staff create | Preserve this; do not introduce a three-request setup flow |
| Scoped reads | `getScopedLocationIds`: ADMIN returns null; MANAGER returns assigned IDs, possibly [] | Empty permissions always mean no records |
| Legacy lists | Staff and Attendance return arrays inside ApiResponse | Add search endpoints; do not globally change old array contracts |
| Detail reads | Location stats and staff details embed large histories | A paginated request alone is insufficient if the old heavy request still runs |
| Invalidation | `frontend/src/lib/invalidateWorkspace.ts` checks root keys | Nest new queries under existing roots or deliberately add new roots |
| Unique occurrence | `TaskInstance` has `@@unique([templateId, date])` | Deduplicate planned vs actual by template and resolved stored day anchor |

### Existing scheduling rules to characterize, not change

Read `backend/src/cron/dailyTaskScheduler.ts`, `onceTaskScheduler.ts`, `taskInstanceWindow.ts`, and `utils/dateTime.ts` before P3-A.

- DAILY currently skips when `effectiveDate > localTomorrow`, and skips expired recurrence when `recurringEndDate < localToday`. Equality at either boundary is significant.
- ONCE currently accepts `effectiveDate >= localToday && effectiveDate < localTomorrow`.
- `resolveTaskInstanceWindow` can move a task to the next local day for an overnight staff shift; the returned `date` is the persisted occurrence anchor.
- Its task end handling treats end-clock <= start-clock as rolling into the next local day. Do not silently impose the opposite rule in preview or the wizard.
- Current frontend effective-date serialization uses a UTC date construction. Do not assume that already matches a site's local midnight. Characterize current accepted payloads in Karachi and a western time zone. If correcting it would alter scheduling meaning, stop that affected case and report it rather than changing cron.
- The preview must document surprising boundary behavior faithfully. A model must not replace current comparisons with what it considers more conventional calendar behavior.

## 4. P2-A — extract existing task UI

### Files

Primary: `frontend/src/pages/Location/LocationDetailPage.tsx`.
Suggested new files: `Location/components/LocationTemplatesTab.tsx`, `Task/components/TaskScheduleFields.tsx`, `Task/taskScheduleForm.ts`. Keep new types next to the feature. Read Task API/types/queries and Assignment API/queries.

### Tasks

- **P2-A.1** Map everything referenced by `TemplatesTab`: DTOs, allowed staff, timeZone, menu/dialog state, create/edit/delete hooks, QR data, error handling, preview URL ownership, callbacks, and query invalidation.
- **P2-A.2** Move the templates tab into its own module with typed props. Move only its owned code. Keep location overview, attendance, and instance-history behavior in their existing owner.
- **P2-A.3** Extract pure form helpers where useful: blank state, reference-row validation, time/date serialization, and error-to-field mapping. Preserve their behavior during this unit; identify known gaps for P2-B.
- **P2-A.4** Avoid circular imports back into LocationDetailPage. Put genuinely shared feature types/helpers in a small module instead of exporting the whole page's internal implementation.
- **P2-A.5** Keep dialog opening, existing edit/assignment, reference viewing, QR output, and permanent deletion accessible exactly as before.

### Exit checks

Compare before/after synthetic request payloads for DAILY, ONCE, optional manual staff, multiple named photos, and edit. Verify create dialog, existing edits, QR, menu behavior, and delete confirmation. Build/lint and appropriate existing tests must pass. No new API and no scheduling/business-behavior change. Record the still-pending P2-B rollback fix explicitly.

## 5. P2-B — guided creation and safe partial success

### Public component contract

Suggested `TaskScheduleWizard` props: locationId, locationName, timeZone, allowed staff options, open, onOpenChange, and onCreated. The site is preselected and read-only. Define `onCreated` as a typed result containing templateId and assignment outcome (`automatic`, `manual`, or `manual-failed-kept`), so setup can report truthfully. Invoke the final outcome once per completed user flow. Refresh lists when persistence first succeeds even if optional assignment is still unresolved.

### Tasks

- **P2-B.1 Task step:** required trimmed title, optional instructions, one or more named reference photos. Each row owns a stable UI ID, File, name, and preview URL. Reject half-filled rows; never silently filter them out and lose the user's file. Validate names using backend-compatible normalization and uniqueness rules.
- **P2-B.2 Team step:** default to “Use automatic assignment”; optional existing manual assignment. Show only allowed site staff. An empty option list must not manufacture an assignee. Retain current server capacity/assignment constraints.
- **P2-B.3 Schedule step:** DAILY/ONCE, effective date, start/end wall times, and supported recurrence-end date. Show site time zone. For ONCE, hide or clear an inapplicable recurrence end rather than sending hidden stale values. Preserve actual supported overnight behavior.
- **P2-B.4 Review step:** show task, named reference areas, chosen staff mode, site, recurrence, dates, and time zone. One final Create schedule action. Next/Back never call mutation endpoints. Fields and File objects survive navigation.
- **P2-B.5 Serialization:** retain current multipart names and parallel file/name ordering. Use `fromZonedTime` for wall-time inputs; use verified existing date-only conventions for effective/end dates. Test actual serialized payloads. Do not render recurrence controls until the adapter sends their values.
- **P2-B.6 Limits:** read existing subscription limits; server remains authoritative. The UI currently has a hardcoded ten-row cap while backend has an environment upload cap and per-plan allowance. Do not invent another cap. If the transport cap is not exposed, report that limitation and keep server rejection actionable; any additive capability metadata must be narrowly scoped and documented, with no plan changes.
- **P2-B.7 Accessibility:** give steps a text label/current-step indication; allow backward navigation; validate forward navigation and focus the invalid field. Use existing Radix dialog focus handling. Keep footer actions reachable at 360px and on a short laptop. Block close/submit consistently while a write is pending.
- **P2-B.8 Cleanup:** revoke preview URLs on replacement, removal, reset, and unmount; avoid revoking a URL still used by a visible preview. Reopening a completed/cancelled wizard starts fresh; Back does not reset it.

### Required mutation state machine

| State/event | Next behavior | Forbidden behavior |
| --- | --- | --- |
| Editing → submit | Validate all fields, issue one POST, disable duplicate submission | Writing on Next/Back |
| POST returns ID | Store ID immediately; invalidate affected reads; assign if explicitly selected | Repeating POST after an ID is known |
| POST definitive validation error | Preserve draft, show field/step error | Clearing photos or redirecting as success |
| POST transport timeout/ambiguous server failure | Show unknown outcome and link to schedules to check | Automatic POST retry or claiming nothing was saved |
| Assignment succeeds | Report manual assignment, close/reset as appropriate | Reporting assignment before PATCH success |
| Assignment fails | Show “Schedule created. Staff assignment could not be completed.” | Deleting the new schedule as rollback |
| Retry assignment | PATCH existing template ID only | Creating another template |
| Keep schedule | Report saved schedule and unresolved manual assignment honestly | Assuming a failed/timeout PATCH definitely made no change |

After an assignment timeout, refetch the existing template to reconcile its current assignee. “Keep schedule without manual assignment” must not secretly unassign a person or guarantee automatic state if the server may have completed PATCH. Show the server's known state or explicitly say it is still being checked. Do not expand this into a new assignment workflow.

Keep mutation retry disabled for ambiguous creates. Separate failed cache refresh from failed persistence; a cache error after POST does not mean creation failed. Edit preserves entity/photo IDs and never delete-and-recreates.

### Required focused checks

Next/Back persistence; missing name/file pairs; duplicate names; cap rejection; DAILY/ONCE; supported overnight case; browser/site time-zone mismatch; optional recurrence serialization; double click; failed create; successful create followed by failed assignment; retry sends exactly one POST total; unknown POST outcome; timeout reconciliation; close/reopen; existing edit/QR/delete regression. Show captured request counts for duplicate-write checks. Phase P2 is complete only after these pass.

## 6. P3-A — read-only weekly schedule API

### Files and endpoint

Add `GET /api/location/:id/schedule?week=YYYY-MM-DD` in `backend/src/routes/location.route.ts`. Suggested controller/service: `schedule.controller.ts` and `schedulePreview.service.ts`, plus focused tests. Use original handoff section 8's `LocationWeekSchedule` response contract and existing ApiResponse. No schema change is expected.

### Tasks

- **P3-A.1 Validate scope/input:** ADMIN/MANAGER only; company and assigned-location checks; positive integer ID; strict calendar date; reject repeated/array values. Missing week defaults to site's current Monday. Valid non-Monday input normalizes to Monday; malformed input is 400. Missing/inaccessible location follows existing error conventions without exposing other-company records.
- **P3-A.2 Freeze time:** capture `now` once, return `asOf`, derive site-local current date and requested Monday/Sunday boundaries. Construct successive calendar dates, then zone their midnights. Never add 7×24 hours to calculate a DST week.
- **P3-A.3 Fetch bounded data:** read authorized site's relevant templates with staff shift/time-zone inputs and actual instances intersecting `[weekStart, nextMonday)`. Use `shiftStart < weekEnd` and `shiftEnd > weekStart` for intersection; include narrow occurrence-key lookups if needed to suppress a shifted actual occurrence. Do not load all task history or all evidence arrays.
- **P3-A.4 Generate candidate occurrences:** copy characterized DAILY/ONCE eligibility into a pure helper and call existing pure `resolveTaskInstanceWindow`. Never import/run the cron functions. Include preceding base dates when an overnight staff shift or task could enter Monday; bound the lookback using the helper's maximum shift into the next day plus overnight duration (two local days is the current conservative lookback). Filter resolved intervals back to the requested week.
- **P3-A.5 Historical handling:** past displayed local days contain actual records only. Do not invent missed historical tasks. A candidate whose base day precedes today but whose resolved occurrence starts today may still be relevant; distinguish base day from resolved day in tests. Exclude projections resolved entirely before today's local start.
- **P3-A.6 Deduplicate:** persisted occurrence key is templateId + resolved `date` instant. Actual records win even when CANCELLED/MISSED/COMPLETED. Preserve template-less actual records. Do not match by title or use the raw base date when the helper moved it.
- **P3-A.7 Segment for display:** retain full startsAt/endsAt; list an intersecting occurrence in each local day it spans with continuation booleans. An end exactly at midnight does not occupy the next day. Stable occurrence key stays the same across segments; renderer identity uses day + occurrence key.
- **P3-A.8 Truthful DTO:** actual has persisted instance/status/current staff. Planned has null instanceId/status; template default staff is labeled `template-default`, otherwise `unassigned`. Do not predict automatic assignment. Sort each day by start, title, key. Return all seven days including empty ones.

### Exit checks

Test current unusual effective/end boundaries, DAILY/ONCE, future start, expired recurrence, inactive templates, overnight staff/task, Sunday→Monday carryover, exact-midnight ends, DST transition, duplicate suppression for cancelled actual, orphan actual, no historical fabrication, and no writes from GET. Test empty manager scope, denied location, other company, invalid/repeated dates. Verify Prisma query bounds and response shape. Any uncertainty in scheduling meaning blocks that case; it never authorizes cron changes.

## 7. P3-B — weekly schedule UI

Suggested files: `Location/components/LocationScheduleTab.tsx`, Location API/types/queries, and the bounded tab wiring in LocationDetailPage.

- **P3-B.1** Add Schedule inside a location. Preserve existing tabs/defaults. Map known tabs to validated query values; invalid values fall back safely. Keep unrelated parameters, including setup/deep links.
- **P3-B.2** Query key: `['location', 'schedule', companyId, locationId, weekStart]`. Only fetch when this view is active. Handle returned normalized Monday without URL/refetch loops.
- **P3-B.3** Display Previous week / This week / Next week, date range, and site time zone. Disable only controls whose operation is genuinely pending; avoid showing the new date range over stale previous-week content.
- **P3-B.4** Use a readable seven-day agenda or columns on desktop and stacked days on mobile. Group overlapping entries; do not overlay them on top of each other. Show Planned explicitly and distinguish Default staff from an actual assignee. Show overnight continuation text.
- **P3-B.5** An actual entry opens existing read-only details or the correct staff/date detail. A planned entry opens its template information. There is no new task-instance route assumed by the plan: verify a real destination or use a read-only dialog. Deleted/missing sources show a recoverable message.
- **P3-B.6** Add skeleton/loading, empty week, error/retry, and visible text statuses. Add no create/drag/reassign actions to this view. Ensure schedule edits/deletions from existing controls invalidate this query family.

Exit: browser back/forward preserves week/tab; direct links work; current-week calculation uses site time; mobile has no page overflow; actual/planned labels are distinguishable without color; read navigation issues no mutations. Capture desktop/mobile screenshots with both actual and planned examples.

## 8. P4-A — server-derived workspace setup status

Add ADMIN-only `GET /api/manager/workspace-setup` before ambiguous routes. Suggested `workspaceSetup.service.ts` plus controller/route wiring. Use original handoff section 9's typed status DTO. No persisted setupComplete column or migration.

- **P4-A.1** Determine eligibility from authenticated company subscription using existing helpers. This read endpoint does not replace WorkspaceGate or change what statuses permit billing access. MANAGER/STAFF receive the existing unauthorized behavior; no admin checklist query is needed from their UI.
- **P4-A.2** Compute counts/flags from real company resources. Active site; active staff assigned there with both shift fields; active valid task schedule at that same ready site. Build one coherent chain, not separate unrelated EXISTS checks across sites.
- **P4-A.3** Document “valid schedule”: supported recurrence and accepted dates/time inputs; current required named reference images; ONCE/ended schedules must be evaluated deliberately for usable setup. Inspect legacy photo representation and do not count an incomplete legacy schedule merely because it has a title. Do not download images or run verification to assess readiness.
- **P4-A.4** Suggested site selection: prefer a site with a complete ready chain, then one with a ready team, then an active site; tie by ID. Derive displayed step flags from the selected chain. Counts may describe company totals, but must be labeled as totals and must not imply cross-site readiness.
- **P4-A.5** Use Prisma counts/relation predicates and minimal selects. No attendance/history/proof downloads. If computing readiness requires small template date fields, bound selection to relevant active schedules. Return complete/eligible separately. Missing data and failed query are not interchangeable.

Exit fixtures: empty, site only, site+staff without shift, ready staff, ready full chain, unrelated resources at different sites, cancelled/expired or incomplete schedules, inactive/deleted resources, established company, unpaid admin, manager denial, and two companies. Assert GET performs no writes and returns no private account fields.

## 9. P4-B — checklist and contextual forms

Suggested files: `components/onboarding/WorkspaceSetupChecklist.tsx` with colocated API/query/types; DashboardPage; small entry-point changes to LocationsPage, StaffPage, and LocationDetailPage/P2 wizard; shared invalidation.

- **P4-B.1** Show eligible ADMIN a compact three-step checklist: location → team and shift → schedule. One main Continue setup action leads to the first incomplete prerequisite. Other normal navigation remains available. Do not show established users a forced wizard or celebratory overlay.
- **P4-B.2** Query key: `['workspace-setup', companyId]`, enabled only after authenticated ADMIN/company/subscription state is known. Loading/error must not display an invented 0/3 completion state. Recompute from the server after writes and resume.
- **P4-B.3** Add dismiss/resume using versioned localStorage companyId+userId key. Catch unavailable storage; use in-memory dismissal if necessary. Storage holds dismissal only, never readiness or authentication. Provide Show setup guide after dismissal.
- **P4-B.4** Support validated entry parameters: `/locations?create=1&setup=1`; `/staff?create=1&setup=1&locationId=123`; `/locations/123?tab=templates&createTask=1&setup=1`. Parameters only open/preselect allowed dialogs. Never save on mount. Consume/remove triggering parameters after close so refetch/render does not reopen the dialog; preserve other parameters and browser history sensibly.
- **P4-B.5** Location success uses the actual returned ID and refreshes setup status. Team creation keeps the existing single POST with site and shift; require readiness fields in setup mode without imposing new unrelated rules on normal creation. For existing incomplete staff, offer editing that person instead of forcing another account.
- **P4-B.6** Existing staff edits may require separate operations; keep known ID, retain successful edits, and retry only failed edits. Do not delete existing/saved accounts to simulate a transaction. For an unknown create outcome, check the list before retrying.
- **P4-B.7** Task creation uses P2-B's outcome. Optional manual assignment failure does not erase a valid saved schedule or become a claim of assignment success. Let the status endpoint determine readiness after refetch.
- **P4-B.8** Normal forms opened outside setup retain their existing navigation. Closing before submit writes nothing. Setup additions do not redirect regular edits or break the new auth artwork/signup-first flow.

Exit: complete setup with fresh resources; resume after reload; dismiss and restore; unavailable storage; different company/user; delete a prerequisite and recompute; finish an existing staff shift; task partial success; regular forms; unpaid/returning subscriber routes; manager sees no admin setup. Verify write counts and account identity are preserved.

## 10. P5-A — load code when needed

Files: `frontend/src/main.tsx`, narrowly scoped error/Suspense components, and extracted heavy detail components. Change App/guards only if necessary for boundaries, not semantics.

- **P5-A.1** Capture a fresh production build and initial public-page network trace. Record minified/gzip chunk sizes and actual initial JS requests. Vite's dev-server requests are not production performance evidence.
- **P5-A.2** Replace eager route-page imports with explicit React.lazy imports, handling named/default exports correctly. Keep Redux/QueryClient/Router order and singleton QueryClient. Preserve GuestRoute, ProtectedRoute, RequireRole, WorkspaceGate nesting, paths, and direct links.
- **P5-A.3** Place accessible loading boundaries around route content so the app shell remains usable. Handle rejected chunk imports with a clear retry/reload action; never auto-reload repeatedly or clear authentication.
- **P5-A.4** Find transitive imports that keep charts, QR rendering, or task forms in initial chunks. Extract/lazy-load these only when visible/open. Hiding eagerly imported JSX with CSS is not code splitting. Check Paddle imports without changing checkout initialization or lifecycle.
- **P5-A.5** Run the production preview and compare requests before/after. Public Home/login should not fetch unused operational route/chart/QR chunks. Record improvements measured; do not promise a specific percentage or silently raise the warning threshold.

Exit: cold public page trace; authenticated navigation; direct reload of staff/location/choose-plan/welcome; existing billing mocks; expired session; lazy chunk failure/recovery; no duplicate providers or blank permanent loading state. Existing screens and auth artwork remain intact.

## 11. P5-B1 — pagination foundation and Team

### API and validation

Add `GET /api/staff/search` before `/:id`. Keep `GET /api/staff/`, `/location/:locationId`, and picker contracts unchanged. Suggested shared backend pagination validation/service and typed frontend pagination component.

Response `data`: `{ items, page, pageSize, total, totalPages, summary }`. Use the original handoff's PageResult contract. Team summary: `{ totalStaff, assignedStaff, activeStaff }` over the complete matching active-only result, not the page. Do not force these numbers to differ when their meanings overlap.

- **P5-B1.1** Strictly parse scalar page/pageSize/q/locationId/assignment. Default page=1/pageSize=25; sizes 10,25,50,100; q trimmed, max100. Reject fractional, negative, malformed, repeated array/object values. A concrete location plus `assignment=unassigned` is 400.
- **P5-B1.2** Build one scoped predicate: authenticated company AND active staff AND manager locations AND requested filters/search. Search name/email/phone using Prisma parameters. Apply this predicate to rows, count, and aggregates. ADMIN can see unassigned staff; manager's empty scope must yield none.
- **P5-B1.3** Use stable name/id ascending order and Prisma skip/take. In an appropriate consistent read transaction, count, clamp out-of-range page, read rows, and aggregate. If separate reads must share a snapshot, choose/document the Prisma-supported transaction isolation; merely saying “transaction” does not prove snapshot consistency. Empty result returns page1/totalPages0/items[].
- **P5-B1.4** Select only list fields; no passwords/tokens/full histories. Preserve old response shapes and mobile consumers. No fake JS slicing of an unbounded query.

### Frontend

- **P5-B1.5** Add `useSearchStaff`, leaving `useGetStaff` for complete option lists. Query key `['staff','search',companyId,normalizedFilters,page,pageSize]`. Pass query abort signal to Axios; debounce search 300ms.
- **P5-B1.6** Reset page on effective search/filter/page-size change. Preserve useful state in URL without replacing unrelated setup parameters. Handle server page clamping once without an effect loop. Search must match records beyond the previously loaded page.
- **P5-B1.7** Add optional controlled Pagination/DataTable props. Unpaginated callers remain unchanged. Display correct range, Previous/Next, page size, accessible names, and wrapping controls. Zero rows says 0 results. Do not slice a server page again.
- **P5-B1.8** Show initial loading, background updating, error/retry, empty/no matches. If keeping old rows temporarily, keep their old range label and mark updating; do not show page2 labels over page1 records. After deletion, invalidate counts/options/location/billing/setup/schedule reads and accept the effective page.

Exit dataset: 63 records with tied names, a query matching only previously unseen rows, all page sizes, rapid typing, no matches, last-page deletion, unassigned/admin, manager zero/one/multiple sites, another company, invalid params, punctuation in search. Confirm old picker lists remain complete. Record network row limits and server aggregates.

## 12. P5-B2 — Attendance search and pagination

Add `GET /api/attendance/search` and keep `/api/attendance/`, `/my`, check-in/out, and shift routes unchanged. Reuse P5-B1 validation/UI/query conventions.

- **P5-B2.1** Filters: page/pageSize/q/staffId/locationId/from/to. Search staff name/email. Validate strict dates and from<=to. Filter before pagination, stable date descending then ID descending.
- **P5-B2.2** Preserve existing active-staff, company, manager, and date-range interpretation. Current legacy multi-time-zone filtering ORs date ranges; characterize this behavior before deciding whether the new endpoint can match it. Do not silently fix the legacy API or change day interpretation while paginating. Record any mismatch with desired site-local semantics as an explicit compatibility issue for review.
- **P5-B2.3** Capture one request time for status summaries. Reuse AttendancePage's present/late/future-ABSENT categorization; future expectedStart is shiftNotStarted, not absent. Aggregate across all filtered records using database counts/grouping, not by fetching every record. Label cards as records across the selected range, not distinct employees. If deriving display status in rows, use the same captured time.
- **P5-B2.4** Add typed search hook keyed under `attendance`, full filter state/company/page/size. Wire existing Attendance UI to server rows and summary. Keep staff selector data complete. Extend location filtering only as the approved contract describes.
- **P5-B2.5** Apply P5-B1 loading/error/cancellation/page-clamp behavior. Keep actual proof/check-in links and status details. No attendance mutation behavior changes.

Exit: >2 pages, tied dates, late/present overlap semantics, future shifts, selected staff/site/date range, two local dates, request time fixed across midnight, manager denied scope, empty/error, rapid search, complete summaries, and unchanged mobile `/attendance/my` contract.

## 13. P5-C1 — bounded histories and lightweight detail reads

Add `GET /api/location/:id/task-history` and `GET /api/staff/:id/task-history` with page/pageSize/dateFrom/dateTo. Preserve old detail endpoints. Reuse P5-B pagination validation and stable date/ID ordering.

- **P5-C1.1** Inventory detail callers, including list-hover prefetch and mobile. Record which need complete templates/options and which currently download histories. Add a dedicated overview endpoint or explicit lightweight mode; default legacy response remains unchanged.
- **P5-C1.2** History filters intersect parent company/manager scope. Staff history membership follows the existing staff-detail rule, including any assignment-history semantics; do not silently replace it with only current staffId. Use existing date conventions, strict range validation, server count/summary, and bounded reads.
- **P5-C1.3** Minimal row DTO includes actual status/times/assignee summary and fields necessary to show expandable evidence controls. Do not embed every completion attempt or full image array if the existing evidence endpoint supplies it on demand. Preserve needed QR/reference/history associations.
- **P5-C1.4** Summary `{ total, byStatus, late }` covers the whole selected range. Initialize known status keys, keep cancelled/history semantics, and explain that late overlaps statuses. Overview cards/charts also use server aggregates, never loaded page length.
- **P5-C1.5** Separate metadata/overview and enabled history queries. Opening overview or an inactive tab must not download full task history. Remove duplicate old heavy requests and hover prefetches from these web paths. Keep template lists/staff assignment options complete.
- **P5-C1.6** Query families: `['location','task-history',companyId,id,filters,page,pageSize]` and `['staff','task-history',...]`. Date changes reset page. Preserve tab/dateFrom/dateTo/focus=today and P1 site-local links. Evidence fetch occurs only on expansion and keys by actual task ID.
- **P5-C1.7** Deleted parent gets a recoverable missing state; invalidate detail and histories after permanent deletion/edit/assignment. Handle final-page deletion as in P5-B1.

Exit: overview load requests no history; history tab requests one bounded page; evidence expands on page2; filter across months; totals match full fixture set; no stale duplicate detail payload; two-time-zone Today link still works; complete selectors; manager scope and deleted parent. Save before/after JSON byte and row counts using equivalent fixtures.

## 14. P5-C2 — smaller image previews

Suggested files: `frontend/src/lib/imageUrls.ts`, `components/common/EvidenceThumbnail.tsx`, and narrowly scoped evidence/check-in/reference thumbnail call sites.

- **P5-C2.1** Inventory image ownership and URL formats. Record trusted configured Cloudinary cloud names and unsigned image-upload URL structure. A generic Cloudinary hostname alone does not prove the resource belongs to this app.
- **P5-C2.2** Pure helper: accept original URL and preview dimensions; transform only positively identified supported owned unsigned URLs. Preserve version/public-ID/extension and correctly handle existing transformation segments. For signed, external, malformed, unfamiliar, or unverifiable ownership URLs, return original without guessing. Never double-transform on rerender.
- **P5-C2.3** Apply conservative width/height and auto format/quality for small previews. Use contain for evidence where cropping could hide useful content; presentation choice must not change originals. Give image explicit dimensions, alt, async decode, offscreen lazy load, and stable failure placeholder.
- **P5-C2.4** Clicking preview opens the stored original. Stop nested row navigation where necessary and preserve keyboard activation. Keep the auth/public important image eager. Do not replace original URLs in database, verification requests, download actions, or media cleanup/public-ID parsing.
- **P5-C2.5** Test owned valid/versioned URL, existing transformations, encoded public ID, signed URL, external host, malformed URL, repeated processing, and image failure. Browser network confirms preview bytes/dimensions smaller while original opens intact. No live upload/delete is needed to prove URL formatting.

Exit: actual preview call sites changed, evidence readable, reduced transfers measured, originals/automatic-verification/deletion paths intact. A helper with no integrated call sites is not a completed unit.

## 15. Shared invalidation matrix

Use existing mutation owners. Add `workspace-setup` to `invalidateWorkspace` when P4 introduces it. Nest schedule/history keys under location/staff roots to reuse existing deletion invalidation. Existing narrow create/edit hooks may need explicit extra invalidations; deletion-only coverage is insufficient.

| Successful operation | Required affected reads |
| --- | --- |
| Location create/edit/delete | location lists/details, dashboard counts, setup, relevant schedules/histories; existing billing usage invalidation |
| Staff create/edit/location/shift/delete | staff lists/options/details/history, affected location data/schedule, Today, Attendance as appropriate, setup, existing usage |
| Template create/edit/delete | location templates/schedule/history/overview, affected staff details, Today, setup |
| Template assignment | affected location/staff views, schedule labels, Today, setup if relevant |
| Partial persisted success | Refresh real saved entities immediately; do not wait for optional assignment to recover |

Invalidation refreshes reads; it never runs the scheduler or creates missing occurrences. Do not clear auth or invalidate all queries on every keystroke. Audit numeric/string location ID keys so targeted invalidations actually match existing consumers.

## 16. P6 — final integration verification

P6 verifies the implemented units and fixes regressions within their scope. It is not a new feature or general security/testing project.

### Required evidence

- **P6.1 Completion audit:** every preceding task/exit check has evidence or an explicitly unresolved limitation. No checkbox is checked solely because code exists or a model said it was done.
- **P6.2 Frontend:** `npm run build`, `npm run lint`, `npm test` from frontend. Record warnings honestly. Compare final production chunks/network to P5-A baseline.
- **P6.3 Backend:** `npm run build` and `npx vitest run src` when backend changed. Do not count generated dist tests twice.
- **P6.4 Isolated database reads:** exercise real pagination/count predicates, tenant/site scoping, weekly occurrence deduplication, setup chains, and the outstanding P1 two-local-date case against a disposable test database. Capture expected IDs/counts/dates. If no isolated DB is available, keep this evidence outstanding; mocks cannot establish SQL behavior.
- **P6.5 Browser journey:** activated empty ADMIN → site → staff/shift → schedule → weekly view → Today/detail; reload between steps. Established ADMIN, scoped MANAGER, manager with zero sites, denied access, and guest/unpaid/returning-subscriber mocked routes also work.
- **P6.6 Failure journey:** task POST success/PATCH failure; unknown POST result; setup query failure; list request failure; image failure; lazy chunk failure; last-page deletion; delete a setup prerequisite; closing/reopening wizard. Capture correct state and write counts.
- **P6.7 Date fixtures:** one fixed `asOf` with Karachi and Los Angeles on different calendar dates (for example 2026-09-17T01:00:00Z); browser in a third zone; overnight boundaries; New York DST weeks around 2026-03-08 and 2026-11-01. No reliance on the machine's current clock for deterministic assertions.
- **P6.8 Responsive/accessibility:** 1440×900, 768px, 390×844, one 360px form check, short laptop height, keyboard-only wizard/pagination/dialogs, visible focus and error labels, no whole-page horizontal overflow. Screenshot representative states.
- **P6.9 Deletion preservation:** new lists/calendars/setup update after existing permanent deletion. Use the existing isolated deletion test only with its required disposable `*_deletion_test` database. Never use the normal application database or enable restore behavior.

Use repository-installed tools where available. If browser tooling is absent, use a documented isolated harness. An interception like `**/api/**` also matches Vite `/src/api/*.ts`; guard by URL pathname beginning `/api/` so mocks do not block source modules. Mock billing and external verification; never make real purchases or upload customer photos.

Save durable evidence under `docs/implementation-evidence/<unit>/`: concise report, representative screenshots, synthetic response/request-count examples, and measured bundle/network data. Do not commit credentials, browser profiles, node_modules, full databases, or unnecessary giant traces. Add specific ignore exceptions if report Markdown is otherwise ignored by the repository.

### Progress entry required after every unit

```text
Unit: P... / status: complete | partial | blocked
Starting changes preserved:
Task IDs completed:
Files changed and why:
API/query-key contracts added or changed:
Commands actually run and results:
Browser/DB fixtures and assertions:
Evidence paths:
Known limitations or failed checks:
Exact remaining tasks:
Next unit (not started):
```

### Stop and report conditions

Pause only the affected work when a required form value cannot map to current scheduling semantics, a preview cannot reproduce current date rules, an unknown API consumer would be broken, a mutation result is ambiguous, or a necessary verification would require live customer data. Continue independent in-scope work where useful. Do not hide the issue behind mock success, type casts, disabled checks, a TODO, automatic deletion, or a scheduler rewrite.

Final report identifies P2/P3/P4/P5/P6 status individually, links evidence, states any remaining database/deployment prerequisites, and distinguishes completed implementation from unverified behavior. Stop after reporting; deployment is not part of this plan.
