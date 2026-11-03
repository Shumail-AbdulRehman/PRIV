# Launch operations and release gates — Spec39

Release is blocked. Code/CI success is not authorization to deploy, alter production configuration/data, publish Android or activate billing/photo processing. No real credentials/evidence were supplied in this batch. `releaseReadiness.ts` reports only configuration validity, supplied schema observation, active photo qualification and fixed human-evidence gates. It returns releaseAllowed=false; flags cannot manufacture evidence. No secrets, URLs, tokens or worker identifiers are returned. Its output is a development/review report, not a public readiness endpoint or an authorization service.

## Active CI and isolated reproduction

CI runs full backend unit tests/build, an explicit active direct-photo/qualification/review/receipt unit group, full frontend policy/component/lint/build and full native regression/typecheck/web bundle. Docker images build without push; none is a signed phone artifact or deployment. Existing3-line company-performance CI edit is preserved separately in the user's working tree, excluded from this spec's committed workflow.

The previous hosted backend CI failure (run39619823659) occurred in legacy verification.lifecycle.integration.ts:266, expecting VERIFIED_COMPLETE from receipts no longer meeting current20/21 rules. Historical buffered/photo-HTTP/lifecycle scripts presume retired processing/automatic outcomes. They remain untouched as historical code; CI now uses current scoped launch proofs plus active direct/review unit regressions. This replaces obsolete expectations rather than weakening the actual photo qualification guard. Full unit suites still cover current completion/auth/read/receipt policy. Retained manager SQL initially failed401 in hosted run39625860958 because its old JWT fixtures lacked tokenUse/expiry. The fixture now uses the real access-token generator, asserts typeless legacy token rejection, and creates only synthetic qualified mirrored entitlement instead of relying on legacy subscriptionStatus. No authentication or account policy was relaxed. No historical benchmark/reporting exit0 is treated as empirical qualification.

`backend/scripts/launchCiDatabase.ts` requires explicit LAUNCH_CI_DATABASE_URL pointing to local bootstrap database priv_verification_test, rejects production NODE_ENV and remote/non-test targets before I/O, creates one uniquely named child DB, applies all actual migrations and runs10existing proofs sequentially: workforce, capacity, billing, owner identity, company settings, annotations, operator company/support, photo receipt/replacement and composition. Then it runs the7existing launchPersistence SQL invariants (normally skipped without an explicit isolated URL). Each gets only the new child target. Finally drop only that generated child, never the bootstrap/application DB. No application dotenv URL selection. CI's throwaway Postgres service/test-only credentials are not deployment secrets.

Local reproduction when a disposable Postgres16 bootstrap is explicitly available:

```
cd backend
NODE_ENV=test LAUNCH_CI_DATABASE_URL=<explicit-local-priv_verification_test-url> node --import tsx scripts/launchCiDatabase.ts
npm test
npx tsc --noEmit
npm run build
```

Do not substitute an application/production URL. Docker socket access is denied and no server was installed. For local proof, official PostgreSQL16.15 package files were extracted only under /tmp/hygene-spec39-postgres-tools; an unprivileged fresh cluster under /tmp/hygene-spec39-postgres-data listened on127.0.0.1:56441. No system installation or existing DB was used. All10current proofs plus7SQL invariants and retained manager integration passed. The runner created/dropped only its own child database. Hosted CI independently provides its disposable service; its exact result is recorded in the Log/handoff. Negative runner tests also prove unsafe targets fail before connecting.

## Required external evidence

All below remain REQUIRES_EVIDENCE. Assign an accountable owner and attach actual environment/date/artifact/run evidence to human release review. A config value, synthetic dataset or mock does not complete a gate.

| Gate ID | Required evidence / safe boundary |
|---|---|
| tls-and-origin | Hosting owner, actual public HTTPS origins/certificate chain/expiry, forwarded-proxy trust, secure same-site cookie and CORS checks against real hosts. Runtime validation is necessary, not TLS proof. |
| secret-custody-and-job-owner | Named operator, secrets custody/rotation/revocation, independent signing keys, scheduler/worker ownership and single intended job start. Verify app initializes validated runtime before jobs/listener. No secrets in public VITE/EXPO env or logs. |
| migration-backup-rollback-restore | Approve additive schema plan against real current migration inventory; preflight counts/backfill; encrypted backup and restore into an isolated recovery target; compare constraints/tenant records/private evidence; record RPO/RTO measurements, owner and rollback decision. Never run migrations/reset/restore against production from this task. Code downgrade may be incompatible after schema changes: test rollback before release, do not delete history. |
| paddle-merchant-catalog-sandbox | BILLING.md: real eligibility/merchant/environment/catalog/terms, sandbox checkout/portal/signed webhook ordering/duplicates and ambiguous reservation recovery. Existing PADDLE_BILLING_ENABLED remains off until qualified.38 public facts do not activate server billing. |
| owner-delivery-and-legacy-bootstrap | OWNER_IDENTITY.md and research/owner-delivery.md: approved sender/domain/API credentials/HTTPS fragment links, real mailbox receipt and one-use recovery; accountable legacy identity proof. Local audit/delivery mocks are not delivery. |
| operator-idp-mfa-browser | OPERATOR_IDENTITY.md/OPERATOR_UI.md: approved issuer/audience/JWKS, explicit named subjects and actual required assurance; real browser PKCE/state/nonce/session/logout/callback qualification. Current browser adapter/sign-in remains disabled; tenant ADMIN never grants operator access. |
| verified-support-and-approved-policies | SUPPORT_OPERATIONS.md/COMMERCIAL_CONTENT.md: approve and receive through real configured support mailbox; approve current service/privacy/retention/export/exit terms and exact links. No invented refund/retention/deletion promise. Missing required policies/support block new checkout. |
| signed-android-and-physical-device | validate-device-config script rejects unsafe target, but validate an actual phone-reachable HTTPS backend, signed artifact/provenance/hash/update path and approved distribution; physical Android attendance/camera/location/force-kill/recovery/notification checks in40. Expo web build is not device evidence. |
| old-private-media-transition | Media transition dry-run inventory, binding manifest, redacted counts, guarded copy verification and reconciliation, explicit rollback/restore evidence and access denial of old public originals. No blind backfill or destructive deletes. |
| representative-consented-photo-privacy-identity | Actual active adapter lacks privacy/fixture-identity qualification. Direct/buffered new PHOTO processing stays unavailable before provider/storage; existing completed-result reconciliation remains. Require representative consented rooms/people/mirror/identity/privacy cases and independently reviewed empirical results/pipeline hashes. No flag/historical report/fake confidence can enable it. |
| customer-calendar-and-fit | Real business-owner approval of timezone/overnight/date ranges, shift/task responsibility, restrictions/over-limit/transfer rules, customer fit and supported guarantees. No invented grace period/price/HR feature. |
| bounded-query-scale | Existing operations/platform windows are bounded; confirmed master-list and per-inquiry audit lookup gaps documented in followups/BOUNDED_LISTS_SPEC.md. Implement that separate approved follow-up or resolve with real measured bounded-scale evidence and explicit review. No unbounded production probe or broad silent rewrite. |

## Verification limits

Hosted run39626388658 on fbd5ca7 passed backend/frontend/mobile-web/docker-builds, including current10SQL proofs+7invariants and3non-pushing images. Local unit/type/build and SQL checks independently passed.38 typography-only base follow-up66723be was integrated afterward and frontend rebuild/8renders passed. Exact results are recorded in spec39 Log/SESSION_HANDOFF. Pending external evidence is a release blocker even when all code checks pass.40 owns whole-product/device flows and41 clean final verification; neither started here. No production/provider/email/deployment operation performed.
