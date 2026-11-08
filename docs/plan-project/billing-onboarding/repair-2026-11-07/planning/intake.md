# Intake — 2026-11-07

No new interview questions: the existing scope and approval already settle the expensive choices. User wants a plan before implementation and explicitly limits unrelated changes.

Inherited: React/Vite frontend, Express/Prisma/PostgreSQL backend, existing Paddle sandbox, Netlify frontend and Heroku backend; existing owner auth and private tenant-scoped billing; existing Hygene Ops brand, EN/UR and approved revision-2/v3. No fresh visual design, provider migration, auth rewrite, native change, business-price/trial change or real-money activation. Reuse the completed design pipeline and approval.json; no design/token edits are proposed, so no repeat approval request is necessary.

Required behavior: account creation with durable session → standalone real plan selection → selected-plan summary → Paddle-owned card entry → server-confirmed entitlement → dashboard. Existing subscriptions and historic operational-read policy must remain intact.

Unanswered external facts remain questions: deployed release SHAs, the failing request status/provider error category, actual account reservation/READY linkage and provider state. Do not infer these from the screenshot or from main being pushed.
