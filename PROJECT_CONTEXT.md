# Hygene Ops — current project context

Updated: 2026-10-13. Repository: `/home/shumail/bk-Priv/PRIV`.

This is the consolidated context for understanding and continuing this project. It replaces the September 3 `PROJECT_CONTEXT.txt`. It describes the source and uncommitted work inspected and redesigned on October 11, not necessarily a deployed release. It is a context snapshot, not a new implementation plan or authorization to deploy, migrate databases, or change historical data.

## Latest change: direct photo processing, 2026-10-13

New staff photos are checked synchronously within the backend upload request.
The separate worker, deployment service, and live photo queue are removed. The
mobile app keeps only the current temporary picture, requires explicit retry on
failure, and no longer has persistent encrypted photo storage or automatic upload
sync. Staff occupied-room/ask-manager exception actions are removed. QR authority,
required photos, quality/cleanliness checks and manager verification remain.

`docs/verification/DIRECT_PHOTO_FLOW.md` is the current flow and validation record.
It supersedes the buffered-photo, worker, encrypted-phone queue and staff exception
sections below, which describe earlier implementations. The backend has a new
additive migration; it was tested only in isolated databases. No application DB
migration, deployment, or APK build was performed for this change. The next APK
needs a fresh native build because the unused SQLite dependency/plugin was removed.

## 1. Product and intended outcome

Hygene Ops, previously called CleanOps, is a multi-tenant cleaning and facility-operations SaaS developed as a final-year project. Cleaning-company owners and managers coordinate locations, workforce attendance, shifts, cleaning schedules, assignments, and evidence review. Field staff use a mobile application.

The operational questions it aims to answer are:

- Who was assigned, and did that person attend the location?
- What cleaning work was scheduled, started, submitted, missed, or overdue?
- Were the required fixtures and surfaces photographed in the assigned room?
- Does the visible evidence support a cleanliness decision?
- Which cases need staff rework, manager review, maintenance, or an explicit exception?

The main differentiator is fixture-level, guided cleaning verification integrated into workforce operations. A room can contain several similar toilets or sinks; proving that a generic room photo looks similar is insufficient. The current design binds evidence to an area, task, assignment, fixture, required view, and capture authority.

The cleanliness rubric concerns visible dirt and assessable surfaces. It does not establish sanitation, disinfection, or absence of invisible contamination.

The product should feel professional, calm, and straightforward. Operational work takes priority; blocked actions and subscription limits should explain a concrete next step. `PRODUCT.md` preserves product/design principles, although its name still says CleanOps. Branding migration is not complete across internal package names, deployment names, and application identifiers.

## 2. Repository structure and stack

| Path | Purpose |
| --- | --- |
| `backend/` | Express API, Prisma models/migrations, business services, cron jobs, verification worker and diagnostic scripts |
| `frontend/` | Admin/manager web dashboard, public marketing, signup, billing, setup and evidence review |
| `frontend-mobile/` | Staff application, attendance camera, task start, guided verification, durable local evidence and native modules |
| `docs/` | Implementation handoffs, progress, verification reports and operational history |
| `.github/workflows/` | CI, Android testing builds, Docker image publishing and Compose deployment |
| `.agents/skills/` | Repository-local design guidance |
| `screenshots/` and root screenshot files | Existing visual artifacts |
| Root `package.json` | Legacy Heroku backend launcher; not a workspace-wide script orchestrator |

Backend: TypeScript ESM, Express 5, Prisma 7 with the PostgreSQL adapter, PostgreSQL, Zod, bcrypt, JWT, multer, Sharp, Cloudinary, node-cron, date-fns/date-fns-tz, timezone lookup, Paddle, Vitest. Dependencies include the OpenAI SDK; that alone does not establish that the current verification path uses an OpenAI-hosted model.

Web: React 19, Vite 8, TypeScript, React Router, TanStack Query, Redux Toolkit, Tailwind 4, Radix/shadcn-style primitives, React Hook Form, Recharts and Paddle JS. Feature folders commonly contain `api.ts`, `queries.ts`, `types.ts`, pages and components.

Mobile: Expo 54, React Native 0.81, TypeScript, React Navigation, TanStack Query, NativeWind/Tailwind 3, Axios, Expo camera/location/filesystem/SQLite/SecureStore, NetInfo and ONNX Runtime. Native modules include capture quality and spatial tracking, with Android Kotlin and iOS Swift implementations.

The three applications have separate dependency installations, lockfiles and scripts. Docker builds use Node 22, and CI uses Node 22. The root launcher still declares Node 20; do not infer a uniform runtime from it.

## 3. Roles, tenancy and authentication

- `Company` is the tenant root.
- `ADMIN` is the company administrator/owner. Admin and manager accounts live in `Manager`; field accounts live in `Staff`.
- `MANAGER` access is scoped through `ManagerLocation` memberships. Admin access is company-wide, not cross-company.
- `STAFF` sees its own attendance and assigned tasks, and performs staff-only task/capture mutations.
- Manager location access, active accounts, active companies, active locations and current assignments matter throughout verification authorization.

`backend/src/middlewares/auth.middleware.ts` accepts an access-token cookie or Bearer token. It reloads the actor, checks staff as well as manager activation, checks company activation, and rejects a changed role. Older notes claiming that inactive staff remain authorized are obsolete.

Access and refresh tokens have separate secrets and configured expiries. The common routes provide refresh, logout and current-user retrieval. Web uses credentialed requests and restored auth state in Redux; server data generally belongs in TanStack Query. Mobile coordinates token refresh across requests.

Native mobile session persistence uses SecureStore, with a legacy AsyncStorage recovery path. The legacy copy is removed after successful secure persistence. Web/mobile-web storage differs from the native implementation. Do not describe all current mobile tokens as AsyncStorage-only.

Passwords are hashed by Prisma query extensions in `backend/src/prisma/prisma.ts` on manager/staff create and string-password update. Preserve this behavior when changing account writes.

## 4. End-to-end operational workflow

1. A company registers, obtains an administrator account and chooses a subscription. Workspace gating distinguishes new/unpaid signup from active or existing billing situations.
2. The administrator creates locations, managers and staff. Locations include coordinates, geofence radius and timezone; staff have location and shift information.
3. An administrator/manager configures areas within a location, adds an inventory of fixtures, chooses identification guidance and required photo views, and can add optional standard photos.
4. The manager creates a daily or one-time task schedule for one area and all or a subset of its fixtures. Tasks preserve inventory and policy snapshots.
5. Staff check in with a selfie and reported GPS, then access assigned tasks.
6. In the inspected current source, starting cleaning requires scanning the assigned area's current QR. The start transaction validates assignment, inventory setup, area QR and the start window, then records task/assignment start atomically.
7. After cleaning, staff enter the guided photo workflow, scan/renew room capture authority, take required context and fixture photos, save evidence durably, upload, and wait for checks as required by the sequential workflow.
8. Staff submit after all required evidence has been received and checked. A submission may still require manager verification.
9. Managers handle evidence exceptions and audited decisions. Fully qualified evidence or appropriate explicit decisions determine the final verification outcome.

Important correction to historical reports: some previous device-fix notes describe QR-free task start. `taskInstance.controller.ts` and `StartTaskScreen.tsx` now implement area-QR start. Current source takes precedence.

## 5. Attendance, scheduling and assignment

Attendance supports geofenced selfie check-in/out, shifts, late status, absence and missed checkout. Server distance calculations use haversine distance against the configured location radius; receiving GPS coordinates is a plausibility check, not independent proof against spoofing.

Attendance states include `ABSENT`, `CHECKED_IN`, `CHECKED_OUT`, `LATE` and `MISSED_CHECKOUT`. Current attendance helpers express a 30-minute early check-in window, 15-minute late grace and 30-minute minimum before checkout. These differ from task-start/reassignment rules.

Schedules are `TaskTemplate` records with `DAILY` or `ONCE` recurrence, effective date, optional recurrence end, shift window and optional designated staff. `TaskInstance` is the occurrence; uniqueness on template/date supports idempotent generation.

Snapshot generation is implemented for current inventory tasks. Existing fix reports record immediate creation of today's task/initial assignment within schedule creation, avoiding the gap between a saved schedule and a later cron-generated snapshot. Future occurrences remain scheduler work. Inspect `inventorySnapshot.service.ts`, schedule creation and cron generators when changing this contract.

Assignment logic considers location, staff activation, shift coverage (including overnight shifts), attendance eligibility and workload. Manual assignment and plan-gated automatic assignment/reassignment coexist. `TaskAssignment` retains assignment history and the current assignment; assignment epochs help invalidate stale capture authority.

Current source uses a five-minute early task-start window and five-minute late-start threshold. Reassignment has its own environment-configurable grace; these should not be treated as the same policy.

Cron responsibilities:

| Module | Responsibility / current schedule |
| --- | --- |
| `dailyTaskScheduler.ts` | Daily occurrences; polls every 90 seconds |
| `onceTaskScheduler.ts` | One-time occurrences; cron `3-59/15 * * * *` |
| `taskStatusCron.ts` | Missed/overdue task status; cron `7-59/15 * * * *` |
| `taskReassignmentCron.ts` | Reassignment checks every minute |
| `attendanceCron.ts` | Attendance creation/window synchronization; cron `2 */6 * * *` |
| `attendanceStatusCron.ts` | Missed checkout checks; cron `5-59/10 * * * *` |
| `deletedMediaCron.ts` | Queued media cleanup every minute |
| `startupCron.ts` | Startup catch-up |

Cron modules are imported by the API. The verification worker is a separate process; API availability alone does not mean photo checks are running. Multiple backend versions sharing a database can generate incompatible tasks; older reports document this problem in development.

## 6. Areas, fixtures and immutable task requirements

The current verification model is inventory-based, version 2. Legacy reference-image models remain for retained historical data; their presence does not mean their old upload flow is active.

Areas have draft/active/archived lifecycle, inventory version, rotating QR version/nonce and layout instructions. Fixtures have stable codes, display names, type, sequence, identification mode, position hints, required views and versioned rubric. Identification modes include printed label, existing number and ordered context.

Presets in `inventoryPresets.ts`:

| Fixture | Default views |
| --- | --- |
| Toilet | Bowl/seat; exterior/base |
| Sink | Basin/drain/tap |
| Mirror | Reflective surface |
| Bin | Opening/interior; exterior/surrounding floor |
| Floor zone | Whole configured zone |

Stable numbering does not reuse retired fixture codes. Fixtures can be active, under maintenance or retired. Schedules select `ALL` or `SUBSET`, and mandatory/optional items and views affect completion.

Task snapshots preserve names, types, identity guidance, ordering, required instructions, rubric and policy. Editing the room inventory later must not silently rewrite evidence obligations for an already-generated task.

Standard photos are optional guidance, not task evidence and not a cleanliness-similarity baseline. They are screened for privacy before unrestricted review display. Failed screening leaves them restricted; retries are bounded.

## 7. Capture, evidence and verification pipeline

Key implementation directory: `backend/src/services/verification-v2/`.

Capture sessions bind staff, task, area, current assignment epoch, QR version, reported presence, capture window and upload deadline. Signed slots/attempt reservations, byte hashes, replay checks and retake generations bind a photograph to its authorized requirement. Late or stale uploads can be retained for review without receiving automatic credit.

Current room-context policy requires `ENTRANCE` for newly configured sessions. Missing/malformed legacy context policy conservatively requires `ENTRANCE` and `LAYOUT`; renewal must preserve prior obligations.

The sequential workflow is `SEQUENTIAL_CLEF_V1`. Photo slots are activated in sequence, and previous required checks must resolve before advancement. A default per-object capture budget is 90 seconds, bounded by session authority. Session defaults include 20 capture minutes, 30 rework minutes and 15 upload minutes; task snapshots can carry validated policy values.

The worker pipeline has separate recorded stages:

1. **Quality:** server image inspection, orientation/metadata handling and quality/hash information. Unusable photos can require recapture.
2. **Privacy:** identify unsafe/uncertain occupant or reflection content and restrict media where necessary.
3. **Coverage and originality:** expected fixture/view and identity consistency, context, duplicate evidence and screen/photo recapture indications.
4. **Cleanliness:** assess exactly the required visible surfaces and aggregate to `CLEAN`, `DIRTY` or `CANNOT_ASSESS`.
5. **Publication/completion:** publish results under a valid job lease, reject stale generations/assignments, update requirements and cases, and attempt finalization.

For sequential capture, a joint photo-provider call can produce privacy, coverage, originality and cleanliness assessments. Later recorded stages reuse its cached assessment rather than making an independent full model call each time. Other retained pipeline paths use separate adapters. Follow actual provider and evaluator version metadata.

Current adapters use Cloudflare Clef configuration; model choices include `clef` and `clef-flash`. Model/service errors, malformed output, missing calibration and uncertain evidence are distinct from proving that a fixture is dirty. Avoid converting provider failure into a cleanliness verdict.

`CANNOT_ASSESS` represents insufficient visibility or interpretation. `DIRTY` represents visible removable dirt. Required surface aggregation prioritizes unassessable surfaces, then dirty surfaces, then clean. Wear or permanent discoloration should not automatically count as removable dirt.

Automatic cleanliness passing requires a reviewed, digest-pinned release record matched to the actual evaluator configuration, thresholds, fixture type and rubric. Missing, invalid, expired or changed release configuration blocks automatic approval. A model response or threshold environment variable alone is insufficient. This analysis did not inspect secret environment values or establish that a deployed release is qualified.

Spatial evidence supports fixture-identity evaluation through native tracking and session continuity. The policy supports `OFF`, `EVALUATE` and `ASSISTED_RECAPTURE`; automatic spatial acceptance is not enabled by the inspected release configuration. Device support and physical accuracy require validation.

## 8. Staff submission versus verified completion

These are separate milestones and must remain separate in UI and backend logic.

`finishStaffSubmission()` requires mandatory evidence, received media, checked attempts and no pending/running/retry-wait jobs for those attempts. Checked states can include manager-review, privacy-hold or service-failure outcomes; these do not imply automatic approval. Unresolved evidence is routed into review issues. Submission closes active capture sessions and records `staffSubmittedAt` with an audit event.

Staff presentation maps submitted work to completed and hides internal final verification outcome. Operational manager presentation can also count submitted cleaning as completed while showing verification separately. Therefore a presented `COMPLETED` label is not by itself proof of `VERIFIED_COMPLETE`.

Finalization checks current staff/assignment/location, mandatory requirements, presence/context, blocking issues and outstanding processing. Successful final outcomes include:

- `VERIFIED_COMPLETE`: qualified required evidence and completion gates satisfied.
- `COMPLETED_WITH_EXCEPTIONS`: audited acceptance/waiver/override contributed to completion.
- `LEGACY_RECORDED`: retained historical outcome.

Task verification states include not started, capturing, processing, rework required, needs review, verified and resolved with exceptions. Requirement states distinguish missing, processing, passed, recapture, cleaning, review, manager acceptance and waiver.

## 9. Exceptions, protected media and retention

Managers have an exception inbox, detail/action page and verification history. Cases and issues track reason codes, priority, workflow, decisions, events and read receipts. Actions include accepting/rejecting evidence, accepting context, requesting another photo/cleaning, marking maintenance, waiving a requirement, extending a window and resolving a satisfied issue.

Accepting evidence requires appropriate authorization and privacy clearance. Viewing a restricted photo does not authorize accepting it. Maintenance does not implicitly waive required evidence. A waiver/acceptance is audited and affects the final outcome. Already-completed cases have follow-up restrictions rather than unrestricted rewriting of completion history.

Evidence uses authenticated Cloudinary storage with originals and sanitized/review variants. Content is served through an authorized API rather than trusting a publicly shared URL. Original access is more restricted than review access. The response uses private/no-store caching and nosniff headers. Current uncommitted work includes evidence-content security and restricted-action checks.

Deletion and archive are different operations. Existing permanent-deletion services and deferred media cleanup coexist with verification retention. Entities linked to retained evidence/decisions can reject deletion and provide an archive/deactivation route. Deactivation can revoke active sessions while preserving history. Do not bypass retention to make a delete operation succeed.

## 10. Mobile reliability and native boundaries

The October 11 redesign prioritizes My day, Tasks and Help & account. English/Urdu preference persists independently of credentials; the native navigation, shared text and key layouts support explicit RTL. Built-in photo instructions have Urdu vocabulary and optional Expo Speech listening using an installed matching voice. Arbitrary snapshotted/custom instructions remain unchanged. Required photos, accurate local/upload/checking states and occupied-room reporting are visible. Ready evidence requires a staff tap on Submit work instead of automatic submission during polling. It still uses the existing authoritative finish endpoint and encrypted evidence queue. Native changes need rebuilding and physical-device testing.

Main screens: Login, Shift/Home, Tasks, StartTask and Verification. Navigation uses actual bottom tabs and an authenticated native stack. Spatial diagnostics are development-only.

Native verification evidence is saved to an account/company-scoped encrypted SQLite queue using SQLCipher, with secure key storage, durable identities and upload state. Queue capacity/storage checks, serialized access, retries, lost-response reconciliation, interruption recovery and account switching are covered by tests. Logout must not silently discard unsent evidence.

An important recorded fix replaces an unkeyed exclusive-transaction connection with transactions on the already-keyed serialized queue connection. Missing keys/storage failures should not trigger destructive recreation of saved evidence.

Synchronization checks network and app foreground state, preserves exact capture identities and distinguishes authentication problems from network/provider failures. This is not a guarantee of continuous background upload. Creating new server-authorized capture authority requires connectivity; local persistence does not waive expiration or sequencing rules.

Occupied-room reporting pauses camera activity. Durable prior photos survive interruption, while an interrupted uncertain capture may require retaking. Camera capture, native quality and spatial behavior require real devices; a web export or mocked test cannot certify them.

The repository bundles a quantized CLIP vision model and fixture-category tooling. However, the inspected current `VerificationScreen.tsx` does not call the local category inspector; its capture log records `SERVER_CLEF`. Treat bundled/local-category code and older guidance as available implementation/history, not proof that the active screen runs category inference before each upload.

Current source app configuration: Hygene Ops Staff, version `2.1.2`, Android version code `5`, package/bundle identifier `com.hygeneops.staff`. Native verification minimum defaults to `2.0.0` and is configurable. Source version does not identify what APK a phone has installed. Native modules, SQLCipher and bundled model changes require a compatible native build; Expo Go/web are not equivalent.

## 11. Web functionality

The October 11 operations redesign uses one Today navigation entry with `DailyOverview.tsx`; `/dashboard` and `/today-status` both remain supported. It prioritizes attendance, unfinished overdue work, actual unassigned work and open manager reviews. Owners get location summaries and a deferred, defined seven-day submission comparison using existing date-range stats. Shared DataTable renders mobile summaries with expandable detail. `DESIGN.md` and `docs/UX_REDESIGN.md` document the design and validation boundaries.

Public pages include landing, features, pricing, signup and login. Admin onboarding includes welcome/plan selection and a workspace gate. Authenticated functionality includes:

- Today: attendance, tasks and operational status.
- Locations, location details, room inventory setup and room details.
- Guided schedule creation, task templates and weekly schedule views.
- Staff list/detail, attendance and manager administration.
- Subscription usage, billing/customer portal and enterprise inquiries.
- Exception inbox/detail, protected evidence and verification history.

Routes and role gates live in `frontend/src/main.tsx` and `App.tsx`. Shared components include layout, tables, forms, status displays and loading/empty states. Performance/chart components and marketing visuals coexist with operational UI; avoid applying marketing patterns to every workspace action.

## 12. Subscription and billing

Paddle integrations include pricing context, checkout-facing UI, customer portal, signed webhook handling, fulfillment and stored customers/subscriptions/transactions/events. Webhooks are mounted with a raw request body before JSON parsing so signature validation sees the original bytes.

Current backend plan definitions:

| Code / displayed name | Locations | Staff | Managers including admin | Manager access | Auto assignment/reassignment |
| --- | ---: | ---: | ---: | --- | --- |
| `STARTER` / Starter | 1 | 3 | 1 | No | No |
| `PRO` / Pro | 5 | 25 | 3 | Yes | Yes |
| `ADVANCED` / Enterprise | 20 | 200 | 20 | Yes | Yes |

Inventory verification is included in all three plan definitions. Active subscription/paid-access checks still apply. Usage counts active records. Enterprise inquiries are supported; the internal `ADVANCED` code and Enterprise display name must not be confused with an additional fourth plan. Consult `subscription.service.ts` and `paddleFulfillment.service.ts` before changing allowances or payment state.

## 13. Data model map

Canonical schema: `backend/prisma/schema.prisma`. Migration SQL also supplies constraints/triggers not fully represented by Prisma model declarations.

| Models | Responsibility |
| --- | --- |
| Company, Manager, Staff, Location, ManagerLocation | Tenancy, actors and access/location relationships |
| Attendance | Shift attendance and check-in/out |
| TaskTemplate, TaskInstance, TaskAssignment | Schedules, occurrences and assignment history |
| Area, AreaItem, AreaStandardPhoto, TaskTemplateItem | Room configuration, inventory, guidance and selections |
| TaskVerificationItem, TaskEvidenceRequirement | Immutable occurrence requirements and current evidence decisions |
| CaptureSession, CaptureSlot, VerificationRequest | Capture authority, ordered/versioned photo slots and request identity |
| EvidenceAsset, VerificationAttempt | Protected media and capture/assessment records |
| VerificationJob, VerificationWorkerHeartbeat | Durable processing, leases/retries and worker readiness |
| VerificationException, VerificationIssue, VerificationDecision | Review cases, individual issues and audited resolution |
| ExceptionEvent, ExceptionReadReceipt, AuditLog | History, unread state and broader operations audit |
| PaddleCustomer, PaddleSubscription, PaddleTransaction, PaddleWebhookEvent | Billing identity, subscription and fulfillment history |
| EnterpriseInquiry, DeletedMedia | Sales requests and deferred media cleanup |
| TaskCompletionAttempt, TaskAreaSubmission, reference-image models | Retained legacy verification data |

Row versions, assignment epochs, slot generations, scoped foreign keys, uniqueness rules, locks and job leases are correctness mechanisms, not interchangeable timestamps. Preserve them when optimizing queries or changing workflows.

## 14. API map

All paths below are under `/api`; inspect route files for exact methods, validation and role guards.

| Route family | Purpose |
| --- | --- |
| `/manager`, `/staff`, `/common` | Signup/login, account management, profile/session operations |
| `/location`, `/area` | Location and room CRUD, inventory, area QR rotation, fixture labels and standards |
| `/task-template`, `/assignment`, `/task-instance` | Schedule CRUD, assignment, task feeds, QR start and staff submission |
| `/attendance` | Shift assignment, check-in/out and attendance reads |
| `/subscription`, `/webhooks/paddle` | Pricing/usage, enterprise inquiry, portal and fulfillment |
| `/verification-capabilities` | Client/native/schema capability information |
| `/task-instance/:taskId/verification` | Requirement manifest and current state |
| `/task-instance/:taskId/verification/history` | Protected verification history |
| `/task-instance/:taskId/capture-sessions` | Capture-session issuance; `/rework` for targeted rework |
| `/capture-session/:id/...` | Activate photo, resume/renew, retake slots, reserve manifest and upload photo |
| `/verification-attempt/:id` | Attempt result polling |
| `/verification-exceptions/...` | Case listing/detail, actions and read receipt |
| `/evidence/:assetId/content` | Authorized original/review bytes |
| `/evidence/worker-health` | Admin worker/queue readiness |

Old per-reference-area scan/upload routes are retained as retired endpoints returning `410`; they are not an alternative current upload path. `POST /task-instance/:taskId/complete` now calls staff submission rather than the historical generic proof-photo/Gemini completion flow.

Verification routers are mounted at `/api` but authenticate only their matching route families, avoiding repeated authentication/database work on unrelated requests. Preserve nested-path boundaries when changing these regular expressions.

Response formats include the older `ApiResponse` envelope and newer `{success,data}` DTOs. Central API errors include message, errors, code and details. Do not assume every endpoint uses the same exact envelope.

## 15. Timezones, deployment and configuration

Locations store an IANA timezone, with backend timezone lookup from coordinates. Stored timestamps are instants; day/shift interpretation belongs to the location timezone. Zoned helpers and overnight/DST behavior matter when modifying scheduling or attendance.

Mobile formatting accepts a supplied timezone, but `src/utils/attendance.ts` still contains Karachi-offset/day helpers. The former blanket claim that all mobile formatting is hardcoded is obsolete; the remaining attendance day-selection inconsistency still needs attention.

Deployment paths coexist:

- `docker-compose.yml`: default Docker Hub app images, external database configuration, backend/frontend and separate verification worker.
- `docker-compose.deploy.yml`: PostgreSQL 16 service, backend bound to localhost, frontend, optional mobile-web profile and separate worker. Backend/worker share release-record mounts and environment configuration.
- GitHub workflows: CI checks each app and isolated PostgreSQL integrations; image publishing targets GHCR; Compose deployment is manually dispatched; Android testing-build workflow packages/inspects artifacts.
- `backend/ops/`: an untracked development worker service definition was present when inspected. It is not proof that a service is currently installed/running.

The backend Docker command applies Prisma migrations before starting the API. Starting this container against a database is therefore mutation-bearing. The current migration chain includes billing, deletion/retention, enterprise inquiry, inventory foundation, verification lifecycle, spatial observations and sequential capture; it is no longer just one baseline migration.

Prior development reports record Supabase transaction-pool/session-pool differences and an unreachable IPv6 direct endpoint. Those are historical environment observations, not a guarantee about today's connectivity. Read the reports and inspect the intended database before executing migration commands.

Custom SQL protections must be preserved. A generic Prisma schema diff can propose removing constraints/indexes/triggers absent from model declarations; it is not automatically safe to apply.

Important configuration families: database URL; frontend allowed origins; access/refresh secrets and cookie settings; Cloudinary credentials; QR/slot signing secrets; native-version compatibility; reassignment policy; Cloudflare/Clef provider settings; calibration threshold/version; release record path and SHA-256; mobile/web API base URLs. Keep secrets out of documentation and logs.

Mobile API configuration is normalized to end with `/api`. The fallback `10.0.2.2` is an Android-emulator convention, not the physical phone's server address. Historical LAN addresses and APK paths are not current environment guarantees.

Backend development runs compiled `dist/app.js` with TypeScript watch and nodemon. Stale compiled output or another old backend sharing the database can explain behavior that differs from edited source. Shared Prisma transaction defaults are a bounded 10-second acquisition wait and 30-second transaction timeout, added for remote-database latency.

## 16. Commands and validation boundaries

Run package-local commands, or use `npm --prefix <directory> ...` from the root:

```bash
npm --prefix backend test
npm --prefix backend run build
npm --prefix backend run dev
npm --prefix backend run worker:verification
npm --prefix backend run worker:verification:check
npm --prefix frontend test
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend run dev
npm --prefix frontend-mobile test
npm --prefix frontend-mobile run typecheck
npm --prefix frontend-mobile run validate:device-config
npm --prefix frontend-mobile run start
```

Worker startup and API startup interact with the configured environment. Do not run them merely to obtain a static understanding of the repo. Likewise, Android/iOS build commands may prebuild native directories.

Additional backend scripts cover readiness doctor, migration report/backfill, provider benchmark, lifecycle/main/worker PostgreSQL integration, trace/latency, spatial evaluation, cleanliness calibration, held-out evaluation and release records. Read each script before running it. Database integration requires an explicitly isolated test target; seed/backfill/migration scripts are not interchangeable read-only diagnostics.

Checks actually run during the October 11 analysis:

| Check | Result |
| --- | --- |
| Backend `npm test` | 411 passed across 46 files |
| Mobile `npm test` | 73 passed after redesign |
| Web `npm test` | 36 passed after redesign |
| Backend TypeScript `tsc --noEmit -p tsconfig.json` | Passed |
| Web TypeScript `tsc -b --pretty false` | Passed |
| Mobile `npm run typecheck` | Passed |

The initial analysis found one web fixture mismatch: the older safe-evidence fixture lacked `privacyState: 'SAFE'`. The redesign corrects that fixture and preserves the privacy restriction. Web tests now include web/native Urdu vocabulary parity; mobile tests check delivery guidance and explicit submission.

The redesign subsequently ran web build/lint/tests, mobile TypeScript/tests, and Chrome interaction checks at desktop/phone widths with Urdu, 200% text, owner comparison, denied/error/empty/loading/offline states. Mobile web export is recorded separately in `docs/UX_REDESIGN.md`. These use fabricated browser API responses, not live operational integration. PostgreSQL integrations, migrations, deployed worker/provider/Cloudinary checks, APK/iOS builds and physical-phone tests were not performed.

## 17. Current working tree and known limits

The workspace was already dirty before analysis. Existing edits span backend location/manager/staff/task controllers, verification routers and services, task assignment, mobile attendance/verification/location, and web exception/status/evidence presentation. Untracked entries include a worker service definition, task-assignment/evidence security tests, AttendanceCamera and mobile/web tests. These were preserved, not committed or reverted.

Known or unresolved points supported by this inspection:

- Deeper configuration pages still have English copy and legacy styling; built-in primary flows have Urdu but arbitrary custom instructions do not.
- Optional listening depends on matching installed voices and requires native rebuilding; actual camera/Urdu/text-enlargement behavior needs physical-device validation.
- Remaining mobile attendance Karachi-day assumptions.
- Daily scheduling still polls every 90 seconds; multiple API writers/version skew need operational care.
- Root runtime/package naming and CleanOps/Hygene Ops naming are inconsistent.
- Source configuration still permits cleartext mobile traffic for development; deployed transport behavior was not audited.
- An attendance check-in debug middleware remains in source.
- Automatic approval requires calibration/release qualification, not merely implemented provider code.
- Spatial/quality/native encryption/camera claims require physical-device evidence.
- Protected Cloudinary access, live provider behavior, accuracy, latency, cost and fleet load were not established by this analysis.
- Historical migration/cutover, real-data mapping and device reports must be read with their dates and follow-ups; no production-readiness certification is implied.

This was a project-understanding pass, not an exhaustive security or performance audit. Old issue lists were not copied wholesale because many describe code that has been replaced or fixed.

## 18. Where to start future work

Read this context, inspect current Git status, then open the specific source files for the requested task. Relevant entry points:

- Product: `PRODUCT.md`.
- Schema: `backend/prisma/schema.prisma` and migration SQL.
- API/router composition: `backend/src/app.ts`.
- Task start/submission: `backend/src/controllers/taskInstance.controller.ts`, `staffSubmission.service.ts`, `sequentialPolicy.ts`.
- Capture/authorization: `captureSession.service.ts`, `sequentialCapture.service.ts`, `authorization.service.ts`, `qr.service.ts`.
- Processing/completion: `pipeline.service.ts`, `jobQueue.service.ts`, `completion.service.ts`, `verificationPolicy.service.ts`.
- Provider/release: `clefPhoto.provider.ts`, `clef.provider.ts`, `clefConfiguration.ts`, `cleanlinessRelease.ts`.
- Review/privacy/retention: `exception.service.ts`, `evidence.service.ts`, `standardPrivacy.service.ts`, `retention.service.ts`.
- Web routes: `frontend/src/main.tsx`; exception and verification feature folders.
- Mobile: `StartTaskScreen.tsx`, `VerificationScreen.tsx`, verification queue/sync modules and auth/session storage.
- Billing: `subscription.service.ts`, `paddleFulfillment.service.ts` and webhook controller.

Preserve current user changes, historical evidence, tenant boundaries, task snapshots, byte identities, privacy checks, deadlines, transactional correctness and the distinction between submission and verification. Make requested changes concrete and test the affected contract; do not infer permission for deployment or data repair from this document.

## 19. Documentation retained and replacement scope

Only `PROJECT_CONTEXT.txt` is removed by this consolidation. It was the old standalone context file and contains materially obsolete active-workflow descriptions.

Keep the following because they have separate purposes:

- `docs/PRODUCT_IMPROVEMENT_HANDOFF.md`, progress and remaining-phase files: scoped planning/implementation history, not the universal current context.
- `docs/verification/*`: evidence, operational follow-ups and dated validation boundaries. Some early assertions are superseded by later source or follow-ups.
- `FYP_ML_DISCUSSION.md`: research/product reasoning history.
- `kimi-*` files and `frontend-mobile-errors-and-fixes.md`: historical implementation notes, not authoritative descriptions of today's code.
- `PRODUCT.md`: product/design intent.

For current behavior, use source plus this dated context. For why a decision was made or what an earlier session validated, use the specific historical report without assuming it is current.


### Current photo review page

`ExceptionDetailPage.tsx` presents the issue and useful next step before any decision form. Missing photos link to task photos; expired work links to the room schedule. Manager decisions require explicit action selection and retain audited reasons/notes, version checks, request IDs, authorization and completed follow-up proof. Exceptional options and historical records are expandable. English/Urdu, optional supported speech, persistent success, offline notices and conservative privacy display are implemented. Only one Today entry appears in the sidebar, with both previous daily routes preserved.

### Manager web implementation, 2026-10-12

The manager plan has been implemented in the current working tree. `/dashboard` is now Overview, `/today-status` is a distinct paginated daily records page, `/exceptions` is a paginated reason-first Reviews queue, and `/exceptions/:id` is an evidence/decision workspace containing the complete requirement inventory. The old `DailyOverview` source is preserved but these routes no longer use it.

New authenticated read APIs: `/api/manager/operations/{overview,staff,tasks}`. All aggregates and lists share location/timezone-aware cohort helpers, including labelled overnight overlap and actual unassigned occurrences. Review listing supports queue/period/date/search/page filters while retaining the old cursor mode. Review details return snapshotted items, protected attempt descriptors, safe example guidance and precise issue actions. Next-case and eligible completed-follow-up lookups are authorized. Existing decision POSTs still own audits, idempotency, locking, privacy and completion policy; resolution satisfaction is now a shared read/write helper.

Validation and screenshots: `docs/MANAGER_WEB_IMPLEMENTATION_RESULTS.md`. No application-database migrations or data repair were performed. API/web were started locally at the user's request; web uses the default port 5173, and 5179 was stopped. Existing verification worker heartbeat was healthy. Browser tests use stateful fabricated responses, while PostgreSQL integration uses newly created isolated databases on 127.0.0.1:54329.

### Deferred Cloudinary storage, 2026-10-12

At the user's explicit request, new staff photo uploads now use encrypted temporary server storage and one `PHOTO` job assessing cleanliness/screen recapture only. Fixture-identity and privacy AI checks are removed for new captures. Dirty/retake photos never reach Cloudinary; clean/review results are stored before final publication. Assessment persistence allows storage retries without another AI call. Phone bytes survive temporary receipt and service failure. Existing authorization/QR/timing rules, immutable requirements, audited decisions, calibrated automatic acceptance and historical held-evidence restrictions remain. See `docs/verification/BUFFERED_PHOTO_FLOW.md` for runtime shared-volume/key requirements, tests and latency limits. No real-phone post-change latency has been measured.

### Photo workflow live HTTP validation, 2026-10-12

Real AI/Cloudinary end-to-end tests now pass with synthetic JPEGs and an isolated local database. Dirty results took about 3 seconds and were not stored in Cloudinary; reviewable results took about 4.5–6.6 seconds and completed after audited acceptance. Fixed context-origin issue resolution, accepted preserved-context reuse after cleaning rework, and staff context reason feedback. Explicit negative coverage proves old context acceptance cannot bypass a renewed session's presence. See `docs/verification/PHOTO_FLOW_E2E_RESULTS.md`; physical-phone and remote application-database latency remain unmeasured.

### Staff app reference-based UI update, 2026-10-12

Mobile Home, task cards, task start and guided photo capture now use the user's off-white/teal/sage visual references. New shared StaffBrand and PhotoCaptureControls provide discoverable language selection, corner framing, photo progress and a labeled large shutter. Shift details use disclosure. 75 mobile tests, typecheck and web export passed; browser checks cover English/Urdu at 320/390 widths and simulated enlarged home text. See `docs/MOBILE_REFERENCE_UI_RESULTS.md`. User explicitly cancelled the APK build; no APK was produced. Native camera/device validation remains.

### Smaller staff APK, 2026-10-12

Version 2.1.4 / code 7 removes dead CLIP/ONNX model, runtime, classifier/tensor exports, prep scripts and bundling configuration. Required local brightness/blur checks and boot clock remain. Shared NDK hook remains for native-library alignment. Fresh native APK is about 65 MiB, versus 175 MiB for 2.1.3; local model/runtime absence, required modules, signature match and alignment are verified. 70 remaining mobile tests/typecheck passed; five deleted tests were classifier-only. Latest file is `frontend-mobile/build-output/HygeneOps-staff-2.1.4-small.apk`. See `docs/verification/MOBILE_LOCAL_AI_REMOVAL.md`. API remains Wi-Fi address 192.168.100.198:8080; user-requested backend restart succeeded.

### Camera/keyboard and entrance removal, 2026-10-12

Mobile camera previews now use explicit bounded height; login uses keyboard-aware scroll space; missing photos with no usable slot offer QR renewal. New sessions require only configured item photos (context policy v2 empty). Authorized resume/renewal retires old sequential context obligations with an audit while retaining evidence/GPS and independent serious issues. Unit/mobile/type and isolated no-entrance HTTP plus legacy lifecycle checks passed. See `docs/verification/MOBILE_CAMERA_KEYBOARD_FIX.md`. User explicitly asked not to build an APK; these mobile changes are not in the existing 2.1.4 APK.

### Second QR entry and photo-session timer validation

All mobile navigation into task photos now explicitly requires a fresh QR scan before camera/step activation/capture, even when a prior session is still valid. An authorized second scan renews photo authority and preserves evidence. 73 mobile and 77 relevant backend tests passed, including fixed per-item deadlines, shared view budget, service-wait exclusion, overall deadline clamping and expiry requiring QR renewal. Default per-item budget is 90 seconds; default session window is 20 minutes bounded by task policy. No APK was built.

### Latest requested mobile APK

The user later authorized APK packaging. `frontend-mobile/build-output/HygeneOps-staff-2.1.4-photo-fixes.apk` now contains camera-height/login-keyboard fixes, fresh second-QR entry guard and task-only-photo recovery. Expo/Hermes compilation and 73 mobile tests/typecheck passed. The verified 2.1.4/code 7 native binary was reused with unchanged modules/assets/dependencies; only the JavaScript payload changed before alignment/signing. Actual package/model absence, matching certificate and alignment checks passed. Install over the existing APK without clearing app data. Native physical-device checks remain.

### Overdue staff-card label correction

Read-only inspection of task 8575409 (`shuumer`) confirmed backend status NOT_COMPLETED_INTIME, due 20:00 Asia/Karachi, unsubmitted, NEEDS_REVIEW; its configured verification deadline was 20:30. TaskCard previously fell through to In progress for this enum. Shared taskCardStatus now labels NOT_COMPLETED_INTIME as Overdue before processing/rework labels, with Urdu translation. 74 mobile tests and typecheck passed. No task data was modified and no APK was rebuilt for this follow-up; installed photo-fixes APK still contains the old label.

### Staff APK 2.1.5, 2026-10-13

The user subsequently authorized an APK build. A fresh native 2.1.5/code 8 APK is
ready at `frontend-mobile/build-output/HygeneOps-staff-2.1.5-direct-uploads.apk`
(53.71 MiB). It includes direct uploads/manual retries and the shutter fix; SQLite
and local AI model/runtime are absent. Package, signature match and alignment
checks passed. No application DB migration/backend deployment was performed.
See `docs/verification/DIRECT_PHOTO_APK_2_1_5.md`.
