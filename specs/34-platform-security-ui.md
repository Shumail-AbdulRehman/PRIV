# Spec 34 — Platform sign-in and security workspace

**Status:** Not started
**Depends on:** Spec 19, Spec 27
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `frontend/src/pages/Platform/OperatorLogin.tsx`, `frontend/src/pages/Platform/OperatorLogin.test.tsx`, `frontend/src/pages/Platform/operatorSession.ts`, `specs/inventory/34-platform-security-ui.md`
**Reuses:** `frontend/src/components/common/AuthShell.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/operator-login.html`

## Goal

Platform sign-in and security workspace in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Use configured OIDC sign-in/MFA/own security provider handoff with safe redirect/state/PKCE according to selected provider docs before enabling. No local operator signup or tenant JWT reuse. Missing provider shows unavailable; logout clears operator query scope.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Platform/OperatorLogin.test.tsx` passes: Missing config stays disabled; state/nonce mismatch rejected; tenant auth never treated as operator; MFA assurance required. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
