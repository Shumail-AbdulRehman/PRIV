# Spec 38 — Configured support and service information

**Status:** Not started
**Depends on:** Spec 27, Spec 25
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend/src/pages/Help/HelpPage.tsx`, `frontend/src/pages/Help/HelpPage.test.tsx`, `frontend/src/pages/Help/serviceInformation.ts`, `docs/implementation/COMMERCIAL_CONTENT.md`, `specs/inventory/38-service-information.md`
**Reuses:** `frontend/src/components/layout/PublicLayout.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/information.html`

## Goal

Configured support and service information in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Consume spec25 `/api/support/contact` explicit availability; no invented support address or assumed verified delivery.


Provide actual support path, approved service/privacy/exit text via explicit configured facts. Unavailable recipient/legal terms/Android link shows unavailable and blocks purchase/release where required. Describe current supported photo guarantees; no invented legal promises, refund policy, prices or retention. Register via shell ownership handoff.

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

- [ ] `npm run test:components --prefix frontend -- src/pages/Help/HelpPage.test.tsx` passes: Missing support/link/policy never renders a working claim; configured safe links use expected origin; EN/UR assistance available. [unit]
- [ ] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
