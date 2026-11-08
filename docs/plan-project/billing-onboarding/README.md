# Sandbox billing repair — plan and design review

Status: revised design approved as amended on 2026-11-06. Help/Contact/support/FAQ elements are removed. The detailed implementation queue is in [specs-billing-onboarding](../../../specs-billing-onboarding/README.md); application implementation and deployment have not started.

## Confirmed outcome

Keep the existing Netlify frontend, Heroku backend and Paddle sandbox. A new company owner must be able to create an account, choose an existing monthly/yearly plan, enter a test card in Paddle checkout, wait for confirmed subscription access, and open the workspace. An unfinished owner must resume without creating another account or duplicate purchase. Existing subscribers keep their billing portal.

## What the issue means

The code already contains signup-to-billing redirects, owner gates, sandbox prerequisites, checkout reservation/reuse, signed webhooks and subscription entitlement checks. Therefore, adding another signup button alone cannot establish the cause of the live disabled flow. The deployed revision, build-time browser settings, runtime server settings, authenticated session and provider readiness must be traced together.

The public deployed login/signup pages load, and a guest request to choose-plan correctly returns to login. No live account or payment was created in this planning pass. The precise authenticated failure is still unverified; missing billing configuration and cross-site session loss are investigation branches, not established diagnoses. Earlier Docker Compose findings do not establish the cause on Netlify/Heroku.

## Intended flow

1. Create owner account; show a durable sign-in recovery path if account creation succeeds but the browser session fails.
2. Show three existing plan capacities, monthly/yearly selection and a clear selected-price summary. Fetch real amounts/currency/trial terms from the active provider catalog.
3. Open Paddle sandbox checkout using the server-created transaction. Paddle owns card fields. Show a clear sandbox badge and test-card guidance.
4. On completion, display confirmation progress. Refresh server subscription and entitlement state; browser events alone cannot grant workspace access.
5. Open the workspace when the server confirms tenant, catalog, effective period and access. Resume after refresh or interrupted checkout. Check uncertain payments before another checkout attempt.

## Repair order

| Phase | Deliverable | Evidence required |
| --- | --- | --- |
| Deployment diagnosis | Bind deployed revisions; validate Netlify browser environment, Heroku enabled flag/catalog and Paddle sandbox link/webhook settings | Sanitized config validity and authenticated lifecycle response; never print secret values |
| Server and SDK contracts | Reuse current owner-scoped lifecycle, checkout reservations, webhook ordering and Paddle singleton; make readiness/actionable errors explicit | Focused backend/browser unit checks, preserved duplicate prevention and live safeguards |
| Themed screens | Separate plan choice, payment handoff, confirmation, recovery and current subscriber billing; integrate existing signup and aliases | Approved v3 reproduced in app components; EN/UR, mobile, keyboard, loading and unavailable states |
| End-to-end proof | One final browser suite plus actual deployed sandbox acceptance | Signup → plan → test checkout → signed event → server entitlement → workspace, with decline/close/reload/late event cases |

The [dependency plan](planning/dag.md) now has20 executable specs44–63, four steering documents, the progress tracker and a copy-ready Sol medium handoff in repository-root [specs-billing-onboarding/README.md](../../../specs-billing-onboarding/README.md). Existing specs00–43 remain unchanged. It separates contract, SDK, shell, Netlify transport, backend readiness, pure display policy, client queries, signup, checkout controller, five screens, route integration, real SQL proof, deployment preparation, one browser gate and final verification. [Detailed tests](planning/test-matrix.md) specify76 unit/service cases,30 local browser flows and separate actual deployed sandbox acceptance.

## Design to review

Open [revised v3 plan choice](../../../design/billing-onboarding/revision-2/v3/index.html), then expand the bottom Design preview controls to navigate account, payment, activation, billing and recovery. Help/contact controls and support wording have been removed as requested. [Preview guide](../../../design/billing-onboarding/README.md) lists screenshots and controls.

The direction keeps the current blue/slate palette, Inter type, existing mark and English/Urdu support. Public Linear/Notion layouts and their documented upgrade flows inform three aligned plan panels, a setup rail and a focused order-summary/payment handoff. The original comparison-ledger design was rejected and is preserved as history. No dashboard redesign is proposed. Amounts in the prototype are explicitly illustrative; implementation must use the actual provider catalog. The preview checkout is an illustration and never submits a card.

[Reference research and adaptation](research/revision-2/saas-patterns.md) records what was actually inspected and the patterns used. The revised design pipeline and reviews are separate from the original rejected pass. The latest user amendment removes Help/Contact/support/FAQ controls and authorizes proceeding to the implementation plan.

## Scope boundaries

No real-money/live activation, new prices, trial-policy changes, payment-provider migration, custom card collection, unrelated workforce fixes, general authentication redesign or destructive customer/subscription changes. Preserve production verification gates; the confirmed sandbox flow retains its existing sandbox-specific policy.

## Evidence and open items

- [Intake](planning/intake.md), [repository survey](planning/repo-survey.md), [detailed approach](planning/approach.md), [flow acceptance table](planning/flow-acceptance.md), [rejected splits](planning/splits.md).
- [Source reuse inventory research](research/stack-and-reuse.md), [official provider/hosting sources](research/provider-sources.md), [public deployment observations](research/live-observation.md).
- Current [review synthesis](research/revision-2/synthesis.md), [A focused verdict](research/revision-2/design-review-a-verdict.md), [B focused verdict](research/revision-2/design-review-b-verdict.md) and [verification](research/revision-2/verification.md).
- Historical first-design [design review A](research/design-review-a.md) and [design review B](research/design-review-b.md); focused v3 verdicts are saved beside these.
- The authenticated deployed failure and private config validity require implementation-time operator evidence. Public inspection cannot establish them.
- Current provider prices and any trial/card policy remain provider facts to verify; the prototype does not set them.
- The amended v3 is the approved visual source. See the [validator report](planning/validator.md) for mechanical validation; application/provider acceptance remains future implementation work.
