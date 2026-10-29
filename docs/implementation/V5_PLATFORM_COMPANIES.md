# V5 platform company workspace — 2026-10-29

Specification33 continues from accepted billing checkpoint `adae1b9`; completed28
and32 are retained. Existing24 company DTOs,27 primitives and34's separate operator
identity boundary remain authoritative. Issue71 is reused. No schema, backend,
provider configuration, production record or dependency changed.

## Implemented boundary

The named `CompanyWorkspace` now follows approved `design/v5/platform.html`:
224px account-administration navigation, existing brand/language header, V5 page
heading, bounded-page summary rail, unified filter/register/pagination surface,
and a split Account view with profile/access and account/support context. Billing
and Activity retain real provider mirrors and recorded status events. Phone
navigation collapses behind a labelled expanded-state button; registers use the
existing DataTable mobile renderer. Logical spacing, mixed-value isolation and
the existing Urdu dictionary preserve EN/UR/RTL workflows.

Changes remain in33's owned company page/CSS/copy/tests. The shared OperatorShell
source is untouched; page-specific `:has(.platform-company-workspace)` styling
adapts only this workspace. All navigation points at existing platform routes.

## Contract-driven reference differences

- List summaries explicitly describe the current bounded page. No API supplies
  global company/onboarding/synchronization totals; prototype totals are omitted.
- Company rows use actual registered dates, account state, plan and version.
  Owner/contact and billing-sync fields are absent from the list DTO and are not
  invented. Detail uses actual numeric customer IDs; no fabricated DEMO identifier.
- Account context shows actual plan/version/billing availability. Unsupported
  aggregate staff/location counts and prototype verified-contact claims are omitted.
- There is no operator display name/avatar/sign-out-provider claim without a
  qualified identity. The existing separate header/language control is retained.
- Status actions preserve actual server authority: suspension changes operational
  state; reactivation does not grant billing access; legacy inactive restoration
  stays unavailable. No workforce/photos, impersonation or payment override.

## Functional corrections

An uncertain or409 status write previously allowed another confirmation before a
successful refresh. Confirmation now locks until an explicit successful matching
account refresh, retaining reason, intended target and version reconciliation.
Failed refresh keeps the dialog and draft mounted alongside clearly stale saved
facts; it cannot enable a write. Pending writes prevent duplicates, cancellation
and Escape dismissal. A401/403 refresh supersedes cached facts and removes status
controls. Invalid/non-safe integer company IDs never issue account requests.

Existing search/status/cursor API requests, reasoned confirmation, exact expected
version, read-only Billing dates/state and recorded Activity remain intact. Clear
filters removes the cursor and returns to the first bounded server request.

## Verification in this worktree

`npm run test:components --prefix frontend -- --maxWorkers=1 src/pages/Platform/CompaniesPage.test.tsx`:
**18 passed**, one file,4.89s (the first source checkpoint passed17/10.70s). Covers real route denial before request, bounded
filter/cursor calls, allowlisted metadata, missing billing/activity, reason/version
save, conflict target retention, uncertain/failed refresh, pending duplicate/close
guards,401/403 stale denial, invalid IDs, clear-filter cursor reset, stale save
receipt clearing and Urdu/RTL. A later status attempt clears its earlier success
receipt; reopening an uncertain attempt is labelled as review rather than an
unrelated opposite status action.
The initial existing11-case run passed10 and exposed a historical test expectation
for the now-dismissed refresh action; the updated assertion verifies confirmation
becomes enabled only after successful refresh. No functional assertion weakened.

Targeted ESLint passes for changed TypeScript/test/copy files. Integrated whole
suite/build and rendered paired evidence are recorded by the coordinator/QA after
source integration. These18 component checks
replace only `operatorRequest` at its dedicated boundary. They do not qualify
OIDC/MFA or a live operator mutation. Actual routes still use unmodified34's
fail-closed OperatorBoundary, and transport still rejects before network I/O.

## Acceptance limits

Functional implementation and focused verification are complete at the owned
source/component boundary. Paired actual/named-workspace visual review is pending
the coordinator's40 harness. The specification remains In progress until its
required evidence and positive operator qualification are honestly resolved;
source completion alone does not tick the visual criterion or certify full V5.

## Final applicable web acceptance — 2026-10-29

The integrated coordinator passes64Node+360React/28files, final45company/service
focused cases, frontend full lint0, TypeScript and exact production build
(11.62sVite). Backend source is unchanged:189focused tests/3files and actual
isolated company/support SQL proofs pass. The guarded React/private-API/disposable
SQL browser regression passes20/20cases in49.6s, including real tenant-cookie
platform denial, safe owner security/billing destinations, registration/lifecycle
and six EN/UR own-password pending/403/transport-error observations. No deployed
service, customer DB or qualified provider was used.

Final platform visual run passes74observations with98PNG artifacts:32core,
26state,12mutation/reload and4guarded-route matrices; these overlap earlier runs
and are not74unique product flows. Actual named workspaces use synthetic transport;
actual SQL and default guarded-route proof are separate. The coordinator inspected
paired1366×900/390×900 EN/UR compositions, phone navigation, negative states and
confirmation/handling interactions. All-manifest.json/image-index.json bind source
hashes/dimensions/SHA256. See V5_PLATFORM_QA.md for exact diagnostics and limits.

Applicable web implementation and visual/functional verification pass. Qualified
positive browser operator identity/MFA remains34/40, and no positive live
operator mutation, support delivery or provider qualification is inferred.
