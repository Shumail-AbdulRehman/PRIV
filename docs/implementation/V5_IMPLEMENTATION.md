# Approved V5 implementation correction

Current status: **incomplete**. This is implementation against existing approved
V5, not a new design. Historical specification logs/checkmarks are retained;
passing functional checks did not establish visual acceptance.

## Environment verified before edits

- Checkout: `/home/shumail/bkacup-16-oct-bkpriv/bk-Priv/PRIV`, initially
  `implementation/spec-40-launch-e2e`, HEAD `e0337b4`; correction branch
  `implementation/v5-visual-corrections` derives from that revision.
- Vite PID40737 serves this checkout's `frontend` on127.0.0.1:5173.
  API proxy targets127.0.0.1:8080; client defaults to `/api`.
- Listener8080 PID46772 cwd is **this checkout/backend**, launched by the
  local-development launcher. The older-main assumption is no longer current.
  A second watch tree exists; no existing watch process was terminated.
  The unrelated old verification worker is outside this task and left untouched.
- Draft stack inspected with `gh pr list`: PR81/spec40 based39, and independent
  testing-APK PR80 based39. No PR merged, branch reset or force push.
- Existing tracked dirty CI/gitignore/DESIGN/backend/dashboard/manager dictionary/
  handoff and untracked design, performance, skills and investor work preserved.
  Initial tracked diff saved `/tmp/hygene-v5-start.patch`. Selective staging only.
- Screenshots/integrated tests use the existing guarded spec40 runner, fresh migrated
  UUID child databases under the owned local56442 test cluster. No screenshots of
  restored customer records; no production services/data or provider activation.
- ADB found at `~/.local/share/hygeneops-tools/platform-tools/adb`;
  `adb devices -l` lists **no connected devices**. Native visual checks unverified.

## Complete prototype-to-application inventory

FI=functional implementation; VI=V5 visual implementation; FV=functional verification;
VV=paired V5 visual acceptance. Historical functional work is not retested merely by
reading its old log. **Pending** includes screen/state checks still to perform.

| V5 entry | Actual route/screen | FI | VI | FV | VV / required work |
|---|---|---|---|---|---|
| manager | `/today-status` owner/manager | Existing + corrected filters/drawer | Core composition corrected | Current unit/API/integration checks passed | Core EN/UR desktop/phone + drawer/menu inspected; documented deviations, broader matrix remains open |
| owner | `/dashboard` owner | Supplied performance API preserved | V5 metric/trend/attention/register implemented | Actual scoped rates, periods, search, deep links and SQL proof | Paired1366/390ENUR + states inspected; Spec28Done, V5_SETUP.md |
| overview | `/dashboard` manager | Scoped performance API | V5 historical count chart/actions implemented | Actual assigned-site API, denial and navigation | Paired1366/390ENUR inspected; truthful totals, Spec28Done |
| location | `/locations`, `/locations/:id` | Persisted list/detail/forms/tabs retained | V5 register and detail composition | Real edit/create/quota/denial/localday/schedule proofs | Paired1366/390ENUR + six tabs/forms/states inspected; V5_LOCATIONS.md, Spec28Done |
| team | `/staff`, `/staff/:id`, `/managers` | Real directory/hire/edit/detail + retained APIs | V5 frames/mobile/ENUR implemented | Current unit/API/SQL hire/edit/handover/role proof | Paired1366/390ENUR + forms/states inspected; detail derived from approved placeholder; Spec31webDone (V5_WORKFORCE.md) |
| attendance | `/attendance` | Actual scoped location/from/to + secondary filters | V5 register/metrics/mobile implemented | API filters403/empty/localday and unit proof | Paired1366/390ENUR register/lower/photos + manager/loading/error inspected; Spec29webDone |
| attendance-case | existing attendance context dialog | Immutable note/ack/exact retry/real409review | V5 facts/history + editor rail/mobile stack | Actual SQL capturedfacts unchanged, notes persist/retry once | Paired1366/390ENUR context/form/conflict + phone manager inspected; dialog vs prototype fullpage recorded; Spec29webDone |
| reviews | `/exceptions`, `/exceptions/:id` | Existing workspace + refresh/selected-view/keyboard/private delivery correction | V5 blue/white queue/evidence/facts/decision with44/48px zoom controls |50focused/450web/1444backend(+7skips),3SQL scripts,15scoped browser cases | Paired1366/390ENUR+1920core and states inspected,58observations/117PNGs; full36Blocked on qualified retained-media/privacy/native gate; V5_REVIEWS.md |
| setup | `/setup` and linked existing setup forms | Persisted derived readiness and forms | V5 checklist/rail + actual Dialog forms | Actual saved area/schedule reaches4/4 afterreload; unknown/readonly/denial proof | Paired1366/390ENUR + loading/error/empty/forms inspected; V5_SETUP.md, Spec28Done |
| workforce | staff/manager access/transfer/recovery dialogs | Reasoned actions + draft/context refresh retained | V5 dialogs/manager choices implemented | Actual transfer409/history/session/recovery/capacity proof | ENUR1366/390 forms/conflict/retry/denial/validation inspected; Spec31webDone; no native/provider qualification |
| billing | `/subscription` | Actual lifecycle/catalog/transaction/portal guards retained | V5 subscription/capacity/activity stack and help rail |64Node+348React;1449backend+SQL;actual API/SQL browser proof | Paired1366/390ENUR+loading/error/empty/reconciliation/period/overcapacity inspected; Spec32webDone; actual merchant/provider qualification external; V5_BILLING.md |
| settings | `/settings`, `/account/security` | Existing + tabs/name refresh/draft correction | V5 Organization/My account/Security core implemented | Current246React + actual API/SQL save/conflict/refresh/denial checks | Paired EN/UR1366/390 core + unverified/bootstrap/network/stale draft inspected; additional ENUR390 pending/403/transport states inspected; provider-issued delivery open; V5_SETTINGS.md |
| login | `/login`, company registration `/signup` | Existing + registration destination corrected | V5 public cards and real translated forms | Current235React + real owner/staff/registration browser checks | Paired EN/UR1366/390 inspected; real fields replace prototype identities (V5_AUTH.md) |
| recovery | `/recover-owner-account`, `/reset-owner-password` | Existing retained | V5 public form implemented | Current unit/API negative and restricted-account flows | Paired EN/UR1366/390 inspected; successful delivered-link/provider qualification open |
| verify | `/verify-owner-email` | Existing explicit POST retained | V5 public form implemented | Current unit + actual invalid-token400 | Paired EN/UR1366/390 inspected; positive issued-link/provider qualification open |
| access | `WorkspaceGate` inside operational DashboardLayout | Actual owner inactive/suspended recovery; unpaid reads retained | V5 next-step panel with scoped owner styles | Actual operations403, owner lifecycle/security/help, pending/error/retry and company isolation verified | Paired1366/390ENUR and inactive/loading/error phone inspected; first standalone CSS collision corrected and recaptured; Spec32webDone |
| handoff | STAFF role web handoff | Existing + approved distribution guard reused | V5 public handoff implemented | Real staff login/logout + role-denial checks | Paired EN/UR1366/390 inspected; no native qualification claim |
| help | `/help` | Existing + real FAQ/navigation | V5 split panels implemented with public access shell | Current246React + real public support/navigation and labelled network retry | Paired EN/UR1366/390 + FAQ/loading/error independently inspected; unsupported prototype ticket form omitted; configured-positive channel unqualified; V5_HELP.md |
| information | `/service-information` | Existing configured facts | Distinct V5 centered public card implemented | Current unit + real configured-off public API | Paired EN/UR1366/390 independently inspected; longer truthful content; positive legal/distribution/provider gates open; V5_HELP.md |
| operator-login | `/platform/login`, callback | Safe-disabled without qualified IdP | V5 public boundary implemented | Current tenant-cookie denial and no-bootstrap proof | Paired1366/390ENUR login/callback inspected; positive IdP blocked; OPERATOR_UI.md, PR95 |
| platform | `/platform/companies` | Actual bounded metadata and filters retained | V5 sidebar/header/metrics/register implemented |18company component cases + actual backend SQL; default guards deny | Paired1366/390ENUR + states inspected via named synthetic transport; applicable33Done; positive IdP remains34/40 |
| customer | `/platform/companies/:companyId` Account/Billing/Activity | Exact reason/version and uncertain refresh | V5 split profile/access/context, billing/activity and readable phone confirmation | Conflict/lost-response/pending/reload, SQL/audit rollback and guards verified | Paired ENUR desktop/phone inspected; fixture positive identity explicitly synthetic;33webDone |
| operator-security | `/platform/security` | Existing safe boundary retained | V5 public security boundary implemented | Actual local cleanup preserves tenant cookies; guarded APIs401 | Paired1366/390ENUR inspected; positive provider security unqualified; PR95 |
| service | `/platform/service` | Real redacted facts/support retry | V5 diagnostics/support split implemented |27service component cases + actual backend SQL and guards | Paired ENUR1366/390 + stale-contact/loading/error inspected;35webDone, positive provider unqualified |
| audit | `/platform/audit` | Bounded filters/paging/redaction retained | V5 register/mobile details implemented | Actual SQL redaction + components/guarded API checks | Paired ENUR1366/390 inspected; duplicate mobile action corrected;35webDone |
| leads | `/platform/inquiries` | Versioned handling/reason/ownership retained | V5 queue/detail/handling split implemented | Draft retention, pending/conflict/uncertain, SQL one-winner/rollback verified | Paired ENUR1366/390 + significant actions inspected; synthetic positive browser seam explicit;35webDone |
| mobile | Expo My day/Tasks/StartTask/Verification/Help/recovery | Existing safety flows retained | My day/header/help/start/card/font composition corrected; other workflows retain existing source |106native tests/types/Expo export;8RNWeb preview observations | **Native runtime/device unavailable**; RNWeb source preview inspected ENUR390, not native acceptance;37Inprogress |
| index | Reviewer gallery | Reference only | N/A | N/A | Not an application page |
| decisions | Reviewer decision register | Reference only | N/A | N/A | Approved decisions documented separately; not a product route |

## Implementation checklist

- [x] Verify checkout, process cwd, API target, dirty files and draft stack.
- [x] Read installed plan-project, steering documents, V5 gallery/notes and UI acceptance scopes.
- [x] Implement real React shared shell and Today composition using existing APIs/components.
- [x] Replace inline task panel with Radix drawer; keep task QR and review/schedule links.
- [x] Add translated Today vocabulary and preserve structural RTL.
- [x] Expose summary load failure/retry instead of silently removing failed statistics.
- [x] Distinguish submitted from verified status; preserve semantic success/error colors.
- [x] Correct native blue/white foundations in NativeWind/navigation/capture controls.
- [ ] Complete screenshot correction/reinspection for all pages and variants.
- [x] Implement photo workspace queue/evidence/decision core composition.
- [ ] Complete remaining review states and live retained-media acceptance; see V5_REVIEWS.md.
- [ ] Finish customer/platform/form/table/chart parity page by page.
- [ ] Verify native runtime camera/GPS/QR/upload/retry/Urdu on a real device/emulator.
- [ ] Finish functional, authorization, state and responsive acceptance for every page.

## Evidence and intentional differences

`frontend/e2e/v5-visual.spec.ts` captures **actual built React + actual backend +
synthetic persisted SQL data**, alongside unmodified V5 files at1366×900 and390×900,
in English and Urdu. Screenshot paths: `v5-evidence/`. A captured route is not yet a
visually accepted route; every substantial deviation still needs correction.

V5's reviewer bar/sample snapshots never ship. Real company/name/count/time data
replace prototype examples. Today does not fabricate a late/on-time breakdown or
upcoming shift end because the existing overview DTO does not supply those totals.
Upcoming tasks are explicitly limited to the loaded summary. Submitted work remains
separate from verified completion. Existing staff register remains reachable from
Today; this functional tab adds height compared with the task-only prototype.

## Current verification (2026-10-22 continuation)

- Whole frontend suite: **64 Node + 220 React tests**, 17 React files. Focused
  Today/shell checks:27passed, including API filter consumption, failed-summary retry,
  translated UI, named drawer and preserved register page/filters on close.
- Whole frontend lint:0findings. `npm run build --prefix frontend` passes TypeScript
  and Vite production build (nonblocking existing plugin-timing advisory).
- Integrated regression subset: **14passed**, real React/API/disposable PostgreSQL,
  including persisted review closure without task verification, task QR, settings
  version conflict, session reload/logout, setup persistence, cross-tenant/role denial,
  owner billing during suspension, neutral recovery and actual inquiry persistence.
- Native:101tests passed, `tsc --noEmit` and Expo web export passed. No native device
  connected; no native visual/camera/GPS/provider acceptance is claimed.
- Spec validator:42specs,0errors. Existing dependency/terminal/tooling warnings remain
  justified in specs/README.md; the integrated flow table is intentionally long.
- Mechanical design detector:two Inter-font warnings only. Inter is explicitly
  required by approved V5, so those warnings are intentional exceptions.

The paired captures exposed an off-screen drawer: Tailwind v4's individual
`translate` property required an explicit reset in addition to `transform:none`.
That defect is fixed; browser geometry assertions and fresh captures verify bounds.

One recapture attempt was interrupted after noticing ordinary builds and the E2E
preview shared `frontend/dist`. The harness now builds/serves a private `web` folder
inside its disposable runtime directory, preventing revision/API-target drift during
other builds. Discarded/interrupted runs are not acceptance evidence. Final recapture
results are recorded below after completion. No production credentials or databases
were used by this harness; synthetic sessions cannot authenticate to local restored data.

## Next implementation boundary

The shared shell and Today have actual code corrections; the remaining screens are
**not complete**. Start next with `design/v5/reviews.html` versus
`ExceptionInboxPage.tsx`/`ExceptionDetailPage.tsx`: replace the table-only inbox with
an actual queue/evidence/decision workspace, reusing protected media and current
closure permissions. Do not paste prototype data, fake positive operator auth, or
rewrite the dirty user dashboard. Then continue customer/forms/platform layouts and
native workflows using the inventory above. Keep the four acceptance statuses separate.


## Screenshot provenance and review limits

The running checkout includes the user's pre-existing uncommitted performance
work. That code is preserved and excluded from this correction commit; overview
captures therefore document the actual supplied checkout, not a claim that this
batch implemented or visually accepted that dashboard. The changed Today/shell
components use existing committed API contracts and do not depend on those user
performance additions. Public/platform captures prove actual guarded rendering;
they do not prove positive operator-provider functionality or V5 visual parity.

Today desktop English and phone Urdu were directly compared with the matching
V5 captures; the English/Urdu drawer was re-inspected after fixing translation.
Significant remaining deviations for Today: retained functional Staff tab, actual
API pagination instead of sample Show all, no fabricated attendance breakdown,
no speculative shift end, existing task QR/review actions retained. Different
record counts/names/dates come from the persisted synthetic database.

Primary evidence pairs:

| View | V5 | Actual application |
|---|---|---|
| Desktop Today EN | [reference](v5-evidence/v5-today-1366-en.png) | [React](v5-evidence/app-today-1366-en.png) |
| Phone Today UR | [reference](v5-evidence/v5-today-390-ur.png) | [React](v5-evidence/app-today-390-ur.png) |
| Phone drawer UR | V5 manager task-drawer interaction | [React](v5-evidence/app-today-drawer-390-ur.png) |
| Reviews gap, still incomplete | [reference](v5-evidence/v5-reviews-1366-en.png) | [React](v5-evidence/app-reviews-1366-en.png) |

The full filename inventory is in [the evidence index](v5-evidence/README.md).

### Production menu correction

The new geometry assertion caught a production-only cascade defect: CSS optimization
lowered `translate:none` to a transform reset while Tailwind's utility still supplied
individual translation. The fix also normalizes the two existing Tailwind translate
variables for edge surfaces. Ordinary production-preview inspection now measures
menu bounds at(0,0,300,900)in English and(90,0,300,900)in Urdu at390×900, consistently
before/after settling. Real-backend edge captures and assertions follow below. Centered
dialog primitives remain available for ordinary forms; this correction targets only
edge navigation/task drawers.

### Final recorded outcomes

- Four-case full recapture pass covered the15route matrix, real Today filters/drawer,
  real empty/denied states, named simulated network error/loading recovery, and public/
  safe-disabled platform/handoff captures.60route/viewport/language observations report
  zero page overflow/JavaScript errors. Public captures are not positive IdP proof.
- The subsequently added edge-geometry case exposed the production menu defect;
  after the fix, its focused real-backend run passed across1366/390 EN/UR, overwriting
  the affected menu/drawer captures with verified viewport screenshots. It is recorded
  as **4recapture cases passed +1focused edge case passed**, not a claim that the earlier
  failed five-case run passed.14separate persisted integration regression cases passed.
- Final `npm run build --prefix frontend` passes (TypeScript + Vite); frontend lint
  reports0findings.64Node+220React and27focused checks pass. Native101tests/typecheck/
  Expo web export pass. No device/provider/full-product acceptance claim.
- `python3 .ai/plan-project/scripts/validate-specs.py specs`:42specs,0errors,
  12documented warnings (existing11plus intentionally long spec40 correction log).
- Original8unrelated tracked source/config diffs match the initial checkpoint byte
  for byte. The pre-existing handoff append remains unstaged, with only this session's
  new header committed. No design artifact, schema, production data/service, deployed
  site, shared branch history or provider configuration was changed.

### Committed-source verification

Source commit `5313b73` on `implementation/v5-visual-corrections` was checked in a
fresh detached worktree `/tmp/hygene-v5-clean-5313b73` with existing installed
node_modules linked, no ignored environment or user performance source copied.
`npm run build` and `npm test` pass there:64Node+220React,17React files. This proves
the correction builds/tests independently of the preserved dirty dashboard/backend
work. It does not retroactively accept those other pages' screenshots as this commit's UI.

Final isolated edge run:1passed, real backend,1366/390 EN/UR drawer/menu geometry,
corrected viewport screenshots directly inspected. The private child test databases
were removed (0remaining); the owned56442test cluster and temporary5199preview were
stopped. User Vite5173/backend8080 remain running. No merge/deployment.

## 2026-10-22 — Photo Reviews continuation

Issue84, `implementation/v5-photo-review-workspace`, based correction commit265f694/PR83. Real V5 review workspace now implemented with paired evidence and separate functional/visual limits in [V5_REVIEWS.md](V5_REVIEWS.md). Historical completion records remain unchanged; spec36 remains In progress. Full V5 scope remains incomplete.

## 2026-10-22 — Customer authentication continuation

Issue86 on `implementation/v5-customer-auth`, basedd15e37f/PR85. Actual V5 public authentication/recovery/link/security/staff handoff and registration destination correction; see [V5_AUTH.md](V5_AUTH.md).21 scoped browser cases,64Node+235React,50 focused auth/account/role checks;79 PNGs and36 observations. No whole-product/provider/native qualification. Latest user explicitly requests stop after this checkpoint with a new-session handoff; organization settings has not been started.

## 2026-10-22 — Parallel Settings / Help / Information checkpoint

Native agents A/B implemented independent existing specs30/38 in isolated worktrees from16264ae; source-read-only C independently reviewed matching V5/actual renders and current scope. Detailed evidence, intentional differences and incomplete gates: [V5_SETTINGS.md](V5_SETTINGS.md), [V5_HELP.md](V5_HELP.md), [V5_PARALLEL_QA.md](V5_PARALLEL_QA.md), [V5_PARALLEL_CHECKPOINT.md](V5_PARALLEL_CHECKPOINT.md). Full V5 is still incomplete; no native/provider/whole-product acceptance inferred. Latest user requests checkpoint and choice to continue here or start a new session; STOP after saving this batch. Next recommended independent group is Team/workforce; preserve dirty Dashboard/performance work.

## 2026-10-28 — Shared shell / Team / Workforce / Attendance checkpoint

Specs27,29and31nowmeettheirscopedwebacceptance. Currentevidenceandfulldeviations: [Workforce implementation](V5_WORKFORCE.md), [Workforce QA](V5_WORKFORCE_QA.md), [Attendance QA](V5_ATTENDANCE_QA.md), v5-shell/workforce/attendance-evidence manifests.13of27productscreen/workflowgroupsnowhaverecordedcoreV5renders; this is not fullall-statewhole-productacceptance.14othergroupsremainincompleteorunverified, plus broader/providerstatesontheearliercoregroups.31of42specsDone(includingdecision),11remain. FullV5and40/41certificationremainincomplete. Native/operator/mail/photo/Paddle/productiongatesunchanged; nodeviceconnected28Oct. Nexteligible28setup/locationcompositionanduser-dashboardreconciliation.

## Spec28 acceptance — 2026-10-29

Setup/Locations and owner/manager performance meet applicable web acceptance. Read V5_SETUP.md, V5_LOCATIONS.md and V5_SETUP_FORMS.md for exact source/provenance/checks/intentional deviations. This replaces the earlier pending entries for these pages only. Full V5, native/provider/production certification remains incomplete.

Operator34and Review36safe-state extensions are integrated fromPR95/96. Review setup/no-task/no-closure authority, saved decision facts/next action, held metadata, largequeue paging, stale-error totals and Urdu review labels are verified; retained private bytes/provider/native qualification stays open. Read OPERATOR_UI.md and V5_REVIEWS.md; these partial continuations do not mark34/36Done.

Final combined checkpoint29Oct:64Node+328React, lint0, strict TS/build and24real browser cases pass. Spec28targeted16case gate and165artifacts remain recorded separately.10specifications remain; next32. FullV5/provider/native/production acceptance remains incomplete.

## Billing and owner recovery accepted — 2026-10-29

Spec32 now meets applicable web acceptance. Actual billing/access paired references and states inspected; functional and visual implementation/verification are recorded independently above.64Node+348React/28files,1449backend/95files/zero skips, actual billing SQL, types/lint/build and27+2actual browser cases pass.86PNG artifacts with dimensions/hashes; image counts are not unique flows. Full V5 remains incomplete:9specifications remain. Next33 is dependency-eligible at approved scope; live IdP/Paddle/mail/privacy/device/production gates remain. Details: [V5_BILLING.md](V5_BILLING.md).

## Platform and native/account continuation — 2026-10-29

33/35applicable web acceptance passes:64Node+360React,45focused,189backend+actual isolated SQL, full lint/types/build and20actual privateReact/API/SQL browser cases.74platform observations/98PNGs contain synthetic named positive workspaces and unchanged real default guards; no IdP qualification inferred. Native37source composition/font fixes pass106tests/types/Expoexport, with8RNWeb source observations/10images, never native acceptance. Additional30credential pending/denied/transport states are inspected with empty password fields. Seven units remain30,34,36,37,38,40,41; fullV5incomplete/41ineligible. Reports: V5_PLATFORM_COMPANIES.md, V5_PLATFORM_SERVICE.md, V5_PLATFORM_QA.md and V5_NATIVE_COMPOSITION.md.

## Spec36 single-unit acceptance continuation — 2026-10-29

Local review state and V5 interaction verification is complete for the tested web
contract; full36remains Blocked. Fresh evidence is in `v5-review-acceptance/`, with
source/image hashes and explicit positive-image/fault seam provenance. No production
private media, privacy capability or native runtime is qualified. The original
whole-product incomplete status and other specifications remain unchanged.
