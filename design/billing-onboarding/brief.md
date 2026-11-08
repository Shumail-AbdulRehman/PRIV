# Billing onboarding design brief — 2026-11-06

Mode: Operate. User-pinned identity: match the existing Hygene Ops interface, not a new brand. Current source and deployed login screenshots fix blue primary rgb(37 86 216), slate canvas rgb(248 250 252), white surfaces, strong slate ink, Inter, existing blue brand mark and readable Urdu. Earlier DESIGN.md references to teal do not override current code/deployed evidence. Preserve root design and product documents.

Task: create an owner account, choose a provider-priced plan, enter a test card in Paddle sandbox, wait for verified activation and enter operations; manage billing later without another purchase. Confirmed Netlify + Heroku. Card entry belongs to Paddle. No real payments, no invented discounts/trials, no broad product redesign.

Defining screens: account creation, plan choice, checkout handoff/provider boundary, pending-to-ready activation, existing subscriber billing, service/checkout recovery. Three plan allowances are taken from backend PLAN_DEFINITIONS; manager seats include owner. Illustrative amounts shown only in this local review prototype are explicitly labelled in the reviewer bar and never prescribe production pricing.

Direction: capacity-first plan comparison, a restrained order receipt and a short factual account-to-ready progress line. Precise typography, ruled rows, aligned allowances and one obvious primary action. No floating glass, gradients, huge marketing hero, carousel, stock photos, nested cards, urgency, invented popularity badge, animated counters or scroll pinning. Local prototype opens from disk without a build/server, talks to no APIs, stores no entered information and uses bundled fonts/assets. Native app unchanged.

Desktop: plan rows and receipt sit side by side. Mobile: selected plan and price stay obvious; primary action follows the comparison; no sticky bar obscures content. EN/UR direction, keyboard radio behavior, explicit focus, reduced motion, 48px controls and 200% zoom are required.

Pipeline adaptation: gpt-taste's static v1 is governed by this brand/task brief and plan-project's static-prototype requirement. Marketing AIDA/GSAP/image/typographic randomization does not replace fixed product identity or impose moving reading surfaces. v2 uses animate's frequency/purpose gate for short CSS feedback only; v3 critiques/polishes only this feature directory. No application implementation is authorized by a prototype.
