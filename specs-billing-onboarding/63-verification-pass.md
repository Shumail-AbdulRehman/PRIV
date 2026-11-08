# Spec 63 — Verify clean suites and deployed sandbox acceptance

**Status:** In progress
**Depends on:** Spec 62
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `specs-billing-onboarding/INVENTORY.md`, `docs/implementation/billing-final-verification.md`
**Reuses:** `docs/implementation/billing-deployment-checklist.md`, `backend/SANDBOX_BILLING.md`, `frontend/public/_redirects`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Subscription/onboarding/billing-setup.css`, `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingAccountPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx`

## Goal

Close the feature only after clean local regression and actual Netlify/Heroku/Paddle sandbox evidence establish the requested owner flow.

## Scope

- Recheck every prior binary criterion, fold inventory fragments and report actual counts/commands/revisions without mutating app source during this gate.
- Reinstall from existing lockfiles, generate client, build, and run whole backend/frontend unit suites, isolated SQL billing checks and full managed browser suite.
- Verify no help/contact/support promise/placeholder, sample price, mock card form or prototype review control shipped in the feature; preserve self-service recovery and global unrelated routes.
- An operator publishes/configures the prepared candidate only after spec62 local acceptance. Bind deployed Netlify build/Heroku release to the reviewed revisions and configuration.
- Use an authorized synthetic new owner and actual Paddle sandbox test card. Verify signed server delivery, persisted canonical subscription/current period and workspace permission after refresh/new sign-in. No production charge or real customer mutation.
- Missing external credentials/delivery evidence means local complete, deployed acceptance pending: leave this gate incomplete and state the precise prerequisite.

Audit `frontend/e2e/run.mjs`, `frontend/e2e/fixtures.ts` and `frontend/e2e/README.md` to confirm disposable-database and provider-fixture boundaries still match the reported evidence.

- Separately record the reported stuck-account diagnosis and provider-proven recovery (or precise unresolved prerequisite), not only success with a fresh synthetic account. Verify all required candidate files were committed/reviewed and actual deployed SHAs match; main containing only SDK46 is not an onboarding release.

## Explicit non-scope

- New application repairs are separate owner/repair specs; do not expand this verification gate into implementation.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Create clean-install evidence and collect current per-spec test outputs; do not copy old audit counts as current passes.
2. Run the documented local suites and duplication/token/inventory-path sweep; compare approved source and application screens at representative sizes.
3. Inspect operator release/config proof and follow the deployed acceptance checklist for a new sandbox owner, then an unfinished and existing subscriber.
4. Confirm reload/blocked-third-party-cookie session, existing-draft reopen, late webhook, actual server access and no duplicate provider subscription. Record redacted transaction/event correlations and timestamps.
5. Record honest completion boundaries. Return app defects to owners; reconcile tracker and issue/PR references without merging PRs automatically.

## Done when

- [ ] Clean installs/builds, full backend/frontend unit suites, isolated SQL billing checks and full managed browser suite pass; commands and actual counts are in the verification report. [suite]
- [ ] Every previous criterion, approved-design amendment, path/duplication/token sweep and per-spec fragment fold is evidenced; no app-source fix is hidden in this gate. [static]
- [ ] Deployed candidate revisions, same-origin session/reload, actual Paddle test-card completion, signed delivery, persisted qualified current entitlement and workspace entry are evidenced for a new sandbox owner. [requires: Netlify, Heroku, Paddle sandbox, authorized synthetic owner, operator configuration access]
- [ ] Unfinished/existing owner resume does not create a second provider subscription; actual portal and owner/security recovery work with no Help/Contact UI. [requires: deployed sandbox, signed webhook delivery, operator evidence]
- [ ] The reported stuck-account failure stage, reservation/provider correlation and safe recovery or remaining blocker are evidenced without record deletion or second purchase. Leave final acceptance pending if this evidence is unavailable. [requires: authorized affected-account diagnostics, Heroku/Paddle operator evidence]
- [ ] Package typecheck and changed-file frontend lint pass; unrelated baseline failures are explicitly distinguished from introduced failures. [static]
- [ ] `npm run build --prefix backend` and `npm run build --prefix frontend` pass from clean dependencies. [static]

## Log

**2026-11-08** — Started final clean verification in /tmp/billing-clean, excluding private env/artifacts and using exact unchanged lockfiles. Clean installs/builds, backend1603 tests, frontend81 Node +747 Vitest and isolated SQL passed. Focused managed60 passed; full managed suite is running. Shared workflow/native translation/release-doc files required by incumbent tests were added to the isolated copy before final clean reruns. External operator/deployed/affected-account criteria remain unchecked; see docs/implementation/billing-final-verification.md. No app-source fix is owned by this gate; focus/unknown refinements were assigned to55/59 and tested there.
