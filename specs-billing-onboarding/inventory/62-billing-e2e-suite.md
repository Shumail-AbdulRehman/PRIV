# Spec62 browser inventory and flow mapping

Provider-facing fixture flows use `mockBilling` in `frontend/e2e/fixtures.ts`. Real auth/registration and actual API/SQL cases are named explicitly. Fixture tokens, overlay and lifecycle permission are not real Paddle, signed delivery or deployed entitlement. SQL60 proves persistence separately. Same-origin Netlify cookies are external63; managed loopback auth/reload is local proof.

| Row | Browser evidence |
| --- | --- |
| F01 | sandbox-onboarding: real signup, SQL owner identity, reload and fresh login |
| F02 | durable account/session-delivery fixture shows sign-in, one signup |
| F03 | required validation; real duplicate account and delayed one-request submit |
| F04 | six plan/interval cases assert native selected radio, API capacity labels, exact recurring money and URL |
| F05 | error/empty/partial catalog refresh focus; held slow response denies continuation |
| F06 | production/missing server environment mismatches sandbox browser config, zero POST; SDK failure before POST. Compiled-token removal browser case and SDK/controller units cover missing build input |
| F07 | real unverified new owner reaches sandbox fixture; production counterpart cannot bypass guards (zero POST) |
| F08 | rapid double action, close/reopen, one checkout POST/fixture transaction in SDK/API fixture |
| F09 | proven draft reload and cookie clear/new login; URL provider ID ignored |
| F10 | prepared year selection retained; no change-plan/replacement action |
| F11 | checkout.payment.failed signal shows unknown outcome, retained plan and no access |
| F12 | lost response,409 and actual mocked server hold; status-first, one/zero POST |
| F13 | completion before server-ready and forged return stay confirmation only |
| F14 | explicit current permission enables workspace action; no automatic browser-success grant |
| F15 | transient failure recovery, virtual-clock bounded polling timeout/manual restart, automatic delayed entitlement while a draft remains; real API failure→refresh |
| F16 | active/trialing/unknown and future/expired/missing/unqualified period fixtures with server denial never ready; SQL60 evaluates actual windows |
| F17 | real SQL suspension and legacy inactive company deny operations before layout; billing/security remain |
| F18 | actual persisted subscriber states; canceled fixture exposes portal and no checkout |
| F19 | API counts equal real SQL, over-capacity numerals survive reload and no destructive workaround |
| F20 | real stored missing periods/status plus unavailable price; scheduled cancel fixture never invents next billing |
| F21 | freshly authorized managed portal success/outage/untrusted URL; one navigation or safe error |
| F22 | real manager owner-only endpoint403, tenant injection denied; role screen boundary |
| F23 | actor change before checkout verification denies old principal overlay/POST |
| F24 | actual forced-password flag wins; legacy choose-plan/welcome/subscription paths exercised |
| F25 | missing SubscriptionPage chunk uses bounded installed recovery, actual signup session survives |
| F26 | keyboard radio and language changes preserve selection/URL; customer auth EN/UR forms |
| F27 | native radio keyboard selection; SDK fixture Escape restores opener; reduced-motion viewport cases |
| F28 |320/390/768/1366/1440 EN/UR plan/payment/confirmation/recovery; desktop CSS200% reflow (not a native browser chrome zoom claim) |
| F29 | each new-state viewport asserts no help/contact/support/FAQ link; actual pre-layout gate has billing/security/refresh only |
| F30 | real managed auth/reload and unit-tested redirect contract; deployed proxy Set-Cookie qualification pending63 |
| F31 | real signup→standalone plan→payment→activation→explicit workspace; unpaid dashboard/reload returns setup, no operational nav |
| F32 | reconciliation+catalog failure explanation and recovery, response-loss/409 no second payment |
| F33 | existing subscriber/manager/staff operational regressions, forced password, owner security and unrelated global help |

`billing-v5.spec.ts` retains real stored-fact/security checks while replacing obsolete monolithic markup assertions. `customer-auth-v5.spec.ts` measures the new signup shell against the approved billing reference; other auth retains its existing authority. Synthetic credential workflows disable trace/video/failure screenshots; generated captures now go to ignored `.artifacts`, not tracked historical evidence.

Managed guard still rejects nonlocal/nonexact bootstrap targets, creates UUID child databases, applies real migrations, compiles fresh servers, forbids attaching to existing processes and drops only its generated child. No production environment inheritance/provider activation or guard weakening.

Clean focused61 passed; full managed171 passed/1 unrelated optional operator skip,0 failures and no skipped billing regression. Typechecks/scoped lint/builds passed. Final172-test run includes both fulfillment and automatic confirmation timing refinements; see dated Logs.
