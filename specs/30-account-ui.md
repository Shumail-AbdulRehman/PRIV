# Spec 30 — Account settings and recovery UI

**Status:** Not started
**Depends on:** Spec 16, Spec 17, Spec 22, Spec 27
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Account/AccountPages.tsx`, `frontend/src/pages/Account/AccountPages.test.tsx`, `frontend/src/pages/Account/api.ts`, `specs/inventory/30-account-ui.md`
**Reuses:** `frontend/src/components/common/AuthShell.tsx`, `frontend/src/pages/Login/LoginPage.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/recovery.html`

## Goal

Account settings and recovery UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Implement real reset/verify/self-password and owner Organization settings forms; neutral request states, expired/used links, force replacement and unavailable delivery. Clear cached identity on credential changes. Register actual pages via spec27 ownership handoff; no pretend sent mail.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Backend launch API wiring → spec 26.

## Reuse first

- Read the named existing paths before adding code; reuse their public contracts.
- Search INVENTORY.md plus fragments; preserve existing provider and component seams.
- No raw sample operational data, invented policies or secret fallback values.

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [ ] `npm run test:components --prefix frontend -- src/pages/Account/AccountPages.test.tsx` passes: Owner/manager separation, required/current password, expired recovery, unavailable sender and saved-setting display tested. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
