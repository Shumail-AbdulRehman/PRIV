# Initial approach — superseded by the validated implementation queue

## Outcome

New owner signs up → sees a focused plan-choice screen with monthly/yearly provider prices → reviews selected plan → opens Paddle sandbox hosted checkout → enters a test card → sees explicit activation progress → enters workspace only after server entitlement confirms the subscription. Returning unfinished owners resume that flow. Existing subscribers retain account billing/portal actions without a second purchase.

## Scope

Netlify build settings, Heroku runtime billing configuration, existing Paddle sandbox catalog/default link/webhook destination, owner route composition, plan-selection/summary/card handoff/activation/recovery UI, EN/UR/mobile/keyboard states, duplicate-purchase prevention and packaged/browser/SQL acceptance.

## Explicit non-goals

Production/live payments, new prices or trial policy, provider migration, collecting/storing card data ourselves, general auth redesign, photo qualification, scheduling/workforce defects and unrelated dashboard redesign. Preserve customer/subscription records and current security/entitlement checks.

## Diagnose before changing gates

1. Bind deployed frontend/backend revisions to the intended source.
2. Inspect runtime configuration names and validity through operator-only tooling; do not log values. Require sandbox enabled flag, sandbox API/client token family, matching six-price catalog, default checkout link, webhook destination and signing-secret validity.
3. Verify signup Set-Cookie persistence and an authenticated current-user read through reload, including blocked third-party cookies; current browser API traffic crosses the Netlify/Heroku sites. If this fails, qualify same-origin API proxying before the SPA fallback instead of moving secrets into browser storage.
4. Use an authorized synthetic owner to inspect the lifecycle/catalog response and failing network step during implementation acceptance. Existing real owners need not recreate accounts.
5. Fix the identified prerequisite/route defect. Missing config must not be hidden by widening production gates or inventing local access.

## Flow rules

- New owners use onboarding composition rather than a full operational dashboard with unrelated billing history.
- Prices, currency, interval and trial are from the active server/provider catalog. Display no invented annual discount or unsupported feature readiness.
- Plan controls use actual plan allowances; manager seats include the company owner.
- Sandbox skips live-only owner email/legal-support prerequisites exactly as the incumbent policy permits. Clear environment mismatch or service unavailability offers retry and retained account recovery.
- One server-created transaction is reused after a closed overlay. Lost responses/pending activation must not trigger another purchase.
- Provider checkout alone collects card/address details. Brand the surrounding application; do not claim pixel control over provider fields.
- /choose-plan, /subscription and /welcome remain compatible. Server facts determine ready, pending, linked, restricted and unavailable states.
- Browser completion may refresh activation, never grant access. Active/trialing must also match catalog, tenant and effective billing period.
- A signed subscription webhook and persisted entitlement complete activation. Resume polling on recoverable transport failures without misleading success; bound backoff and give an explicit refresh path.

## Draft implementation boundaries

Next available specification number is 44. Tentative units: deployed sandbox diagnosis/config contract; billing lifecycle/readiness contract; owner route/state composition; plan selector; checkout handoff/recovery; activation/resume; existing subscriber billing; deployment acceptance/runbook; one browser flow suite; final verification. Exact ownership/dependencies/model tiers and four steering documents follow approval of design/billing-onboarding/revision-2/v3; this list is not an executable spec set.

## Success proof

A fresh disposable local owner completes the full app path with fixture provider boundaries, including duplicate/reload/decline/late-webhook/environment-error cases. Then a designated new sandbox owner completes the same path on the confirmed Netlify/Heroku deployment with Paddle's actual test checkout and signed delivery. Both UI and saved server entitlement must agree. The deployed sandbox acceptance is a separate external requirement, not satisfied by mocked tests.

Final2026-11-06: the user authorized the revised design as amended to remove Help/Contact UI. The complete20-spec plan is in specs-billing-onboarding/README.md; this earlier outline is retained as planning history.
