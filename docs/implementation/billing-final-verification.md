# Billing onboarding final verification

2026-11-08. Local final verification complete. Live acceptance was deferred by the user; this report does not establish a real Paddle payment, signed deployed delivery or recovery of the reported stuck account.

## Completed local evidence

- Clean isolated source snapshot: `/tmp/billing-clean`, with private dotenv files, existing node_modules/dist and artifacts excluded. Included shared workflow, native translation source and release docs required by incumbent tests. No existing application database or process attached.
- `npm ci` in backend/frontend exited0 from unchanged lockfiles. Backend lock SHA256 `6f121dd209d18eb3114e318d09fe72185a4c93290d9afc42cdab7cdfa592cfec`; frontend `cf97a07025fab918b410735e9cd86cf725e544d764aacc4788e374293e46fb91`. No dependency upgrade/audit-fix applied.
- Clean backend build generates Prisma client and compiles TypeScript. Clean frontend build compiles TypeScript and Vite. Both exited0.
- Clean backend whole unit suite:1604 passed/100 files,0 skipped after the correlated-fulfillment refinement (focused121 first red then green, and real SQL passed). Explicit `LAUNCH_PERSISTENCE_TEST_DATABASE_URL` supplied to an owned migrated localhost `_test` database.
- Clean frontend whole suite:81 Node tests +748 Vitest tests/48 files,0 failures/skips. Includes19 payment focus tests,23 workspace-gate tests and the integrated unknown-subscription confirmation regression.
- Clean SQL60 script exited0 against owned localhost `billing_onboarding_test` on55471 with injected no-network provider. Proves company locks, exact reload resume, retained reservations after both provider failure boundaries/READY persistence rollback, no duplicate create, foreign/paid denial and persisted effective-window/catalog/suspension access.
- Clean focused managed browser suite:61 passed, no skipped billing tests. Real registration/auth/reload/SQL facts where named; lifecycle/checkout/SDK/portal fixtures are explicitly marked, and cannot prove deployed provider persistence.
- Final clean full managed browser suite:171 passed/1 unrelated opt-in local-platform skip,0 failures and0 skipped billing cases (172 tests,11.9m). Earlier complete170/1 runs are superseded by this run, which includes canonical fulfillment and saved-draft polling refinements. Detailed33-flow mapping: `specs-billing-onboarding/inventory/62-billing-e2e-suite.md`.
- Changed-file lint, e2e/application typechecks and final plan validation passed. Validator:20 specs,0 errors,20 accepted missing-issue warnings documented in README. Diagnostic logs remain local under `/tmp/billing-*`; raw cookies, credentials, portal URLs and trace archives are not release evidence.

## Repairs and regression scope

Confirmed source defects were dashboard nesting of choose-plan and catalog reads coupled to purchase permission. They are corrected through standalone App-restored owner routes and independent catalog reads. Actual provider failure for the reported account is still unknown.

The old monolith is a thin composer. Shared controller validates current identity/config/SDK and fresh server facts before one POST. Saved server-proven draft wins over URL selection. Uncertain response/409 never creates a replacement. Only fresh workspace permission exposes the explicit dashboard action. Historic subscriber reads remain; unknown early mirrors stay in confirmation and suspension/error/foreign data block operations before dashboard chrome. Production owner/policy/contact guards remain headless; unrelated global help and operator/security boundaries are preserved.

Full-suite diagnostics required narrow legacy test maintenance: standalone route/copy/markup assertions, a qualified persisted empty-setup fixture, past-due subscriber read-only fixture, original staff-password restoration after its one-use recovery test, exact review-ID/query locators, saved SQL company-name expectations and incumbent public/operator labels. No unrelated app implementation was changed to satisfy those tests. Generated historical screenshot outputs are restored rather than committed as new approval evidence.

## Visual, duplication and publication checks

Approved billing source is `design/billing-onboarding/revision-2/v3`. Actual component previews at1440/390/320 Urdu have zero overflow/browser errors. Independent finish reviewers resolved compact phone comparison/summary, full-width continuation, focus-panel treatment, localized usage and blue scoped tracks. Payment focus-return refinement passed19 component tests and a reviewer/documenter recheck. No root design/token system rewrite.

Application billing subtree/gate contains no Help/Contact/FAQ entry point, mock card form, invented recurring price/trial/discount, destructive cleanup or prototype confirmation control. The sandbox-only test-card guidance is conditional on matching browser/server environment. Capacity definitions and server entitlement policy remain single authorities. DTO/query/controller storage is owner-scoped; no new state/auth storage or schema migration.

Implemented/tested code revision: `585af3a` (`fix: complete standalone owner billing onboarding`). Staged-path review found no environment files, raw test artifacts, credential-pattern matches or source drift from the clean tested snapshot. Main was advanced through a normal fast-forward, preserving SDK46 `50febf0` and all earlier ancestry. A separate documentation-only evidence commit records the completed checks; no code changed after the passing run. Publication uses an ordinary main push, without reset/rebase/force-push. Actual deployed revisions remain unverified.

## External acceptance still required

See `billing-deployment-checklist.md` and `backend/SANDBOX_BILLING.md`.

- Operator binds actual Netlify build and Heroku release to reviewed candidate SHAs; confirms sandbox flags, six current active catalog/product pairs, trial card policy, default checkout link and matching signed destination configuration without revealing secrets.
- Actual same-origin `/api` secure-cookie delivery/reload, including third-party-cookie restrictions.
- Authorized synthetic new owner completes real Paddle sandbox card checkout; signature-verified delivery persists the canonical qualified subscription/current period and fresh workspace permission. Verify reload/new sign-in, count subscriptions and record redacted correlations/timestamps.
- Unfinished owner reopens the same actual draft and existing/canceled/past-due subscriber uses the real protected portal without a second purchase; owner/security and manager/staff behavior remain correct.
- Read-only affected-account diagnosis identifies actual failing stage/status, current deployment revisions and reservation/READY/customer/transaction correlation. Establish provider-proven recovery or explicitly retain its unresolved prerequisite. Do not delete audit/provider records or clear a hold to retry payment.

No Netlify/Heroku/Paddle operator session or affected-account diagnostics were supplied. Connected tools expose no matching operator integration and no Heroku/Netlify CLI is available. The user explicitly deferred live verification on2026-11-08. No further operator evidence is requested during this local implementation task. Local mocks/builds cannot close the external criteria; they remain deferred rather than asserted as passed.

## Final commands and boundaries

Clean `npm ci`, backend/frontend `npm run build`, whole backend `npm test` with the explicit isolated launch database, frontend `npm test`, isolated billing SQL script, scoped ESLint, application/e2e TypeScript checks and `HYGENE_E2E_DATABASE_URL=<owned local priv_e2e_test bootstrap> npm run test:e2e` all exited0. Unit concurrency was capped at4; browser workers remain1. Focused browser command selected sandbox-onboarding, billing-onboarding, billing-v5 and customer-auth-v5 files and passed61 cases.

Final logs: `/tmp/billing-clean-backend-final-tests.log`, `/tmp/billing-final-frontend-tests.log`, `/tmp/billing-clean-final-sql.log`, `/tmp/billing-final-focused.log`, `/tmp/billing-final-full.log`, `/tmp/billing-clean-backend-final-build.log`, `/tmp/billing-final-frontend-build.log`, `/tmp/billing-final-lint.log`, `/tmp/billing-final-poll-lint.log`. No source difference exists between the committed application and tested clean copy. The managed runner dropped its generated database children; the explicit bootstrap and local SQL database belong only to this test session.

Specs44–62 are complete. Spec63's local suite/static criteria are complete; its three deployed-provider/affected-account criteria remain unchecked because the user requested leaving live verification for now. This is the sole remaining acceptance boundary, not unfinished implementation.
