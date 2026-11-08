# Signup billing repair plan — 2026-11-07

## Desired outcome

A new owner creates one account, stays outside dashboard chrome while selecting a real configured plan/interval, enters card details only in Paddle sandbox, waits for signed-provider-backed server permission, then enters the dashboard. An interrupted owner resumes safely; an existing subscriber uses account billing without buying twice.

This is an amendment to specs-billing-onboarding, not a second queue. Decision44 and implementations45/46 remain Done. All remaining code units keep their original ownership and numbers. Existing approved visual design remains unchanged. Source observations are in ../research/findings.md.

## 1. Diagnose before changing the affected account

Capture the actual Netlify build SHA, Heroku release SHA and browser route chain. On an authorized affected-account session, inspect only sanitized lifecycle readiness booleans, checkout request HTTP status and a safe provider error category/request correlation. Verify configuration presence/environment agreement without printing keys, cookies or signed portal links. Capture whether the original request reached the provider.

Inspect the authenticated company's latest CUSTOMER_CREATE/CHECKOUT reservation and matching READY record with the same reservation ID. Correlate to canonical company/customer/transaction and provider state. Separate these outcomes:

| Outcome | Required response |
| --- | --- |
| No reservation; SDK/config/validation failed before submit | Fix the proven prerequisite; allow explicit retry after a fresh check |
| READY draft and authoritative same-tenant safe transaction | Resume that exact saved selection/transaction after fresh checks |
| Paid/completed/pending/unknown outcome | Refresh/reconcile authoritative state; do not prepare another purchase |
| RESERVED without READY | Preserve hold; operator must establish actual provider outcome before proposing a narrowly reviewed recovery |
| Conflicting/missing owner/customer correlation | Deny purchase and record the sanitized mismatch; no email-based relinking |

Do not delete audit data, cancel by timeout, clear uncertainty on the client or create a new customer/account as recovery. If an affected-account repair requires a new service or data mutation beyond spec49, stop that action and create a bounded reviewed repair spec before the two final gates. Local work can continue independently; final deployed acceptance cannot close without this diagnosis and recovery evidence. No operator access was available during planning, so the exact live checkout cause remains open.

## 2. Implement existing units with explicit regression contracts

| Boundary | Existing owner | Required change/proof |
| --- | --- | --- |
| Standalone layout/translations | 47,52 | Reuse approved branded setup shell and existing signup mutation/session behavior; no operational styling change |
| API/session transport | 48 | Qualify same-origin proxy separately; diagnose whether it contributes before calling it the live cause |
| Authoritative server facts | 49 | Reproduce failures at customer create/draft create/persist; safe resume and explicit readiness; retain locks and production guards |
| Pure state/catalog display | 50 | Derive checking/selection/resume/uncertain/linked states; never label status alone as workspace permission |
| Private reads/polling | 51 | Decouple safe catalog READ from purchase permission; bounded polling/manual recovery, no automatic POST retry |
| Checkout orchestration | 53 | Validate SDK before POST, one mutation, same draft on reopen/reload, status-first response-loss/409 recovery |
| Screens | 54–58 | Render real selectable prices or explicit reason/retry; never a blank options panel; card UI stays provider-owned |
| Route integration | 59 | Put /choose-plan, payment, activation and recovery outside DashboardLayout; preserve aliases/auth/password recovery and subscriber reads |
| SQL persistence proof | 60 | Inject provider/DB failure at each reservation boundary; assert hold/reuse/dedup and no second create |
| Operator package | 61 | Bind release SHAs, capture sanitized diagnosis, explain safe affected-account recovery and non-destructive rollback |
| Browser acceptance | 62 | Assert full signup-to-dashboard route/layout sequence, exact screenshot failure variants and unrelated-route regressions |
| Final release gate | 63 | Clean suites plus real deployed sandbox card, signed webhook, persisted entitlement and separate affected-account evidence |

Implement one spec per session with its named focused tests, affected package whole unit suite, typecheck, scoped frontend lint and build. Specs62/63 alone own integrated browser/final suites. No new route or database bypass is authorized. Keep the existing DAG; UI units consume tested contracts while server work proceeds independently. Numerical order is the sequential fallback; readiness is dependency-based.

## 3. Prove that neighboring behavior survives

Retain manager/staff role isolation; existing active, expired, canceled and past-due subscriber handling; tenant cache isolation; suspended-company restrictions; forced password change; refresh-cookie/session restoration; old /choose-plan, /welcome and /subscription links; owner security and unrelated /help routes. Test direct /dashboard navigation by a new unpaid owner, return URL spoofing, early completion events, account switch during requests, failed SDK, decline, lost POST response and existing draft reload. None may authorize workspace or duplicate checkout.

Mocked provider/browser proof, real disposable PostgreSQL proof and real deployed Paddle proof are three separate evidence classes. The browser test must assert absence of operational navigation throughout onboarding, not just the presence of a Choose plan heading.

## 4. Release without losing history or data

A commit on main does not establish deployed behavior. Inventory all reviewed dependencies (including currently uncommitted DTO/plan files) before preparing the candidate. Use ordinary additive commits/fast-forward or reviewed merges; no reset, history rewrite, force push or unrelated file staging. Record exact frontend/backend revisions and previous working release/config values without secrets. Build/test locally before operator deployment; publish additive backend contract before matching frontend. Rollback through previous deployment revisions or additive revert commits, retaining all billing/audit/customer/subscription data.

Do not declare this fixed until a synthetic new owner completes the real deployed sandbox sequence, refresh/sign-in retains entitlement, existing subscriber/manager smoke checks pass, and the previously stuck account has either a verified safe recovery or an explicitly documented unresolved prerequisite. Planning authorizes no production billing activation or live account mutation.

## Handoff

Start the next sequential session with Spec47 under the existing Sol medium execution profile; read AGENT-GUIDE.md and PROGRESS.md first. Start the read-only operator diagnosis as soon as authorized access/evidence is available; do not postpone discovering the live failure until after deployment. Specs49 and61 consume the diagnostic checklist above. The plan is complete when the existing spec-set validator passes with any warnings explained. Implementation has not started in this planning turn.
