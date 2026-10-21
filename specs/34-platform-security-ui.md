# Spec 34 — Platform sign-in and security workspace

**Status:** In progress
**Depends on:** Spec 19, Spec 27
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** #59
**Owns:** `frontend/src/pages/Platform/OperatorLogin.tsx`, `frontend/src/pages/Platform/OperatorLogin.test.tsx`, `frontend/src/pages/Platform/operatorSession.ts`, `specs/inventory/34-platform-security-ui.md`, `frontend/src/pages/Platform/operator.css`, `frontend/src/pages/Platform/operatorTranslations.ts`, `docs/implementation/OPERATOR_UI.md`, `.impeccable/surfaces/frontend-src-pages-platform-operatorlogin-tsx.md`
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

- [ ] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm run test:components --prefix frontend -- src/pages/Platform/OperatorLogin.test.tsx` passes: Missing config stays disabled; unsolicited callback/state/nonce rejected without an initiated flow; tenant auth never treated as operator; MFA requirement explained. Live provider state/nonce/PKCE/MFA remains gated by39/40. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-21** — Claimed issue59 in isolated branch implementation/spec-34-operator-ui from2d77fd3 (Spec28/PR56). Scope amended before implementation for separate route exports, local translation/style/session boundary and operator handoff docs. Global main/App/router ownership remains the parallel30/root integration owner. No tenant client/Redux/cookie fallback or provider/token credentials. No selected browser IdP adapter exists; configured backend19 verifier alone cannot create a browser session. Every handoff remains unavailable and every callback rejected without an initiated trusted flow.
- **2026-10-21** — Local15 focused component tests and whole web57 Node+71 component tests/7files pass; initial/full lint and TypeScript/Vite build pass. Scoped48px control correction captured in7 valid EN/UR desktop1440/mobile390 component-fixture screenshots, plus security cleanup and callback denial, with no JS errors/overflow. Impeccable detector ran once withzero findings. Temporary preview entry removed. No full-product e2e run before40. Final rebuild passes; independent finish review/documenter plus root top-level routing integration remain required before markingDone. Root serializes progress/handoff updates to avoid parallel conflicts.

- **2026-10-21** — Fresh independent finish review ship at disabled-boundary scope, all7captures checked; three lint unusedbindings corrected by root and reviewer fresh lint exit0 confirmed. Read-only documenter comparison pass, inherited design drift reported without repair. Root top-level route integration remains beforeDone.

- **2026-10-21** — Root integrated874fff1/3cb20d1/82a7d21 after30/PR62; registered platformRoutes top-level outside tenantApp. ActualReact syntheticrouteproof /platform/login,security,callback,wildcard made zeroAPIrequests (includingtenantbootstrap), noJSerrors; callback query/fragmentremoved.15focused; integratedwhole57Node+102components/10files, lint/tsc/buildpass. Independentfullreview shipatintentionallydisabledboundaryscope;3initiallintunusederrorscorrectedandfreshreviewerlintverified.7EN/URcaptures plusdocumentercomparisoncomplete. Provider/browserOIDCclientnotselected, sooperatorRequest failbeforeI/O, no tokenargument/tenantJWT/cookiecachefallback, noenabledsigninandnoMFAqualification. Realprovider39/40blocked. No production/dependency/schema/designreplacement. Userstopafterbatch.

- **2026-10-21** — Serialized platform company registration ownership transferred to33; existing authentication/security/billing behavior preserved.

- **2026-10-21** — Sequential38 owns main.tsx for public help outside tenant bootstrap; platform route order/boundary preserved.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.
