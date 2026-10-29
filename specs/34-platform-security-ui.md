# Spec 34 — Platform sign-in and security workspace

**Status:** Blocked
**Depends on:** Spec 19, Spec 27
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #59
**Owns:** `frontend/src/pages/Platform/OperatorLogin.tsx`, `frontend/src/pages/Platform/OperatorLogin.test.tsx`, `frontend/src/pages/Platform/operatorSession.ts`, `specs/inventory/34-platform-security-ui.md`, `frontend/src/pages/Platform/operator.css`, `frontend/src/pages/Platform/operatorTranslations.ts`, `docs/implementation/OPERATOR_UI.md`, `docs/implementation/v5-operator-acceptance/`, `.impeccable/surfaces/frontend-src-pages-platform-operatorlogin-tsx.md`
**Reuses:** `frontend/src/components/common/AuthShell.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/operator-login.html`

## Goal

Platform sign-in and security workspace in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Use configured OIDC sign-in/MFA/own security provider handoff with safe redirect/state/PKCE according to selected provider docs before enabling. No local operator signup or tenant JWT reuse. Missing provider shows unavailable; logout clears operator query scope.

## Explicit non-scope

- Integrated whole-product verification → spec 40.
- Backend launch API wiring → spec 26.

## Reuse first

- Read the named existing paths before adding code; reuse their public contracts.
- Search INVENTORY.md plus fragments; preserve existing provider and component seams.
- No raw sample operational data, invented policies or secret fallback values.

## Steps

1. Confirm real inputs, current callers and negative authorization cases at this boundary.
2. Implement only the scoped behavior and explicit integration/handoff points.
3. Add behavior tests at DB/provider/network seams, including denied and uncertain states.
4. Run targeted checks and whole affected unit suite; fix regressions.
5. Record reusable additions, files, commands/counts and external limitations.
6. Update spec Log, PROGRESS.md and docs/implementation/SESSION_HANDOFF.md.

## Done when

- [ ] Real approved provider sign-in, callback state/nonce/PKCE/replay denial, enforced MFA, own-security handoff, API bearer expiry/refresh and provider logout are qualified using provisioned operators; tenant identities remain denied. Existing scope remains disabled until this evidence exists. [requires: approved identity provider]
- [ ] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm run test:components --prefix frontend -- src/pages/Platform/OperatorLogin.test.tsx` passes: Missing config stays disabled; unsolicited callback/state/nonce rejected without an initiated flow; tenant auth never treated as operator; MFA requirement explained. Live provider state/nonce/PKCE/MFA remains gated by39/40. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-29 — Parallel continuation ownership:** Return CompaniesPage.test.tsx to33 and ServicePage.test.tsx to35. Current identity, callback, provider-unavailable guard and OperatorShell remain owned34 and unchanged by those units. No positive IdP/MFA qualification or permission change is implied.

- **2026-10-21** — Claimed issue59 in isolated branch implementation/spec-34-operator-ui from2d77fd3 (Spec28/PR56). Scope amended before implementation for separate route exports, local translation/style/session boundary and operator handoff docs. Global main/App/router ownership remains the parallel30/root integration owner. No tenant client/Redux/cookie fallback or provider/token credentials. No selected browser IdP adapter exists; configured backend19 verifier alone cannot create a browser session. Every handoff remains unavailable and every callback rejected without an initiated trusted flow.
- **2026-10-21** — Local15 focused component tests and whole web57 Node+71 component tests/7files pass; initial/full lint and TypeScript/Vite build pass. Scoped48px control correction captured in7 valid EN/UR desktop1440/mobile390 component-fixture screenshots, plus security cleanup and callback denial, with no JS errors/overflow. Impeccable detector ran once withzero findings. Temporary preview entry removed. No full-product e2e run before40. Final rebuild passes; independent finish review/documenter plus root top-level routing integration remain required before markingDone. Root serializes progress/handoff updates to avoid parallel conflicts.

- **2026-10-21** — Fresh independent finish review ship at disabled-boundary scope, all7captures checked; three lint unusedbindings corrected by root and reviewer fresh lint exit0 confirmed. Read-only documenter comparison pass, inherited design drift reported without repair. Root top-level route integration remains beforeDone.

- **2026-10-21** — Root integrated874fff1/3cb20d1/82a7d21 after30/PR62; registered platformRoutes top-level outside tenantApp. ActualReact syntheticrouteproof /platform/login,security,callback,wildcard made zeroAPIrequests (includingtenantbootstrap), noJSerrors; callback query/fragmentremoved.15focused; integratedwhole57Node+102components/10files, lint/tsc/buildpass. Independentfullreview shipatintentionallydisabledboundaryscope;3initiallintunusederrorscorrectedandfreshreviewerlintverified.7EN/URcaptures plusdocumentercomparisoncomplete. Provider/browserOIDCclientnotselected, sooperatorRequest failbeforeI/O, no tokenargument/tenantJWT/cookiecachefallback, noenabledsigninandnoMFAqualification. Realprovider39/40blocked. No production/dependency/schema/designreplacement. Userstopafterbatch.

- **2026-10-21** — Serialized platform company registration ownership transferred to33; existing authentication/security/billing behavior preserved.

- **2026-10-21** — Sequential38 owns main.tsx for public help outside tenant bootstrap; platform route order/boundary preserved.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-28 — V5 public boundary continuation:** continued existing issue59 in
  persistent isolated worktree `v5-continuation-20261028/operator`, branch
  `implementation/v5-operator-boundary`, base verified8ff718e. Reused the now
  corrected AuthShell for actual public login/callback/security; retained
  OperatorShell's guarded33/35 consumer contract, separate request identity,
  callback rejection/scrub and local-only cleanup. Source checkpoint80299fb
  committed early. The coordinator granted minimal heading-only denial-selector
  changes in CompaniesPage.test/ServicePage.test; their other assertions remain.
  No shared route/backend/schema/dependency/provider/design changes.

- **2026-10-28 — Fresh behavior verification:** whole frontend64 Node+276 React
  tests/21files passes, including17 operator cases; full lint0, TypeScript and
  production build pass, detector[]. Initial whole suite caught4 obsolete title
  selectors after matching the V5 heading; fixed under explicit ownership and
  reran whole suite successfully. Initial guarded browser run3/3 passes: actual
  built routes with no tenant bootstrap, keyboard/language persistence/direct
  metadata denial, and real owner/manager/staff cookies rejected401 by platform
  APIs while their tenant identity survives local platform cleanup. Only owned
  disposable synthetic SQL was used, with matched private API/web builds.

- **2026-10-28 — Visual scope:** compared actual desktop1366×900/phone390×900
  EN/UR login/callback/security and cleanup receipt with approvedV5 references.
  Corrected phone heading wrap and identity-badge placement after the first look;
  fresh capture results and the exact provenance are in OPERATOR_UI.md and
  `v5-operator-evidence/`. Public unavailable views do not fabricate a provisioned
  account, authenticated sidebar, challenge or provider success. Overall34 stays
  In progress: actual OIDC state/nonce/PKCE/MFA/provider logout and positive
  operator/security acceptance remain blocked by the unqualified provider.

- **2026-10-29 — Saved-run completion:** resumed the persistent source without
  redoing accepted checks. Final guarded browser3/3 in24.7s passed on source
 25440e1, including the mobile type/badge fixes. Focused17/17, whole64Node+276React,
  full lint0, production build and strict E2E TypeScript passed. Inspected all12
  final EN/UR desktop/phone base captures and matching references, plus cleanup
  receipts;40PNGs include12references/12full-page supplements. Manifest hashes
  and supported security/callback deviations are in v5-operator-evidence. Overall
 34 remains In progress because positive provider/security qualification is absent.

- **2026-10-29 — Review handoff:** OPEN/DRAFT
  [PR95](https://github.com/Shumail-AbdulRehman/PRIV/pull/95), base
  `implementation/v5-workforce-final`, reuses issue59. Source25440e1 and
  evidenceb373c03 are separate from the final documentation link commit.
  Coordinator owns PROGRESS/SESSION_HANDOFF/ledger and shared ownership records.
  No merge, deployment or production data change.

- **2026-10-29 — Single-spec continuation:** verified fetched `d25f411`/draft PR105,
  prior 115 native/169 backend logs, six remaining and actual dependencies 19/27.
  Claimed issue59; isolated `implementation/spec-34-identity-qualification` branch.
  Existing local runtime was complete; added four callback/cache/isolation regressions.
  No runtime/backend/dependency/schema/design changes or invented provider adapter.
- **2026-10-29 — Verification:** 21 focused; full 64 Node +390 React/28 files;
  backend 1444 passed +7 existing skips; 186 focused backend/4 matched files;
  full frontend lint, both builds/types and browser types pass. Existing actual
  API/SQL/browser harness 3/3 passes (21.7s). Paired EN/UR1366/390 login/callback/
  no-session security and cleanup inspected; 40 PNGs/hashes in v5-operator-acceptance.
  No overflow/JS errors/bootstrap. Owned PG56534 stopped/zero child DBs;
  23 other worktrees/799 dirty paths unchanged. Full details: OPERATOR_UI.md.
- **2026-10-29 — Blocked, STOP:** approved browser IdP/client/API/redirect/security/
  recovery policy, provisioned subjects and exact MFA acr unavailable; session OIDC
  inputs absent, no root credentials loaded. State/nonce/PKCE/MFA/refresh/logout and
  positive security visual acceptance remain unchecked. Explicit provider criterion
  clarifies existing scope; no criterion removed. Six remain; no unblocked next unit.
 30 is dependency-eligible but mail blocked;36/37 external gates;40/41 ineligible.
  No other specification, merge, deployment, production or provider action.
- **2026-10-29 — Publication:** `5e2668a`, OPEN/DRAFT [PR106](https://github.com/Shumail-AbdulRehman/PRIV/pull/106) on PR105; full34 Blocked.
