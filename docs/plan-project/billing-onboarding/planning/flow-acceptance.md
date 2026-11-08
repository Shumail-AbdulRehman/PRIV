# Billing flow acceptance draft — 2026-11-06

These are proposed acceptance rows, not completed checks. All provider payments in this scope are sandbox-only. Store no card data and never infer entitlement from a browser URL/event alone.

| Flow | Required behavior | Evidence target |
| --- | --- | --- |
| New owner | Durable signup/session → plan choice without operational sidebar/history noise | Real app + disposable SQL |
| Session could not be established | Account-created receipt → sign-in → resume plan choice, no duplicate signup | Component + browser |
| Existing unfinished owner | Sign-in/reload returns to saved server state and plan choice | Browser + SQL |
| Catalog loading | Stable selection layout; announced status, actions wait for valid prices | Component + browser |
| Plan choice | Only active sandbox catalog entries; monthly/yearly prices/currency/allowances agree with server | Unit + browser |
| Configuration unavailable | Plain recovery message, account/security/help usable; no provider request/reservation | Unit + browser |
| Environment mismatch | Checkout denied before creating purchase; operator receives useful nonsecret diagnostics | Unit + browser |
| First checkout | One server-created draft belongs to the tenant; Paddle opens with transactionId and actual sandbox client token | SQL + browser + deployed sandbox |
| Card entry | Actual Paddle-hosted test card/address fields; displayed totals/trial are provider facts | Deployed Paddle sandbox |
| Close checkout | Selected plan remains; same provider draft can reopen, no new purchase | Browser + SQL |
| Card declined | Provider error remains actionable; reopen/retry same known transaction | Browser fixture + actual sandbox scenario |
| Ambiguous provider creation | No automatic second purchase; reconcile canonical saved transaction | Unit + SQL + browser |
| Checkout callback | Refreshes subscription facts; never directly grants operational access | Unit + browser |
| Delayed/unknown subscription | Explicit pending state; no second checkout; polling continues with bounded backoff/retry | Query tests + browser |
| Activation confirmed | Matching catalog/tenant and effective active/trialing period → ready → workspace setup | SQL + browser + deployed sandbox |
| Duplicate/out-of-order webhook | Signed raw-body verification and persisted dedup/version ordering preserved | Existing + added SQL/unit |
| Missing/invalid signature | No entitlement change | Unit + SQL |
| Browser reload while pending | Reload resumes canonical server state; no new card/payment request | Browser + SQL |
| Expired/canceled/past-due | Do not label access ready merely because a linked provider row exists | Unit + browser |
| Suspended company | Billing/security/help remain available; payment does not reactivate operational suspension | Unit + browser |
| Existing subscriber | Current plan/usage → owner portal; never new-subscription purchase | Unit + browser |
| Wrong principal | Staff/manager/nonowner cannot create checkout or access another company's billing | Unit + SQL |
| Mobile and Urdu | 320/390/768/1366 widths, no page overflow; EN/UR/direction retained; meaningful 48px targets | Prototype + later real browser |
| Keyboard/reduced motion | Radios/toggles/hosted focus return/announcements work; prices stay still | Prototype + later component/browser |
| Stale build | Bounded module recovery, same session preserved, no reload loop or duplicate provider request | Existing + added browser |
| Real deployed acceptance | Netlify build sandbox config + Heroku runtime catalog/secret + signed actual Paddle delivery all match | Explicit external sandbox evidence |

Prices/trial durations shown in the local design are sample fixtures and prescribe no commercial change. Production payments are excluded. The one formal e2e spec will own browser implementation flow tests; implementation units own their unit/component tests.
