# Spec 59 — Compose owner routes, aliases and workspace gates

**Status:** Done
**Depends on:** Spec 52, Spec 54, Spec 55, Spec 56, Spec 57, Spec 58
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/src/pages/Subscription/onboarding/billingRoutes.tsx`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/routes/workspaceRoutes.tsx`, `frontend/src/routes/workspacePages.tsx`, `frontend/src/pages/Pricing/ChoosePlanPage.tsx`, `frontend/src/pages/Pricing/WelcomePage.tsx`, `frontend/src/pages/Subscription/SubscriptionPage.tsx`, `frontend/src/pages/Subscription/SubscriptionPage.test.tsx`, `frontend/src/components/onboarding/WorkspaceGate.tsx`, `frontend/src/components/onboarding/WorkspaceGate.test.tsx`, `frontend/src/pages/Subscription/onboarding/billingRoutes.test.tsx`, `specs-billing-onboarding/inventory/59-owner-billing-routing.md`
**Reuses:** `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingAccountPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx`, `frontend/src/pages/Signup/SignUpPage.tsx`, `frontend/src/pages/Signup/queries.ts`, `INVENTORY.md#aliases-and-gate`

## Goal

Mount the finished owner screens as a coherent standalone flow while preserving current authentication, role/security recovery and legacy links.

## Scope

- Keep /choose-plan, /subscription and /welcome compatible; register owner-only payment/activation/recovery children under /subscription with clear URL selection rules.
- Make /choose-plan open real selection for eligible new owners and route linked owners to /subscription account billing. /welcome always refreshes provider facts, never treats its URL as payment proof.
- Keep onboarding/billing outside PublicLayout marketing nav and DashboardLayout operational/help chrome, while retaining App session restoration and forced-own-password-change enforcement.
- Preserve signup→choose-plan and durable-account/sign-in recovery. Never redirect while current-user is still loading or turn manager/staff into owner access.
- Use current lifecycle state to resume an unfinished owner; retain historical subscriber READ_OPERATIONAL policy and restricted-company security/billing access.
- Remove Help/Contact links/support copy from the owner-access gate and new billing composition. Do not delete unrelated global /help routes, APIs or dashboard functionality.

- Assert the full new-owner chain: existing signup success → /choose-plan outside operational chrome → payment → activation → dashboard only after fresh server permission. Direct /dashboard visits by new unpaid owners resume onboarding. Keep this subtree out of DashboardLayout rather than merely hiding sidebar CSS; preserve operational layouts for existing subscribers/managers.

## Explicit non-scope

- Screen implementation bugs → spec 54.
- Session proxy/deployment configuration → spec 48.
- Whole-browser regression and legacy test updates → spec 62.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read main/App/workspace routing and the current SubscriptionPage tests before moving route ownership.
2. Replace the monolithic billing page with a thin lifecycle/view-state composition of the completed screens; retain compatibility props only where current imports need them.
3. Publish a thin importable billingRoutes.tsx route module for unit tests instead of importing main.tsx and its createRoot side effect. Mount owner setup/payment/confirmation routes under App auth but outside operational layout; keep one route owner for aliases and lazy page exports.
4. Update component route/gate tests to assert the new transitions and preserve all tenant/role/session/uncertain/period-negative cases from the old tests.
5. Verify the route subtree contains no help/contact control and that own-security/refresh remain reachable during failure/suspension.
6. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/59-owner-billing-routing.md`; append a dated Log only when work starts.

## Done when

- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/onboarding/billingRoutes.test.tsx` passes: guest waits/redirects correctly; new owner→choose-plan/payment; linked owner→account; welcome alone pending; ready click→dashboard; invalid selection safe; force-password-change wins. [unit]
- [x] `npm run test:components --prefix frontend -- src/components/onboarding/WorkspaceGate.test.tsx` passes: new/unresolved owner resumes billing; historical expired record retains permitted reads; suspended/foreign/error blocks operations with billing/security/refresh only; manager/staff unaffected. [unit]
- [x] `npm run test:components --prefix frontend -- src/pages/Subscription/SubscriptionPage.test.tsx` passes: old security/action regressions preserved under thin composition; SDK config failure0POST, stale/uncertain actor no new purchase, portal validation and true server readiness. [unit]
- [x] Route/gate tests prove unpaid-owner deep-link/reload resumes standalone onboarding with no operational navigation; no dashboard is mounted before current permission. Existing subscribed-owner operational reads, manager/staff, forced password change and security routes retain prior behavior. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] In frontend/, `npm exec -- tsc -b` and `npm exec -- eslint --max-warnings 0 src/pages/Subscription/onboarding/billingRoutes.tsx src/main.tsx src/App.tsx src/routes/workspaceRoutes.tsx src/routes/workspacePages.tsx src/pages/Pricing/ChoosePlanPage.tsx src/pages/Pricing/WelcomePage.tsx src/pages/Subscription/SubscriptionPage.tsx src/pages/Subscription/SubscriptionPage.test.tsx src/components/onboarding/WorkspaceGate.tsx src/components/onboarding/WorkspaceGate.test.tsx src/pages/Subscription/onboarding/billingRoutes.test.tsx` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-08** — Started standalone route composition and compatibility tests while completing screen verification. Maintains App session/password enforcement and server policy.

**2026-11-08** — Completed standalone App-restored owner routes. Signup, choose-plan, subscription/payment/activation/recovery and welcome use approved shells outside marketing/dashboard chrome. Workspace gate executes before operational layout; new unpaid owners resume billing, historic subscriber reads remain, suspension/foreign/error blocks retain billing/security/refresh. Guest loading and forced password enforcement preserved.

Focused route/page/gate/workspace regression command passed83 tests/4 files; page/query/gate/route run additionally exercised15 query cases. `VITEST_MAX_WORKERS=4 npm test --prefix frontend` passed81 Node +744 Vitest/48 files. Frontend `npm exec -- tsc -b`, required owned-file ESLint plus compatibility tests/query file and `npm run build` passed0. Logs /tmp/spec59-regression.log, /tmp/spec59-full-final.log, /tmp/spec59-build.log. No real provider/deployed acceptance claimed.

Lead-approved narrow compatibility updates outside original ownership: launchPages.test.tsx mounts actual standalone billing routes and identifies its operational owner as server-preserved legacy; LoginPage.test.tsx expects signup's /choose-plan destination. Runtime login/dashboard unchanged. Query51 lifecycle now sets retryOnMount:false: real failed lifecycle plus recovery remount had otherwise retriggered error requests indefinitely; explicit manual refresh/focus/reconnect/bounded polling remain. Covered by foreign-error integrated test and existing query suite. Migration of monolith tests preserves action/tenant/SDK/environment/uncertainty/portal/return negatives through integrated cases and dedicated38 controller,17 account,15 activation,12 recovery tests, replacing obsolete help-rail/layout assertions. No feature logic is duplicated in the composer.

**2026-11-08** — Final review refinement assigned to59: early unknown mirrored subscription cannot count as historical operational READ. WorkspaceGate first honors true server permission, otherwise resumes onboarding for explicit required/unknown states; thin composition renders confirmation for unknown records. Added gate/page/browser regressions. Clean full frontend suite now81 Node +747 Vitest passed, with23 gate tests. No server access-policy change.
