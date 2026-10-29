# Independent V5 platform QA — 2026-10-29

## Scope and evidence boundary

QA owns only the Spec40 platform visual harness, this report and its evidence
directory. Application fixes belong to separate33/35 implementation worktrees.
Baselineadae1b9 includes accepted28/32; common ownership metadata is present.
Approved V5 platform/customer/service/audit/inquiry references remain unchanged.

The prepared runner renders real named React workspaces with an explicitly
synthetic operatorRequest seam and independently exercises normal guarded routes.
See `v5-platform-evidence/README.md` for reproduction, source binding and limits.
No positive provider identity, SQL persistence or live operational mutation is
inferred from the named-workspace fixture. Coordinator-run actual isolated SQL
proofs are distinct evidence and must be linked with their real logs/counts.

## Prepared checks

- Company register; Account/Billing/Activity; diagnostics; audit; inquiry queue
  and handling, paired desktop1366×900/phone390×900 in English/Urdu.
- Distinct loading/empty/error/unavailable and real button-triggered retry.
- Reason/version-based save, one pending request, retained conflict/uncertain
  draft, required explicit refresh, same intended action and synthetic reload.
- Actual guarded company/service/audit/inquiry routes reject untrusted storage
  claims, mount no protected child and perform no tenant/operator API I/O.
- Document direction, horizontal overflow, action heights and JavaScript errors;
  image/source hashes and exact viewport metadata.

Syntax checks pass for both JavaScript harness files. Direct fixture checks prove
one changed outcome across a lost-response/retry simulation for company and
inquiry. These are harness diagnostics, not application acceptance. Final rendered
execution and independent source/visual review remain pending.

## Remaining-unit source audit

| Spec | Feasible local work | External evidence boundary |
|---|---|---|
| 30 | Broader password pending/error/revocation visual-state coverage remains open in V5_SETTINGS; existing Settings/auth core is already accepted | Genuine delivered owner reset/verification links and provider delivery remain unqualified |
| 34 | Current safe login/callback/security composition and local cleanup are already implemented; do not repeat them | No selected/qualified browser IdP/MFA/PKCE/session/security adapter |
| 36 | Core queue/detail and setup/closed/held/paging states are already accepted at their safe scope | Actual private bytes, consented photo/privacy qualification and native/device proof remain open |
| 37 | Native V5 composition still has concrete source gaps listed below | Hardware permission/camera/GPS/QR/push/install/large-text/Urdu proof requires a native runtime |
| 38 | Help/information core is implemented and visually inspected; avoid duplicating it | Live approved-positive mailbox/legal/distribution configuration and delivery remain unverified |

### Concrete native37 gaps, source-grounded

1. `frontend-mobile/src/components/ui/text.tsx` still hardcodes platform system/
   sans-serif families. Approved reference typography is Inter/Arabic; the palette
   bridge alone does not establish matching typography. Text automatically
   translates string children, so English JSX alone is not a translation defect.
2. `frontend-mobile/src/screens/HomeScreen.tsx` currently places a large Today
   header above its date, then an icon/location hero and collapsed Shift details.
   The reference uses date → working-day heading → site, a compact shift/status
   header, attendance action and next task. Preserve actual attendance facts and
   authority while correcting hierarchy.
3. Tasks and Help screens start with standalone language controls rather than a
   consistent staff brand/language header. Reference phone-top is shared across
   tabs; existing StaffBrand can be reused instead of adding another shell.
4. Help starts with a workflow explanation, then ungrouped settings/push controls.
   Reference prioritizes a Task alerts state/action panel and account/help panel.
   Existing actual registration results and password replacement must remain.
5. StartTask centers an88px DoorOpen icon and kicker before the task title.
   Reference leads with the task and QR instruction. Correct composition while
   preserving exact server start, QR/GPS, current authority and retry contracts.

These observations justify local native composition work; neither Expo web export
nor React component trees can close native visual acceptance. No native change is
made by this QA worktree.

## Acceptance recommendation

Pending final source/tests/render inspection. Missing34-owned qualified positive
identity must not become an artificial33↔34 or35↔34 spec dependency. Applicable
web acceptance may be assessed from real backend contract/persistence proof,
focused/full affected web checks, real named-component renders and unchanged
fail-closed shipped routes, with the positive identity and full product gate
explicitly retained in34/40. A build or screenshot count alone is insufficient.

## Executed coordinator verification

Parallel agents saved company1937224/1244bd0, service2f504f9/e90ed91 and QA107137a
before reaching account usage limits. The coordinator recovered their committed
source and dirty QA harness, reviewed the rendered result and finished corrections.
This final execution is coordinator verification, not a claim that the unavailable
independent reviewer approved every final image.

The final all-mode run passes **74 observations**, comprising32core combinations,
26state captures,12mutation/reload observations and4guarded-route matrix checks.
These are browser observations, not74unique product flows. **98PNG artifacts**
include reference/application pairs and four supplemental full pages. Desktop is
1366×900; phone390×900; both English/Urdu. Dimensions/SHA256 and exact source
hashes are recorded in all-manifest.json/image-index.json. The older core/state/
guard manifests overlap this final run and must not be added as unique evidence.

Visual review compared company register, account/billing/activity, diagnostic
split, audit/queue/handling, mobile navigation and reasoned confirmation to the
approved references. Final refinements replaced account tab pills with V5
underlines, stacked phone confirmation actions and corrected duplicate mobile
audit labels. Negative states, focus on the reason field, keyboard phone-menu
operation, one pending request, conflict/lost-response refresh, actual retry and
stale contact removal pass. No page overflow, JavaScript error or undersized
visible action button is present in the measured matrix. Actual default routes
mount no protected workspace and perform no tenant/operator API I/O, including
untrusted local-storage claims.

The first runner diagnostics used the wrong Babel cwd and hidden table/option
selectors. The coordinator corrected the harness and explicit inquiry form label
associations, then ran all74observations fresh. No policy assertion was weakened.
Diagnostic outputs were retained privately, outside accepted evidence.

Relevant real backend checks are separate: **189tests/3files** pass, plus fresh
isolated company and support SQL proofs. They prove concurrent one-winner/409,
operator reason/issuer/subject/timestamp, audit-failure rollback, suspension policy
and owner-safe destinations, inquiry handling and redaction. A UUID database was
created/migrated with18existing migrations and removed; provider calls were absent.
This is actual backend persistence, not browser-provider identity qualification.

The integrated frontend passes64Node+360React/28files. Final focused45company/
service tests pass; full lint0. Strict types/private build/API browser proof is
recorded by the coordinator's final handoff. The first type gate caught two
unsupported Testing Library `exact` options; removing them retains string-name
exact matching and fixes compilation.

Applicable33/35web acceptance passes the final build/API gate: exact frontend build11.62s, strict types and20/20actual React/API/SQL browser cases in49.6s. Missing
qualified positive operator sign-in remains explicitly owned34/40. Native source
preview and account-state evidence are separate; neither is platform auth proof.
