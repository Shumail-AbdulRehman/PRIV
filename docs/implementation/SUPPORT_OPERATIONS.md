# Platform support operations — specification25

## Boundaries and composition

`platformSupport.route.ts` default router mounts at `/api/platform/service` in26, outside tenant JWT routing. Every diagnostic/audit/inquiry route uses separate verifyOperator and private/no-store. Real OIDC/MFA/provisioned identities still require qualification19/39/40; no tenant ADMIN elevation.

GET `/diagnostics`: current DB query reachability and actual maximum persisted webhook occurrence/processing and verification-worker heartbeat timestamps. Null means no observations; an unavailable query yields UNAVAILABLE/null, never a raw driver error. No heartbeat age threshold, service uptime guarantee or provider network check is inferred. Provider connectivity is NOT_CHECKED. Configuration reports only identity/support availability booleans, never values, keys, URLs, hostnames, worker IDs or raw logs.

GET `/audit`: platform-only allowlisted company suspension/reactivation and inquiry update facts. Optional `companyId`, `action`, numeric `after` cursor, `limit` (default25/max50). Descending audit ID. DTO contains id/companyId/action/actorType/createdAt only; no raw reason, before/after JSON, tenant actor IDs or workforce actions.

## Existing inquiry queue

Existing public `POST /api/subscription/enterprise-inquiries` remains the source. Its idempotent durable submissions are preserved, including supplied contact and requirements. Their counts are requested sizes, not actual workforce. Email is always UNVERIFIED; a public submission is not proof of contact ownership.

GET `/inquiries`: bounded submitted-company search `q` (max100), UUID `after`, `limit` default25/max50; descending createdAt/id cursor. Summary excludes contact name/email/requirements. Each returned record resolves its latest handling event (at most50 bounded lookups). No unbounded event scan into application memory. JSON-path state lookup has no dedicated index; qualify latency on real lead volumes in39 before scaling, rather than adding a speculative store.

GET `/inquiries/:id`: operator-only submitted contact/requirements and handling state. Treat all submitted text as untrusted text in35; never render HTML, auto-open submitted links, fetch attachments or treat lead text as a system diagnostic. This route queries no workforce or evidence model.

PATCH `/inquiries/:id`: strict `{expectedVersion,status,ownership,reason}`. Queue labels NEW/IN_PROGRESS/CLOSED are internal triage states, not delivery/payment/legal claims. `ownership` SELF assigns the verified caller, UNASSIGNED releases; arbitrary assignee subjects cannot be submitted. Every provisioned operator may make a reasoned version-guarded queue update, including claim/release; no hidden tenant access results.

Original submission row is locked but never rewritten. Existing AuditLog stores PLATFORM_INQUIRY/INQUIRY_UPDATED events, companyId/actorId null and numeric entityId0 because inquiry IDs are UUIDs. `newValue.inquiryId` binds the event; newValue also has status/owner and operator issuer/subject. Latest audit ID is version; no event means version0/NEW/unassigned. An invalid latest event fails unavailable, never silently resets state. The sole state/audit write is atomic. Concurrent stale updates409; exact same state at current version no-op; a lost-response old-version retry must reload, not automatically overwrite newer handling. Reason is trimmed1–500; original event retains actor/time/reason. No external message is sent and inquiry email verification cannot be set here.

## Customer contact configuration

Named `customerSupportRouter` mounts at `/api/support` in26. Public GET `/contact` reveals only explicitly publishable contact availability; it exposes no inquiry, audit or diagnostics. It stays available to a locked-out customer without a tenant session. All responses private/no-store.

Only set `SUPPORT_CONTACT_EMAIL` to a genuinely approved, operator-controlled mailbox intended for public use. Set `SUPPORT_CONTACT_VERIFIED=true` only after the responsible operator verifies mailbox control, receipt and the approved customer handoff. Both must be present and email syntax valid; otherwise response is `{available:false,email:null,channel:null,verification:'UNAVAILABLE'}`. Configured response uses EMAIL/OPERATOR_CONFIGURED; this is deployment-owner configuration, not automated delivery or email ownership proof. Never put a private mailbox/credential/fixture value into production configuration.

No real channel has been provisioned or tested in this implementation. No provider call, email/Slack message, production mutation, migration, deployment or commercial/legal policy is authorized.38 consumes this exact availability contract instead of invented support links;35 must display unavailable states honestly.

## Verification

Focused `npm test --prefix backend -- src/services/platformSupport.service.test.ts` plus full backend suite, backend TypeScript/build. Guarded isolated proof:

`PLATFORM_SUPPORT_TEST_DATABASE_URL=postgresql://shumail@127.0.0.1:56439/hygene_launch_test backend/node_modules/.bin/tsx backend/tests/platformSupport.integration.ts`

Always use an explicit disposable local target; never application .env selection or production. Proof reuses the actual public inquiry controller, demonstrates unchanged idempotent submission, concurrent queue one-winner/409, durable actor/time/reason/owner, audit failure rollback, redacted audit filters and real DB observations. Fixture contact/identity values are synthetic and never activate a real channel. Live identity/channel qualification and full product flows remain39/40.
