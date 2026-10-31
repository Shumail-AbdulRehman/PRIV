# Spec 42 — Location-based bulk staff import

**Status:** Done
**Depends on:** Spec 09, Spec 14, Spec 17, Spec 28, Spec 31
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #108
**Extends serially:** `backend/src/controllers/staff.controller.ts`, `backend/src/routes/location.route.ts`, `backend/src/utils/syncAttendanceWindow.ts`, `backend/src/utils/syncAttendanceWindow.test.ts`, `frontend/src/pages/Location/LocationDetailPage.tsx`, backend dependency manifests.
**Owns:** `specs/inventory/42-location-staff-import.md`, `backend/src/services/staffProvisioning.service.test.ts`, `backend/src/services/staffImport.service.ts`, `backend/src/services/staffImport.service.test.ts`, `backend/src/services/staffProvisioning.service.ts`, `backend/src/routes/staffImport.route.ts`, `frontend/src/pages/Location/StaffImportDialog.tsx`, `frontend/src/pages/Location/StaffImportDialog.test.tsx`
**Reuses:** `design/v5/location.html`, `design/v5/workforce.html`, `DESIGN-SYSTEM.md#component-conventions`, `backend/src/services/accountAccess.service.ts`, `backend/src/services/credentialHandoff.service.ts`, `backend/src/validations/staff.validation.ts`, `backend/src/utils/dateTime.ts`, `frontend/src/pages/Location/LocationDetailPage.tsx`, `specs/DESIGN-SYSTEM.md`

## Goal
Enable an owner or assigned-site manager to preview and atomically create staff from a location-scoped spreadsheet without exposing passwords or bypassing existing scheduling/capacity rules.

## Scope
User explicitly requests one feature specification and sequential implementation. This additive spec follows the original42 without renumbering them. Preserve approved V5 blue/white tokens and frozen design. Treat existing Staff and shifts screen/dialog composition as the design source.

Use Full Name, Email, Phone, Shift Start, Shift End; require valid names/emails/phone and distinct paired HH:mm times. No location/password columns. Provide XLSX template, accept XLSX and CSV through one validation contract. Selected request location/timezone is authoritative.

Bound uploads/expanded zip bytes/cell content/rows; reject formulas, links, macros, duplicate/extra/missing headers and malformed structures. Retain no files. Preview creates no accounts. Report physical spreadsheet row errors and aggregate valid/error counts without disclosing other tenants' identities.

Revalidate identity, active location, current manager assignment, duplicate emails and subscription capacity at confirmation. Reject any invalid row. Serialize with existing company capacity locks; all accounts, assignments and receipt commit together. Repeated confirmation returns reconciled result; concurrent conflicts leave no partial records. Signed previews expire and bind actor/company/location/content.

Reuse current locationId and shift fields with IANA timezone conversion. Do not create shift/task models or historical attendance. New accounts use cryptographically random inaccessible passwords and forced replacement. Provide existing individual reauthenticated one-use access handoff instructions after import; no batch secrets/export/email delivery dependency.

## Explicit non-scope
- Provider email qualification and account recovery acceptance → spec 30.
- Platform identity/OIDC integration → spec 34 (postponed by user).
- Native device/photo qualification → spec 37.
- Integrated browser acceptance → spec 40.
- Full release certification → spec 41.

## Reuse first
- Extract the existing staff insertion into a transaction-compatible service shared with individual creation; preserve Prisma hashing hooks.
- Keep existing account capacity, location authorization, time conversion, handoff and cache invalidation.
- Use existing Dialog/Button/Input, language context and location Staff tab.

## Steps
1. Record source-grounded assessment and preserve dirty work in isolated worktree.
2. Implement bounded parsing/template, normalized row validation and duplicate detection.
3. Implement actor/site-bound preview and atomic confirmed creation with durable retry receipt.
4. Add V5 location entry/dialog with template/upload/preview/errors/confirmation/results and EN/UR.
5. Verify overnight compatibility, secure handoff, batch limits/performance and unchanged individual creation.
6. Record commands, actual outcomes and unavailable acceptance in tracker/handoff/inventory.

## Done when
- [x] Parser/service tests cover valid XLSX/CSV, malformed/oversized/formula/header inputs, row errors, duplicate emails, overnight/timezone handling and500row validation. [unit]
- [x] Service tests prove role/site/tenant denials, stale authorization, capacity, rollback, concurrent/duplicate confirmation and no preview writes. [unit]
- [x] StaffImportDialog component tests cover template/upload/preview/errors/pending/confirmation/success and EN/UR. [unit]
- [x] Whole affected backend/web unit suites pass; counts recorded. [unit]
- [x] Real PostgreSQL proof covers imported company/site/shifts, rollback/retry and credential handoff authentication. [requires: isolated PostgreSQL]
- [x] Existing browser harness verifies desktop/phone EN/UR with real API/SQL and records screenshots. [requires: spec 40 browser runtime]
- [x] No existing dirty changes or unrelated specs altered; no migration, mail dependency, merge or deployment. [static]
- [x] Backend/frontend TypeScript and touched frontend lint pass. [static]
- [x] `npm run build --prefix backend` and `npm run build --prefix frontend` pass. [static]

## Log
- **2026-10-31** — Restored source/Git/PR context. Valid with capacity, shared-provisioning and first-shift adaptations; see docs/planning/location-staff-import-assessment.md. Isolated a8728ed-based branch created; no implementation acceptance claimed.

- **2026-10-31 — Complete locally:** shared individual/import insertion, safe XLSX/CSV preview/atomic confirmation and V5 EN/UR location dialog delivered.42focused backend and4dialog cases pass; final whole backend1471passed/7pre-existing skips; web64Node+394React; touched lint and both builds pass. Real API/migrated SQL/Chromium3cases pass35.3s;200staff commit13,383ms;500row capacity denial, secure handoff/authentication, individual creation, stale authorization, concurrency/rollback and Staff Management verified. Eight actual UI/four unchanged reference captures inspected at1366/390EN/UR. No child test DBs remain; owned proof cluster stopped. Device/provider gates remain original30/34/36/37/40/41. Source/review bookkeeping follows in handoff.

- **2026-10-31 — Review publication:** source eed787a pushed; OPEN/DRAFT PR109 https://github.com/Shumail-AbdulRehman/PRIV/pull/109, base build/hygeneops-android-testing-20261029. Issue108 assigned. No merge/deploy; root source unchanged. Final documentation-only checkpoint follows.
