# Hygene Ops implementation index

Approved scope: docs/product-discovery/PRODUCT_SCOPE_PROPOSAL.md. Approved design: design/v5 (2026-10-20). Technical evidence: docs/audit. Decisions: docs/implementation/DECISIONS.md. This is continuation Phase E; user authorizes execution after validator, overriding historical planning-only stops. Research/planning saved under docs/implementation to preserve existing docs.

| # | Spec | Wave | What it covers |
|---|---|---|---|
| 00 | [Launch decisions](00-launch-decisions.md) | 0 | Existing stack and D01–D12 |
| 01 | [P0 actor-safe self endpoints](01-actor-self-authorization.md) | 1 | P0 actor-safe self endpoints |
| 02 | [P0 historical worker site authorization](02-historical-site-scope.md) | 2 | P0 historical worker site authorization |
| 03 | [P0 fail-closed production runtime](03-production-runtime.md) | 1 | P0 fail-closed production runtime |
| 04 | [P0 atomic role-safe refresh sessions](04-refresh-session-safety.md) | 1 | P0 atomic role-safe refresh sessions |
| 05 | [P0 private attendance media boundary](05-attendance-private-media.md) | 3 | P0 private attendance media boundary |
| 06 | [Web component test harness](06-web-unit-harness.md) | 1 | Web component test harness |
| 07 | [Legacy attendance asset transition tooling](07-legacy-media-transition.md) | 4 | Legacy attendance asset transition tooling |
| 08 | [Protected attendance image presentation](08-attendance-media-ui.md) | 4 | Protected attendance image presentation |
| 09 | [Attendance write and calendar correctness](09-attendance-reliability.md) | 4 | Attendance write and calendar correctness |
| 10 | [Additive launch lifecycle persistence](10-launch-persistence.md) | 1 | Additive launch lifecycle persistence |
| 11 | [Workforce transfer and offboarding API](11-workforce-lifecycle-api.md) | 5 | Workforce transfer and offboarding API |
| 12 | [Task generation and assignment reliability](12-task-readiness.md) | 1 | Task generation and assignment reliability |
| 13 | [Atomic company registration](13-registration-atomicity.md) | 2 | Atomic company registration |
| 14 | [Account access and capacity policy](14-entitlement-policy.md) | 2 | Account access and capacity policy |
| 15 | [Paddle lifecycle API and configuration](15-billing-lifecycle.md) | 3 | Paddle lifecycle API and configuration |
| 16 | [Owner verification and recovery API](16-owner-identity-api.md) | 3 | Owner verification and recovery API |
| 17 | [Self credentials and assisted worker recovery](17-credential-handoff-api.md) | 2 | Self credentials and assisted worker recovery |
| 18 | [Credential epoch access revocation](18-credential-revocation.md) | 3 | Credential epoch access revocation |
| 19 | [Separate platform operator authorization](19-operator-identity.md) | 1 | Separate platform operator authorization |
| 20 | [Photo receipt and replacement contract](20-photo-submission-contract.md) | 1 | Photo receipt and replacement contract |
| 21 | [Fail-closed active photo qualification](21-photo-qualification.md) | 1 | Fail-closed active photo qualification |
| 22 | [Owner company settings API](22-company-settings-api.md) | 2 | Owner company settings API |
| 23 | [Immutable attendance annotations API](23-attendance-annotations-api.md) | 2 | Immutable attendance annotations API |
| 24 | [Platform company operations API](24-platform-company-api.md) | 4 | Platform company operations API |
| 25 | [Redacted diagnostics and inquiry operations](25-platform-support-api.md) | 5 | Redacted diagnostics and inquiry operations |
| 26 | [Wire launch backend routes and policies](26-launch-api-composition.md) | 6 | Wire launch backend routes and policies |
| 27 | [Approved v5 shared shell and route composition](27-workspace-shell.md) | 2 | Approved v5 shared shell and route composition |
| 28 | [Real derived setup and operational dashboard](28-setup-ui.md) | 4 | Real derived setup and operational dashboard |
| 29 | [Attendance exception context UI](29-attendance-context-ui.md) | 5 | Attendance exception context UI |
| 30 | [Account settings and recovery UI](30-account-ui.md) | 5 | Account settings and recovery UI |
| 31 | [Workforce access and transfer UI](31-workforce-ui.md) | 6 | Workforce access and transfer UI |
| 32 | [Real subscription lifecycle UI](32-billing-ui.md) | 5 | Real subscription lifecycle UI |
| 33 | [Platform company workspace](33-platform-company-ui.md) | 5 | Platform company workspace |
| 34 | [Platform sign-in and security workspace](34-platform-security-ui.md) | 3 | Platform sign-in and security workspace |
| 35 | [Platform service audit and leads UI](35-platform-service-ui.md) | 6 | Platform service audit and leads UI |
| 36 | [Truthful task and photo review UX](36-photo-review-ui.md) | 3 | Truthful task and photo review UX |
| 37 | [Native attendance/photo/account recovery](37-native-workflows.md) | 7 | Native attendance/photo/account recovery |
| 38 | [Configured support and service information](38-service-information.md) | 6 | Configured support and service information |
| 39 | [Launch operations and active CI proof](39-release-operations.md) | 7 | Launch operations and active CI proof |
| 40 | [Launch end-to-end suite](40-e2e-suite.md) | 8 | Launch end-to-end suite |
| 41 | [Final clean verification pass](41-verification-pass.md) | 9 | Final clean verification pass |

## Waves

- Wave 0: 00.
- Wave 1: 01, 03, 04, 06, 10, 12, 19, 20, 21.
- Wave 2: 02, 13, 14, 17, 22, 23, 27.
- Wave 3: 05, 15, 16, 18, 34, 36.
- Wave 4: 07, 08, 09, 24, 28.
- Wave 5: 11, 25, 29, 30, 32, 33.
- Wave 6: 26, 31, 35, 38.
- Wave 7: 37, 39.
- Wave 8: 40.
- Wave 9: 41.

## Dependency order

See docs/implementation/planning/dag.md: every edge consumes an ancestor contract. Security specs 01–05 run first locally despite other independent ready work. Use one coherent unit at a time; no automatic deployment.

## Status legend

Not started · In progress · Blocked · Done. Done means criteria passed, not production deployed. Tracker: PROGRESS.md; fresh-session read: AGENT-GUIDE.md and handoff.

## Open questions

External release facts only: configured IdP/MFA/people, verified sender/support recipient, Paddle catalog/terms/sandbox, legal/privacy/retention/exit, host/TLS/backup owner, signed Android distribution, customer calendar fit and consented photo qualification. Safe disabled boundaries are authorized. See D01–D12 for selected technical defaults.

## Known gaps

Latest single-spec continuation2026-10-29:36's local web behavior/V5 matrix is
verified, but full36is Blocked on the existing qualified retained-media/privacy/
native gate. Six remain30/34/36/37/40/41; no other unit started.450web/1444backend
(+7existing SQL skips)/106native tests and15scoped browser cases pass;58observations/
117PNGs. The original criterion stays unchecked. Current evidence/handoff:
V5_REVIEWS.md and SESSION_HANDOFF.md. The following38checkpoint is historical.


Spec36 continuation2026-10-29 extends the existing `evidence.service.ts` and
`reviewClosure.integration.ts`. Two added no-consumer warnings are source-index
false positives: evidence.route.ts already calls evidenceContent, and36directly runs
the standalone closure integration test. No new endpoint is introduced. These are
accepted alongside the ten existing warnings (12total); no unrelated spec/dependency
is changed merely to silence them.

Latest single-spec continuation2026-10-29:38's approved conditional web contract is
Done; six remain30/34/36/37/40/41. Spec30stays Blocked;38's default unavailable
states and production mail/legal/distribution/billing gates remain unchanged.
32Help/436whole web/110focused backend, lint/types/build and18actual-public-surface
visual observations pass;34PNGs inspected. Configured `.invalid` facts are fixtures,
not real approval. See current PROGRESS/SESSION_HANDOFF/V5_HELP. Earlier seven-unit
checkpoint below is historical. No new dependency edge or specification.

Continuation2026-10-29:33/35applicable web acceptance complete. Final validator
42specs/0errors/10warnings; remaining warnings are the existing decision/no-issue,
actual transitive consumption edges, deliberately long single40 and terminal
follow-up/verification reports described below. Native37new font/screens/cards
are explicitly consumed by40source preview; no unreferenced runtime is introduced.
Seven units remain30/34/36/37/38/40/41; native runtime and positive provider/mail/
legal/support/photo/privacy/device/production qualification are not inferred from
the source fixes, synthetic renders or successful builds.

Final VERIFICATION.md is a terminal report consumed by human release review, not a runtime endpoint; its no-consumer warning is accepted. Recorded decision spec 00 has no GitHub issue: a planning record, not a code task. Code specs without issues remain Not started until local execution. Hot-file re-edit needs explicit ownership transfer at serialized integration units 18/26/27; amend/validate before editing, do not presume wave-safe wiring. Existing app.ts starts jobs on import: spec 03 must validate first. E2E flow table is deliberately the long spec. External provider/device/restore tests cannot be replaced by unit mocks. Existing dirty CI/dashboard work stays intact. No claim that unimplemented specs are complete.

Spec25 directly consumes19 identity and24 operator audit typing;26 directly mounts24 routes even though25 also depends24. The validator flags these two transitive edges as redundant; retained because each records an actual consumed contract and imposes no additional execution wave.

Spec26 directly consumes14 account policy,15 billing routes and17 credential routes, also reachable transitively. Retain these three explicit consumption edges; the combined redundant-edge warning is accepted and add no wave.

Spec28 directly consumes14 account action evaluation alongside15 lifecycle metadata; its transitive14 warning is accepted because it is the actual readonly permission contract, not extra sequencing. Spec32 consumes the shared lifecycle client/type added by28, so28 is a real direct dependency.

Spec32 directly consumes15 billing lifecycle behavior and27 approved shell in addition to28 shared client types. Those transitive warnings record actual contracts and impose no extra wave. Spec40 consumes28 setup documentation, form entry points, translated copy and styling for its integrated reload/deep-link/role tests; the surface brief is review evidence, never a runtime dependency.

Spec30 consumes28 registered setup/navigation route composition while reusing27 shell; direct27 transitive warning recordsactualshell. Sharedmain/routeseditedserially duringparallelworktreeintegration.

Spec37 directly consumes26 composed manifests/allowedActions and structured forced-password denial, plus09attendance,17credentials,20receipts and21qualification semantics. Their transitive warning is accepted because those actualcontracts are tested directly. Spec37 moves toW7,40remainsW8.40 consumes nativeauth/recovery/navigation/notifications/screens andNATIVE_RECOVERY evidence; nativevisual/device qualification remainsunverified, not impliedbyExpoexport.

Spec31 serially consumes existing staff/manager parent forms and workforce dictionary; these are runtime callers of the owned actions. Consumer40 validates their integrated lifecycle flows. No new execution dependency on36.

Priority31/36 completed concurrently in isolated branches based37/PR64; neither depends on the other. Shared translation registration was resolved only on the verification branch, retaining both dictionaries. Next eligible32 is recorded but not started; see current PROGRESS/handoff. Original eight validator warnings remain justified above; new runtime callers/read DTO consumers are explicitly named in40.

Spec32 completed on the latest verified application checkpoint; actual dependencies remain15/27/28. Owner billing uses the server catalog/transaction and fresh portal contracts; public/legacy entry points consume the same canonical workspace.39/40 still own real provider/commercial qualification. Latest user requested this one next unit only; stop after32, identify33 but do not start it.

Spec40 validation2026-10-21: the three additional no-consumer warnings are accepted. frontend/package.json and package-lock.json are existing tooling manifests transferred from06, not new application endpoints; npm and CI consume them directly. E2E_DEFECTS.md is a human-reviewed proposed fix report consumed by E2E_RESULTS and the final handoff, not a runtime module. Combined with the eight previously justified warnings, validator reports42specs/0errors/11warnings. Ignored approved design/v5 references are made available read-only from the preserved root design folder in the isolated worktree; no redesign or design commit.

V5 corrective visual acceptance (2026-10-21): historical UI completion has been
reopened in27–38 while retaining prior logs. Functional and visual statuses are
tracked independently in docs/implementation/V5_IMPLEMENTATION.md. Screenshot
capture alone does not certify fidelity. Spec40 remains the existing long integrated
flow table; its extra visual-evidence consumption log is intentionally retained
rather than split into a second E2E spec. No extra architecture or dependency wave.

Spec40 remains the single integrated flow table; its additional correction logs may exceed130lines. This is an intentionally long E2E record already accepted above, not a reason to create a second E2E specification.

V5 correction validator2026-10-22:42specs/0errors/12warnings. The additional long-spec40 warning is accepted because40 remains the sole integrated browser/screenshot harness by project contract; its explicit consumption and evidence log are retained rather than splitting browser ownership into another execution spec. Existing11warnings remain justified above.

Spec32 V5 acceptance2026-10-29:15/27/28 remain the actual consumption dependencies; no graph edge or wave changed. Ownership of additive lifecycle DTO and serialized shell presentation transferred before editing. Current32webDone,9remain.86paired/state PNG artifacts and27+2actual browser cases do not qualify live Paddle or complete40. Existing12validator warnings remain documented above. Next33 is locally eligible via24/27; its positive IdP qualification stays external.

## Additive feature42

| Spec | Wave | Consumes |
|---|---|---|
| [42 — Location staff import](42-location-staff-import.md) | 7 | 09, 14, 17, 28, 31 |

Spec42 consumes09attendance windows,14capacity transactions,17secure handoff,28location workspace and31staff management. Original40/41 gates retain numbering and scope; this post-plan feature uses their existing browser/release harness rather than replacing them. See docs/planning/location-staff-import-assessment.md.

### Spec42 known gaps and validation notes

The original40/41gate numbers remain frozen at user request;42 is a sequential additive feature after that plan. Its direct09/14/17dependencies name consumed behavior even where transitively implied. Issue108 may trigger the validator’s raw-colour heuristic; it is an issue number. Prior00missingissue,25/26/28/30/32/37redundantedges,36evidence/testconsumer,40length/defectledger and41finalreport warnings are inherited, not new feature failures. Copied local design/v5 references are validation inputs preserved byte-for-byte, not feature changes to commit.

Spec42 latest user amendment adds a required Password column and immediate staff email/password login, superseding handoff-only initial access. Existing handoff remains recovery. File receipts use HMAC; previews/receipts/audits never contain passwords. User-authorized local5173/8080services now run the feature checkout.

## Local platform login extension43

[Spec43](43-local-platform-login.md) consumes19operator principal,27AuthShell,33Companies and35Service surfaces. It adds explicit local-only password sessions; it does not complete34provider/MFA acceptance. Existing shipped34 boundary is extended serially; blocked production qualification remains unchanged. No original spec is renumbered.

### Spec43 known gaps

The issue110 raw-colour warning is an issue identifier, not a colour. Its direct19dependency documents the principal/auth boundary consumed even where33/35 imply it transitively. The original44-plan gates remain40/41 at user-requested frozen numbering;43uses their existing browser harness as a scoped sequential extension. The explicit local-platform browser mode is opt-in; its positive test runs with HYGENE_E2E_LOCAL_PLATFORM=true, and the default suite retains provider-disabled behavior. Previous documented warnings remain accepted.
