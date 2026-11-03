# V5 independent parallel visual QA — 2026-10-22

Scope: Organization/Settings and Help/Service Information, continuing approved V5 from `16264ae`. QA worktree `/tmp/hygene-v5-qa`, branch `verification/v5-parallel-qa`. Agent C changes only this report and `v5-parallel-qa-evidence/`; application source is read-only. Implementation agents have separate worktrees. Final integrated functional checks belong to the coordinator; screenshots alone never establish functional or visual acceptance.

## Provenance and boundaries

- Read current handoff/steering/spec30/spec38/V5 ledger and inspected actual route composition. Existing auth/Today/review work is preserved, not repeated.
- References were rendered from the actual immutable `design/v5/*.html` using a loopback-only static server5197, Google Chrome and Playwright, fresh browser contexts at1366×900/390×900, EN/UR.24 initial reference captures cover owner organization/account/security, manager account, help and information. Manifest records viewport, role/tab/action, title, errors and overflow. All24 references have zero page overflow/JavaScript errors.
- `settings.html`, `help.html`, `information.html` load **journeys.js/journeys.css**; unrelated unused functions in `app.js` are not their visual source. Settings owner defaults Organization, manager defaults My account; security is a form/session split. Help is Contact+FAQ with Recovery/Information side rail. Information is a centered public card with separated topic rows.
- Prototype reviewer bar, fictional identity/data, decision links and simulated send controls must not ship. Compare page composition after allowing removal of the reviewer bar. Actual server authorization and configured availability override prototype-only controls.
- `~/.local/share/hygeneops-tools/platform-tools/adb devices -l` returns no connected devices. Native visual acceptance is **blocked/unverified**; native palette/export/tests are not screenshots of a native runtime.
- Platform positive routes remain blocked by unqualified operator identity. No tenant fallback, guard bypass, synthetic operator application session or live provider claim is allowed.
- User-owned5173/8080 processes and restored customer database are not QA targets. Real-app verification must use coordinator's guarded isolated synthetic SQL/API runtime; no production database/configuration/provider changes.

## Complete29-entry route map

This table reconciles the approved gallery and current router/ledger. Entries outside this batch retain their previous status; no fresh acceptance is inferred from historical tests or screenshots.

| V5 HTML entry | Real route or native destination | Visual classification at batch start / outstanding work |
|---|---|---|
| manager | `/today-status` ADMIN/MANAGER | Partially implemented: core verified previously, broader state matrix remains |
| owner | `/dashboard` ADMIN | Partially implemented: owner composition unverified; preserve user performance work |
| overview | `/dashboard` MANAGER | Partially implemented: manager charts/denominators unverified |
| location | `/locations`, `/locations/:id`, area/template/schedule/QR dialogs | Partially implemented: pending paired list/detail/forms/tabs verification |
| team | `/staff`, `/staff/:id`, `/managers` | Partially implemented: register/detail/hiring tools pending |
| attendance | `/attendance` | Partially implemented: register/filter/photo/detail pending |
| attendance-case | attendance context dialog from `/attendance` or `/staff/:id` | Partially implemented: facts/note/conflict/read-only pending |
| reviews | `/exceptions`, `/exceptions/:id` | Partially implemented: core verified previously; closed/setup/held/large-queue/retained-provider pending |
| setup | `/setup`, existing linked forms | Partially implemented: readiness/forms/activation state verification pending |
| workforce | existing staff/manager access/transfer/offboarding dialogs | Partially implemented: parent workspace and permission variants pending |
| billing | `/subscription` (canonical `/choose-plan` redirect) | Partially implemented: V5 parity pending; qualified provider absent |
| settings | `/settings`; independent `/account/security` | Partially implemented: organization/current batch; independent public security previously verified |
| login | `/login`, `/signup` | Visually verified previously for recorded core EN/UR1366/390 states; not rerun in this batch |
| recovery | `/recover-owner-account`, `/reset-owner-password` | Partially implemented: recorded core verified; delivered valid-link success remains blocked |
| verify | `/verify-owner-email` | Partially implemented: core invalid/missing verified; issued delivered-link success remains blocked |
| access | WorkspaceGate restricted account boundary | Partially implemented: suspended/billing restricted safe destinations pending |
| handoff | STAFF protected web destination handoff | Visually verified previously for recorded core EN/UR1366/390 states; native qualification absent |
| help | `/help`, public outside tenant bootstrap | Partially implemented: current batch; configured contact/error/unavailable variants needed |
| information | `/service-information`, public outside tenant bootstrap | Partially implemented: current batch; approved facts unavailable must remain honest |
| operator-login | `/platform/login`, `/platform/callback` | Blocked/unverified positive flow: unqualified IdP; safe denial exists |
| platform | `/platform/companies` | Blocked/unverified positive workspace: operator provider |
| customer | `/platform/companies/:companyId` Account/Billing/Activity | Blocked/unverified positive workspace: operator provider |
| operator-security | `/platform/security` | Blocked/unverified positive security: operator provider |
| service | `/platform/service` | Blocked/unverified positive diagnostics: operator provider |
| audit | `/platform/audit` | Blocked/unverified positive audit: operator provider |
| leads | `/platform/inquiries` | Blocked/unverified positive inquiry handling: operator provider |
| mobile | Expo My day/Tasks/StartTask/Verification/Help/recovery | Blocked/unverified native visuals: no connected Android runtime |
| index | Reviewer gallery, reference only | Not a product route; no implementation needed |
| decisions | Reviewer decisions, reference only | Not a product route; no implementation needed |

## Initial implementation guidance delivered

Agent A: retain owner-only organization reads/name-only real22 contract; no invented operational-contact editing. Preserve independent own-password on restricted accounts. Owner Organization/My account/Security must be separated; manager account/security must never fetch owner company settings. Use matching responsive EN/UR references.

Agent B: distinct information route should use centered public composition, not the old repeated Help document. Help's public/restricted-account reachability must remain; never fetch tenant records merely to imitate prototype company navigation. Support contact availability must be real25; no simulated successful send. FAQ semantics must retain receipt/submission/review/verified distinctions.

## Current batch rendered review

Initial review was pending actual implementation output. The final scoped rendered outcomes and remaining gates are recorded below; no full-spec or whole-product completion is claimed.

Read-only integrated-source review (`/tmp/hygene-v5-integrated`, A8f1e813/Bf8538d3): correct separate route, real API clients preserved, owner-only company reads maintained. Scoped browser scripts retain real persisted save/conflict/reload, manager denial, independent security, public-only support GET, FAQ and recovery navigation. Their loading delays forward actual responses; explicit network-abort capture is labelled a frontend network seam rather than real backend outage.

Actionable finding Q01: Help's configured approved-Android anchor was inline, so min-height alone did not establish44/48px target. Agent B fixed display:inline-flex before integration. Configured-positive behavior remains unit-seam evidence until genuinely configured; no provider qualification inferred.

Recorded choice Q02: Help keeps existing translated `Help & service information` heading by coordinator decision to retain stable public/suspension navigation; approved reference says `Help & support`. This is a documented copy deviation, not a visual blocker. Information remains distinct. Current public Help intentionally has truthful brand/language header instead of fabricated tenant identity/sidebar.

## Independent rendered outcome

Reviewed actual integrated-source screenshots from the coordinator's guarded disposable SQL/API/build runtime. Browser run observed21passed (52.2s), including three Settings cases, two Help cases, retained lifecycle and workspace regressions. No positive HTTP response was replaced. Public support returns actual200/unavailable, preserving configured-off truth. Database fixtures/identities are synthetic; screenshots use empty password fields and tracing/video are disabled.

| Current page/state | Independent visual status | Evidence and limits |
|---|---|---|
| Owner Organization | **Visually verified for shown core** | All1366/390 EN/UR base captures plus real saved/conflict1366EN and delayed-forward loading390EN inspected. Header/tabs, primary form/protected rail, responsive stack, error draft and success feedback coherent. Name-only contract intentionally replaces prototype's unsupported operational-contact field. |
| Owner My account | **Visually verified for shown core** | All1366/390 EN/UR profile/verified-email captures inspected. Real identity, LTR isolated email in Urdu, role/status and responsive facts are clear. Additional390EN/UR unverified legacy-bootstrap variants were independently inspected in the final rerun. Configured delivery-request/form variants remain unverified because the delivery provider is unavailable. |
| Owner Settings Security | **Visually verified for shown core** | All1366/390 EN/UR empty-password captures inspected. Form/session rail, stacked phone composition, labels/helper text and password fields coherent. Real policy explains session revocation instead of prototype placeholder. Pending/error inline variants not visually verified in this batch. |
| Manager Settings denial | **Functional denial/canonical redirect verified; Dashboard visually unverified** | GET returns actual403 and owner input absent. `app-manager-settings-redirect-loading-390-en.png` deliberately shows the redirected Dashboard loading state after canonical redirect assertion; Q03 filename correction is resolved. This does not imply Dashboard visual acceptance. |
| Independent own-security | **Visually verified shown manager phoneEN** | `/account/security` actual empty form inspected, route stays independent. Previous auth checkpoint covers broader EN/UR core; it is not reaccepted wholesale by this one capture. |
| Public Help | **Visually verified for shown core/configured-off state** | All1366/390 EN/UR base captures, phone FAQ-open EN/UR and390EN loading/network-error inspected. Blue/white panels, split/stack, translated readable copy, disclosure, retry and navigation coherent. Public-only request manifest confirms GET `/api/support/contact`; no tenant bootstrap. |
| Public Service Information | **Visually verified for shown core/configured-off state** | All1366/390 EN/UR captures inspected. Centered432px public card, type/hierarchy, separated document/fact sections, unavailable notices and links coherent. On desktop, brand/title/card align to reference within about3px after omitting39px reviewer bar; no pixel-perfect claim. |

Both manifests report zero page overflow/JavaScript errors for20base route/viewport/language observations. Independent PNG header checks confirm all35Settings and22Help captures have the filename's1366/390 width. Capture counts include references/states, not distinct accepted pages.

Evidence: [Settings manifest](v5-settings-evidence/render-results.json), [Help manifest](v5-help-evidence/render-results.json), [independent reference manifest](v5-parallel-qa-evidence/reference-manifest.json).

Meaningful V5 deviations reviewed: real company/name/data; owner name-only organization API; real verified/unverified status instead of simulated contact-change CTA; actual password policy and revocation guidance; manager remains blocked from owner Settings and uses independent security rather than broadening permissions; public Help omits fabricated tenant sidebar/company identity and unsupported fake ticket form; stable Help title retained; additional truthful photo/Android/configuration guidance lengthens Help/Information and phone scrolling. Help27px phone heading fits retained longer title; Information retains30px. No prototype reviewer bar/sample decisions/fictional mutation controls ship.

Q01 corrected before integration. Q02 recorded intentional copy choice. Q03 was an evidence-quality issue, corrected by asserting the canonical redirect and naming the screenshot accurately; it was not an authorization/source defect. No other significant composition, spacing, typography, clipping, RTL or state usability issue found in the reviewed captures. This is scoped core visual acceptance, **not all-state/full-spec/full-product acceptance**. Spec30/spec38 and full V5 remain incomplete until their outstanding relevant states and external qualifications are satisfied. Configured support/approved policy/distribution positives were not activated; mail/operator/native/photo/provider qualification remains blocked or unverified as already recorded.

Q03 disposition: coordinator integrated test correction6c0762b from5dfbe9a. Manager's canonical `/dashboard` redirect is asserted; capture renamed `app-manager-settings-redirect-loading-390-en.png`, explicitly showing the safe redirect's transient loading state, with no Dashboard visual acceptance. Original misleading denial filename removed/renamed. Functional403 proof remains unchanged. No application authorization change was needed.

Final extra six screenshots independently inspected after A's430a960 correction:390EN/UR unverified legacy/bootstrap, initial network error and cached stale draft after failed refresh. All are legible, with no clipping/overlap; stale draft remains visible alongside distinct saved company name, honest error and reload action. Network-abort screenshots are explicitly frontend fault seams; unverified status is real persisted SQL. Normal-state screenshots remain valid because the source correction only changes failed-refetch fallback. Coordinator reports final13Settings/workspace cases pass in24.9s and integrated64Node+246React pass; these functional results are attributed to coordinator, not separately rerun by QA. Final screenshot widths:35Settings+22Help, zero mismatches. No significant visual finding remains open in captured core; Q01 fixed, Q02 intentional, Q03 resolved.
