# Spec 43 — Verification pass

**Status:** Not started
**Depends on:** Spec 00, Spec 01, Spec 02, Spec 03, Spec 04, Spec 05, Spec 06, Spec 07, Spec 08, Spec 09, Spec 10, Spec 11, Spec 12, Spec 13, Spec 14, Spec 15, Spec 16, Spec 17, Spec 18, Spec 19, Spec 20, Spec 21, Spec 22, Spec 23, Spec 24, Spec 25, Spec 26, Spec 27, Spec 28, Spec 29, Spec 30, Spec 31, Spec 32, Spec 33, Spec 34, Spec 35, Spec 36, Spec 37, Spec 38, Spec 39, Spec 40, Spec 41, Spec 42
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `specs-saas-onboarding/INVENTORY.md`
**Reuses:** `ARCHITECTURE.md#invariants`, `DESIGN-SYSTEM.md`

## Goal

The final gate. Prove from a clean state that what this spec set promised is true, and record every place it was not. This spec observes and reports. It does not fix.

## Scope

- Clean install from lockfiles in `backend` and `frontend`, then types, lint and build.
- Whole unit suites and the whole end-to-end suite in one run.
- Re-check every earlier `Done when` against the real result.
- Fold `inventory/*.md` into `INVENTORY.md`, then remove the fragments.
- Duplication sweep, invariant check and token check.
- Compare each screen at 1440 and 390px against `design/saas-onboarding/v3`.
- List items deliberately left for later: a shared rate-limit store for multiple servers, mobile session refresh loss, Docker Compose Paddle settings, new APK build, and limits on the billing POST routes.

## Explicit non-scope

- Fixing anything found. Each finding becomes its own numbered spec appended to `README.md` and `PROGRESS.md` → spec 43.
- New features → spec 43.

## Steps

1. Clean install, then types, lint and build, recording real output.
2. Run both suites.
3. Walk every spec's `Done when`.
4. Fold the inventory and sweep for duplicates, raw colours outside `flow.css`, and any remaining trial wording.
5. Check each invariant in `ARCHITECTURE.md` against the code.
6. Record everything in the Log with real numbers, and file follow-ups.

## Done when

- [ ] Clean install, types, lint with 0 errors and 0 warnings, and build all pass. [static]
- [ ] Whole unit suites and whole e2e suite pass from clean; real counts in the Log. [suite]
- [ ] Every inventory fragment is folded into `INVENTORY.md`. [static]
- [ ] Every earlier `Done when` is re-checked and the result recorded. [static]
- [ ] Duplication sweep run; findings in the Log. [static]
- [ ] Every invariant is checked against the code. [static]
- [ ] No raw colour exists outside `flow.css`, and no token is used that is not listed. [static]
- [ ] Real sandbox results are stated separately, and nothing claims a real payment that did not run. [static]
- [ ] Every finding has a follow-up spec or a line saying why it is accepted. [static]
