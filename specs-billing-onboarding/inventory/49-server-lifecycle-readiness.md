# Spec 49 — Authoritative readiness, catalog metadata and safe draft resume

## Existing service boundary extended

`backend/src/services/billingLifecycle.service.ts` retains getBillingLifecycle/getBillingCatalog/createBillingCheckout/createBillingPortal and the same db/provider injection. Adds an internal optional `now: () => Date` dependency for deterministic permission checks; no request field or runtime test switch. Return types explicitly use spec45 JSON DTOs, including ISO date strings, workspaceAccessAllowed, bounded checkoutReadiness and nullable checkoutResume. HTTP routes/envelopes/owner middleware/no-store remain unchanged.

Lifecycle reuses readAccountState for canonical account facts and evaluateAccountAccess START_WORK for the exact correlated subscription facts returned in the response. It never derives permission from READ_OPERATIONAL or status alone. Effective current period, matching catalog/company plan, tenant/customer/subscription and administrative restriction are required. Invalid/missing/foreign facts deny. Expected policy403 becomes false; unexpected DB errors propagate rather than fabricate readiness. Turning off purchase activation does not revoke a previously qualified current entitlement, consistent with the existing access policy.

Readiness precedence: COMPANY_RESTRICTED, BILLING_DISABLED (activation or checkout-destination prerequisite), OWNER_VERIFICATION_REQUIRED, LINKED_SUBSCRIPTION, RECONCILIATION_PENDING, READY. checkoutAvailable is true only for READY; resume is exposed only when READY and an exact prepared draft is proven. Linked/disabled owners can still have current entitlement or permitted catalog/portal reads; those are separate capabilities. No provider request is made by lifecycle reads.

## Reservation safety / compatibility

Private inspectCheckout and customerReconciliationPending helpers share read/mutation decisions without creating a second billing engine. Both CUSTOMER_CREATE and CHECKOUT latest RESERVED/READY correlations are checked. Customer identity must match the canonical same-company mirror; unresolved customer provisioning cannot be skipped just because another event linked a customer. Checkout resume requires the saved reservation ID, valid transaction ID and exact configured plan/interval/price. A known transaction is looked up by ID then checked for tenant/customer/subscription linkage, so a foreign row cannot be mistaken for an absent mirror.

Known draft/ready transactions can reopen; paid/completed/billed/past_due/unknown/unsupported statuses cannot resume or repurchase. Only a same-tenant provider-confirmed canceled transaction with valid audit correlation permits replacement. No local timeout, deleted audit row or browser completion clears uncertainty. Company locks and fresh owner/verification/restriction checks remain in the reservation path.

New CHECKOUT_READY facts add customerId, after an actual provider draft response and the canonical-link recheck. If a transaction mirror has not arrived, this persisted server-created customer linkage permits reopening that same draft only. Legacy READY without customerId needs a same-tenant draft/ready mirror to prove linkage; absent proof remains held. READY confirmed by a completed-provider event without a matching mirror also remains held. These are safe legacy degradation rules, not a migration or live record repair. DTO/public API consumers do not see audit details.

Spec60's existing SQL injected provider fixture must supply the real SDK draft `status` in create responses; preserve the guard and extend its real DB assertions rather than weakening the production response check. No real SQL test was added/run by49. Existing interrupted accounts without sufficient linkage proof require operator/provider evidence;49 does not mutate those accounts to force recovery.

## Configuration and catalog reuse

`backend/src/config/paddle.ts` adds configuredEntryForPrice(priceId), returning the exact validated price/plan/interval or undefined; existing configuredPlanForPrice delegates to it. Adds getPaddleCheckoutUrl(), returning the validated HTTPS URL or a generic error, with no credentials/query/fragment. Activation/catalog/portal reads retain existing prerequisites; an unusable checkout URL denies preparation before reservation without disabling otherwise authorized catalog reads.

getBillingCatalog preserves exact nonnegative integer provider amount strings, real currency and valid active recurring price/product pairs. Trial requiresPaymentMethod is copied as true/false/null (unknown), never invented. Malformed price/trial facts reject safely. For the requested sandbox card-entry path, a trial requires explicit provider requiresPaymentMethod=true before a new reservation; unsupported/unknown sandbox trial card policy rejects without altering terms/prices. Production verification/policy semantics are retained; no real-money activation is authorized.

## Verification boundaries

Lifecycle tests:120 passed; config tests:25 passed. Final full backend suite:1596 passed,7 pre-existing SQL tests skipped across99 passed/1 skipped files. Skips are launchPersistence.test.ts, requiring explicit isolated LAUNCH_PERSISTENCE_TEST_DATABASE_URL; no app DATABASE_URL fallback or skip was introduced. Stateful failure fixtures retain reservations at provider/customer/draft/persistence boundaries and prove subsequent service reads/retries do not duplicate provider creates; they are service-decision fixtures, not proof of PostgreSQL rollback/locking or actual provider delivery. Existing local signature/router/portal negative tests remain.

Exact static/build commands and final results are in spec49 Log. Live affected-account/root-cause diagnosis and deployed sandbox card/webhook/entitlement evidence remain external61/63 requirements; SQL concurrency/persistence belongs to60. UI/query/route wiring belongs to50–59. No deployment, billing configuration mutation, trial/price edit, account data repair or Git history rewrite is part of this unit.
