# Hygene Ops architecture

## Folder structure
- backend/src/app.ts: composition, Express middleware and existing route registration, listener/jobs.
- backend/src/routes/: route adapters. New launch route groups stay separate and mount through launch.route.ts.
- backend/src/controllers/: existing HTTP adapters; preserve routes while extracting changed business rules to services.
- backend/src/services/: existing operations, subscription, mobile, staff-notifications, verification-v2.
- backend/src/config/: validated runtime/provider configuration.
- backend/src/prisma/prisma.ts: existing PostgreSQL/Prisma connection seam.
- backend/src/validations/, utils/, types/: schemas, errors, dates, token helpers, request identity.
- backend/prisma/schema.prisma and migrations/: relational model and additive migration history.
- frontend/src/main.tsx, routes/: composition/router; components/layout and components/common: shared shells.
- frontend/src/pages/: existing feature-local API/query/component modules, retained for new pages.
- frontend/src/i18n/: language provider/translations; api/client.ts: credentialed HTTP and refresh.
- frontend-mobile/src/: screens, API, auth, queries, verification, notification recovery; existing Expo app.
- specs/inventory/: per-unit reuse handoffs. design/v5/: immutable approved reference, never runtime code.

## Layer boundaries
| Path | Owns | Must never do |
|---|---|---|
| routes/controllers | authenticated actor, input schema, HTTP DTO/errors | derive tenant from request body or expose ORM credentials |
| services | business transitions, injected DB/provider seams | depend on req/res or invent financial policy |
| prisma/prisma.ts | existing database access | connect a second client per service |
| web/native API/query modules | request/cache/invalidation | embed secrets or authorize by hidden buttons |
| components/screens | forms/rendering and local drafts | hardcode sample operational data or bypass API |

## Naming conventions
Preserve existing camelCase.service.ts, PascalCase components, colocated backend .test.ts, web tests/*.test.mjs until spec 08 adds component tests. Feature-specific new code belongs beside its consumer. Do not rename the tree as incidental cleanup.

## Protected files
Never edit generated Prisma client/dist/node_modules, past applied migrations, design/v1–v5, production config/data. Add migrations with preflight/rollback procedure; execute only against explicitly isolated databases. Do not include existing dirty dashboard work in unrelated changes.

## Data model
Company owns Manager (ADMIN owner or MANAGER), Staff, Location and billing linkage. ManagerLocation gives current site scope. Staff has current location/shift and retained Attendance; each attendance/task row has its own historical location. TaskTemplate generates TaskInstance with immutable snapshots, assignment epochs and evidence attempts. Verification exceptions/review closure differ from submitted/verified work. Paddle customer/subscription/events mirror provider truth. AuditLog is an existing tenant audit seam; operator audit must use distinct identity. Spec10 adds CredentialToken (hashed purpose/target/expiry, composite tenant target binding), immutable AttendanceAnnotation (own staff/assigned-site actor trigger), Manager/Staff credentialVersion/mustChangePassword, owner emailVerifiedAt and separate Company operationalStatus/accountVersion/suspension context. Existing AuditLog remains audit storage. No provider secrets/raw tokens in persistence. Schema migration precedes selecting new columns.

## State ownership
TanStack Query owns server data; existing Redux auth state stays identity-only. Local useState/reducers own drafts/filters/dialogs. Context is auth/language dependency injection. Native SecureStore owns tokens; do not migrate to another state solution.

## Invariants
1. Actor identity is role + numeric ID + company ID; Manager IDs never identify Staff.
2. Every tenant query/mutation constrains company and every manager historical row constrains its own location.
3. Attendance photos are authenticated assets and authorized application bytes, never public/signed URLs in DTOs.
4. New business rules accept plain values, not req/res. Reuse existing transaction/provider seams for tests.
5. Production runtime rejects unsafe secrets/origins/cookies before jobs or listener; no secret values in errors/logs.
6. Preserve immutable attendance/evidence/history and subscription provider dates; no destructive migration/reset.
7. Every mutating retry has conditional state/idempotency or explicit result reconciliation; stale refresh cannot revoke newer login.
8. Operator identity/audience never grants tenant workforce/evidence access, impersonation or public registration.
9. UI reflects persisted API facts with explicit empty/error/loading/uncertain states and full EN/UR/RTL.
10. Unqualified photo evaluation never automatically approves work; no claimed redaction/fixture attestation.
11. New capacity limits serialize creation with subscription state; downgrade preserves existing records/access.
12. Composition hot files have sole owner: app.ts spec 03 mounts a launch router supplied by spec 26; main.tsx/workspacePages/Sidebar spec 27 registers new frontend surfaces. Intermediate placeholders must have an explicit unavailable response, never success.

## Shared helpers, in full
No new verbatim helper contract is required. Reuse scope.ts/dateTime.ts/ApiError and existing authorized task/evidence services; inventory lists paths. Inject DB/provider boundaries for new services instead of introducing a container framework.

## End-to-end fixture strategy
Spec 40 uses an explicitly isolated PostgreSQL DB and synthetic fixtures with two companies, owner/managers/staff with colliding numeric IDs, two sites and transferred historical records. Real backend persistence, Chromium web and physical Android/Maestro proof; provider sandbox/stubs have separately named limits. Never use production data or reset a configured unknown database.
