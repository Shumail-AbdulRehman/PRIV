# Launch backend composition

Spec26 mounts explicit adapters before the existing operational routers. app.ts
still imports initializeRuntime first, before policy imports, cron and listener.
The Paddle webhook remains raw-body verified before JSON parsing. No dynamic
route discovery or HTTP-method-derived account action is introduced.

## Mounted contracts

| Path | Audience and account policy |
|---|---|
| /api/owner-identity/status, /email/request | Active owner; own security, including inactive/suspended company; epoch and forced-password enforced |
| /api/owner-identity/recovery/request, /recovery/complete, /email/complete | Public POST capability/request contracts from16; no GET token consumption; no-store/no-referrer and sanitized errors |
| /api/platform/companies | Separate verified operator; metadata-only24 contract |
| /api/platform/service | Separate verified operator; diagnostics/audit/inquiry25 contract |
| /api/support/contact | Public configuration-only contact availability; no inquiry/audit/diagnostics |
| /api/company/settings | Active tenant owner; operational read; PATCH requires MANAGE_WORK |
| /api/attendance/:attendanceId/annotations | Active tenant; retained historical tenant/site scope from23; POST requires current entitlement and person (ANNOTATE_ATTENDANCE), including own-staff notes; no capacity or start grant |
| /api/subscription/manage | Active owner, own billing; inactive/suspended company permitted;15 qualified catalog/checkout/portal contract |
| /api/subscription/pricing-context, /enterprise-inquiries | Existing public catalog/contact contract, no tenant JWT prerequisite |
| /api/common/security/password | Active exact principal, own current password; forced replacement permitted; no operations bypass; revoke sessions/epoch |
| /api/common/security/staff/:id/handoff | Operational owner/assigned manager and MANAGE_WORK; existing17 reason/current-password/one-use contract |
| /api/common/security/handoff/complete | Existing one-use public capability contract; not a registration endpoint |
| /api/common/get-current-user | Safe own identity only; no locations/workforce/evidence from suspended workspace |
| /api/location/readiness, workforce/assignment/archive, other existing operations | Existing routes retained; ordinary tenant auth denies inactive/suspended operations; concrete manage/start/completion/capacity gates below |

Tenant tokens never promote operators; operator identity/token never promotes a
tenant. Active principals may refresh their exact family and change their own
password while company operations are restricted, consistent with14 OWN_SECURITY.
Inactive people, obsolete roles, revoked epochs and stale refresh families remain
denied. Only the password endpoint admits forced replacement; other authenticated
security/billing requests still report PASSWORD_CHANGE_REQUIRED. Frontend30/37
must show the password form on that structured403 rather than assume logout or
unlock operations. Billing operations additionally require ADMIN. The legacy subscription summary permits manager reads only while company operations are active; its billing exception is owner-only. Assisted handoffs retain
operational company checks. Existing manager PATCH password replacement by another
account is unavailable; use the exact principal's own-password contract. No new
manager recovery policy is invented.

## Concrete operations

- Ordinary JWT auth checks current active person, role/epoch, forced password and
  company operational activation. Verification service authorization independently
  scopes its persisted principal to ACTIVE operational company.
- Schedule/area/assignment/workforce/location/staff edits, archives and manager
  mutation handlers use MANAGE_WORK. Annotation writes use a separate person action
  so paid staff can append their own retained context without manager authority.
- Location/staff/manager creation runs through withAccountCapacity, using its
  company/subscription-locked transaction for the actual create and postcount.
  Staff site scope is rechecked from persistence inside that transaction.
- Task start records WORK_ENTITLEMENT_GRANTED after the winning locked start update
  in the same transaction. Idempotent start retries do not issue another grant.
- Attendance authorizes before provider storage and rechecks after the staff lock;
  the winning compare-and-swap check-in and grant commit together. Grant/audit
  failure rolls back the clock write. Proven unused concurrent-upload cleanup and
  ambiguous-write retention remain as09/11 defined.
- Capture mutations use START_WORK for pending tasks, or exact persisted
  assertAccountCompletion for already-started tasks. Submission checks completion
  inside its task transaction. Existing20 receipt, waiver, failed-view generation,
  assignment/device/QR/deadline and immutable evidence checks remain intact.
- After expiry, only the exact saved own-work start grant permits completion.
  Request timestamps, other work's grant, old unproven starts and local trial/grace
  clocks do not qualify. Finalization may inspect submitted work for an asynchronous
  job, still requiring its retained exact start grant after expiry. Public staff
  capture/submission adapters do not admit submitted work for mutation.

## Jobs and truthful photo availability

jobAccountAllowed reuses14 state evaluation: new generation/assignment/attendance
preparation needs MANAGE_WORK; active-company bookkeeping can retain READ_OPERATIONAL
after expiry. Policy denial skips the tenant; driver/configuration failure
propagates. Daily/once/startup snapshots share the guarded generation transaction.
Attendance cron/startup use existing staff-locked preparation, removing earlier
unguarded bulk inserts. Assignment/reassignment rechecks before mutation. Deadline
and attendance-status work skip suspended companies; task-assignment status writes
carry the same relation predicate. Notification generation and pre-send checks
exclude suspended companies. Verification claim SQL excludes inactive/suspended
companies; processing/publication/failure adapters recheck before changing evidence
or task state. Finalization also checks exact completion entitlement. Billing
webhook/provider facts remain independent of operational suspension.

Spec21's new direct/buffered PHOTO processing remains unavailable before AI/storage:
the active adapter has no qualified privacy/identity path. Verification capabilities
and manifests report photoChecking unavailable and disable new capture/upload action
availability. Existing result reconciliation remains reachable. No feature boolean,
cached approval, fixture data or historical record bypasses qualification. This is
not a privacy screening implementation, redaction guarantee or empirical approval.

## Error boundary and verification limits

Known Zod/multipart/size/JSON/conflict errors map to structured400/409/413; ApiError
keeps its public code/details. Unknown driver/provider errors return generic500
without raw errors/stacks/logging credential material. No database error is treated
as account entitlement, successful start, clean photo or confirmed delivery.

Route tests use real tenant JWT/role/epoch middleware with explicitly injected
service and qualified-operator seams. They prove routing/audience isolation, not
live IdP/provider qualification. Isolated PostgreSQL launchComposition integration
uses real controllers/services for task/check-in races, capacity, audit rollback,
expiry/legacy/completion and suspended own-password behavior. Storage is injected
synthetic metadata only; no real photos or remote calls. launchPhoto regression
retains20 proof under explicit synthetic billing entitlement. Synthetic billing
catalog/customer records are not real Paddle sandbox or commercial approval.

Type/build/whole-suite results are in spec26 Log. No deployment, schema migration,
production data/configuration, real email or provider mutation occurred. Original
user CI/package/manager-performance/dashboard/design work remains outside commits.
Live IdP/MFA, mail/support qualification, real Paddle, consented photo/privacy data,
legal/retention/exit, backups and physical Android remain39/40 release gates.
