# Source-backed findings — 2026-11-07

Scope: local code and user-supplied screenshot only. No live backend logs, authenticated deployed lifecycle response or account database were inspected. Heroku and Netlify CLIs were not available in PATH during diagnosis. Deployment identity is unverified.

| Finding | Verified source | Implication |
| --- | --- | --- |
| Signup navigates to /choose-plan after durable session | frontend/src/pages/Signup/queries.ts:23–31 | Retain signup/auth semantics; no new registration endpoint |
| Alias immediately redirects to /subscription | frontend/src/pages/Pricing/ChoosePlanPage.tsx:3 | New owners cannot remain on a dedicated selection route |
| /subscription belongs to workspaceRoutes beneath DashboardLayout | frontend/src/routes/workspaceRoutes.tsx and frontend/src/main.tsx | The screenshot's dashboard shell follows current route composition |
| Catalog query requires checkoutAvailable and no reconciliation/uncertain state | frontend/src/pages/Subscription/SubscriptionPage.tsx, catalog useQuery | Purchase safety and catalog visibility are coupled; local uncertainty can produce an empty panel |
| Error after submitted checkout or status409 sets uncertain | same file, act catch | Warning text alone does NOT prove an unmatched server reservation exists |
| Lifecycle derives reconciliation from latest RESERVED without matching READY | backend/src/services/billingLifecycle.service.ts:41–45 | Persisted uncertainty must be inspected and correlated, never cleared by UI timeout |
| Provider call errors lose their details at public boundary | same file, callProvider | Generic browser error cannot distinguish provider rejection from transport failure; sanitized operator diagnostics are needed |
| Reservations precede customer and draft creation | same file, createBillingCheckout/reserve | Failure after reservation can hold account to prevent duplicate billing; refreshing alone need not repair it |
| Ready transaction can be reused under lock | same file, reserve | Extend existing mechanism; no second billing engine or unguarded retry |
| Only billingContract files exist in onboarding folder | rg --files frontend/src/pages/Subscription/onboarding | Specs47–59 screens/controller/routing remain planned, not shipped |
| HEAD50febf0 contains SDK code/tests, spec46 and tracker; many planning/spec45 files remain uncommitted | saved repo survey / git ls-tree | A future release must include its reviewed dependencies and match deployed frontend/backend revisions; a partial commit is not acceptance |

Snapshot test evidence for SDK46 remains in its Log; no application tests run in this planning turn. Existing manifests confirm Vitest, Playwright, TanStack Query, Redux auth, @paddle/paddle-js and @paddle/paddle-node-sdk; no new dependencies proposed. Existing model headers/profile are retained from docs/plan-project/billing-onboarding/research/models.md; no new model selection or provider claim is made.

The approved design pipeline already exists at design/billing-onboarding/revision-2/v1–v3 with approval.json approved_as_amended on2026-11-06. Restore that direction in application components rather than redesigning it during a functional repair.
