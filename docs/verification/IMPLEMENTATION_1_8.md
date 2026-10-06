# Inventory verification foundations, steps 1–8

Starting tree was dirty: existing Prisma schema/migration, verification-v2 helpers,
backend dependencies, auth/audit changes and frontend/mobile draft files. User
explicitly authorized takeover. Preserve UI drafts; capture and exception UIs
are outside this implementation.

Baseline: 93 backend tests and backend build passed; 15 frontend tests, frontend
lint and mobile TypeScript passed. Initial frontend TypeScript failed because a
pre-existing area draft imported missing MigrationMappingPanel. The configured
database is remote; migrate status is read-only. No production migration/reset
is authorized. Migration tests use an isolated local PostgreSQL instance only.

Historical templates/instances remain v1 until explicit mapping/cutover. New
inventory templates opt into v2. Scheduling must preserve v1 drain behavior at
this foundation phase; universal cutover is step 21.

## Checklist comparison

| Step | Implemented | Remaining within the step |
| --- | --- | --- |
| 1. Baseline/contracts | Working-tree audit; workflow-v2 Zod DTOs/state enums/reasons; bounded pure defaults; schedule/DST/overnight, assignment and legacy-completion characterization. Source-only test discovery fixes duplicate execution of compiled tests. | Configured remote migration status could not be obtained: read-only Prisma status did not finish. Run the read-only report against the deployment database before rollout. |
| 2. Schema/migrations | All specified entity tables and existing fields; same-area composite keys; slot/attempt/session/assignment and tenant bindings; partial live-session uniqueness; historical LEGACY_RECORDED backfill; immutable snapshot/evidence/decision guards; additive report/backfill CLI. New migrations are transaction-wrapped. | Production application and a customer backup dry run are deployment gates, not performed here. Isolated migration tests restore the baseline schema from repository migrations and seed historical fixtures; they do not copy customer data. |
| 3. Authorization | STAFF mutation gates, active account/company checks, current database role validation, current manager location membership, common area/task/assignment helpers and ADMIN auditing. Legacy evidence handlers reject v2 before upload parsing. | None in this foundation step. Assignment lifecycle revocation/race handling beyond archive/QR rotation is step 11. |
| 4. Policy/reducers | Independent presence/coverage/cleanliness decisions, mandatory-view aggregation, completion eligibility, explicit context override semantics, deadlines, anchored timing/boot checks, retry/escalation and session/attempt/requirement/task/issue reducers. | None. Network evaluator adapters and transactional completion are later steps. |
| 5. Protected evidence/jobs | Authenticated originals and stripped review derivatives; scoped no-store content route; privacy gating; byte/pixel/format validation; deterministic upload recovery; received+first-job atomicity; unique versioned jobs; leases, guarded publication, bounded retries, fairness and global/per-tenant concurrency limits; worker heartbeat/readiness, process command, Compose and environment examples. | A live authenticated-delivery/access probe in an explicitly designated nonproduction Cloudinary account is still required. Storage contract/recovery tests mock Cloudinary; no customer media was uploaded. The worker only executes quality checks and never releases unscreened media or auto-passes a task. Privacy/coverage/cleanliness execution awaits steps 12–13. |
| 6. Deletion retention | Scoped deletion guards before media enqueue; verification namespace and reused-asset cleanup protection; archive/deactivate endpoints; session revocation on staff/location archive; frontend deletion offers archive when retained history blocks deletion. | None. No remote evidence cleanup or retention timer was added. |
| 7. Area/inventory | Scoped routes/services/validation; count expansion; stable identities; retired codes never reused; atomic versioned edits; same-area rejection; template impact and review flags; archive; signed QR rotation and fixture labels; optional protected standard-photo upload/list. | Optional standards stay privacy-pending until the later privacy evaluator/review workflow is available. Manager area setup UI is step 9. |
| 8. Immutable snapshots | Shared transactional generation in daily/once/startup; area/template locks; authoritative template fields; frozen item/view/rubric/identity/policy/deadline snapshots; atomic initial assignments and legacy reference copying; JSON v2 template creation/edit/configuration with capacity, recurrence and tenant/location checks; nonempty mandatory selections; future ALL expansion; blocked retirement/setup generation surfaces a durable setup case. Legacy schedules continue until explicit later cutover. | None in this step. v2 start/deadline/assignment lifecycle behavior is step 11; public capture/ingestion/resume endpoints are step 10. |

## Final validation

- Backend: 100 source unit/characterization tests passed; Prisma generation and TypeScript build passed.
- Frontend: 15 tests, lint, TypeScript and Vite production build passed.
- Existing mobile project: TypeScript passed. No mobile capture UI was implemented.
- Real isolated PostgreSQL: all ten repository migrations applied via Prisma; restored-baseline historical backfill and constraints passed. Integration covered lease expiry, stale workers, concurrent tenant claims, exactly-once result publication, storage acknowledgement loss/idempotency, privacy/role delivery gates, retained-evidence deletion rejection, archive preservation, inventory version conflicts, all three schedulers, concurrent generation, immutable snapshots, subset membership, future ALL expansion, assignment state characterization and retirement review.
- Report/backfill commands ran in read-only/dry-run mode against isolated PostgreSQL.
- Worker process started against an empty isolated database and reported a healthy heartbeat/readiness; shutdown was graceful. Compose configuration and git diff whitespace checks passed.

Expected constraint failures appear as Prisma error logs in the integration suite. The PostgreSQL adapter emitted a pg concurrency deprecation warning; assertions passed. Frontend build retains its existing large-chunk warning.

The existing frontend/mobile drafts were preserved. Minimal frontend repairs removed an import of a nonexistent mapping component, prevented stale protected-image state, and restored legacy reference-form validation compatibility. The manager exception and native capture UIs were not added or connected.

No production migration, data reset, workflow cutover, provider evaluation, automatic evidence deletion or live Cloudinary upload occurred. Steps 9–21 remain outside this request, including full capture sessions, evaluated AI, guarded task finalization, manager decisions, UI, rollout and release/device checks.
