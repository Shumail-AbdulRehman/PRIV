# V5 service, audit and inquiry continuation — Spec35

Source starts from accepted28/32 checkpoint `adae1b9`; exclusive ownership is
recorded in the common continuation metadata. Current application commit is
`2f504f9`. No billing/setup work is repeated and no backend, schema, provider
configuration, shared operator identity or transport is changed.

## Implemented boundary

The actual `/platform/service`, `/platform/audit` and `/platform/inquiries` routes
remain outside tenant bootstrap and behind the existing fail-closed
`OperatorBoundary`. No qualified browser IdP adapter currently exists. A tenant
role, browser storage value or URL claim cannot mount these workspaces or perform
operator requests. The named `ServiceWorkspace` export is the established
component-test seam, not a second application route or authentication mechanism.

The approved `design/v5/service.html`, `audit.html` and `leads.html` compositions
inform the real page:224px white platform navigation,72px retained brand/language
header, clear page heading and sections, split diagnostics/support rail, bounded
audit/inquiry registers and split submission/handling panels. The existing shared
OperatorShell is retained; company/service-only styling hides its redundant
generic title/shield in this workspace. Mobile uses one expandable navigation
tree, local tab scrolling and stacked panels/forms. EN/UR uses the existing
language provider, translated workflow copy, logical spacing and semantic V5
tokens. No prototype reviewer controls or fictional identity appear.

## Existing behavior preserved and corrected

- Diagnostics show only the real redacted observation DTO: database result,
  identity configuration and nullable provider/worker timestamps. Provider
  connectivity remains explicitly unchecked; there are no invented issues,
  healthy background jobs, queue sizes, readiness or operational runbooks.
- Audit and inquiry requests retain existing25-row server cursor contracts and
  scoped filters. Only allowlisted metadata is rendered; untrusted inquiry text
  stays escaped and contacts are not promoted to verified facts.
- Handling retains required reason, deliberate SELF/UNASSIGNED choice,
  expectedVersion, pending lock and explicit conflict/uncertain reconciliation.
  A failed background inquiry refresh now keeps the mounted draft and labels
  retained details stale while preventing a save.401/403/404 supersedes cached
  details and removes the form. A successful PATCH's handling DTO is retained
  if its follow-up read fails; the receipt does not imply message delivery.
- Support mailto requires confirmed available EMAIL/OPERATOR_CONFIGURED facts
  and a safe mailbox. Explicit contact refresh hides the previous handoff while
  pending; failed/unavailable responses never leave an actionable old address.
  The refresh and retry controls perform the existing request.

## Verification recorded by the implementing worker

`npm run test:components --prefix frontend -- --maxWorkers=1
src/pages/Platform/ServicePage.test.tsx`:27passed/1file,15.85s. This includes22
existing tests and five additional regressions for failed-refresh draft retention,
401/403 cached-data denial, pending support-contact replacement and accepted
mutation followed by failed refresh. These are network-boundary component tests,
not qualified IdP or actual provider operations.

Changed-source ESLint passes with0findings:
`./node_modules/.bin/eslint src/pages/Platform/ServicePage.tsx
src/pages/Platform/ServicePage.test.tsx src/i18n/platformServiceTranslations.ts`
from the frontend cwd. `git diff --check` passes. Logs are in the private
continuation parent as `service-focused-{initial,final}.log`.

The coordinator owns whole-suite/build and Spec40 rendered acceptance. Paired
actual/named-workspace and V5 reference desktop1366×900/phone390×900 EN/UR checks
are pending at this source checkpoint; no visual acceptance is inferred from the
component count. Full Spec35 stays In progress until its unmet acceptance and
qualification requirements are verified. IdP/MFA, actual operator mutation,
provider/support delivery and production qualification remain separate gates.

## Contract-driven reference differences

The prototype's synthetic incident/job/health rows and illustrative reconcile or
runbook actions are replaced with available redacted API facts and actual retry.
No guessed operational capability is introduced to fill their space. The real
request queue and reason/version handling form replace the prototype's single
fictional inquiry. The sidebar retains actual destinations without a fictional
operator profile or sign-out claim. Header brand/language remain in the existing
separate operator shell. All deviations preserve existing approved policies.

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
