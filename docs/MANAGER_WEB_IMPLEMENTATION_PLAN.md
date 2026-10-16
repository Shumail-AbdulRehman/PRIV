# Hygene Ops: manager/admin web implementation handoff

Prepared 12 October 2026 for Sol. Read this document before implementation. The latest user request is for a detailed plan and updated visual direction; this handoff does not claim the redesign is implemented.

## 1. Outcome and scope

Deliver four connected, working screens: **Overview, Today, Reviews, and Review workspace**. Managers must recognize a problem, open the exact record, see the evidence, and choose a valid next action without investigating across several pages. Admins use the same system with company-wide scope and a location comparison; managers are limited to assigned locations.

UI/UX and visual execution are release requirements. Changing colors or adding click handlers to the existing structure is insufficient. Implement the new hierarchy, direct navigation, readable reasons, complete evidence workspace, and authoritative filters/counts together.

Do not expand to mobile, marketing, billing redesign, or unrelated backend hardening until these journeys pass. Preserve the dirty working tree. Do not reset files, discard existing language support, rewrite historical data, change task requirements, or deploy as part of this work.

Visual companion: `docs/MANAGER_WEB_DESIGN_PREVIEW.html`. It is a standalone design prototype with explicitly fictional data, not a production screen or a source of operational truth. Use it for composition and density; this plan defines production behavior and edge cases.

Open the HTML file in a browser and use Overview / Today / Reviews to explore the proposed layouts. Review opens the split workspace; issue selection and image enlargement work in the prototype. Scope options, queue tabs, language placement and pagination demonstrate visual structure; their complete API-backed behavior belongs to implementation.

Visual references:

- [Proposed overview](manager-web-design/overview-1440.png), [phone-width overview](manager-web-design/overview-390.png).
- [Proposed Today](manager-web-design/today-1440.png), [phone-width Today](manager-web-design/today-390.png).
- [Proposed review list](manager-web-design/reviews-1440.png), [phone-width reviews](manager-web-design/reviews-390.png).
- [Proposed review workspace](manager-web-design/case-1440.png), [phone-width workspace](manager-web-design/case-390.png).
- [Existing overview baseline](manager-web-design/before-overview.png), [existing review baseline](manager-web-design/before-review.png).

## 2. Inspection findings: fix causes, not symptoms

Read `PRODUCT.md`, `DESIGN.md`, `PROJECT_CONTEXT.md`, `.agents/skills/frontend-design/SKILL.md`, and applicable repository instructions. Current source outranks historical screenshots/reports.

| Confirmed source finding | User-visible consequence | Required correction |
| --- | --- | --- |
| `DashboardPage.tsx` and `TodayStatusPage.tsx` both render `DailyOverview` | Two route names describe the same long page | Separate overview and daily records; share data/components |
| Metric buttons in `DailyOverview` only toggle `view` in search parameters | Clicking appears to do nothing because results change below the fold | Real links to the matching filtered list, with destination heading/focus |
| Review card queries `state=MANAGER_REVIEW` without a date | Old cases appear beside today's metrics; OPEN cases are omitted | Explicit date cohort and consistent actionable-state predicate |
| Today API combines day anchors in `date in [...]`; staff/tasks assembled separately | Date/location pairing is implicit, and overnight carry-over is omitted | Shared per-location day scope, explicit overnight contract, same filter in aggregates and rows |
| Today API returns early when there are no staff, and selects only tasks assigned to current staff | Unassigned work requires extra per-location schedule requests | Read actual task instances directly, including unassigned work, independent of staff rows |
| Inbox shows priority and number of issues, rather than a useful reason | Manager cannot decide what to open | Show backend-grounded reason, fixture, worker and time; remove priority controls/badges |
| Inbox has cursor-based 50-row loading; no date/search filter in backend | Cannot filter all matching results or offer honest numbered pagination | Add validated server search/date/page contracts; keep legacy cursor behavior compatible |
| Review detail sends managers to `/verification/:taskId` | Requirements and evidence are fragmented | Assemble task requirements, context and photos in the case workspace |
| `allowedActions` broadly includes RESOLVE_ISSUE before satisfaction checks | An available-looking action can fail with “Resolve the blocking condition first” | Expose precise eligibility and blocking explanations from shared backend policy |
| Review back link is always `/exceptions`; layout calls `window.scrollTo(0,0)` on pathname changes | Back navigation loses filters and position | Safe return URL, cached query state, explicit scroll/focus restoration |
| `ProtectedEvidence` limits images to `max-h-64` and opens blob in new tab | Evidence is too small and breaks the decision context | Larger inline viewer and accessible enlargement dialog, same protected endpoint |
| `plainReason` falls back to formatting codes; `reviewHeading` has few specific cases | Several different problems get the same vague title | Complete, tested reason vocabulary with conservative unknown fallback |
| `invalidateWorkspace` misses `daily-schedule` and `owner-trends` | Some dashboard material may remain stale after a decision | Central query keys and explicit invalidation of new overview/list queries |

The current browser scripts were run against the actual Vite frontend with fabricated API responses. Both passed at 1440 and 390 pixels, including their existing Urdu/enlargement and error tests. These tests preserve old behavior: the review script explicitly expects a separate “View task photos” link. Replace that expectation with the new complete-workspace requirement. Passing old tests is not proof that the requested UX is achieved.

## 3. Concrete visual direction

Physical setting: a manager glances between workers and a laptop or phone in a bright site office. Use a light, quiet canvas, strong dark text, and recognizable controls. Preserve the existing logo. Use operational teal for action, not a full-page tint.

### Tokens and composition

| Role | Target |
| --- | --- |
| Canvas | Cool paper `#F4F6F8` |
| Main surface | Almost white `#FDFEFE` |
| Main text | Deep slate `#192D38` |
| Supporting text | Slate `#536775` |
| Brand/action | Deep teal `#176457`; light selected surface `#E7F2EE` |
| Attention | Dark amber `#86520F` on `#FFF4DE` |
| Error/overdue | Dark red `#A63838` on `#FFF0EE` |
| Dividers | `#DCE3E7`; inputs/focus need stronger boundaries |
| Type | Existing Inter/system UI for English; bundled Noto Sans Arabic for Urdu. Use one calm interface family rather than decorative display type |
| Scale | Page title 28/36, section 20/28, body 16/24, dense metadata 14/21, metric value 30/36. Use rem units; tabular numerals |
| Space | 4/8/12/16/20/24/32; 24 between sections; 16–24 within panels |
| Controls | Minimum 48px target, 10px radius, label above field, icon with text |
| Surfaces | 12px radius, subtle full border, no decorative gradient or floating-card shadow |
| Shell | 224–240px sidebar; 64–72px top bar; content max 1440px, 24–32px padding |

Express these as semantic tokens inside `.workspace`, preferably OKLCH equivalents, and verify contrast in the rendered implementation. Consolidate competing legacy declarations in `workspace.css`; do not append a third override layer. Public marketing styles remain scoped separately.

The signature is a **recognize → inspect → decide** structure: a concise issue queue leads to a spacious evidence panel with a short decision column. No oversized empty issue card, icon tile for every paragraph, or card inside another card. The requested four metric cards are compact navigation affordances, each visibly linked with a small arrow and clear hover/focus state.

### Shell and routes

- `/dashboard`: **Overview**. Quick situation and next actions.
- `/today-status`: **Today**. Searchable/paginated workers and tasks for a selected day.
- `/exceptions`: **Reviews**. Full review queue, including older unresolved work.
- `/exceptions/:id`: **Review workspace**. Case ID, never task ID.
- Keep `/verification/:taskId` available for historical links, but a review must not require it.
- Sidebar: Overview, Today, Reviews, then existing Locations, Team, Attendance. Admin-only tools remain role gated. Update breadcrumb/title mappings and remove the alias that marks Overview active on Today.
- Language choice stays visible in the top bar. Optional Listen belongs beside essential issue guidance, not every decorative header.

## 4. Screen specifications

### A. Overview

```text
Overview                         [Assigned locations v] [Today / date]
Monday, 12 October · times follow each location       Updated 10:42

[Staff present ↗] [Tasks due today ↗] [Work submitted ↗] [Waiting for review ↗]
 18 of 24          24 tasks           14 of 24             3 cases today

Needs your attention                                [See today's work]
Worker / area       Concrete problem + location       [Specific action]
...

Cleaning progress today                 Today's tasks
Submitted      ██████████ 14             Area · worker · status · [Open]
In progress    ████        5             ...
Not started    ██          3             [View all tasks]
Overdue        █           2
Submission is separate from verification.

[Admin: location comparison, using the same date and metrics]
```

Numbers above are illustrative only. Header filters apply to all daily cards, attention rows, chart, and operational preview. Preserve visible location selection as options load; do not silently switch to an unauthorized location.

Summary navigation is a real `<Link>`, never a filter-only button:

| Card | Destination and exact meaning |
| --- | --- |
| Staff present | `/today-status?tab=staff&attendance=present&locationId=...&date=...` |
| Tasks due today | `/today-status?tab=tasks&status=all&locationId=...&date=...`; actual active, non-cancelled occurrences |
| Work submitted | `/today-status?tab=tasks&status=submitted&locationId=...&date=...`; same submission predicate as count |
| Waiting for review | `/exceptions?queue=needs-me&period=today&locationId=...`; explicit selected date uses `period=date&date=...` |

Use a shared URL builder; omit `locationId` for all authorized locations. `date=today` remains a symbolic value interpreted per location, not the browser's UTC date. On a historical day, rename “today” labels to the selected day.

Attention order: missing check-ins after shift start, unfinished overdue tasks, due/unassigned tasks, manager decisions. Within a group use due time and stable ID. Show at most 6–8 rows and an honest total/link for each category. Include worker, area/task, location, short reason and one action. A review row opens the case, a task row opens the task, an attendance row opens the worker's matching day/attendance. Do not manufacture a case ID from a task ID. The manager sees no priority scores.

Daily chart: use four labelled horizontal bars for submitted, in progress, not started and overdue. It must partition active non-cancelled tasks using one server classification. `overdue` takes precedence over pending/in-progress if unfinished and deadline passed; submitted takes precedence over lateness. Show separate verification counts below, not additional stacked segments. No percentage donut, invented series, or zero for unloaded data. Provide an accessible textual equivalent. Recharts already exists if needed; simple CSS bars are also sufficient.

Admin variation: location comparison table with location, staff present, submitted/due, today's reviews, and Open Today. Use server totals for every location, not counts from the first page of reviews. Managers may see the same table for multiple assigned locations. A seven-day trend is optional after the four flows pass; the current `OwnerTrends` contains two aggregated periods, not seven daily data points. Do not draw a seven-point line from those aggregates.

### B. Today

Title **Today** for live today; **Daily records** for an explicit historical date. Show date and location filters at the top, with “Back to today.” Two primary tabs: **Staff** and **Tasks**. Do not mix staff rows, task rows and reviews within one ambiguous table.

- Staff: search by name; All / Present / Not checked in / Shift not started. Columns: worker and location, shift, attendance, submitted/assigned work, explicit View worker action. No-record is “No attendance record,” not absent.
- Tasks: search task/room/worker; All / Not started / In progress / Overdue / Submitted / Unassigned. Columns: area and task, location, worker, scheduled time, work state, review state, Open task/Review. Submitted rows can still need review.
- Show current shift time, not only a status badge. Carry-over is explicitly marked “Started yesterday · overnight shift.”
- Paginate both tabs through the server. A staff row can expand a bounded task preview with “View all this worker's tasks,” which applies a worker filter to the Tasks tab. Do not fetch all tasks per worker to paginate them in the browser.
- Normal task inspection opens an inline detail panel via `taskId` in the URL, using the existing authorized task/manifest APIs. The panel shows assignment, schedule, work status and verification status; a case link opens the full workspace when one exists. Deep links and reload must reopen the panel. Staff details may use the existing date-scoped route; verify that its destination really honors the query parameters.
- Unassigned work must identify the actual occurrence. If existing assignment UI edits a template rather than today's occurrence, label that correctly or embed/reuse the existing occurrence-assignment action. Never label a schedule edit “Assign this task” unless it performs that mutation.
- Old review cases live under Reviews. A quiet “Earlier unresolved reviews” link may be separate, but must not enter today's totals/chart/list.

### C. Reviews

Title **Reviews**, short supporting line “Check the reason, look at the photos, choose what happens next.” Remove the entire More filters section shown in the user's screenshot, including Priority, Reason filter and Worker ID field. Reasons remain prominent content in every row.

Visible filters: location, room (enabled after a location is selected), text search, period (All dates / Today / Earlier / Specific date). Default period is All dates so backlog remains discoverable. A dashboard link explicitly selects today's cohort. Primary queue tabs:

1. **Needs my decision**: OPEN or MANAGER_REVIEW.
2. **Waiting for staff**: STAFF_ACTION_REQUIRED.
3. **Checks pending**: WAITING_SERVICE.
4. **Resolved**: RESOLVED.

Each row: area/task title; location and worker; local scheduled date/time; leading unresolved reason; “+2 more issues” where relevant; state; **Review** link. Existing priority can sort internally, never appear as a numeric label. Use priority descending, oldest raised time ascending, ID as stable tie-breaker for actionable queues. Show future/older task dates clearly. Setup cases with no task use a concrete setup reason, area/location and raised time.

Examples from actual reason families: PHOTO_TOO_DARK → “Photo is too dark”; PHOTO_BLURRY → “Photo is blurred”; MISSING_EVIDENCE → “Required photo is missing”; AUTO_PASS_NOT_VALIDATED → “Cleaning needs your check”; SERVICE_FAILURE → “Automatic check could not finish”; PRIVACY_HOLD → “Photo needs a privacy check”; WRONG_ITEM → “Photo may show another fixture”; MISSING_SURFACE → “Part of the fixture is not visible.” Unknown reasons become “This work needs your decision,” with authorized supporting instructions. Never infer dark/dirty from a generic failure.

Pagination: 20 rows default; 20/50 selector; range, exact filtered total, Previous/Next. Empty/error/denied differ. “Nothing needs your decision” only after a successful response. A search with no matches says “No reviews match these filters” and offers Clear filters. Queue counts are full server aggregates using the same non-queue filters.

### D. One review workspace

```text
← Back to reviews                         [Next review →]
Ground floor washroom           Waiting for your decision
Gulberg office · Ali Raza · Morning clean · Mon 12 Oct, 09:00–10:00
Work submitted 10:04 · Verification pending

[Photo too dark] [Missing sink photo] [Room context]   2 open issues

┌ Evidence and requirements (about 60%) ┐  Issue and action (about 40%)
│ Selected fixture and required view   │  Photo is too dark
│                                     │  Check whether the bowl is visible.
│ Large protected photo / honest empty │  [Listen]
│ state                               │
│ [Enlarge photo] Captured / received  │  What should happen next?
│                                     │  [Ask for another photo]
│ Required: bowl, seat and inner rim   │  [Accept this photo] (only if eligible)
│ Example photo (optional guidance)    │  [More options]
│                                     │
│ All required photos:                │  Inline selected-action form
│ Toilet 01 / bowl    Another needed  │  consequence · short reason/note
│ Sink 01 / basin    Missing          │  [Save decision]
└─────────────────────────────────────┘
▸ Previous decisions and earlier photos
```

Use the content width; remove the narrow max-width wrapper around the current giant issue card. Issue selector is a wrapped list of labelled buttons, not a hidden overflow menu or horizontal strip that clips Urdu. Selecting an issue updates the image, requirement and action panel together. Preserve selected `issueId` in the URL. Show resolved issues in history; select the next open issue after save without discarding drafts silently.

Evidence area must include all task requirements, even those with no issue-specific attempt. A task-level missing-evidence case must immediately show exactly which mandatory views are missing. Do not ask managers to navigate to discover them. Show required view instructions from the immutable task snapshot. Optional current room standards must be labelled “Example guidance,” tied to the source fixture where possible, and never imply that a newly edited standard was the historical task requirement.

Protect photos through `getEvidenceBlob` and the authenticated content endpoint. No direct Cloudinary public URLs, guessed assets, privacy bypass, or acceptance solely because the image can be viewed. Unknown/PENDING privacy state must not initiate routine display. Authorized restricted review may use the existing audited HOLD path; label it and keep acceptance unavailable. Enlarge in an accessible dialog with Escape, focus trap/return, zoom and meaningful alt text. This dialog is appropriate for image inspection; decisions remain inline.

Missing image states: not received, checking privacy, restricted, unavailable/error, and truly missing. “No photo received” does not claim there is no saved photo on the worker's phone.

Use eligible actions only. Every blocked normal next step gets a short explanation with a real alternative. Do not present a disabled Save button without telling the user what is missing. The first form is closed until an action is chosen. Keep the selected action/consequence visible; use a short action-specific reason list rather than the current 16-code universal list. Preserve audit reason/note requirements. No success toast alone.

After save: “Another photo requested. Waiting for Ali.” or “Photo accepted. One issue still needs your decision.” Use the server's refreshed case state. A request for more cleaning is not case resolution. Keep a persistent result banner and offer Next issue / Next review / Back to reviews as appropriate.

## 5. Date, status and metric contract

Implement this before wiring cards to lists. One backend service must supply predicates for summary, chart, preview and paginated records. Avoid duplicating business classification inside page JSX.

### Location-local dates and overnight work

Use `getZonedDayRange` and `getZonedDayRangeFromDateInput` in `backend/src/utils/dateTime.ts`. Pair each range with its location ID in an OR predicate. Never compare UTC string prefixes, take only the first location's timezone, or add a fixed 24 hours to find the next local midnight.

`TaskInstance.date` follows the resolved task start day; `resolveTaskInstanceWindow` can move post-midnight tasks onto the next day for overnight staff. Attendance is anchored to its shift's start day and can span midnight. Preserve these existing conventions.

Recommended daily inclusion: task/attendance records anchored to the selected local day, plus earlier-starting shift windows that genuinely overlap it (`start < dayEnd && end > dayStart`). Return `carryOver=true` for the latter. Deduplicate each task by ID and each person for attendance denominators. A previous task whose shift ended before dayStart is backlog, even if unresolved. An overnight shift still crossing today's midnight is relevant, labelled explicitly. At an exact end boundary use half-open intervals. For staff with two attendance rows, retain both shift summaries while selecting the currently active row for primary display; do not silently overwrite in a Map keyed only by staff ID.

Define totals as daily workload, including labelled overnight carry-over; do not add overlapping daily totals into a weekly unique-task total. If a future trend is implemented, bucket by owning scheduled day to avoid double counting carry-over.

For a live period, derive each authorized location's today from the same server `asOf` instant. For an explicit date, use that calendar date independently in each location timezone. If multiple locations have different local dates, display “Today in each location” and expose the per-row date. Refresh queries at focus/reconnect and location-midnight rollover.

### Exact metrics

- Staff present: distinct active scoped staff with applicable attendance containing a confirmed check-in; count checked-out staff as attended today. A missed checkout with a real check-in is not absent. Denominator is distinct scheduled staff with applicable shifts, not every employee regardless of schedule. Display unscheduled/no-record workers separately and never invent expected attendance. If retaining an all-active-staff denominator for compatibility, explicitly label it “of active staff”; do not call it scheduled.
- Tasks due: actual active, non-cancelled task instances in the cohort, including unassigned work. Schedule previews are not actual tasks.
- Work submitted: use the existing `operationalTaskStatus`/`managerTaskPresentation` semantics; preserve raw task status, `staffSubmittedAt`, verification state and completion outcome in the DTO. Clearly classify retained legacy completion separately when explaining verification.
- Waiting for review: distinct cases in OPEN/MANAGER_REVIEW tied to tasks in the daily cohort. Count cases, not issues or unread records. Setup cases have no scheduled task date; include them in all-date Reviews and an explicitly labelled setup attention group, not today's task review denominator.
- Verification: VERIFIED_COMPLETE, COMPLETED_WITH_EXCEPTIONS, LEGACY_RECORDED and unresolved review remain distinct. Submission is not proof of automatic approval.
- Status chart: submitted, overdue unfinished, in-progress, not-started are disjoint. Handle MISSED as overdue/unfinished; exclude CANCELLED. Failed fetch is unknown, not zero.

## 6. Backend/API work

Paths below are **proposed additions/extensions**, not already available APIs. Keep the old Today response compatible for existing consumers while the new pages migrate.

### Operations reads

Add `operationsScope.service.ts` and `managerOperations.service.ts`, with controller/routes under the existing authenticated manager router:

```text
GET /api/manager/operations/overview?locationId=&date=today
GET /api/manager/operations/staff?locationId=&date=today&q=&attendance=&page=1&pageSize=20
GET /api/manager/operations/tasks?locationId=&date=today&q=&status=&workerId=&page=1&pageSize=20
```

Overview returns `asOf`, selected scope and per-location dates/timezones, typed metrics, mutually exclusive task-status counts, bounded attention preview with full category totals, bounded task preview and admin location summaries. Staff/tasks return `rows`, `total`, `page`, `pageSize`, `totalPages`, `asOf`, and applied scope. Return the actual clamped page if deletions/resolutions reduce the last page. Counts are over the full matching query, never the limited result set.

Use company and assigned-location constraints before every count/find; unauthorized explicit location is denied, not silently replaced with all locations. Use validation for positive IDs, real calendar dates, allowed filters, search length, and bounded page size. Set deterministic order with ID tie-breaker. Use one query scope for summary and rows, and a consistent read transaction where necessary to avoid visibly contradictory counts. Do not run a new weekly-schedule request for every location to find today's unassigned tasks.

### Review listing

Extend GET `/api/verification-exceptions` with `queue`, `period`, `date`, `q`, `page`, `pageSize`, while preserving the current cursor response for existing callers. Reject ambiguous simultaneous cursor/page requests. During frontend migration, normalize legacy `state=MANAGER_REVIEW` into the new needs-me queue and preserve old bookmark meaning. New UI ignores/removes old priority/worker-ID filters visibly; backend compatibility may retain them.

Search applies server-side to area/task/worker names; period uses the same location/task cohort helper. All dates includes setup and historical cases; Earlier means task windows ended before each local dayStart, not merely `firstRaisedAt < today`. Queue tabs return exact counts under the same location/search/period filters. Return a useful `displayReasonCode`, unresolved issue count, fixture/view summary, actual task date/start/end, submission/verification state and authorized location/worker. For setup cases derive an authorized reason from the existing setup event/template state, not an empty issues array.

Pagination mode: server offset pages for this manager queue, default 20/max 50, ordered by priority/raisedAt/ID. Data can change between requests; refetch current page/count after mutation and clamp. Do not promise snapshot pagination. Keep cursor mode for history/infinite consumers. Query plans should be inspected before adding indexes; preserve custom SQL constraints/triggers if migrations are needed.

### Review workspace payload

Extend GET `/api/verification-exceptions/:id` into a typed workspace DTO rather than asking JSX to infer policy. Reuse existing manifest/history/standard-photo service logic; do not call HTTP endpoints from the API into itself.

Include:

- Case identity/state/version; task raw and operational status, submission time, original/current deadlines, area/location/timezone, worker/assignment context.
- All snapshotted required items/views, instructions, mandatory flag, requirement state, current accepted attempt and safe media descriptors. Inventory bounds already limit this set; paginate historical attempts separately.
- All unresolved issues, reason text keys, selected/current versus issue-triggering attempt IDs, privacy state, exact action availability and blocking reasons.
- Context evidence relevant to contributing sessions; optional authorized standard photos labelled as current guidance.
- Paginated prior decisions/events/attempts with independent cursors. Exhausting one stream must not reload its first page when another stream continues.
- Server time, fresh processing status, and setup-specific summary when there is no task.

Bind lookups by case/task/company; keep asset content access independently authorized. The DTO must not leak storage keys, raw model scores, QR/slot secrets or spatial diagnostics.

### Action eligibility and resolution

Create shared eligibility/satisfaction helpers used both by detail reads and `managerDecision` inside its existing locked transaction. GET eligibility is advisory; POST must re-evaluate it. Preserve request UUID/body-hash idempotency, expectedVersion, actor access, lock ordering, audit events, retained history and finalization.

Return action descriptors such as `{ action, enabled, blockedReasonCode, consequenceKey, targetRequirementId, eligibleAttemptIds }`. Show enabled actions as buttons; explain relevant blocked routes as short next-step text. Do not authorize actions merely from a client descriptor.

| Existing action | UI label | Eligibility / consequence to retain |
| --- | --- | --- |
| ACCEPT_EVIDENCE | Accept this photo | Received SAFE evidence bound to the requirement; manual acceptance, not automatic verification |
| REQUEST_RECAPTURE | Ask for another photo | Valid mutable requirement and permitted capture/rework path; keep evidence/history |
| REQUEST_CLEANING | Ask for more cleaning | Only an appropriate cleaning concern; never default for service failure |
| MARK_MAINTENANCE | Mark repair needed | Valid fixture/area; does not waive evidence or resolve every issue |
| WAIVE_REQUIREMENT | Make an exception | Explicit required note/reason; no image credit; completion with exceptions when all gates pass |
| ACCEPT_CONTEXT | Accept room check | Safe relevant context from the contributing session; separate from fixture acceptance |
| EXTEND_WINDOW | Give more photo time | Existing one-time, bounded original-deadline policy; do not calculate from now |
| RESOLVE_ISSUE | Resolve this issue | Existing satisfaction predicate actually passes, including privacy/replacement/context requirements |
| REJECT_EVIDENCE | Reject this photo | Secondary action with clear impact and retained evidence |

Task-level MISSING_EVIDENCE deserves special care. It has no requirement binding, so sending its `issueId` alongside another requirement ID is invalid. Display each missing requirement with its own permitted requirement-level actions; the current backend can process requirement-targeted decisions without that unrelated parent issue ID. Verify and expose those actions explicitly instead of forging a parent binding. Re-evaluate the parent issue after affected requirements change. Never blanket-waive all missing photos or hide the task-level issue.

Requests for replacement photos must not imply that an expired/submitted task can accept uploads. The current capture flow rejects submitted tasks; if a requested action would leave staff unable to act, explain the available existing extension/follow-up path. Do not silently reopen a submitted task or grant new capture authority as a UI fix. If no existing path is valid, present the reason and an accurate schedule/follow-up action rather than an impossible request.

Completed-task concerns use existing completed follow-up proof requirements. Replace the raw task-number input with a scoped searchable list of eligible completed follow-up tasks in the same room, showing worker/date/replacement coverage; add an authorized read endpoint if necessary. The POST still verifies proof. Do not apply that special path to an unfinished expired task; those are different states.

Setup cases: `managerDecision` deliberately refuses them. Show the setup problem and embed/reuse the room/schedule configuration entry point when feasible. Existing template update resolves the corresponding setup case. Verify that path and refresh the workspace after correction; never add a generic Resolve that bypasses configuration. Expired/cancelled/inactive cases may legitimately have no eligible mutation. Explain the actual restriction and preserve the case; archival/abandonment policy changes are outside this redesign.

After actions call existing `refreshCase`/`finalizeTask`; return decision and refreshed case status/version/openIssueCount/nextStep. A case leaves Needs my decision when no manager-action issues remain, can move to Waiting for staff, and is RESOLVED only when all issues qualify. Remaining issues never disappear because one action succeeded.

## 7. Frontend implementation map

Reuse Button, Input, PageHeader, StatusBadge, DataTable, LanguageChoice, ListenButton and protected-media fetches. Improve their contracts rather than building page-specific copies.

| File/group | Work |
| --- | --- |
| `workspace.css`, `DESIGN.md` | Consolidated tokens, layout, type, focus/disabled states and responsive rules |
| `DashboardLayout.tsx`, `Sidebar.tsx`, `main.tsx` | Distinct routes/navigation, document titles, safe scroll restoration |
| `pages/Manager/{api,types,queries}.ts` | Typed operations contracts and scoped query keys; no loose envelope guesses |
| `pages/Dashboard/DashboardPage.tsx` | Real overview composition and admin location comparison |
| `pages/Manager/TodayStatusPage.tsx` | Daily record tabs, URL filters, server pagination, task panel |
| `pages/Manager/DailyOverview.tsx` | Extract useful pieces then retire its double-page orchestration |
| `pages/Manager/operationsPresentation.ts` (new) | URL builders, date labels and display mapping; backend remains authority for cohorts |
| `components/common/Pagination.tsx` (new) | Reusable accessible paging, total/range, page-size control |
| `components/common/ScopeFilters.tsx` (new) | Visible location/day controls with labelled loading/denied behavior |
| `pages/Manager/TaskStatusChart.tsx` (new) | Compact accessible task-status chart |
| `ExceptionInboxPage.tsx`, exception API/types/queries | Server filters/paging, reason-first rows, correct links and return state |
| `ExceptionDetailPage.tsx` | Workspace orchestration, issue selection, data/error handling; extract evidence/action/history components |
| `actionPresentation.ts`, `reviewPresentation.ts`, verification `presentation.ts` | Unified human labels, action consequences and conservative reason fallbacks |
| `ProtectedEvidence.tsx` | Larger protected viewer, fail-closed privacy rendering, accessible enlargement/retry |
| `invalidateWorkspace.ts` | New query-key families, summary/list/task/history invalidation |
| Web translations / vocabulary test | Translate new manager text; preserve shared web/mobile vocabulary without redesigning mobile |

Query keys must include actor/company/role plus all applied filters. Use `keepPreviousData` only with a visible updating indicator; never imply old-location rows belong to a newly selected location. Abort superseded requests. Lower background polling to a reasonable cadence (for example 30s daily/list, 5s only for actively processing detail) and stop hidden/offline polling. Revalidate after mutations/focus/reconnect.

Store all meaningful filters/tab/page/search/selected task or issue in URL parameters. Search debounce ~250ms, reset page on filter changes, clamp on dataset shrink. Preserve return URL and scroll position in route state/session history keyed by full URL and actor; validate return paths as internal approved routes. Browser Back, explicit Back, reload and copied URLs must all work. Restore focus to the originating row/action when possible. Never persist protected image blobs or audit notes in general localStorage. Keep in-progress notes through errors/refetch; warn before abandoning an unsaved note.

Next review must come from the server-scoped current filter/order, not just the initially fetched 20 cases. Add a small context-aware next-case lookup, or fetch successive list pages correctly. If no next case exists show “You're caught up in this view” and Back to reviews; do not wrap silently or select an unauthorized case.

## 8. Accessibility, Urdu and states

- Desktop 1440 and small laptop 1280×800: header, metrics and start of attention list visible without scrolling; selected issue and primary action visible together in the review workspace.
- Below ~1100px, review columns stack: issue summary, selected evidence/requirements, actions, history. Do not duplicate a form in two responsive trees. Below 768px tables become summaries with visible action, reason and identity; secondary fields can expand. Below 400px metric cards can stack rather than clip labels.
- Use CSS logical properties and bidi isolation around times, IDs and mixed names. Urdu text uses appropriate line-height; buttons grow with text. Mirror direction arrows, not camera/person icons. RTL reading order must match visual order.
- Test keyboard navigation, Enter/Space activation, visible focus, labelled search/selects, semantic tables, live save/status announcements, 200% text and reduced motion. Avoid reordering rows under keyboard focus during polling.
- Loading: bounded skeletons. Error: clear failed section and Retry. 403: access explanation and choose authorized location. 404: unavailable case and Back. Offline: last-updated timestamp, visible stale notice and no mutation. No stale success after failed POST.
- Missing voice: existing supported speech API, matching installed voice; persistent unavailable message. No new audio service is required for this plan.
- Translation parity currently compares entire web/mobile dictionaries. Either add shared new vocabulary to both dictionaries without mobile behavior changes, or deliberately split shared versus web-only dictionaries and update the test to protect shared parity. Do not delete coverage to make tests pass.

## 9. Implementation phases and completion gates

1. **Baseline and contracts.** Save dirty status/diff, run current tests/browser fixtures, inventory routes, implement/test day/status/review-scope predicates. Deliver typed API proposal and representative fixtures: multi-location, no staff but unassigned task, overnight, multiple issues, missing/held photo, setup, resolved, service failure. Gate: sample totals reconcile and scope denial tests pass.
2. **Shared shell and Overview/Today vertical slice.** Tokens, navigation, scope bar, linked metrics, actual task chart, server staff/tasks pagination, task panel. Gate: all four cards navigate correctly; location/date/search/page survive Back and reload; no unrelated-date tasks.
3. **Reviews queue.** Backend page/search/cohort extension, reason-first list, readable dates and queue tabs, remove advanced filter block, exact totals and empty-page recovery. Gate: test >2 pages and page exhaustion after mutation; reason is visible on every item.
4. **Complete review workspace.** Joined DTO, shared eligibility, evidence/view requirements, targeted actions, follow-up selector, setup flow, history, success/reconciliation and next review. Gate: no second investigative page; privacy and audit semantics preserved; partial resolution leaves other issues visible.
5. **Visual and usability finish.** Match preview composition, inspect desktop/narrow/Urdu/large text, test live-like request failures, run suite/build/lint, record screenshots and verification. Gate: all journeys below pass and no unexplained disabled/dead control remains.

Do not wait for a new aesthetic approval between routine phases; the supplied brief/preview is the target. Stop only for genuinely new product-policy decisions or unavailable required external access. Keep independent work moving. Keep schema/migration changes minimal and do not apply migrations to a real database during UI validation.

## 10. Acceptance tests Sol must implement/run

| Scenario | Required result |
| --- | --- |
| Click each summary card | Route changes to correct record type/filter; title visible; count equals full result total under unchanged data |
| Same manager, two locations | Own assigned scope only; changing location updates every daily section; unrelated company/location denied |
| Karachi midnight | 00:15 local uses previous UTC date correctly; old ended task excluded |
| Overnight shift/task | Overlapping carry-over labelled and included once; post-midnight task anchored as existing resolver dictates |
| DST location | Local day boundaries follow timezone, not fixed 24h; counts/lists agree |
| No staff, unassigned task | Task remains visible and counted; no early-empty response |
| Submission vs verification | Submitted review-pending task counted as submitted; never labelled verified |
| Chart | Categories reconcile to full daily non-cancelled total; missing data shown unavailable |
| Review list with 47 records | 20/20/7, total 47; server search can find a record initially on page 3 |
| Resolve last result on last page | Server/client moves to valid page; totals update; no misleading empty queue |
| Return from case | Same queue/filters/page/search/position restored; originating row focus recovered |
| Review with missing evidence | Required fixture/views visible immediately; no evidence invented; no navigate-to-investigate requirement |
| Service failure | Never says dirty; displays eligible review path or blocked explanation |
| Multi-issue case | Resolving one issue preserves others; Needs my decision count changes only per server state |
| Safe acceptance | Correct requirement/evidence binding, audit note/version/idempotency, completion with exceptions when eligible |
| Privacy hold | Routine display/acceptance blocked; authorized restricted viewing audited; safe replacement rules retained |
| Cross-tenant asset/case IDs | Server denies; UI does not display cached other-actor data |
| Expired/submitted/completed task | No false promise of upload/rework authority; applicable extension/follow-up rules and explanations |
| Setup case | Concrete configuration reason; no fake evidence action; configured template path resolves only qualifying case |
| Double click / lost response | One logical decision; same idempotency key for identical retry; no duplicate audit action |
| 409 changed review | Note preserved; refresh and reselect/reconfirm against current eligibility; no stale auto-resubmission |
| POST succeeds, refetch fails | Show “Decision saved; updated details could not load” rather than “Save failed”; offer Refresh |
| 403 / 503 / offline | Distinct messages, retry/return path, no zero-count success masquerading as failure |
| Urdu + 200% text | No clipped controls or horizontal page overflow; correct reading order; all newly visible copy translated |
| Evidence enlarged | Protected bytes only; Escape/focus return, no accidental decision submission |
| Next case across page boundary | Correct filtered authorized case; resolved or moved cases skipped according to current queue |

Backend tests: pure scope/status tests plus isolated PostgreSQL integration for counts, action eligibility, resolution and races. Use existing mocks for fast service tests, but do not claim SQL correctness from mocks alone. Browser tests should click destination routes and assert loaded record IDs and matching request parameters, not merely inspect `href`. Stateful fabricated responses must actually update requirements/case/counts after POST; the current static action mock is insufficient.

Run package-local checks after implementation: backend `npm test` and TypeScript/build; frontend `npm test`, `npm run lint`, `npm run build`; isolated database suites for changed contracts. No mobile suite is required unless shared dictionary/test files change. Never start the API/worker or migrate a configured database just to get screenshots. Browser fixtures can run against Vite with intercepted APIs.

## 11. Short usability sessions

Use two managers and two owners, including Urdu preference and lower software confidence. Sessions of 20–25 minutes, test company and fabricated data. Ask without coaching:

1. “Who has not checked in today?”
2. “Find the washroom whose cleaning is overdue and who is responsible.”
3. “Why does this photo need your decision?”
4. “Ask for a better photo and explain what happens next.”
5. “This case has two issues. Deal with one and find what is still waiting.”
6. “Return to the list where you were, then find yesterday's unresolved reviews.”

Record time, wrong turns, misread states, unsuccessful clicks, requests for help and mistaken submission/verification assumptions. Aim for 4/5 representative users completing each core task without coaching and no privacy/verification misunderstanding; treat this as a target, not existing evidence. Fix the most repeated confusion before adding visual ornament or more charts. Have a native Urdu speaker review new workplace wording.

## 12. Evidence and handoff boundaries

Already done during planning: source tracing; Vite run; existing operations/review Playwright scripts on fabricated responses, desktop/390px, their existing error/offline/Urdu/enlargement checks. Baseline artifacts were generated in `/tmp/priv-operations-browser` and `/tmp/priv-review-browser`. No real manager login, customer evidence, database integration, deployed permissions, provider behavior or real-user study was tested. Previous test totals in project context are historical and must be rerun by implementation.

The standalone visual prototype was also checked in Chrome at 1440px and 390px: all four layouts, attendance-card navigation, issue switching, image enlargement/close, demo saved state, and review layout at 200% text passed without page errors or page overflow. Screenshots are retained under `docs/manager-web-design/`. This is prototype validation, not validation of the proposed production changes. New-prototype Urdu interaction is not implemented or tested; the existing app's Urdu checks passed separately.

Sol's final delivery must include changed files, concise design decisions, actual command/test results, before/after screenshots, checked journeys, API/schema changes, and remaining live-data limitations. Update `DESIGN.md`, `PROJECT_CONTEXT.md` and `docs/UX_REDESIGN.md` only to describe the implementation actually delivered. Do not mark every plan item done merely because the app compiles.

Suggested start prompt for Sol:

> Implement `docs/MANAGER_WEB_IMPLEMENTATION_PLAN.md` in the existing repository. Use `docs/MANAGER_WEB_DESIGN_PREVIEW.html` as the visual target, replacing all sample content with actual authorized APIs. Preserve uncommitted changes. Complete Overview, Today, Reviews and the full review workspace, including server-side cohorts/pagination/action eligibility and the acceptance tests, before touching mobile or unrelated pages. Treat privacy, submission versus verification, and honest action availability as non-negotiable. Work through the phases and report actual validation and remaining limits.
