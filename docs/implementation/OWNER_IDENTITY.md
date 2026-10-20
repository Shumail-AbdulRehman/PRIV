# Owner email verification and recovery — specification16

## Identity and token contract

Existing CredentialToken is the sole token store.32 random bytes/base64url are sent only through the configured mail adapter; only SHA256 hashes plus purpose/company/manager/targetEmail/createdAt/expiry/consumedAt persist. Verification lifetime24h, reset30m (D04 security limits). Owner email remains case-sensitive, matching existing signup/login; no lowercase alias trust is introduced. A token must match current active ADMIN, company, exact email and purpose; future-created/expired/used links fail generically. Public reset requires emailVerifiedAt. No staff/manager recovery promotion, no operator impersonation.

Completion locks manager→token, conditionally consumes once and revokes all remaining owner tokens atomically with audit. Reset uses existing Prisma bcrypt extension exactly once; email verification and reset both increment credentialVersion and clear refresh family; reset clears forced-replacement flag. No session is created; sign-in required. Company/billing/suspension state never changes. Active owners can perform own security even when company is inactive/suspended (D01); shared auth adapter26 must preserve that without permitting operational access.

## New signup versus legacy enrollment

Registration16 now adds OWNER_EMAIL_ENROLLMENT_ALLOWED in the same company/owner transaction. ADMIN actor is the new owner; payload source REGISTRATION, emailHash exact supplied address. This is eligibility to prove that address, not email verification. It contains no password/raw token and retroactively enrolls nobody. Enrollment-audit failure rolls back signup.

Existing unverified owners without this marker cannot self-verify an old stored address. Authenticated verification request requires current owner password, current exact identity and an enrollment grant. Confirmation rechecks the grant. A verified owner requires no new verification link.

Legacy bootstrap is a controlled external maintenance procedure, **not** a public/operator API and **not** automatically performed by this implementation:

1. Responsible, authorized identity/recovery personnel independently establish company ownership and intended email control through the approved real verification process. Existing login/password, an old email field, a support inquiry or a payment email alone is not sufficient bootstrap evidence.
2. Record the real case reference, named verifier, company/manager identity and exact approved address in the restricted audit process; follow approved change/backup/review procedure. If any fact is missing or disputed, leave bootstrap unavailable; do not invent evidence or contact.
3. A separately authorized database maintainer may append an enrollment grant for only that exact company/active ADMIN, using AuditLog action OWNER_EMAIL_ENROLLMENT_ALLOWED, entityType MANAGER/entityId owner, actorType SYSTEM/actorId null, reason and source IDENTITY_CHECKED_BOOTSTRAP plus emailHash of the exact current address and actual proof/verifier reference. No raw evidence/identity documents or credentials in audit JSON. This does not set emailVerifiedAt, reset passwords, issue a login session or enable operations.
4. The owner must still authenticate with their current password and complete the one-use link to that exact qualified address. If the owner also cannot authenticate, stop for the separately approved identity/password-bootstrap procedure; this launch API provides no bypass.

No real bootstrap/DB modification is authorized or executed here. Human approvals and real proof are external release facts; fixture grants prove only local mechanics. Maintainers with DB write authority remain a privileged trust boundary; protect that access and audit retention.

## Requests, throttles and honest delivery

Public POST recovery/request admits processing and returns202 `{requestAccepted:true,deliveryConfirmed:false}` before account lookup/provider work. Absent/incomplete delivery configuration fails503 globally before lookup, for known and unknown emails alike. Malformed input400; per-client20 admissions/15m429; global pending64 and bucket-map10000 bounds prevent unbounded memory. Keys use server req.ip/socket identity, hashed in memory; never trust arbitrary forwarded headers. Qualify trusted proxy and distributed ingress limits in39; in-process IP limits alone are not a distributed abuse defense.

Account lookup/issuance/provider work is deferred with native setImmediate to avoid account/provider timing influencing public responses. The admission is explicitly **volatile**, not a durable outbox or guaranteed sent acknowledgement. Process crash/shutdown can lose pending work. UI30 must say delivery is unconfirmed, provide a safe retry path, never say “email sent” or disclose owner existence/verification/throttling state.39 should drain ownerIdentity.whenIdle on graceful shutdown, qualify restart behavior and mailbox delivery; no raw token is persisted to build a speculative queue. Missing/unverified/inactive/non-owner accounts yield the same public receipt and no mail.

Under the owner row lock, at most3 links per purpose/owner/15m across processes. Additional requests silently leave current links intact; resends do not invalidate a still-valid link. Authenticated verification rechecks current password and enrollment and may report bootstrap-required to that authenticated owner. Provider rejection/timeout is recorded internally as OWNER_IDENTITY_DELIVERY_UNCONFIRMED; a potentially delivered link stays valid. Acceptance records OWNER_IDENTITY_PROVIDER_ACCEPTED, not recipient delivery. Provider/SQL exceptions never echo token/email/password/payload; router sanitizes unknown credential-storage errors before generic logging. Background processing emits only a fixed sanitized unavailable warning, never raw exception details.

## Delivery configuration (disabled by default)

Optional native-fetch adapter requires all of:

- OWNER_IDENTITY_MAIL_ENABLED=true and OWNER_IDENTITY_MAIL_PROVIDER=resend.
- OWNER_IDENTITY_SENDER_VERIFIED=true only after the actual sender/domain and mailbox workflow are qualified by the responsible operator.
- OWNER_IDENTITY_SENDER_EMAIL: genuine approved bare sender email.
- OWNER_IDENTITY_RESEND_API_KEY: genuine provisioned send credential; never log or commit it.
- OWNER_IDENTITY_WEB_ORIGIN: approved HTTPS origin, no credentials/path/query/fragment.

Pinned https://api.resend.com/emails, redirect:error,5second timeout and8KiB response bound. Each operation's persisted UUID is the provider idempotency key; raw token never enters the key/audit. Plain-text emails contain `/verify-owner-email#token=...` or `/reset-owner-password#token=...`. These web pages are implemented by30, not yet present; do not activate links before their real UI and origin/referrer/log handling qualify. All current sends are injected no-network fixtures. No actual provider key/sender/domain/terms was supplied or activated. A syntactically configured sender is not proof of real domain/mail delivery.

## Composition and consumers

Mount ownerIdentity.route.ts at `/api/owner-identity` in26 outside account-operation gates; public endpoints are capability-only, authenticated owner security requires appropriate inactive-company adapter. GET status and POST email/request currently use ordinary verifyJwt until26; do not claim suspended-company browser integration before composition. Operator context denied; all responses private/no-store and no-referrer. All mutations POST, never automatic GET consumption.

GET status returns emailVerified/deliveryConfigured/bootstrapRequired only. POST email/request accepts currentPassword; POST email/complete accepts token. POST recovery/request accepts email; POST recovery/complete accepts token/newPassword (minimum8, maximum72 UTF8 bytes). Unknown fields rejected. Completion clears access/refresh cookies and requires sign-in.30 must retain drafts/errors, neutral messages and fragment token cleanup; no URL/body analytics or token logging. New registration session behavior and13 atomicity preserved.

## Verification

Focused owner/registration tests, full backend suite, backend TypeScript/build and strict standalone integration tsc. Isolated real proof only:

`OWNER_IDENTITY_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/ownerIdentity.integration.ts`

Tests use synthetic mail capture, no external sends. They prove atomic registration enrollment, qualified-bootstrap fixture boundary, scoped hash/lifetime, one-winner verification/reset races, bcrypt once, epoch revocation, suspended-company preservation and real credential/token rollback on audit failure. Real sender/domain/UI/legacy proof/ingress/device/browser qualification remains39/40; no production migration or data change occurs.
