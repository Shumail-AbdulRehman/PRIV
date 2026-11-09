# Spec 32 — Staff web handoff screen

**Status:** Not started
**Depends on:** Spec 03, Spec 04
**Model:** Light — `claude-haiku-5-5` · `gpt-6.1-sol` · `gemini-3.5-flash-lite`
**Issue:** —
**Owns:** `frontend/src/routes/launchPages.tsx`, `frontend/src/routes/launchPages.test.tsx`, `specs-saas-onboarding/inventory/32-staff-web-handoff.md`
**Reuses:** `design/saas-onboarding/v3/index.html`, `frontend/src/pages/Onboarding/FlowShell.tsx` (spec 03)

## Goal

Show staff who sign in on the web a clear message in the new design.

## Scope

- `StaffWebHandoff` uses `FlowShell` at narrow size.
- Copy tells them attendance and tasks are in the Android app.
- Keep the download link when configured, and sign out.
- `WorkspaceAudience` guard logic and the route error screen are unchanged.

## Explicit non-scope

- Login routing → spec 40.
- Mobile app → spec 43.

## Reuse first

- Keep `useLogout` and `serviceInformation`.

## Steps

1. Swap the shell.
2. Update copy.
3. Update tests.
4. Record what you created in `specs-saas-onboarding/inventory/32-staff-web-handoff.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [ ] `cd frontend && npx vitest run src/routes/launchPages.test.tsx` passes and proves: staff see the handoff, sign out works, and managers are unaffected. [unit]
- [ ] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/32-staff-web-handoff.md` lists what this spec created for reuse. [static]
- [ ] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
