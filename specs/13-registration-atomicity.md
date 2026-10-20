# Spec 13 — Atomic company registration

**Status:** Done
**Depends on:** Spec 06
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #16
**Owns:** `frontend/src/pages/Signup/queries.ts`, `frontend/src/pages/Signup/types.ts`, `frontend/src/pages/Signup/SignUpPage.tsx`, `frontend/src/pages/Signup/queries.test.tsx`, `backend/src/controllers/manager.controller.ts`, `backend/src/services/companyRegistration.service.ts`, `backend/src/services/companyRegistration.service.test.ts`, `backend/src/controllers/companyRegistration.controller.ts`, `specs/inventory/13-registration-atomicity.md`
**Reuses:** `backend/src/controllers/manager.controller.ts`, `backend/src/validations/manager.validation.ts`

## Goal

Atomic company registration in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Transact Company and first ADMIN owner using existing bcrypt and signup validation. Reject role/plan/operator claims. Map duplicate concurrent registrations safely. Keep successful persistence separate from post-creation session delivery. Delegate the existing signup export to the new handler immediately, preserving the route contract; wider policy wiring remains26.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Shared visual/navigation composition → spec 27.

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

- [x] `npm test --prefix backend -- src/services/companyRegistration.service.test.ts` passes: Failure creates neither orphan company nor owner; duplicate race has one owner; client cannot select role/company entitlement. [unit]
- [x] `npm test --prefix backend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `cd backend && npx tsc --noEmit` passes; no backend lint script exists. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

- **2026-10-20** — Claimed https://github.com/Shumail-AbdulRehman/PRIV/issues/16. Own existing manager controller to delegate signup only; preserve other endpoints and user changes elsewhere. Reuse Prisma password-hashing query extension within transaction, never double-hash.
- **2026-10-20** — Required caller integration extends this atomic signup outcome boundary: signup must not dispatch fake authenticated state when account committed but cookie/session issuing failed. Add narrow existing-hook/page handling and regression tests; no new screen or redesign. Preserve case-sensitive incumbent email login contract; no silent normalization of only signup.
- **2026-10-20** — Company/ADMIN inserts share transaction, explicit safe DTO/strict claim rejection, bounded nonblank names and bcrypt UTF8 length. Existing email case and Prisma hashing extension preserved. Signup session persistence is separate CAS and cannot replace an intervening login;201 carries sessionEstablished false on failure. Existing React hook/page handle this flag without authenticating/redirecting; owner type corrected.13 targeted backend +3 hook tests; whole backend739/739 (73 files); full web57+18 and both builds/touched UI ESLint pass. Transaction rollback/unique failure tested at injected Prisma boundary; real PostgreSQL race/hash/rollback remains integrated gate40, not claimed as exercised.
- **2026-10-20** — Scoped draft https://github.com/Shumail-AbdulRehman/PRIV/pull/19 published, stacked on09; not merged.
- **2026-10-20** — Supplemental isolated PostgreSQL proof in spec10 migration rehearsal: simultaneous registerCompany calls produce one owner/company, duplicate leaves no orphan, actual bcrypt hash compares successfully (exactly once). No production accounts touched.
