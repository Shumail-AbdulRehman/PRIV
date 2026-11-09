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

- [x] `cd frontend && npx vitest run src/i18n/onboardingTranslations.test.tsx` passes and proves: every key has non-empty Urdu, placeholders match, and no value mentions a trial. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/04-urdu-dictionary.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-09** — Added `onboardingUrdu` with **147 entries**, using the approved prototype copy plus checkout preparation/replacement, retry waits, the English Paddle form notice and recovery messages for unknown payment outcomes. Registered it first in `translate`. Reused nine existing billing keys instead of duplicating them. `Enterprise` is the deliberate exception: its legacy billing transliteration is overridden to retain the approved English plan name, alongside Starter and Pro. Existing trial strings in `billingTranslations.ts` are untouched.
- **2026-11-09** — Added an explicit **194-key** screen-copy manifest. The focused command passed **204 tests, 0 failures/skips**. It checks non-empty registered Urdu, exact placeholders and interpolation (including zero and missing values), unchanged English, exact brands/plan names, dictionary precedence, billing-key reuse and no trial wording. The inventory fragment documents the dictionary and reuse contract.
- **2026-11-09** — Used the guide's test-only exception for `frontend/src/pages/Login/LoginPage.test.tsx`: in “keeps credentials available for correction and renders a translated denial without raw server details”, changed only the expected Sign in button label to `سائن ان`; in “translates the split login, platform link and password visibility for Urdu”, changed only the expected platform sign-in label to `پلیٹ فارم مالک سائن ان`. Both now match the approved copy taking precedence; all behavioural assertions remain intact.
- **2026-11-09** — Final `npm test --prefix frontend`, with `VITEST_MAX_WORKERS=2`, passed **81 Node tests and 1,064 Vitest tests across 50 files**, **0 failures/skips**; the Vitest total includes the 204 dictionary cases. The initial uncapped run was stopped after five observed failing cases under concurrent load (three slow operational cases and the two old Urdu login labels), with no final Vitest count; its Node stage passed 81 tests. The capped run passed after the two label updates, without changing timeouts or weakening checks.
- **2026-11-09** — Final `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors and 0 warnings**. `npm run build --prefix frontend` passed. Existing advisories remain: the Node suite reports the mobile translation module-type warning, and the build reports plugin timing (`@rolldown/plugin-babel` / `vite:css`). These are outside this spec's ownership.
- **2026-11-09** — All checks used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. No real database or Paddle access, migration, deployment, issue, pull request, commit or branch operation ran. Backend/mobile suites, browser rendering and Paddle's own form were not exercised; this spec changes the registered copy only. `PROGRESS.md` and this spec's Status line are unchanged.
