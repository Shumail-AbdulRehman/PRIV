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
| owner | `/dashboard` owner | Existing, includes user performance work | Pending | Historical; current rerun pending | Preserve user dashboard; reconcile layout without overwriting it |
| overview | `/dashboard` manager | Existing scoped report | Pending | Historical | Separate role composition and supported chart denominators |
| location | `/locations`, `/locations/:id` | Existing | Pending | Historical | Lists, detail, tabs, forms, schedules and QR |
| team | `/staff`, `/staff/:id`, `/managers` | Existing | Pending | Historical | Staff register, details, owner manager tools |
| attendance | `/attendance` | Existing | Pending | Historical | Register, filters, photos and details |
| attendance-case | attendance detail/context dialog | Existing | Pending | Historical | Original facts, note, conflict and read-only states |
| reviews | `/exceptions`, `/exceptions/:id` | Existing + reason/draft correction | V5 core workspace implemented | Full suites + real API/SQL closure/filter/conflict checks | Paired EN/UR1366/390/1920 inspected; labelled image seam; broader closed/setup/held/large-queue/provider acceptance open (V5_REVIEWS.md) |
| setup | `/setup` and linked existing setup forms | Existing | Pending | Historical | Derived progress, forms, readiness, unavailable activation |
| workforce | staff/manager access and transfer dialogs | Existing | Pending | Historical | Actual staff parent workspace and permission variants |
| billing | `/subscription` | Existing | Pending | Historical | Catalog/provider unavailability is a supported divergence |
| settings | `/settings`, `/account/security` | Existing | Pending | Historical | Owner organization vs manager own account |
| login | `/login`, company registration `/signup` | Existing | Pending | Historical | Authentication composition; signup billing-navigation regression remains |
| recovery | `/recover-owner-account`, `/reset-owner-password` | Existing | Pending | Historical | Neutral delivery, invalid/expired links, password form |
| verify | `/verify-owner-email` | Existing | Pending | Historical | Explicit confirmation and invalid/expired state |
| access | `WorkspaceGate` restricted account state | Existing | Pending | Historical | Suspended vs billing restriction; safe destinations |
| handoff | STAFF role web handoff | Existing | Pending | Historical | Android information and unavailable download truth |
| help | `/help` | Existing | Pending | Historical | Support availability and forms |
| information | `/service-information` | Existing | Pending | Historical | Configured facts, unavailable commercial/legal fields |
| operator-login | `/platform/login`, callback | Safe-disabled without qualified IdP | Pending | Historical denial checks | Live positive sign-in blocked by missing qualified provider |
| platform | `/platform/companies` | Existing guarded workspace | Pending | Historical components | Actual positive route blocked by provider; never bypass guard |
| customer | `/platform/companies/:companyId` Account/Billing/Activity | Existing | Pending | Historical components | Provider blocked; reasoned suspension/conflict variants |
| operator-security | `/platform/security` | Existing safe boundary | Pending | Historical | Provider blocked; no simulated MFA in application |
| service | `/platform/service` | Existing | Pending | Historical components | Provider blocked; real redacted diagnostics |
| audit | `/platform/audit` | Existing | Pending | Historical components | Provider blocked; real audit filters/paging |
| leads | `/platform/inquiries` | Existing | Pending | Historical components | Provider blocked; inquiry details/handling/conflict |
| mobile | Expo My day/Tasks/StartTask/Verification/Help/recovery | Existing | Palette/nav correction only | Pending current checks | **Native device unavailable**; full workflow acceptance incomplete |
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
