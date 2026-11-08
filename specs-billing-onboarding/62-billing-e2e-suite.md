# Spec 62 — Prove every owner billing flow in the managed browser suite

**Status:** Done
**Depends on:** Spec 60, Spec 61
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/e2e/sandbox-onboarding.spec.ts`, `frontend/e2e/billing-v5.spec.ts`, `frontend/e2e/billing-onboarding.spec.ts`, `frontend/e2e/customer-auth-v5.spec.ts`, `frontend/e2e/fixtures.ts`, `frontend/e2e/run.mjs`, `frontend/e2e/README.md`, `frontend/playwright.config.ts`, `specs-billing-onboarding/inventory/62-billing-e2e-suite.md`
**Reuses:** `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingPaymentPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingActivationPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingAccountPage.tsx`, `frontend/src/pages/Subscription/onboarding/BillingRecoveryPage.tsx`, `backend/tests/billingLifecycle.integration.ts`, `INVENTORY.md#browser-harness`

## Goal

Write and run the one integrated browser acceptance boundary for this feature, preserving isolated real signup/session and explicitly labelled provider fixtures.

## Scope

- Reuse installed Playwright and the existing managed child-database/app bootstrap; no second harness installation or attaching to an existing/live database.
- Keep billing-disabled server default and fixture tokens. Enabled/provider browser behavior is explicitly mocked at the current SDK/API seam; never claim those responses prove backend payment persistence.
- Use role/label locators, web-first assertions, generated synthetic owners and actual reloads. Cover EN/UR and320/390/768/1366/1440 where layout matters, plus actual200% browser zoom or document the unsupported check.
- Update old billing/signup tests only for intentional route/copy/DOM changes; retain tenant, portal, uncertain outcome, over-limit data, restricted account and actual period-negative checks.
- Disable credential-bearing traces/screenshots; retain sanitized diagnostics for noncredential failures. Keep all no-production/bootstrap/cleanup guards.
- This is the longer mechanical test spec; the coverage table below is the contract. Real provider delivery remains separate external acceptance.


| Flow | User path | Built by specs | Required assertion / boundary |
| --- | --- | --- | --- |
| F01 | New owner signup with valid session; reload and sign-in preserve owner/company | 52,59 | Real isolated signup/session; stored owner/company checked |
| F02 | Durable account but failed session delivery | 52,59 | Sign-in recovery; no second signup/fake authenticated identity |
| F03 | Invalid/duplicate signup and slow double submit | 52 | Draft retained, inline errors and one mutation |
| F04 | New owner chooses each plan and month/year | 50,54 | Actual fixture capacities/prices/currency and valid selected navigation |
| F05 | Partial/empty/error/slow catalog and successful retry | 51,54 | No fabricated amount; preserved selection/focus and explicit availability |
| F06 | SDK config absent or browser/server environment mismatch | 46,53 | Zero checkout POST; actionable refresh without contact UI |
| F07 | Unverified sandbox owner can proceed; production counterpart cannot bypass gates | 49,53 | Sandbox UI fixture and backend unit/SQL policy separately labelled |
| F08 | Double checkout click and overlay close/reopen | 53,55 | One mutation/transaction; same transaction reopened |
| F09 | Prepared server draft survives page reload/sign-out/sign-in | 49,53,55 | Exact server-proven plan/interval resumes; no provider ID trusted from URL |
| F10 | Existing unresolved plan cannot silently change after preparation | 49,53,55 | No replacement purchase; original draft retained |
| F11 | Card decline in SDK fixture | 53,55 | Error visible, selected plan retained, no workspace grant |
| F12 | POST response lost,409 and unresolved reservation | 49,53,58 | Status-first recovery; no second checkout |
| F13 | Completion event/return URL before subscription delivery | 53,56,59 | Pending only; browser success cannot unlock workspace |
| F14 | Delayed current server permission and refresh/reload | 49,51,56 | Only explicit server-ready unlocks Open workspace |
| F15 | Transient poll failure, reconnect/focus, timeout and manual recovery | 51,56 | Bounded attempts, no permanent first-error stop, no repeated mutation |
| F16 | Active/trialing but future/expired/missing period, foreign or unqualified price | 49,50,56 | Server-denied permission never becomes ready |
| F17 | Administrative suspension or legacy inactive company | 49,58,59 | No operations; billing/security/refresh remain, no support promise |
| F18 | Existing subscriber and canceled/past-due/paused state | 50,57,59 | Settings/portal view, no fresh subscription purchase |
| F19 | Actual usage above plan limit | 50,57 | Full counts after reload; no record deletion or numeric clamp |
| F20 | Missing existing price/period and scheduled cancellation | 49,57 | No invented amount/date; truthful provider facts/portal fallback |
| F21 | Portal request success, outage and untrusted URL | 49,51,57 | Only fresh approved HTTPS host navigates once |
| F22 | Guest/manager/staff and cross-tenant IDs | 49,59 | Owner-only endpoints/screens; tenant injection and old caches cannot win |
| F23 | Owner changes while checkout/status request is pending | 46,51,53 | Old response/event cannot open overlay or authorize new principal |
| F24 | Choose-plan/welcome/subscription deep links and forced password reset | 59 | Compatible route behavior; session/security restoration has priority |
| F25 | Stale lazy chunk during billing navigation | 46,59 | Existing bounded module recovery, no infinite reload |
| F26 | EN/UR switch while form/plan/payment is in progress | 47,52,54,55 | Draft/selection/focus preserved; numeric ratios/amounts isolated |
| F27 | Keyboard radios, interval actions, modal Escape and reduced motion | 46,47,53,54 | Visible focus/selection; Escape restores opener; no reading motion |
| F28 | 320/390/768/1366/1440 and desktop200% zoom | 47,54,55,56,57,58 | No horizontal page overflow/clipped action; phone CTA does not cover content |
| F29 | No unsupported Help/Contact/support/FAQ entry points | 47,52,54,55,56,57,58,59 | Absent controls/copy across all new states including owner gate |
| F30 | Same-origin API routing contract and secure session reload | 48,59 | Local routing contract plus separate real Netlify cookie qualification |

| F31 | Exact reported new-owner route/layout chain | 52,54,55,56,59 | Real signup → standalone plan/payment/activation with no operational sidebar; dashboard only after explicit fresh permission; unpaid /dashboard deep link returns to setup |
| F32 | Empty-options regression during409/response loss/reconciliation | 51,54,58,59 | Explicit explanation/status refresh, no blank panel or second POST; fixture distinguishes local uncertainty from server hold |
| F33 | Neighboring operational/security routes after route move | 59 | Existing subscriber and manager/staff navigation, forced-password recovery and unrelated help/security remain compatible |

Exercise the real route composition in `frontend/src/pages/Subscription/onboarding/billingRoutes.tsx`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/routes/workspaceRoutes.tsx`, `frontend/src/routes/workspacePages.tsx`, `frontend/src/pages/Pricing/ChoosePlanPage.tsx`, `frontend/src/pages/Pricing/WelcomePage.tsx` and `frontend/src/components/onboarding/WorkspaceGate.tsx`; their aliases/role/security behavior must be asserted, not merely their components imported.

## Explicit non-scope

- Application defects → spec 59; reopen its actual code-owning dependency rather than edit application source here.
- Real deployed sandbox test-card/webhook acceptance → spec 63.
- Production payment/trial-policy additions → spec 44.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Map each acceptance row to at least one independent test and state whether its provider/lifecycle boundary is mocked or real.
2. Adapt existing sandbox-onboarding/browser fixtures for new fields, selected interval, server permission and current routes; no active-status-only success fixture.
3. Add missing flow coverage from the table using real signup/session and controlled SDK/network faults; preserve fresh context/SQL fixture cleanup.
4. Run focused billing files through npm run test:e2e --prefix frontend with the explicit isolated bootstrap, then the full managed browser suite.
5. An app bug is assigned to its owner or a new repair spec; keep the e2e and final verification as the last two units when numbers change. No test skip/expected-failure masks.
6. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/62-billing-e2e-suite.md`; append a dated Log only when work starts.

## Done when

- [x] Every one of the33 local flow table rows maps to a browser test; provider-mocked versus real-server/SQL behavior is documented without a false persistence claim. [static]
- [x] Focused billing files and `npm run test:e2e --prefix frontend` full managed suite pass with real counts and no skipped billing regression. [e2e]
- [x] Harness guards/cleanup and generated-child-only database safety remain verified; app defects name an owner/repair spec. [static]
- [x] `npm exec --prefix frontend -- tsc -p frontend/e2e/tsconfig.json` and `npm exec --prefix frontend -- tsc -b frontend/tsconfig.json` pass; in frontend/, `npm exec -- eslint --max-warnings 0 e2e/sandbox-onboarding.spec.ts e2e/billing-v5.spec.ts e2e/billing-onboarding.spec.ts e2e/customer-auth-v5.spec.ts e2e/fixtures.ts playwright.config.ts` passes. [static]
- [x] `npm run build --prefix backend` and `npm run build --prefix frontend` pass. [static]

## Log

**2026-11-08** — Started managed browser coverage with owned localhost priv_e2e_test bootstrap; existing runner creates/drops generated children and never attaches to application data. New explicit provider fixture helper retains real auth and labels mocked lifecycle/checkout/SDK behavior. Migrating obsolete billing/signup selectors to approved standalone UI while retaining real SQL/read/security cases. No deployed-provider proof claimed.

**2026-11-08** — Clean focused managed command passed60 tests (four billing/auth files) from /tmp/billing-clean, zero skipped billing cases. SDK fixture now models official Initialized state/callbacks; canceled forwarded request races removed by reusing initial real authenticated base facts before explicit fixture responses. Scope/fixtures are documented; no actual provider processing claim. Clean full suite171 is running after migration of legacy assertions.

Lead-approved test-only compatibility boundaries beyond original paths: lifecycle.spec.ts (new standalone route/real logout; restores original synthetic staff password and advances revocation after one-use recovery), workspace.spec.ts/runtime-data.spec.ts (current billing labels/markup), setup-v5.spec.ts (past-due historical read-only state and explicitly persisted eligible empty-owner fixture), public.spec.ts/v5-visual.spec.ts (incumbent public/operator/handoff labels), shell-v5.spec.ts (actual saved SQL company name), runtime-data.spec.ts (exact queue request/review ID rather than ambiguous same-area rows). No unrelated production app source changed. All protections/assertions retained; no failure converted to skip/expected failure.

**2026-11-08** — Completed local browser unit: clean four-file focused suite60 passed; full managed suite170 passed/1 unrelated opt-in local-platform skip (171 tests,11.7m). No skipped/expected-failure billing case. Source current171 includes all33 mapped flows. E2E/application typechecks, scoped ESLint including every test-only compatibility file, and both package builds passed. Logs /tmp/billing-clean-focused.log, /tmp/billing-clean-full-final.log, /tmp/billing-final-lint.log, /tmp/billing-final-e2e-types.log and clean build logs. Backend fulfillment refinement subsequently verified in owner49/SQL60 with1604 unit tests; final63 post-refinement browser repeat is underway.

No harness guard/production default changed. Generated child databases only; cleanup checked after each completed run. First full diagnostic run exposed stale preexisting labels/ambiguous selectors/shared fixture credentials and saved-name assumptions; corrected tests preserve actual assertions rather than changing unrelated app behavior. Subsequent clean full run has zero failures. Native browser-chrome zoom is not automated here: CSS200% reflow is exercised, with native/deployed acceptance separately stated. Live verification was deferred by the user.

**2026-11-08** — Final51 timing refinement adds the automatic delayed-provider-permission browser case; clean focused suite61 passed. Current full172-test run includes that case; no further app changes planned. Previous complete170/1 optional-skip passes remain recorded as historical runs, not substituted for the current run.

**2026-11-08** — Final post-refinement clean full managed run exited0:171 passed,1 unrelated optional operator skip,0 failures/0 skipped billing cases;172 total,11.9m. Focused61 also passed. No app/test source changed after this run. Log /tmp/billing-final-full.log.
