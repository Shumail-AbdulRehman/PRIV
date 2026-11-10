# Spec 25 — Inline Paddle frame

`frontend/src/pages/Subscription/onboarding/PaddleCheckoutFrame.tsx` exports the default `PaddleCheckoutFrame` and `PaddleCheckoutFrameProps`.

- Pass `registerFrameTarget` directly from `useCheckoutSession`. The component registers the constant class name `paddle-checkout-frame` in a layout effect and releases it with `null` on unmount. Keep the callback stable and mount only one checkout frame on a page. React StrictMode deliberately replays registration/cleanup during development.
- Pass `ready` only after the controller has observed `checkout.loaded`; keep it true while the loaded form remains usable (including payment/decline states). The component opens no checkout and makes no provider or network calls.
- The target remains the same empty React-owned element across rerenders, readiness and language changes. Paddle owns its inserted children; the component never reads inside an iframe.
- Loading shows the shared `.flow-skeleton` blocks and the existing English/Urdu loading label. The target remains measurable but invisible, inert and hidden from accessibility until ready. Readiness applies `.flow-frame-ready` to its container, reusing the 240ms fade and 120ms reduced-motion rule from `flow.css`.
- The slot and target reserve 450px minimum height and 312px minimum width, fill available width, remain LTR and allow content to grow without clipping the Paddle footer. Compose inside `FlowShell` and retain at least 312px usable width on phones; it supplies the shared flow styles and tokens.

`PaddleCheckoutFrame.test.tsx` covers registration/cleanup, StrictMode, loading/ready states, English/Urdu continuity, provider-owned child preservation, no cross-origin reads and sizing/overflow hooks. These are DOM tests, not real Paddle layout evidence.
