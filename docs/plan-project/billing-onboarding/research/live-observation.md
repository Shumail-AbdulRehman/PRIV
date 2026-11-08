# Public deployment observation — 2026-11-06

User confirmed Netlify + Heroku, Paddle sandbox/test cards only. Public browser observations used a fresh unauthenticated context; no account was created and no checkout/reservation/payment was submitted.

- https://cleanops-01.netlify.app/login loads the current blue/slate login with no page-level JS errors.
- /signup loads Create your workspace; /choose-plan as a guest correctly redirects to /login.
- The app requests /api/common/get-current-user on the Heroku origin and receives expected unauthenticated 401.
- Screenshots: design/billing-onboarding/evidence/live-login.png, live-signup.png, live-choose-plan.png.
- Heroku and Netlify CLI binaries are not available in this shell. Authenticated deployed lifecycle/catalog/settings were not inspected. The exact live checkout-disabled cause is NOT proven by a guest visit.
- Compose omissions from the earlier audit are a separate packaging defect, not the assumed cause on this confirmed hosting topology.
- Current source already exempts sandbox from email verification and production policy/support gates when backend/browser sandbox settings match. Preserve production gating and diagnose actual deployed revisions/configuration before changing these rules.
