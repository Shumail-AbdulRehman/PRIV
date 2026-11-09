# Spec 32 — Staff web handoff screen

**Status:** Done
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

- [x] `cd frontend && npx vitest run src/routes/launchPages.test.tsx` passes and proves: staff see the handoff, sign out works, and managers are unaffected. [unit]
- [x] `npm test --prefix frontend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/32-staff-web-handoff.md` lists what this spec created for reuse. [static]
- [x] `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` pass with 0 errors, 0 warnings. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-11-10** — Continued the existing partial implementation in this folder. Reviewed the narrow `FlowShell` handoff and approved English/Urdu attendance/task instructions; retained the approved Android distribution link, company guidance, signed-in identity, Android information link and existing logout hook with pending/error feedback. `WorkspaceAudience` logic and `WorkspaceRouteError` remain unchanged. No extra application changes were necessary after review.
- **2026-11-10** — All Done when commands ran in this session with `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`: focused `cd frontend && npx vitest run src/routes/launchPages.test.tsx` **30 passed**; `npm test --prefix frontend` **88 Node + 2,108 Vitest passed** across 58 Vitest files, **0 failures/skips** (the focused cases are included in the Vitest total); `cd frontend && npx tsc -b --noEmit` and `npm run lint --prefix frontend` passed with **0 errors, 0 warnings**; `npm run build --prefix frontend` passed. The build reported the existing nonblocking plugin-timing advisory; Node tests reported the existing mobile translation module-type warning. Neither requires a change within this spec.
- **2026-11-10** — Reviewed and completed the inventory fragment with this session's verification record. No test-only scope exception was needed. Browser layout, physical Android devices, actual downloads and live sign-out requests were not verified; component tests mock auth and API boundaries. No real Paddle, database, migration, deployment, GitHub issue/PR, commit, merge, push or branch operation was used. Status and PROGRESS.md were left unchanged per run instructions.
