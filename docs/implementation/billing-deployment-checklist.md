# Billing onboarding sandbox release checklist

Prepared 2026-11-08; operator release and deployed acceptance pending. Procedure: [runbook](../../backend/SANDBOX_BILLING.md). Evidence destination: `docs/implementation/billing-final-verification.md` (spec63).

- [ ] Inventory and commit/review complete45–59 dependency set, including untracked backend/src/types/billingLifecycle.ts, all frontend onboarding modules, translations, proxy and plan steering/inventories. Record candidate frontend/backend SHAs; compare actual main to candidate. Do not stage unrelated work.
- [ ] Record previous Netlify deploy/Heroku release and sanitized configuration version. Ordinary additive commit/fast-forward/reviewed merge only; preserve all Git history.
- [ ] Pass focused tests per unit, complete frontend/backend units, typechecks/scoped lint/builds, isolated SQL60 and focused/full managed browsers62. Use exact lockfiles. Local mocks, real SQL and deployed provider evidence are separate tiers.
- [ ] Operator verifies all Netlify build and Heroku runtime settings in the runbook without disclosing values. Netlify uses /api; sandbox/test_ public token family agrees with backend. Rebuild for frontend variable changes.
- [ ] Check all six listed sandbox catalog/product pairs and actual recurring amounts/currencies/trials; frequency1 and trial card requirement true. No invented discount/due-today/trial or silent pricing-policy change.
- [ ] Confirm default checkout link/approved domain and signed direct notification destination; retain exact webhook raw body/signature verification. Verify secrets by validity/presence only.
- [ ] Deploy additive backend before matching frontend after62 passes; record actual release/build SHAs. An old main commit or successful build is not release acceptance.
- [ ] Verify real same-origin secure session/reload, including third-party-cookie restrictions. Preserve direct native API/webhook paths.
- [ ] Real synthetic new owner completes standalone signup → plan → Paddle card → pending → signed persisted qualified current entitlement → Open workspace. Record timestamp, redacted request/event correlation, subscription count and fresh lifecycle permission.
- [ ] Reload/new sign-in retains entitlement; unfinished owner resumes exact draft; existing/canceled/past-due subscriber has managed portal with no second purchase. Manager/staff/security/forced-password behavior remains correct.
- [ ] Diagnose the reported stuck account read-only: actual failing request/stage/status, safe provider category, release SHAs, CUSTOMER_CREATE_RESERVED/CHECKOUT_RESERVED and matching READY reservation/customer/tenant linkage. Local loss does not prove a charge or unmatched server record. Document exact remaining access prerequisite if unavailable.
- [ ] If affected-account data/provider repair is necessary, create a bounded reviewed repair before final gates. Never delete records, cancel by timeout, clear a hold or create a second purchase to escape uncertainty.
- [ ] Confirm no Help/Contact/support promise/FAQ, sample prices, mock card form or preview controls in the new subtree/gate. Keep unrelated global help and production commercial guards.
- [ ] Operator demonstrates rollback through prior deploy/config or additive revert, retaining all billing/customer/subscription/audit data and Git history.

Current external gaps: no actual Netlify build/Heroku release match, secure proxy-cookie qualification, affected-account diagnostics, real Paddle card/notification/canonical persistence or portal acceptance established here. No deployment or provider/config mutation was executed by this documentation unit.
