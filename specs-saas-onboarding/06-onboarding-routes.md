# Spec 06 — Next-step route map

**Status:** Not started
**Depends on:** Spec 01
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Onboarding/onboardingRoutes.ts`, `frontend/src/pages/Onboarding/onboardingRoutes.test.tsx`, `specs-saas-onboarding/inventory/06-onboarding-routes.md`
**Reuses:** `ARCHITECTURE.md#lifecycle-dto-additions`, `frontend/src/pages/Subscription/types.ts` (spec 01)

## Goal

Give the app one pure function that turns the server's `onboardingStep` into a route.

## Scope

- Export the route constants, including `/continue`.
- Map every step to the table in `ARCHITECTURE.md`.
- Allowlist `plan` and `interval` query values, dropping anything else.
- Give an internal-path checker for a `from` deep link: it must be same-origin, start with one slash and not point at an auth or billing setup page.

## Explicit non-scope

- Calling this from pages → spec 40.
- Guard behaviour in `App.tsx` → spec 23.

## Reuse first

- Use the step type from spec 01. Do not re-declare it.

## Steps

1. Write the map as an exhaustive switch, so a new step fails type checking.
2. Write the query allowlist.
3. Write the deep-link checker.
4. Test each step, each bad query value and hostile paths such as `//evil.example` and `/\evil`.
5. Record what you created in `specs-saas-onboarding/inventory/06-onboarding-routes.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd frontend && npx vitest run src/pages/Onboarding/onboardingRoutes.test.tsx` passes and proves: all nine steps map correctly; tampered plan and interval values are dropped; external and protocol-relative `from` paths are rejected. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/06-onboarding-routes.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-09** — Read the current context, guide, architecture, design system/prototype, inventory/fragments, tracker, spec 01 acceptance and the existing billing DTO/routes before implementation. No partial spec 06 work existed. Added only the owned pure module, literal owned test file and inventory fragment. The route map reuses `BillingOnboardingStep`, covers all nine architecture destinations, returns no route for an absent/invalid step and enforces exhaustiveness at compile time. The query parser keeps only exact supported selections, drops duplicate/unknown keys and does not mutate its input. The deep-link checker rejects external/protocol-relative paths, backslashes/control characters, encoded/normalized auth or setup paths and redirect loops. Pages and guards are not wired in this spec.
- **2026-11-09** — Acceptance-path blocker: the spec literally owns `onboardingRoutes.test.tsx`, but the installed Vitest configuration includes only `src/**/*.test.tsx`; the focused command also duplicates `frontend/` after changing into that directory. Ran the exact listed command, `cd frontend && npx vitest run frontend/src/pages/Onboarding/onboardingRoutes.test.tsx`: exit 1, **0 tests**, "No test files found". Asked for authorization to correct the owned filename to `.test.tsx` and the command to `cd frontend && npx vitest run src/pages/Onboarding/onboardingRoutes.test.tsx`. The guide says "Write only inside your spec's Owns"; its exception covers existing failing tests, not creation of a differently named test. That correction remains pending, and the focused acceptance box remains unticked. No scope or Vitest configuration change was made.
- **2026-11-09** — Independently verified the literal owned `.tsxx` tests using the installed Vitest `startVitest` API with an in-memory `include` override and a pre-transform calling Vite's `transformWithOxc` with a virtual `.tsx` filename. **142 tests passed, 0 failed/skipped, 1 test file**. This covers all nine steps, missing/invalid steps, valid/invalid/duplicate query values, safe workspace links and hostile redirects. The normal suite does not discover this `.tsxx` file, so those 142 cases are separate from its totals. An in-memory TypeScript compiler-host probe added a virtual tenth DTO step and verified that the exhaustive map fails with TS2345; no files were changed for the probe.
- **2026-11-09** — Initial `npm test --prefix frontend`: **81 Node tests passed; 859 Vitest tests passed and 1 failed across 49 files**. The failure was `src/routes/launchPages.test.tsx` waiting for its lazy-loaded dashboard fixture; the new additive module has no application callers. No existing test was changed. A full rerun uses the installed runner's `VITEST_MAX_WORKERS=2` environment setting to reduce concurrent load. Initial frontend types passed. Initial lint found one unused parameter in the new exhaustiveness helper; fixed within the owned module, and lint then passed with **0 errors, 0 warnings**.
- **2026-11-09** — `npm run build --prefix frontend` passed (3,027 modules). It emitted the existing `PLUGIN_TIMINGS` advisory for Babel/CSS/Tailwind. The Node tests emitted the existing mobile translation `MODULE_TYPELESS_PACKAGE_JSON` warning. Neither warning's configuration is owned by this spec. All test commands use `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. No real database, Paddle call, migration, deploy, GitHub issue/PR, commit or branch operation was used. The spec Status line and `PROGRESS.md` remain unchanged under the user's override.
- **2026-11-09** — Final whole-suite rerun, `npm test --prefix frontend` with `VITEST_MAX_WORKERS=2`: **81 Node + 860 Vitest tests passed, 0 failures/skips, 49 Vitest files**. The earlier navigation timeout did not recur, and no existing test was edited. Final `cd frontend && npx tsc -b --noEmit` and frontend lint both passed with **0 errors, 0 warnings**. Separately, a read-only compiler-host check presented the literal `.tsxx` test contents under a virtual `.tsx` filename and verified that those test contents also type-check; no file was created outside ownership. Inspected the inventory fragment and ran `git diff --check`, which passed. Implementation and independent checks are complete within literal ownership; spec completion remains **blocked solely on authorization to correct the test filename and focused acceptance command**, whose box stays unticked.

- **2026-11-09 — Resumed verification.** Continued the existing owned route helper and tests after reading the required context, guide, architecture, design system/prototype, inventory fragments, tracker and spec 01 acceptance. The file now present is the owned `onboardingRoutes.test.tsx`; the historical filename/discovery blocker below no longer applies. Ran the original focused command exactly as listed: exit 1, **0 tests**, because its filter repeats `frontend/` after `cd frontend`. Corrected only that duplicated prefix in this spec's acceptance command, following the same correction recorded by spec 01. The corrected command ran normally with the repository's unchanged Vitest configuration: **142 passed, 0 failed/skipped, 1 file**. Updated the inventory fragment to remove its stale pending-authorization text. The existing pure implementation satisfies the requested scope, so no application changes or test-only scope exceptions were needed in this resumed run. Pages and guards remain for their assigned specs.

- **2026-11-09 — Resumed run final results.** `npm test --prefix frontend` with `VITEST_MAX_WORKERS=2` passed: **81 Node tests + 1,002 Vitest tests, 0 failures/skips, 50 Vitest files**; the 142 route cases are included in that total. `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors, 0 warnings**. `npm run build --prefix frontend` passed; its existing `PLUGIN_TIMINGS` advisory and the Node suite's existing `MODULE_TYPELESS_PACKAGE_JSON` warning remain outside ownership. Inspected the updated inventory fragment and `git diff --check` passed. All Done when commands now have passing runs in this session after the documented focused-path correction; all boxes are checked. The historical blocker above is resolved. Every verification command used the inert `DATABASE_URL` and `DOTENV_CONFIG_PATH=/dev/null`. No real database or Paddle was accessed; no migration, deploy, issue/PR, commit, merge, push or branch command ran. No application files outside ownership or existing tests were edited. The spec Status line and `PROGRESS.md` were left unchanged.
