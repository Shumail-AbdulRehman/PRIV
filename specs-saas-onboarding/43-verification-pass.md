# Spec 43 — Verification pass

**Status:** Not started
**Depends on:** Spec 00, Spec 01, Spec 02, Spec 03, Spec 04, Spec 05, Spec 06, Spec 07, Spec 08, Spec 09, Spec 10, Spec 11, Spec 12, Spec 13, Spec 14, Spec 15, Spec 16, Spec 17, Spec 18, Spec 19, Spec 20, Spec 21, Spec 22, Spec 23, Spec 24, Spec 25, Spec 26, Spec 27, Spec 28, Spec 29, Spec 30, Spec 31, Spec 32, Spec 33, Spec 34, Spec 35, Spec 36, Spec 37, Spec 38, Spec 39, Spec 40, Spec 41, Spec 42
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `specs-saas-onboarding/INVENTORY.md`
**Reuses:** `ARCHITECTURE.md#invariants`, `DESIGN-SYSTEM.md`

## Goal

The final gate. Prove from a clean state that what this spec set promised is true, and record every place it was not. This spec observes and reports. It does not fix.

## Scope

- Clean install from lockfiles in `backend` and `frontend`, then types, lint and build.
- Whole unit suites and the whole end-to-end suite in one run.
- Re-check every earlier `Done when` against the real result.
- Fold `inventory/*.md` into `INVENTORY.md`, then remove the fragments.
- Duplication sweep, invariant check and token check.
- Compare each screen at 1440 and 390px against `design/saas-onboarding/v3`.
- List items deliberately left for later: a shared rate-limit store for multiple servers, mobile session refresh loss, Docker Compose Paddle settings, new APK build, and limits on the billing POST routes.

## Explicit non-scope

- Fixing anything found. Each finding becomes its own numbered spec appended to `README.md` and `PROGRESS.md` → spec 43.
- New features → spec 43.

## Steps

1. Clean install, then types, lint and build, recording real output.
2. Run both suites.
3. Walk every spec's `Done when`.
4. Fold the inventory and sweep for duplicates, raw colours outside `flow.css`, and any remaining trial wording.
5. Check each invariant in `ARCHITECTURE.md` against the code.
6. Record everything in the Log with real numbers, and file follow-ups.

## Done when

- [ ] Clean install, types, lint with 0 errors and 0 warnings, and build all pass. [static]
- [x] Whole unit suites and whole e2e suite pass from clean; real counts in the Log. [suite]
- [x] Every inventory fragment is folded into `INVENTORY.md`. [static]
- [x] Every earlier `Done when` is re-checked and the result recorded. [static]
- [x] Duplication sweep run; findings in the Log. [static]
- [x] Every invariant is checked against the code. [static]
- [ ] No raw colour exists outside `flow.css`, and no token is used that is not listed. [static]
- [x] Real sandbox results are stated separately, and nothing claims a real payment that did not run. [static]
- [x] Every finding has a follow-up spec or a line saying why it is accepted. [static]

## Log

### 2026-11-10 — Clean verification and consolidated inventory

Completed the observation/reporting pass on the assembled specs 00–42 and `fixes/e2e-bug-fixes.md`. No application code, tests, dependency manifests, lockfiles or schema files were changed. Status, README and PROGRESS remain unchanged. No numbered follow-up specs, issues, PRs, git commits, branch operations, pushes, merges or deployments were made. Each entry under Findings is its follow-up under the user's override.

#### Commands and real results

Removed only the two worktree-local `frontend/node_modules` and `backend/node_modules` symlinks using `rm` without `-r`, after confirming both were links. Their targets were untouched. Both installs now reside in real directories in this worktree.

| Command | Result in this session |
|---|---|
| `cd frontend && npm ci` | Exit 0; 705 packages added, 706 audited. One deprecation warning; 41 audit vulnerabilities: 2 low, 18 moderate, 20 high, 1 critical. |
| `cd backend && npm ci` | Exit 0; 514 packages added, 515 audited. Six deprecation warnings; 35 audit vulnerabilities: 1 low, 9 moderate, 22 high, 3 critical. |
| `cd backend && npx tsc --noEmit -p tsconfig.json` | Final exit 0, 0 errors/warnings after Prisma client generation by the backend build. The initial pre-generation invocation exited 2 with 513 diagnostics; see Findings. |
| `cd frontend && npx tsc -b --noEmit` | Exit 0, 0 errors/warnings. |
| `npm run lint --prefix frontend` | Exit 0, 0 errors/warnings. Backend has no lint script. |
| `npm run build --prefix backend` | Exit 0; generated Prisma Client 7.5.0, then compiled TypeScript. No migration command ran. |
| `npm run build --prefix frontend` | Exit 0; Vite 8.0.1 production build. Existing nonfatal `PLUGIN_TIMINGS` warning. |
| `npm test --prefix backend` | Exit 0: **2,543 passed, 0 failed, 7 skipped**; 113 passed files, 1 skipped file, 114 discovered. 237.25 seconds reported by Vitest. |
| `npm test --prefix frontend` | Exit 0: Node **96 passed, 0 failed, 0 skipped**; Vitest **2,347 passed, 0 failed, 0 skipped**, 60 files. Vitest duration 369.09 seconds. |
| `cd backend && npx tsx tests/billingLifecycle.integration.ts` | Exit 0: **27 passed, 0 failed, 0 skipped**, actual approved disposable PostgreSQL, injected no-network provider. No migrations or schema setup were needed for this already prepared database. |
| `HYGENE_E2E_DATABASE_URL=<approved isolated bootstrap> npm run test:e2e --prefix frontend` | Exit 0: **195 passed, 0 failed, 0 flaky, 1 skipped**, **196 discovered**, headless, retries **0**; Playwright **15.8 minutes**, complete runner wall time **1,063.1 seconds** including setup/build/cleanup. |
| `python3 .ai/plan-project/scripts/validate-specs.py specs-saas-onboarding` | Exit 0: **44 specs, 0 errors, 96 nonblocking warnings** after adding this Log; warning classes and acceptance reasons are recorded below. |
| `git diff --check` and final scope check | Passed after E2E completed and `git checkout -- docs/implementation` restored generated tracked screenshots/JSON. Only this spec, INVENTORY and the removed inventory fragments differ; no source/test/lockfile or other application changes. |

Whole unit commands used bounded CPU affinity (backend CPUs 0–1, frontend CPUs 2–3), preserving the package commands and normal discovery. Static checks and the managed E2E run used the remaining CPUs. There were no failed/interrupted whole unit attempts and no test edits. Their Node unit run emitted the existing mobile-translation `MODULE_TYPELESS_PACKAGE_JSON` warning. The E2E backend emitted the existing pg concurrent-query deprecation notice; its controlled batch-rollback case also emitted an expected allowlisted DriverAdapterError/500 log and passed.

Every non-database command used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none`, the same deliberately unusable `DIRECT_URL`, and `DOTENV_CONFIG_PATH=/dev/null`. Verification launchers under `/tmp/hygene-spec43-verification/` construct an allowlisted child environment: other database/provider credentials are excluded. A Node preload prevents private `.env` reads and propagates that restriction plus `/dev/null` dotenv configuration into E2E child processes. No `.env` file was read, secret printed or real Paddle called.

Only the E2E command received the approved `HYGENE_E2E_DATABASE_URL`. Its existing managed runner creates, initializes from the existing SQL fixtures/migration files, and drops a fresh UUID child of that isolated local bootstrap. This is test-harness setup, with no application migration command, migration deployment or real database access. The standalone SQL command received only the separately approved `BILLING_LIFECYCLE_TEST_DATABASE_URL`. It refuses real provider transport and uses injected provider operations. No other database was selected. Playwright browsers were already available; no browser installation was necessary.

#### Earlier Done when audit

Read all **221 criteria across 43 earlier specs (00–42)**. The **46 referenced focused Vitest files** all ran inside the whole suites above; the counts below are actual per-file results from those runs, not copied historic totals. Brand/preflight Node checks ran inside the 96-test Node suite. Repeated whole-suite/type/lint/build requirements share the command results above; they were not rerun dozens of times. Every earlier inventory requirement was checked before folding, and its entire source body is now in `INVENTORY.md`. Earlier checkboxes and Status lines were not edited.

The table records the local result and the exceptions for every spec. A unit pass does not assert visual fidelity, deployment readiness or real payment. No historical provider command was repeated: those criteria were rechecked against dated evidence, with current real-provider validation explicitly left outside authorization. Literal global zero-warning/colour claims are not asserted; their findings remain below.

| Spec | Criteria inspected | Focused tests passed in whole suites | Other acceptance result |
|---|---:|---|---|
| 00 | 2 | — | Decisions agree with architecture; approved v3 record and local prototype inspected. |
| 01 | 6 | `billingContract.test.tsx` 128 | Local criteria rechecked; inventory folded; shared verification passed. |
| 02 | 6 | `operationalLog.test.ts` 26; `launch.route.test.ts` 60 | Local criteria rechecked; inventory folded; shared verification passed. |
| 03 | 5 | `FlowShell.test.tsx` 28 | Local criteria rechecked; inventory folded; shared verification passed. |
| 04 | 5 | `onboardingTranslations.test.tsx` 204 | Local criteria rechecked; inventory folded; shared verification passed. |
| 05 | 5 | 7 Node | Brand Node checks: 7 passed; complete SVG, PNG dimensions and adaptive safe zone. |
| 06 | 5 | `onboardingRoutes.test.tsx` 142 | Local criteria rechecked; inventory folded; shared verification passed. |
| 07 | 5 | `checkoutMachine.test.tsx` 650 | Local criteria rechecked; inventory folded; shared verification passed. |
| 08 | 5 | `billingProvider.test.ts` 78 | Local criteria rechecked; inventory folded; shared verification passed. |
| 09 | 5 | `billingReservations.service.test.ts` 145 | Local criteria rechecked; inventory folded; shared verification passed. |
| 10 | 5 | `billingOnboardingStep.test.ts` 120 | Local criteria rechecked; inventory folded; shared verification passed. |
| 11 | 5 | `authRateLimit.test.ts` 27 | Local criteria rechecked; inventory folded; shared verification passed. |
| 12 | 6 | `billingRequest.test.tsx` 18; `api.test.tsx` 42 | Local criteria rechecked; inventory folded; shared verification passed. |
| 13 | 5 | `paddle.test.tsx` 42 | Local criteria rechecked; inventory folded; shared verification passed. |
| 14 | 6 | `paddleSandboxProbe.test.ts` 24 | Historical dated real probe evidence inspected; no provider call repeated. See Sandbox evidence and Findings. |
| 15 | 5 | `billingCatalog.service.test.ts` 45 | Local criteria rechecked; inventory folded; shared verification passed. |
| 16 | 6 | `paddleTrialRemoval.test.ts` 23 | Historical six-price trial-clear readback inspected; no provider call repeated. |
| 17 | 5 | `billingCustomer.service.test.ts` 48 | Local criteria rechecked; inventory folded; shared verification passed. |
| 18 | 5 | `paddleFulfillment.service.test.ts` 64 | Local criteria rechecked; inventory folded; shared verification passed. |
| 19 | 5 | `companyRegistration.service.test.ts` 30 | Local criteria rechecked; inventory folded; shared verification passed. |
| 20 | 5 | `login.service.test.ts` 45 | Local criteria rechecked; inventory folded; shared verification passed. |
| 21 | 5 | `useCheckoutSession.test.tsx` 43 | Local criteria rechecked; inventory folded; shared verification passed. |
| 22 | 5 | `useCheckoutConfirmation.test.tsx` 40 | Local criteria rechecked; inventory folded; shared verification passed. |
| 23 | 6 | `App.test.tsx` 27; `client.test.tsx` 32 | Local criteria rechecked; inventory folded; shared verification passed. |
| 24 | 5 | `OrderSummary.test.tsx` 20 | Local criteria rechecked; inventory folded; shared verification passed. |
| 25 | 5 | `PaddleCheckoutFrame.test.tsx` 6 | Local criteria rechecked; inventory folded; shared verification passed. |
| 26 | 5 | `billingCheckout.service.test.ts` 77 | Local criteria rechecked; inventory folded; shared verification passed. |
| 27 | 5 | `billingConfirm.service.test.ts` 83 | Local criteria rechecked; inventory folded; shared verification passed. |
| 28 | 5 | `billingReconcile.service.test.ts` 80 | Local criteria rechecked; inventory folded; shared verification passed. |
| 29 | 5 | `LoginPage.test.tsx` 27 | Local criteria rechecked; inventory folded; shared verification passed. |
| 30 | 5 | `SignUpPage.test.tsx` 20; `queries.test.tsx` 8 | Local criteria rechecked; inventory folded; shared verification passed. |
| 31 | 5 | `AccountPages.test.tsx` 32 | Local criteria rechecked; inventory folded; shared verification passed. |
| 32 | 5 | `launchPages.test.tsx` 30 | Local criteria rechecked; inventory folded; shared verification passed. |
| 33 | 5 | `BillingPlanPage.test.tsx` 32 | Unit contract passes; browser review found desktop grid, Urdu-copy and sticky-bar defects. See Findings. |
| 34 | 6 | `PaddlePricing.test.tsx` 21 | Case-insensitive production-source scan found no “free trial” or “any trial”; historical Trialing accepted. |
| 35 | 5 | `BillingActivationPage.test.tsx` 46 | Local criteria rechecked; inventory folded; shared verification passed. |
| 36 | 5 | `billingLifecycle.service.test.ts` 125 | Local criteria rechecked; inventory folded; shared verification passed. |
| 37 | 5 | `BillingPaymentPage.test.tsx` 62 | Local criteria rechecked; inventory folded; shared verification passed. |
| 38 | 5 | `BillingRecoveryPage.test.tsx` 26 | Local criteria rechecked; inventory folded; shared verification passed. |
| 39 | 5 | `billingLifecycle.route.test.ts` 29 | Local criteria rechecked; inventory folded; shared verification passed. |
| 40 | 5 | `FlowEntry.test.tsx` 33; `WorkspaceGate.test.tsx` 51; `SubscriptionPage.test.tsx` 25; `billingRoutes.test.tsx` 90 | Local criteria rechecked; inventory folded; shared verification passed. |
| 41 | 5 | 8 Node | Preflight Node checks: 8 passed; runbook inspected. Live settings/Compose/APK remain unverified. |
| 42 | 7 | — | E2E 195 passed / 0 failed / 1 optional skip; SQL 27 passed; all 57 flow rows mapped. Real cards open; external FIX-1/2/3 record supersedes numbered-fix requirement. |

External fixes rechecked: `BillingPaymentPage.test.tsx` **62** plus `BillingPlanPage.test.tsx` **32** = **94 passed**; `login.service.test.ts` **45 passed**; `launch.route.test.ts` **60 passed**, including the CORS exposure wiring. All three enabled browser regressions passed: `S42-24 change plan before paying cancels the old draft`, `S42-14 login deactivated displays the correct message`, and `S42-14 login limited displays the correct message`. Neither of the two owned browser test files contains `test.fixme` or `FIX-1`/`FIX-2`/`FIX-3` labels. The fix document's whole suites, types, lint and build requirements are covered by the clean command results above. No test-only scope exception was used in this pass.

#### Inventory, duplication, copy and tokens

Wrote `inventory/43-verification-pass.md`, then folded it together with all 42 existing fragments. **43 complete fragment bodies / 102,733 source bytes** were checked for inclusion before removing the source fragments; **0 Markdown fragments remain**. The consolidated inventory supplies a current integration map, full provenance filenames and an explicit rule that staged-integration notes and old verification counts are historical. In particular, lifecycle delegates to the shared services, the overlay hook is gone, settings alone retain `BillingSetupLayout`, and the external fixes supersede their earlier integration notes. The spec-43 fragment is preserved in the consolidated `Source 43-verification-pass.md` record.

Ran a duplication sweep across **34 non-test billing/onboarding/SDK modules**, checking exact repeated six-line windows and then reviewing architecture-level near matches. The only **3 exact cross-file windows** are overlapping import lists in `BillingPlanPage.tsx` and `BillingPaymentPage.tsx`; accepted as imports. There is one route map, provider gateway, reservation implementation, checkout controller, frame component, confirmation hook and money formatter. Six local `ownerAccount` helpers repeat the principal lookup with different selected fields/operation guards; accepted for now to preserve operation-specific revalidation. No duplicate implementation of checkout/reconciliation/fulfilment was found. Legacy CSS and unused strings are listed under Findings.

The scoped token scan inspected **36 production files** in Onboarding, Subscription/onboarding, Login, Signup, Account and the staff handoff. All **27** `--flow-*` declarations and every CSS/Tailwind reference are listed in `DESIGN-SYSTEM.md`, with **0 undefined or unlisted flow tokens**. New FlowShell screens contain no raw colour outside `flow.css`; retained `billing-setup.css` has **18** raw colour declarations and its separate `--billing-*` tokens. A broad source sweep found **406 raw-colour matching lines in 10 production files** outside `flow.css`, largely pre-existing workspace/marketing palettes. Therefore the literal repository-wide colour criterion is false and its box remains unticked, with the scoped legacy exception documented below.

Case-insensitive production-source searches for `free trial` and `any trial` found **0 matches**. Remaining `trial` occurrences are the historical `Trialing` status/access rules; compatibility metadata/parser comments; the nonvisible `plan-trial` class; and the unused `Provider trial` translation. New purchase trials are refused at the server. These are not evidence of a new trial offer.

#### Architecture invariants checked against code

| # | Result | Evidence and boundary |
|---|---|---|
| 1 | Pass | `paddleFulfillment.service.ts` owns `syncCompanyAccess` and shared `applyPaddleSubscription`; `billingConfirm.service.ts` verifies the exact saved transaction/subscription before entering it. Browser completion only routes/polls. Fulfilment/confirm unit tests and SQL event-order/access cases passed. |
| 2 | Pass | `billingLifecycle.route.ts` mounts JWT + ADMIN checks and strict owner-only bodies; services re-read active owner/company and lock before writes. Body/URL cannot select a tenant. Route, foreign-company and manager/staff-denial tests passed. |
| 3 | Pass, controlled boundary | Production app supplies a stable provider frame, never app-owned card inputs or stored card data. The visible sandbox number is a public fixture; controlled E2E iframe inputs are test-only. Real Paddle input/privacy behaviour was not exercised. |
| 4 | Pass | `reserveBillingOperation` refuses unresolved/in-progress holds; checkout reuses or proves cancellation before a new reservation. `UNCERTAIN` never writes FAILED. Gateway deadlines, lost-response and SQL concurrency/replacement cases passed. |
| 5 | Pass in billing flow | Reservation helpers append through `writeAuditLog`; no billing audit update/delete. Existing unrelated deletion code filters operational entities/MANAGER actors, whereas billing facts use `BILLING_OPERATION`/ADMIN. SQL replacement preserves prior rows; rollback cases passed. |
| 6 | Pass | Customer/reconcile adoption requires exhaustive unique active exact email, safe canonical/mirror ownership and sandbox-or-verified authorization, rechecked under lock. Foreign/archived/uncertain cases passed. Exact email is case-insensitive as the signup identity contract specifies. |
| 7 | Pass | `billingCatalog.service.ts` rejects any non-null trial metadata before checkout, validates active price/product/interval and caches successful facts only. Trial metadata is ignored only by compatibility display parsing. Catalog/SQL refusal tests passed; historic trialing access is retained. |
| 8 | Pass | Gateway and mismatch paths use `operationalLog`'s allowlist and fixed classification/code fields. Raw errors, payloads, customer identity and card data are excluded. Logger/provider redaction tests passed; no secret was printed during verification. |
| 9 | Pass | Controller dispatches `frameLoaded` only for normalized matching `checkout.loaded`; SDK open resolution and totals updates do not establish readiness. SDK/controller/frame tests and watchdog browser case passed. |
| 10 | Pass | `PaddleCheckoutFrame` retains its React target with stable registration; owner/frame generations discard stale events. Language/background-refetch unit cases and S42-51 verify continuity. Frame teardown is reserved for changed/terminal sessions. |
| 11 | Pass, local contracts | Shared 15s provider/SDK, 20s frame, bounded request deadlines, 120s confirmation and recovery retry limits all have fallback actions. Fake-clock hung/late/offline tests and controlled browser recovery cases passed. Real provider timing remains unverified. |
| 12 | Pass | Settings-only `BillingSetupLayout`, managed portal and historical `WorkspaceGate` reads remain. Existing active/trialing/past_due/canceled paths have unit/browser/SQL coverage; no real portal call ran. |
| 13 | Pass | Fulfilment does not change `operationalStatus`/suspension; account policy checks it independently. Suspended paid confirmation remains restricted in SQL42-16 and S42-41. |
| 14 | Finding | All 27 new flow tokens comply; legacy subscriber settings/marketing/workspace raw palettes violate a literal global reading. No source was changed to hide the exception. |
| 15 | Pass for this run | Reviewed the architecture's hot-file ownership and assembled imports. This pass edits no hot file, source or test, and leaves parallel work alone. Prior changes are provenance in their owning specs/external fixes. |
| 16 | Pass with recorded advisories | Both builds and complete unit commands exit 0 after clean Prisma generation. Existing dependency/build/Node notices and intentionally disabled unrelated SQL tests are reported, not suppressed. No compatibility shim or duplicate overlay was added. |

#### Screen comparison and audit

Used the Impeccable audit skill in the **product** register, loading PRODUCT/DESIGN, audit and product references. The approved v3 prototype and this spec's closed tokens govern visual decisions. No redesign or generated visual asset was needed.

Captured and inspected **40 views** outside the repository: **18 prototype views** (9 screens × 1440/390px), **22 compiled-app views** (the same 9 screens plus invalid-link password reset/email verification × both widths). This is a review probe, not a new application test. It reused the existing E2E fixture and running managed build; staff review identity was synthetic and owner reads reused an existing synthetic E2E session without a new login or database operation. All **22 app views had 0 page overflow and 0 unlabelled inputs**. A focused follow-up inspected plan layout in English/Urdu at both widths and checked mobile scrolling/selection. Temporary captures and metrics are under `/tmp/hygene-spec43-verification/screens/`; findings are recorded here so they do not depend on retaining that directory.

The initial supplemental geometry probe stopped on a temporary TSX serialization-helper `ReferenceError: __name is not defined` before collecting measurements. Corrected only that outside-repository probe; its four English/Urdu desktop/phone geometry cases then completed, followed by a successful four-case scroll/selection follow-up. These are review observations and are not added to unit/E2E test totals.

All comparable desktop sheets have the approved widths: login/signup **980px**, plan **880px**, payment **1040px**, narrow screens **520px**. Headings use Inter at **36px**, and **28px** at 390px. Mobile sheets are **358px** against prototype **366px** due to 16px versus 12px side gutters. The approved Fresh aurora, Mint sky, checkbox logo, stacked edges, shared forms and progress are present. The 390px test-mode header wraps to preserve 44px language targets; this is accepted. Automatic heading focus is visible in the app captures and intentionally retained.

| Screen | Comparison at 1440px and 390px |
|---|---|
| Sign-in | Shared shell, labels and actions match; form is taller from accessible targets. Desktop panel headline appears below the worksheet instead of above it: polish finding below. |
| Signup | Correct split/stacked layout, four-step account progress, readable fields and retained side worksheet. Runtime-approved safe copy differs from the prototype's absolute charge promise. |
| Owner recovery | Matching narrow shell; “Recover your owner account” and explicit verified-owner guidance preserve the existing recovery API contract. Neutral receipt is covered by the whole suite. |
| Reset/verify links | No exact v3 screen; checked against its narrow recovery treatment. Missing links explain recovery/sign-in without applying a token or claiming success. |
| Staff handoff | Matching narrow shell and core message; signed-in identity, approved-download fallback/information and working sign-out are intentional existing functionality. |
| Plan | Visual defect at desktop: price auto-places in the first column and the plan in the second; capacity headings no longer match their values. At 390px the sticky decision bar initially covers the Enterprise radio; ordinary scrolling allows it to be selected. English plan descriptions remain in Urdu. Findings below. |
| Payment | Correct side summary at desktop and summary-first at 390px; sandbox box, Copy/disclosure and existing-draft notice are readable. Controlled frame/footer is visible without clipping. The fixture is deliberately not a visual replica or proof of real Paddle. |
| Confirming | Matching narrow/progress treatment and explicit wait; keeps Payment received incomplete until established by server facts. This safe difference from the prototype is accepted. |
| Ready | Shared ready styling, completed steps and explicit workspace link. Missing fixture subscription interval/renewal show “Not available”, not fabricated prototype values. Stamp follows the heading rather than preceding it: accepted polish difference. |
| Recovery | Matching narrow shell; adds support and avoids the prototype's unprovable “Nothing was charged” assertion. Accepted safety/contract copy difference. |

Audit score (heuristic, not a WCAG certification): accessibility **3/4**, performance **3/4**, responsive design **2/4**, scoped theming **4/4**, anti-patterns **4/4**, total **16/20**. The responsive score reflects the plan-grid/sticky problems. The 15 Findings below comprise 0 P0, 2 P1 (including the external release-evidence gap), 10 P2 and 3 P3; deliberate deferrals are included in those counts. Prioritize the desktop grid repair, then Urdu/phone usability and dependency triage; apply any final visual polish only in a later authorized repair. Visible labels, focus, native radios, language controls, reduced-motion rules and a single shared shell are positive. No generic pricing-card grid, gradient text or decorative glass was introduced. Performance was assessed from build/source and bounded motion, not Lighthouse. The full suite supplies English/Urdu reflow, keyboard, 200% zoom, reduced motion, frame continuity and access tests; it does not prove visual column alignment or complete translation of server-supplied copy.

#### Sandbox evidence, separately stated

**A real payment has not run.** No real Paddle API, CDN or card processing was called in this verification session. Browser 4242/3DS/decline scenarios use the controlled script; SQL provider/event fixtures are injected. Neither is real Paddle acceptance or delivered signed-webhook evidence.

Read the dated sandbox research record: the original 2026-11-10 probe exited 1 with `invalid_field` while trials were present. The later explicitly authorized re-run after `d1171f2` exited 0: all six active USD prices had trials clear; customer creation and normalized duplicate handling passed; draft create/read/customer-filtered list and canceled readback passed. These are **historical provider results**, not revalidated current state. The exact raw duplicate error shape, permanent cancellation finality and stuck-company reservation inspection remain unverified. Real 4242, 3DS and declined card runs plus public webhook delivery remain open, as required by the user; no real database or real Paddle was needed to complete this observation pass.

#### Findings

Each entry states its effect and its recommended fix or acceptance reason. These entries are the follow-ups authorized for this run; none becomes a numbered spec or an edit to README/PROGRESS.

- **P1 — Desktop plan ledger column alignment.** Affects plan/allowance comparison in `frontend/src/pages/Subscription/onboarding/BillingPlanPage.tsx:87`. Reproduced in English and Urdu at 1440px: English first-row price starts at **x=338** with **266.66px** width, while the plan label starts at **x=620.66** with only **86.67px** width; capacities occupy the next three tracks, shifting the values from their headings. The price keeps `row-start-1` with an auto desktop column, so grid placement takes the first available track ahead of the fully automatic name block. **Recommended fix:** explicitly assign desktop plan/three capacities/price to tracks 1/2–4/5 and reset mobile row placement; retain native-radio/RTL behavior. Add an actual-browser geometry assertion against the header cells when that repair is authorized. Existing unit/reflow checks pass but do not detect this visual mismatch.
- **P2 — Urdu plan descriptions fall back to English.** Affects Urdu-only owners on the same plan page (`t(plan.description)`, line 88). All three fixed descriptions from `backend/src/services/subscription.service.ts:30`, `:49`, `:69` are absent from both registered dictionaries. Confirmed visible English sentences in the Urdu browser capture. **Recommended fix:** add those exact three server-supplied English keys to the shared onboarding dictionary with Urdu translations and cover real availablePlans copy in dictionary/browser checks.
- **P2 — Mobile sticky decision bar covers the final plan.** Affects 390px English/Urdu plan browsing, `BillingPlanPage.tsx:96`. After `scrollIntoViewIfNeeded`, the Enterprise radio's centre still hits the sticky bar instead of the input. Ordinary 500px scrolling restores access and the Enterprise radio can be selected in both languages, so this is recoverable rather than a task blocker. **Recommended fix:** reserve sufficient space/scroll margin for the sticky region or use a fixed nonoverlapping decision area; verify each plan can be read and tapped at phone heights without being hidden by the action bar.
- **P3 — Small prototype composition differences.** Affects desktop sign-in panel hierarchy (`LoginPage.tsx:70–80`): the panel headline is below the worksheet, while the approved system says headline first. Ready also places the stamp below its heading. **Recommended fix:** move the sign-in headline before the worksheet during a scoped visual polish pass; accept ready-stamp ordering for now because hierarchy, status meaning and the workspace action remain clear. The 8px mobile sheet-width difference, larger targets, header wrapping, real plan prices/default selection and safer recovery/confirmation wording are accepted for usability and truthful server facts.
- **P2 — Dependency vulnerabilities after clean install.** Affects backend and frontend dependency trees: npm reports **35** and **41** vulnerabilities respectively, including **3 backend critical** and **1 frontend critical**. These are all-installed-dependency audit totals, not proof of production exploitability. **Recommended fix:** triage dependency paths/reachability and update lockfiles in a separate authorized dependency repair; rerun suites after upgrades. No `npm audit fix` or package modification ran here.
- **P2 — Clean backend types require generated Prisma client.** Affects a fresh lockfile install: the initial type command ran before client generation and produced **513** cascading diagnostics. Backend build's existing `prisma generate && tsc` then passed, followed by a clean type-only run. **Recommended fix:** document or automate `prisma generate` before the first backend type check in clean CI/bootstrap. No migration is required. Do not interpret the initial missing-client diagnostics as 513 application regressions.
- **P2 — Warning-free gate is not literally met.** Affects the strict zero-warning wording: installs emit 7 total dependency deprecation messages; frontend build and E2E build emit `PLUGIN_TIMINGS`; the Node suite emits the existing mobile module-type warning; the running E2E backend emits the existing pg concurrent-query deprecation notice. Types and lint are clean and all build commands succeed. **Recommended fix:** dependency maintenance, profiling/build-configuration cleanup and a focused pg call-site review; the unrelated module metadata belongs to the mobile package owner. Accepted for this verification run without suppressing warnings. The strict zero-warning checkbox remains unticked.
- **P3 — Legacy palette exception and dead presentation residue.** Affects literal invariant 14: retained settings `billing-setup.css:3–20` declares 18 raw colours/separate billing tokens; pre-existing workspace/marketing systems account for the broad 406-line sweep. This workstream explicitly preserves settings and does not redesign post-dashboard UI. **Accept** these existing scopes; all 27 new flow tokens comply. The old `.billing-steps`/`.billing-step-*` selectors have no remaining markup consumers, `Provider trial` is an unused translation, and the `plan-trial` class renders no trial promise. **Recommended fix:** remove the dead selectors/translation in a later cleanup; consolidate the settings palette only under a separately scoped settings design change. The literal global colour checkbox remains unticked.
- **P1 release follow-up — Real payment and deployed configuration remain open.** Affects provider acceptance and release confidence, not execution of these controlled checks. No real payment has run. The signed-webhook destination, real 4242/3DS/decline behaviour, current provider prices and deployed Netlify/Heroku proxy/build variables were not exercised. The stuck company's reservation state also has no authorized real-database inspection. **Recommended fix:** the coordinator follows the existing runbook with separate explicit authorization and an approved public sandbox callback; record real outputs distinctly. Never infer this evidence from the 27 SQL or browser fixtures.
- **P2 deliberate deferral — Shared rate-limit store.** `backend/src/services/authRateLimit.ts` uses an in-process Map, so multiple API instances multiply the effective allowance. **Accept** for the current single-process contract; **recommended fix:** a shared atomic store with consistent windows before horizontally scaling. No shared-store infrastructure was added.
- **P2 deliberate deferral — Mobile lost refresh reply.** `frontend-mobile/src/api/client.ts:103–130` keeps the old token when a refresh response is lost, then clears the session on a later rejected refresh; it lacks the web client's post-failure current-user probe/rotation recovery. **Recommended fix:** a separately scoped mobile/server token-rotation recovery contract and lost-response test. This web onboarding verification does not build or certify mobile session resilience.
- **P2 deliberate deferral — Docker Compose Paddle configuration.** `docker-compose.yml` does not wire Paddle/owner-mail runtime settings or frontend Paddle build inputs. **Accept** Compose as an unsupported billing deployment path for this release; **recommended fix:** add explicit runtime/build configuration and run safe preflight in a separately authorized Compose task before using it to bill.
- **P2 deliberate deferral — New APK and physical-device validation.** Updated logo assets pass Node dimension/artwork checks, but no APK was rebuilt, installed or tested on physical devices. **Recommended fix:** perform the runbook's Android rebuild/distribution/device checks before announcing the new icon/mobile release. No APK result is claimed here.
- **P2 deliberate deferral — Billing POST rate limits.** `backend/src/routes/billingLifecycle.route.ts` protects owner/tenant scope and reservations but applies no per-owner/IP limits to prepare, confirm, reconcile or managed-portal calls. Browser locks/polling do not bound hostile clients or multiple tabs. **Recommended fix:** add calibrated endpoint-specific shared limits with readable Retry-After and safe unknown-outcome handling in a future authorized repair. Until then, use the current single-instance controlled rollout scope.
- **P3 — Existing skips and planning evidence warnings.** Seven launch-persistence unit tests require `LAUNCH_PERSISTENCE_TEST_DATABASE_URL`, a database not approved for this run, so their existing skips are accepted. The sole optional local-platform E2E mode is outside onboarding; the full run skipped exactly that one case because its opt-in local-platform mode is disabled. The validator reports missing issue references, historical Log/date/length heuristics and “no other spec mentions” warnings. **Accept** missing issues under the no-issue override and historical documentation/layout heuristics; routes/components have actual imports/tests, scripts are deliberate manual entry points, brand assets are consumed by existing code, and the test runner/fixtures are reached by package scripts. Do not create issues, rewrite old Logs or edit README merely to satisfy this planning heuristic. Earlier spec-42 FIX/fixme notes describe its old run; this pass and the external fixes record establish the current enabled regressions.

All requested local verification commands ran, with final successful exits and real counts recorded. The existing runner cleaned up its disposable child and temporary directory before completion. Restored generated implementation evidence with `git checkout -- docs/implementation`, then checked document scope, unchanged Status/README/PROGRESS, inventory preservation and `git diff --check`. The zero-warning and literal global-colour boxes remain unticked because their findings are real; the other boxes reflect completed checks. This is completion of the authorized verification/reporting pass with findings, not approval to release or evidence of a real payment. **A real payment has not run.**
