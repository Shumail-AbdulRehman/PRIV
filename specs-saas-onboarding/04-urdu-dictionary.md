# Spec 04 — English and Urdu copy for the flow

**Status:** Not started
**Depends on:** Spec 00
**Model:** Light — `claude-haiku-5-5` · `gpt-6.1-sol` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend/src/i18n/onboardingTranslations.ts`, `frontend/src/i18n/onboardingTranslations.test.tsx`, `frontend/src/i18n/translations.ts`, `specs-saas-onboarding/inventory/04-urdu-dictionary.md`
**Reuses:** `design/saas-onboarding/v3/locale.js`, `frontend/src/i18n/billingTranslations.ts`

## Goal

Provide every user-visible string in this flow in Urdu, from one registered dictionary, so screens never edit shared translation files.

## Scope

- Create `onboardingUrdu` from the approved prototype copy in `locale.js`, plus the recovery, confirmation and error strings named in screen specs.
- Register it first in the `translate` lookup chain in `translations.ts`.
- Keep Paddle, Hygene Ops, plan names and placeholders exact. Placeholders such as `{count}` must survive translation.
- Do not add any free-trial wording.

## Explicit non-scope

- Removing old trial strings from `billingTranslations.ts` → spec 34.
- Translating Paddle's own form → spec 37.

## Reuse first

- Follow the `Record<string,string>` shape of the existing dictionaries.
- Do not duplicate a key that already has the same meaning in `billingTranslations.ts`.

## Steps

1. Copy strings from the prototype dictionary, updating copy that changed in the approved version.
2. Add a test list of every English key the screens need.
3. Register the dictionary.
4. Check placeholders match between English and Urdu.
5. Record what you created in `specs-saas-onboarding/inventory/04-urdu-dictionary.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/i18n/onboardingTranslations.test.tsx` passes and proves: every key has non-empty Urdu, placeholders match, and no value mentions a trial. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/04-urdu-dictionary.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
