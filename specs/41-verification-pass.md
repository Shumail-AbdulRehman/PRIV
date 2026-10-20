# Spec 41 — Final clean verification pass

**Status:** Not started
**Depends on:** Spec 40
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `docs/implementation/VERIFICATION.md`
**Reuses:** `specs/INVENTORY.md`

## Goal

Final clean verification pass in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

From clean installs run all unit/component/native suites, builds and final integrated suite. Recheck every earlier criterion, tenant/audience denial, dependency coverage, EN/UR/RTL/responsive keyboard interaction, configured provider and physical-device gates. Fold inventory fragments; sweep duplicate exports/components/date helpers/raw palette values/stale paths. File new fix specs for defects; do not call release ready while external gates remain unmet.

Recheck `docs/implementation/E2E_RESULTS.md`, `.github/workflows/ci.yml`, `docs/implementation/VERIFICATION.md` and `frontend/playwright.config.ts`; native flow files under `frontend-mobile/e2e/`.

## Explicit non-scope

- Integrated test implementation → spec 40.

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

- [ ] Clean whole backend/web/mobile unit suites and browser/native end-to-end flows pass; record exact counts. [suite]
- [ ] Earlier criteria, inventory duplication sweep and external launch gates all rechecked with evidence. [static]
- [ ] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [ ] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [ ] `npm run build --prefix frontend` passes. [static]
