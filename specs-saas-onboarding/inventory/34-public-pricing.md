# Spec 34 — Public pricing links and trial copy

- `frontend/src/pages/Pricing/PaddlePricing.tsx` reuses `TIERS`, `ONBOARDING_ROUTES`, and `useBillingCatalog`. Native Monthly/Yearly radios carry only the allowlisted `STARTER`/`PRO` plan and `month`/`year` interval into signup. Owner links use `/continue`; managers, staff, and parent-disabled purchases get an explanation instead of a purchase link.
- The internal `OwnerEnterprisePlan` reads the existing owner-scoped catalog only for eligible owners. It offers `/continue` only when `ADVANCED` exists for the selected interval; missing, pending, or failed catalog reads retain the existing `EnterprisePlan` inquiry. Visitors do not request the private catalog. No provider price IDs or guessed prices are used.
- `WorkspaceLink` in `frontend/src/components/marketing/MarketingCTA.tsx` now uses shared onboarding route constants and sends signed-in visitors through `/continue`.
- `frontend/src/i18n/billingTranslations.ts` supplies Urdu for the updated pricing notice, plan CTA, and Enterprise availability. Historical `Trialing` remains translated.
- `frontend/src/pages/Pricing/PaddlePricing.test.tsx` adds 21 isolated component cases for plan/interval URLs, role restrictions, Enterprise catalog availability, trial-free English/Urdu pricing copy, historical status translation, marketing CTA destinations, and the complete pricing page for visitors, owners, managers, and staff. The catalog hook is mocked; no provider or database is needed.

Verified 2026-11-10: 21 focused pricing tests and the full frontend suite (88 Node + 2,125 Vitest tests) passed; type check, lint, and production build passed.
