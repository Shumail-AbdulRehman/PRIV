# Platform service workspace — Spec35

Current V5 composition/recovery continuation and its exact evidence limits are in
[V5_PLATFORM_SERVICE.md](V5_PLATFORM_SERVICE.md). The historical functional proof
below is retained; current rendered acceptance is recorded separately by40.

Actual React routes `/platform/service`, `/platform/audit`, `/platform/inquiries` use existing34 OperatorBoundary and separate operatorRequest, outside tenant bootstrap. Current browser identity provider is unqualified: all three actual routes stop at unavailable sign-in and issue no protected requests. No tenant role/storage value, fake operator identity or browser configuration flag enables them. Future provider selection/MFA/browser adapter qualification remains39/40.

## Contract-backed behavior

- Existing25 redacted diagnostics: database reachable-at-observation/unavailable, observation timestamp, configured identity and real nullable webhook/heartbeat timestamps. Provider connectivity remains NOT_CHECKED. No synthetic uptime, readiness, queue health or functioning photo-verification claim.
- Audit: allowlisted action/company/actor-type/time only, company/action filters, cursor/25-row bounded pages. No raw JSON/reasons/secrets/worker records.
- Inquiry queue: bounded submitted-company search/cursor pages; requested counts are submission data. Detail separately fetches contact/requirements as escaped untrusted text. No HTML, attachments, automatic remote links, customer verification or workforce access.
- Handling: explicit status, SELF-or-UNASSIGNED ownership and required reason; PATCH includes current expectedVersion. Verified backend principal supplies identity. Original submission stays immutable. No arbitrary operator field, email send or verification implication.409/uncertain update keeps draft and blocks a new save until explicit refresh succeeds. Failed refresh keeps form/reason; rapid duplicate clicks send one update. Saved state is fetched from backend.
- Support: configured contact API must supply available/EMAIL/OPERATOR_CONFIGURED plus a valid safe mailbox before a mailto handoff appears. Opening email does not claim delivery. Unconfigured/error state offers truthful feedback and real scoped retry.

## Verification

22 focused React tests at operatorRequest network seam; full frontend57Node+198React tests/15files. Existing backend support/operator-identity135tests/2files. Full frontend lint0 and TypeScript/Vite build pass (non-failing plugin timing advisory). No backend source/schema/dependency/configuration change; no database reset, live IdP/provider/email/production request.

20 synthetic named-workspace renders: diagnostics/audit/inquiries/detail/error × EN/UR ×390/1440. No page overflow, JavaScript errors or visible buttons below44px;48px source controls. Desktop EN diagnostics and mobile Urdu inquiry form visually inspected. Expected503 network errors in the unavailable fixtures are intentional. Temporary fixture entry/request adapter removed before commit. These are isolated presentation/component checks, not integrated application/operator-provider proof;40 owns integrated flows. Source detector returns[]. Logs `/tmp/hygene-spec35-{focused-final,web-final,backend,lint-final,build-final,render}.log`; captures `/tmp/hygene-spec35-visual/` (ephemeral).
