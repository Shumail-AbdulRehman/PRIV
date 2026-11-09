# Spec 42 — End-to-end suite

**Status:** Not started
**Depends on:** Spec 01, Spec 02, Spec 03, Spec 04, Spec 05, Spec 06, Spec 07, Spec 08, Spec 09, Spec 10, Spec 11, Spec 12, Spec 13, Spec 14, Spec 15, Spec 16, Spec 17, Spec 18, Spec 19, Spec 20, Spec 21, Spec 22, Spec 23, Spec 24, Spec 25, Spec 26, Spec 27, Spec 28, Spec 29, Spec 30, Spec 31, Spec 32, Spec 33, Spec 34, Spec 35, Spec 36, Spec 37, Spec 38, Spec 39, Spec 40, Spec 41
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/e2e/saas-onboarding.spec.ts`, `frontend/e2e/fixtures.ts`, `frontend/e2e/billing-onboarding.spec.ts`, `frontend/e2e/billing-v5.spec.ts`, `frontend/e2e/sandbox-onboarding.spec.ts`, `frontend/e2e/customer-auth-v5.spec.ts`, `frontend/e2e/seed.mjs`, `backend/tests/billingLifecycle.integration.ts`, `specs-saas-onboarding/inventory/42-e2e-suite.md`
**Reuses:** `ARCHITECTURE.md#test-seams`, `frontend/e2e/README.md`

## Goal

The only spec that writes or runs end-to-end tests. Prove every flow below against the real running app and an isolated database, then record real Paddle sandbox runs separately.

## Scope

- Extend the existing harness in `frontend/e2e`. It already boots the app and refuses non-isolated databases.
- Update `mockBilling` to a controlled inline Paddle script that emits real event shapes, including flat error events.
- Replace UI steps that use the removed account-type dropdown in `customer-auth-v5.spec.ts` and the shared login helper in `fixtures.ts`. Other e2e files that sign in should go through that helper. List any that cannot.
- Add one test or more for each flow row. Assert persisted state after reload. Use role and text locators and web-first assertions.
- Extend `billingLifecycle.integration.ts` for locks, reservation facts, replace and reconcile against real PostgreSQL.

### Flow table, the coverage contract

| Flow | Built by | Proves |
|---|---|---|
| New owner signs up, picks a plan, pays with 4242, reaches the dashboard | 19,20,26,27,30,33,37,35,40 | Controlled Paddle; account, draft and access persist after reload |
| Sign up with a plan from the pricing page | 30,34 | Plan is preselected |
| Tampered plan or interval in the URL | 6,33,37 | Ignored |
| Duplicate email at signup, including different case | 19,30 | Sign-in link shown, one account remains |
| Weak password and missing fields | 19,30 | Field errors, typed values kept |
| Double-click create account | 30 | One account |
| Session cannot be issued after signup | 19,30 | Sign-in prompt, no duplicate |
| Sign in as owner with active subscription | 20,29,40 | Dashboard |
| Sign in as owner who never paid | 20,29,40 | Choose plan |
| Sign in as owner with a saved draft | 29,36,40 | Payment, same draft |
| Sign in as owner awaiting confirmation | 29,36,40 | Confirming, no card form |
| Sign in as manager | 20,40 | Dashboard |
| Sign in as staff | 20,32 | App handoff |
| Wrong password, deactivated account, rate limited | 11,20,29 | Correct message, generic for unknown |
| Mixed-case legacy email signs in | 20 | Works |
| Forgot password | 31 | Neutral result in the new design |
| Paddle script blocked, then retry | 13,21,37 | Failure message, retry works, no draft created |
| `checkout.loaded` never fires | 21,25,37 | Times out to retry, same draft |
| Declined card then valid card | 7,21,37 | Same form and draft |
| 3D Secure card | 21,37 | Form stays mounted through the challenge |
| No payment methods error | 7,37 | Failure, not a decline |
| Reload on payment | 21,37 | Same draft, one transaction |
| Double mount and rapid navigation | 21 | One draft |
| Change plan before paying | 26,33,37 | Old draft cancelled, one new draft |
| Change plan after paying in another tab | 26,37 | Blocked, goes to confirming |
| Prepare request times out after sending | 12,21,28,38 | No second POST, recovery resolves it |
| Paddle rejects customer creation | 17,38 | Clear retry path, not locked out |
| Email already exists at Paddle, unlinked, sandbox | 17,28 | Adopted, checkout continues |
| Email linked to another company | 17,38 | Conflict message, nothing linked |
| Old stuck customer reservation | 28,38 | Resolved automatically |
| Old stuck checkout reservation | 28,38 | Resumed or cleared |
| Webhook arrives before confirm | 18,27,35 | Ready |
| Webhook never arrives, server check succeeds | 27,35 | Ready without a webhook |
| Webhook arrives late after server check | 18 | No regression, no duplicate |
| Paid but subscription not created yet | 27,35 | Keeps waiting honestly |
| Confirmation times out | 22,35 | No re-payment offered, Check again recovers |
| Tab closed after paying, signs in later | 36,40 | Confirming, then Ready |
| Foreign customer or price in Paddle data | 18,27 | Nothing granted |
| Trial price in catalog | 15,33,38 | Refused with a clear unavailable state |
| Billing disabled | 10,38 | Unavailable, nothing charged |
| Suspended company pays | 10,35,38 | Payment does not lift it |
| Unpaid owner opens the dashboard URL | 40 | Sent to their step, no operational navigation |
| Expired or past-due subscriber | 10,40 | Keeps read access and billing page |
| Manager opens billing URLs | 40 | Refused without leaking data |
| Two tabs open during checkout and refresh | 23 | No wrong sign-out |
| Server 503 on session read | 23 | Retry screen, not sign-in |
| Offline during payment | 21,37 | Offline notice, recovers |
| 320, 390, 768, 1440px in English and Urdu | 3,29,30,33,35,37,38 | No page overflow, full Paddle footer visible |
| Keyboard only, 200% zoom, reduced motion | 3,29,30,33,35,37 | Reachable, reflowed, no movement |
| Back and forward through every step | 6,40 | Always the correct step, no loops |
| Change language on the payment page | 21,25,37 | Card form stays loaded, entry not lost |
| Session expires on the payment page | 23,40 | Signs in again and returns to the same draft |
| Signed-in owner opens signup or login | 23,40 | Goes to their current step |
| Sign in returns to the page originally requested | 6,23,40 | Safe paths only |
| Existing trialing subscriber | 18,40 | Keeps access |
| Live mode with an unverified owner | 10,40 | Sent to verify email, no checkout |
| Real sandbox: 4242, 3DS and declined | 42 | Real Paddle, real webhook, recorded separately |

### Real sandbox runs

Separate from the suite, and never replaced by the controlled script. Against a deployed or tunnelled candidate with a disposable company: 4242 succeeds, 3DS succeeds, the declined card stays on the form, a signed webhook arrives, and the company gains access. Disable traces on these runs. If access is missing, leave them open and say so.

## Explicit non-scope

- Fixing application code. An app bug becomes a new numbered fix spec in `README.md` and `PROGRESS.md`, and the test is marked `fixme` with that number → spec 43.
- Clean-install verification → spec 43.

## Reuse first

- Use `fixtures.ts`, `seed.mjs` and the managed runner. Do not add a new runner or attach to a running server.
- Never point the suite at an application database.

## Steps

1. Update the login helper and Paddle fixture, and get one trivial test green.
2. Write the tests, one area at a time.
3. Run the suite and sort each failure into test bug or app bug.
4. Run the SQL integration test.
5. Run the real sandbox cases if access exists.
6. Record real counts, fix specs and open items in the Log.

## Done when

- [ ] `HYGENE_E2E_DATABASE_URL=<isolated URL> npm run test:e2e --prefix frontend` passes headless with 0 failures, excluding `fixme` tests that name a fix spec; real count in the Log. [e2e]
- [ ] `cd backend && npx tsx tests/billingLifecycle.integration.ts` passes against a disposable database. [requires: isolated local PostgreSQL]
- [ ] Every flow row has at least one named test in the Log. [static]
- [ ] Real 4242, 3DS and declined runs are recorded, or left open with the reason. [requires: Paddle sandbox, public webhook destination, user approval]
- [ ] Every app bug found has a numbered fix spec. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
