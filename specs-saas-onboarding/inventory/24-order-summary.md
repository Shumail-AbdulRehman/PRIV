# Spec 24 — Order summary

`frontend/src/pages/Subscription/onboarding/OrderSummary.tsx` exports default `OrderSummary`, `OrderSummaryProps`, and `OrderSummaryTotals`.

- Render inside `FlowShell` and a router. Uses the existing language context, approved dictionary, `flow.css` helpers and closed colour tokens. No stylesheet or shared dictionary changes.
- Pass `plan: { name, limits }` using the catalog plan definition and the saved `interval: 'month' | 'year'`. Capacities are never hard-coded. Caller owns placement above the card form below 1024px; this component hides capacities and the security note there and becomes sticky at 1024px.
- `totals` accepts `{ currencyCode, totals?: { subtotal?, tax?, total? }, recurringTotals?: { total? } }`. Every amount is a string in the smallest currency unit, formatted only by `formatBillingPrice`. Current-purchase and renewal totals remain independent. Missing/invalid amounts show skeletons; explicit provider zero remains zero.
- `fallback` defaults to false. The caller ends its bounded wait by setting it true. Missing totals become “Calculated by Paddle”; only the renewal line may use `catalogPrice: { amount, currencyCode, interval }`, and only when its interval matches. Received provider totals still win. No catalog price is substituted for tax, subtotal or due today.
- `hideChangePlan` removes the link while paying/replacing. `changePlanHref` defaults to `/choose-plan`. Link navigation uses React Router without a document reload.
- All amounts and capacity numbers use `bdi dir="ltr"`, including fallback prices in Urdu. The component performs no network calls, provider initialization, timers, card handling or access decisions.

Integration boundary for spec 37: `useCheckoutSession.CheckoutTotals` currently preserves numeric SDK amounts, as recorded by specs 13 and 21. Do not pass those directly or guess their units. The summary contract follows spec 24's exact minor-unit strings; the composing caller must supply amounts whose units have been established. Fetching/conversion and payment-page wiring are outside this component's ownership.

`OrderSummary.test.tsx` contains 20 component tests for loading, exact totals, safe fallback, missing/invalid amounts, explicit zero tax, annual and zero-decimal pricing, change-plan visibility/destination, Urdu isolation, and compact responsive hooks. Responsive hooks are checked in JSDOM, not a browser layout engine.
