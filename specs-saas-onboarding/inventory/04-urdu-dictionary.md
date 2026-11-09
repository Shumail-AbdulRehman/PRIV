# Spec 04 — English and Urdu copy for the flow

## Registered onboarding dictionary

`frontend/src/i18n/onboardingTranslations.ts` exports `onboardingUrdu: Record<string, string>`, with 147 entries from the approved `design/saas-onboarding/v3/locale.js` and the additional payment, recovery and error states required by the screen specs.

- Use the existing `useLanguage().t(englishKey, values)` or `translate(englishKey, language, values)`. `translations.ts` checks this dictionary first. Screens do not need to import it or edit shared translation files.
- Nine existing billing keys are reused through the lookup chain: Skip to content, Choose a plan, Billing interval, Monthly, Yearly, Try again, Order summary, Change plan and Contact support.
- `Enterprise` intentionally overrides the old billing transliteration so Starter, Pro and Enterprise retain their approved names. Paddle and Hygene Ops also stay exact.
- Extra keys cover retry waits (`Too many attempts. Try again in {count} seconds.`), checkout preparation, plan replacement, the English Paddle form notice, unresolved/in-progress reconciliation, and recovery messages that make no assertion about charges when the outcome is unknown.
- Existing account, billing and staff-handoff translations remain available through the same lookup. Placeholders retain their exact names; values and missing placeholders keep the existing interpolation behaviour. No trial copy is added.

## Coverage manifest

`frontend/src/i18n/onboardingTranslations.test.tsx` lists 194 required English keys covering the prototype, additional screen states and reused account/billing/staff copy. Its 204 cases check registered Urdu coverage, English identity, placeholder parity and interpolation (including zero), exact plan/brand names, billing-key reuse, lookup precedence, missing-key fallback and absence of trial wording.
