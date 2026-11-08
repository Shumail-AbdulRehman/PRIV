# Spec 52 — Restyle existing owner signup without changing auth semantics

**Status:** Done
**Depends on:** Spec 47
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Signup/SignUpPage.tsx`, `frontend/src/pages/Signup/SignUpPage.test.tsx`, `frontend/src/pages/Signup/queries.test.tsx`, `specs-billing-onboarding/inventory/52-owner-signup-screen.md`
**Reuses:** `design/billing-onboarding/revision-2/v3/account.html`, `frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx`, `frontend/src/pages/Signup/queries.ts`, `frontend/src/pages/Signup/api.ts`, `frontend/src/components/ui/input.tsx`, `DESIGN-SYSTEM.md#component-conventions`

## Goal

Render the approved owner account form inside the new shell while preserving real signup/session recovery behavior.

## Scope

- Keep existing name/companyName/email/password request shape, validation and React Hook Form; minimum password remains the current6 characters unless a separate policy change is authorized.
- Use persistent labels, correct autocomplete, LTR email/password, inline errors and disabled pending submit. Keep typed values and focus through EN/UR switching.
- Preserve useCreateManager success: clear old tenant caches, set authenticated identity only when sessionEstablished is not false, then navigate /choose-plan.
- If account exists but session delivery fails, show account-created/sign-in recovery without another signup or fake authenticated state.
- Remove help/contact/FAQ/support copy and placeholder footer links. Keep functioning sign-in and configured policy destinations.

## Explicit non-scope

- Auth/owner route redirects and session restoration → spec 59.
- First-party deployment transport → spec 48.
- Integrated signup browser proof → spec 62.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

Translations come from `frontend/src/i18n/billingTranslations.ts` through the existing language context, as published by spec47.

## Steps

1. Read the existing form and queries tests; restyle rather than introducing another registration flow.
2. Compose the shell with the account step; ensure local validation prevents empty/invalid submissions and server errors preserve values.
3. Keep the existing hook semantics and extend tests for the new form behavior, including language and durable-account/session failure.
4. Ensure no sample data or decorative illustration makes claims about an actual created workspace before signup succeeds.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/52-owner-signup-screen.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Signup/SignUpPage.test.tsx` passes: required/email/password validation, single pending submit, failure preserves draft, language preserves values/focus, no help/contact, sessionEstablished=false shows sign-in recovery. [unit]
- [x] `npm run test:components --prefix frontend -- src/pages/Signup/queries.test.tsx` passes: existing success→choose-plan, failed signup retains prior state, durable account with failed session never dispatches authenticated identity. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Signup/SignUpPage.tsx src/pages/Signup/SignUpPage.test.tsx src/pages/Signup/queries.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-07** — Started the next sequential unit after guide/tracker, approved account prototype, shell47/inventory and existing signup API/hook/tests review. Replaced only the existing form presentation with the billing setup shell; kept the four-field payload, RHF, exact six-character minimum, real mutation hook/session semantics and /choose-plan success. Added accessible local validation, synchronous duplicate guard, pending controls, safe server errors and accurate durable-account sign-in recovery without a second signup. No router/auth/backend rewrite or provider/UI mock card data.

Lead-scoped shared-owner completion: added one Urdu min-six-character validation string to billingTranslations.ts (47 complete, no concurrent writer), reusing all other existing translated copy. Initial full suite also identified one registration assertion in LoginPage.test.tsx naming the former public-shell brand link. Updated only that test description/link expectation to the real translated /login destination; login runtime behavior remains unchanged. This is a compatibility exception, not new login scope.

Focused signup/hook tests passed17 (13 screen +4 hook). They exercise actual useCreateManager with synthetic API responses and cover required/blank/invalid email/short password, six-character success and exact request, duplicate pending submit, safe/duplicate server error draft preservation, failed session no fake identity/repeated signup, successful old/new session receipt semantics, EN/UR form identity and focused input retention. Initial slow-submit test queried the original button label after it changed to Creating; retained the same DOM button reference for the second click to exercise real disabled behavior, then reran successfully.

Visual component preview used a temporary Vite virtual entry, no app route/file added. Inspected actual desktop1440, phone390, narrow Urdu320 and phone validation/recovery screenshots in /tmp/spec52-review; measured scrollWidth equal to viewport in all cases. Recovery used one intercepted synthetic signup receipt; no live account created. No support/contact/FAQ/placeholder policies rendered. Impeccable detector returned[]; independent finish review follows. This is not managed billing browser/provider/deployed acceptance. No external issue/PR bookkeeping performed by this request.

Initial `npm test --prefix frontend` reported634 passed/1 legacy-shell assertion failure; narrow test adaptation described above. Final focused/full/static/build evidence follows after rerun. Typecheck and owned-file lint passed before that test-only compatibility edit; final expanded checks follow.

**2026-11-07** — Expanded focused command including src/pages/Login/LoginPage.test.tsx exited0:28 tests (13 signup +4 hook +11 login/regression). Independent review found no signup material blocker but noted inherited placeholder contrast and account-first footer wording after durable-account recovery. Corrected both through owned component props/classes: existing --billing-muted placeholder color/opacity and shell footer slot after success, no shared CSS/brand/palette change. Final five captures replaced the initial preview captures and retain zero overflow. Measured placeholder rgb71/85/105 at opacity1 on white (contrast7.58:1). Added regression assertion that obsolete account-first footer is absent during recovery. No real signup/payment occurred; only the isolated intercepted recovery response was used.

**2026-11-07** — Final focused `npm run test:components --prefix frontend -- src/pages/Signup/SignUpPage.test.tsx src/pages/Signup/queries.test.tsx src/pages/Login/LoginPage.test.tsx` exited0:28 tests. Final `npm test --prefix frontend` exited0:81 Node tests +635 Vitest tests across41 files, no failures/skips. In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Signup/SignUpPage.tsx src/pages/Signup/SignUpPage.test.tsx src/pages/Signup/queries.test.tsx src/pages/Login/LoginPage.test.tsx src/i18n/billingTranslations.ts` exited0 with no diagnostics/warnings. `git diff --check` passed. Existing frontend-mobile module-type warning remains unrelated. Logs: /tmp/spec52-focused.log and /tmp/spec52-tests-final.log.

Independent review scored placeholder/footer fixes resolved and returned ship for the bounded screen, subject to remaining build. Documentation verification found inventory52/Log accurate and sufficient without changing root DESIGN.md/design.json or approved design. Temporary preview server stopped; no preview app route/config/file added. Final production build evidence follows. No operator/provider/deployment/account-data/Git mutation is performed by this unit.

**2026-11-07** — Final `npm run build --prefix frontend` exited0 (TypeScript + production Vite build, non-failing plugin-timing warning only). All required local checks passed; marked52 Done and recorded inventory52. No signup endpoint/hook/auth/guest-route/session schema change, live registration, actual provider/card payment, deployment, Git commit/push or history rewrite performed. Readiness/checkout and owner-route composition remain53–59; full deployed flow is not claimed complete. Next sequential unit53 consumes completed46/51.
