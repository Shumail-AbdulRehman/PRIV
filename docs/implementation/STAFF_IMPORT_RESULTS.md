# Spec42 — location staff import verification, 2026-10-31

## Result and scope
Location-based importing fits current architecture. Staff have one current site and inline shift instants; there is no Shift table to reuse or duplicate. Required columns follow current creation requirements: Full Name, Email, Phone, Shift Start, Shift End. CSV and XLSX share parsing/validation/confirmation. Phone text preserves leading zeros, and native Excel time cells are accepted. Existing plan limits remain3/25/200 active staff company-wide, despite the parser accepting500rows. DAILY rules include every calendar day.

Backend endpoints: GET `/api/location/:id/staff-import/template`, POST `.../preview`, POST `.../confirm`. Authorized path location is authoritative; sheets cannot specify locations/passwords. Upload limits1MB compressed,8MB actual expanded ZIP content,256entries and500rows; reject unsupported files, headers, macros/external links, formulas, invalid identities/times and duplicate emails. Files remain in request memory only. Signed previews expire in10minutes and contain a digest, not employee rows. Preview is read-only.

Confirmation rechecks JWT actor/current company/site membership, active location, entitlement/capacity and normalized global email uniqueness under database locks. It uses the same shared staff insertion as individual creation. Prisma bcrypt10 hashes random inaccessible initial passwords; no credentials appear in import output. Existing individual staff-access handoff requires manager password reauthentication and establishes a one-use30minute password replacement code. Email delivery is unnecessary and no owner-mail/provider qualification is claimed.

Same-transaction AuditLog digest receipts reconcile duplicate submissions. Actual concurrent confirmations created one staff row. Injected second-row database failure left zero batch staff. Existing first-shift guard prevents a new hire acquiring an absence before account creation. Existing overnight/site-zone/geofence/late/checkout rules are retained; tasks are not fabricated.

## Commands and actual outcomes
All complete runs below used one worker, at nice15, after the user reported laptop contention. The initial concurrent attempts were stopped and are not acceptance evidence.

- `node backend/node_modules/vitest/vitest.mjs run --root backend --maxWorkers=1 src/services/staffImport.service.test.ts src/services/staffProvisioning.service.test.ts src/utils/syncAttendanceWindow.test.ts`: **42passed/3files**,4.47s. Includes native Excel times, compressed-expansion bound,500row parsing, invalid phone/name/email/shift/header/formula cases, duplicate detection, token actor/file binding, preview no writes, secure provisioning and first-shift guard.
- Whole backend initial complete regression: **1469passed,7pre-existing skips/97files**,79.28s. Two later parser tests and narrow validation refinements were subsequently checked by the42focused tests. Final whole rerun from backend directory: **1471passed,7pre-existing skips/97files**,79.86s. An intervening run launched from frontend was stopped after a cwd-dependent runtime-security subprocess failure; it is not acceptance evidence.
- Web Node tests with `--test-concurrency=1`: **64passed**,3.35s. Whole React suite with `--maxWorkers=1`: **394passed/29files**,87.46s. Focused final import dialog: **4passed**,2.22s.
- `npm run build --prefix backend` and `npm run build --prefix frontend`: passed on final source. Frontend build12.79s; advisory plugin timing warning only. Guarded browser runner additionally compiled backend, strict browser TypeScript and production frontend.
- Touched frontend ESLint: passed from frontend directory with no findings. One wrong-directory invocation failed to locate config; that was corrected without changing lint policy.
- `HYGENE_E2E_DATABASE_URL=postgresql://shumail@127.0.0.1:56443/priv_e2e_test node frontend/e2e/run.mjs staff-import.spec.ts`: final **3passed/35.3s**, real API, all migrations and disposable synthetic PostgreSQL17 child, Chromium one worker. No successful API responses were intercepted or fabricated.
- Actual200employee commit: **13,383ms** on this laptop with unchanged30s transaction budget.500row preview rejects excess Enterprise capacity. No commercial limit was increased. Test runner's added Enterprise catalog entry is a synthetic fixture only; real provider operations remain disabled.
- Browser cases verify XLSX and CSV template/upload, no preview writes, SQL company/site/overnight times/hash/forced replacement, secure handoff completion and staff authentication/profile, Staff Management visibility, owner/manager authorization, unassigned manager/foreign company/STAFF rejection, stale manager assignment rejection, concurrent idempotency, individual creation regression and injected batch rollback.
- Spec validator: **43specs,0errors,14documented warnings**; copied unchanged local V5 references were validation inputs. No existing specification was renumbered.

## Render evidence
`docs/implementation/v5-import-evidence/` contains eight real React screenshots plus four unchanged Staff-tab references: preview/success at1366×900 and390×900, English/Urdu. All identities are synthetic; traces/video and credential screenshots are disabled. Desktop/phone previews were visually inspected; replacing the custom table with the shared paginated DataTable corrected cramped phone cells and retained readable mixed-direction values. DialogTrigger restores keyboard focus to the entry button. Body horizontal overflow checks pass.

Approved frozen design/v5/location.html and workforce dialogs supply blue/white tokens and composition. This new import state has no pre-existing exact prototype; unchanged Staff-tab reference captures document the inherited visual system rather than claiming pixel identity with an invented reference. No frozen prototype files are committed with this feature.

## Verification limits and original gates
Physical Android camera/GPS/geofencing/checkout execution and real email/photo-provider qualification were not performed. Existing attendance logic and overnight/pre-onboarding regression tests passed; genuine media/device acceptance remains in original36/37/40. Alternate-port manual startup instructions are documented but not executed against the user's existing local database. Existing root dirty runtime fixes remain root-only and were not copied into the feature branch. No production/remote database action, migration of a real database, OAuth work, PR merge or deployment occurred.

Original six unresolved specs remain30/34/36/37Blocked,40In progress,41Not started. Feature42 does not close those gates.

## Cleanup and completion
The final real browser run passed3/3. Reference capture passed4/4. Owned test-cluster inspection found zero generated child databases, then only that cluster was stopped. Final spec validation output is docs/planning/location-staff-import-validator.txt. Spec42 is complete locally; review PR remains draft and unmerged. The task’s current source is the isolated worktree, not the unchanged live root service.
