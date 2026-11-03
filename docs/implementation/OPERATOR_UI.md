# Current V5 operator public boundary — 2026-10-28

Spec34 remains **In progress** because a browser OIDC provider, provisioned
operators and MFA-positive workflow have not been qualified. The current public
login, callback denial and unavailable own-security screens now reuse the
approved V5 centered `AuthShell` in the actual React application. The existing
`OperatorShell` for guarded metadata consumers is preserved.

The login title follows the reference's “Platform operator sign-in”. The card
contains the restricted identity, actual provider-unavailable explanation,
disabled handoff, company-role separation and MFA requirements. It has no
fictional account selector or local MFA form. Callback responses are rejected
and query/fragment material removed. Security offers honest local platform
cache cleanup, with pending, retryable failure and receipt; tenant state is
preserved and provider logout is never claimed.

Current source branch: `implementation/v5-operator-boundary`, based on the
verified combined checkpoint8ff718e. Existing issue59 is reused. OPEN/DRAFT [PR95](https://github.com/Shumail-AbdulRehman/PRIV/pull/95) is based on `implementation/v5-workforce-final`; no PR is merged. Minimal
CompaniesPage/ServicePage test heading changes preserve their denial assertions;
no33/35 runtime source, route composition, backend, schema, dependency, provider,
database configuration or approved design is changed.

Fresh automated verification: **64 Node +276 React tests across21 files pass**;
17 focused operator cases are included. Frontend full lint has zero findings;
TypeScript and production build pass. Mechanical Impeccable detector returns[].
The first whole run exposed4 stale heading assertions after the approved title
change; those were corrected with sole ownership granted by the coordinator,
and the whole suite passed again.

Final visual/runtime report (inspected29Oct2026): source25440e1, actual desktop
1366×900/phone390×900 EN/UR login, callback rejection, unavailable own-security
and local cleanup receipts were compared with unmodified V5. The corrected
mobile title fits on one line, badge follows the reference position, Urdu stays
RTL and controls meet44px desktop/48px phone. All12 final base application views
were opened, along with matching login/security references; no significant
public-boundary defect remains in the captured states. The40PNG evidence count
includes12references and12supplemental full pages, not40accepted screens.

Final guarded browser run: **3/3 passed in24.7s**. It proves actual route
rendering with no tenant bootstrap, keyboard skip/focus, persistent language,
missing-provider protected-route denial, callback material removal, and actual
owner/manager/staff cookies denied401 by metadata APIs while preserving their
tenant identity after local cleanup. No positive response was intercepted.
The final runner compiles backend, strict E2E TypeScript and frontend before
building/serving private assets and cleans its disposable synthetic UUID DB.
No production/customer database, root environment file or existing8080 server
was used. The initial3-case run repeats the same coverage and is not added.
Cleanup pending/duplicate prevention and retryable failure are unit verified;
there is no fabricated provider-loading or MFA-success state.

Evidence: [manifest and inspection record](v5-operator-evidence/README.md),
`v5-operator-evidence/{manifest,render-results}.json`, harness
`frontend/e2e/operator-v5.spec.ts`. Final focused command17/17, whole web
64Node+276React, lint0 and production build pass. Strict E2E TypeScript also
passed independently; no behavior source changed after the captured source.

Supported differences: no reviewer bar/gallery/sample identities or challenge;
real unavailable explanation replaces sample provider controls. V5 security
shows a fictional authenticated operator shell, which cannot be rendered as
actual identity without a qualified provider. The public safe fallback is
verified; positive operator security/MFA/PKCE/state/nonce/provider logout remains
blocked and unverified. Callback has no dedicated V5 reference, so its shared
public sign-in composition is compared with operator-login. Full34 is **not
complete**. Historical records are retained below.

---

# Platform sign-in boundary — Specification34

The platform pages use a separate audience from company accounts. `platformRoutes` exports `/platform/login`, `/platform/callback`, `/platform/security` and a safe `/platform/*` fallback. Register these as top-level routes **outside `App`, `GuestRoute` and `ProtectedRoute`**: those initialize tenant cookies/refresh and must not decide operator access. The root integration owner supplies this global router change after the parallel branch is consumed.

The approved OIDC browser provider has not been selected or configured. Accordingly the login and own-security handoffs remain disabled with English/Urdu explanations. No operator registration, local password/MFA form, guessed authorization/security/logout URL, default identity or browser configuration flag enables them. Security pages contain no identity claims or protected records. Company sign in remains an explicitly separate destination.

`OperatorBoundary` never mounts protected children in this unqualified state. `operatorSessionStatus` reports unavailable. `operatorRequest<T>(path, options)` is the dedicated request boundary for later platform consumers33/35: it rejects with `OperatorUnavailableError` before network I/O and accepts no bearer-token argument. It does not import the tenant Axios client, Redux store, cookie refresh or tenant query keys. This is deliberately not a working provider adapter. Do not replace it with a tenant request or decode a JWT locally to manufacture a session.

`operatorQueryScope` is `['platform-operator']`. Consumers must put all privileged metadata under that prefix. `clearOperatorSession` cancels matching requests before removing that prefix; it preserves company queries and tenant identity. The security page labels this as local cleanup and explicitly says it does not sign out of the identity provider. No provider revocation guarantee is claimed.

The callback never initiates or accepts an authorization exchange. There is no legitimate pending state/nonce/PKCE verifier to compare: every unsolicited response is rejected, including matching-looking values and access-token fragments. Search/fragment response material is removed with router replacement, never logged, decoded or persisted. No return-to parameter creates an open redirect. Once a provider is actually selected, a reviewed maintained provider integration must replace this disabled boundary before activation; merely setting the backend verifier environment is insufficient.

## Existing backend contract, not browser configuration

Spec19 requires RS256 **API access tokens** with the exact configured issuer/API audience/JWKS origin, a provisioned subject, bounded issue/expiry dates and exact independently approved MFA `acr`. It accepts only a dedicated Authorization bearer; tenant cookies or `req.user` do not qualify. It does not expose discovery/client ID, authorization/token endpoints, browser state/nonce/PKCE, redirect/recovery/logout policy or a trusted browser-session issuance endpoint. None of those absent facts can be inferred from `PLATFORM_OIDC_*` backend variables. See OPERATOR_IDENTITY.md and inventory19. No provider configuration, token or real operator was supplied to this implementation.

Release39/40 must qualify the actual browser client/resource, exact redirect origins, state/nonce/PKCE handling, callback replay/failure, MFA enrollment/recovery, provisioned people, API bearer transport, token refresh/expiry and provider logout/revocation against primary provider documentation and sandbox behavior before enabling access. Synthetic UI and RSA verifier tests establish local denial mechanics only; they do not qualify any IdP or claim live MFA.

## Parallel implementation evidence and integration handoff

Branch `implementation/spec-34-operator-ui` is based onSpec28 commit2d77fd3. Issue59 is claimed. Source ownership is entirely feature-local; no global main/App/router, shared i18n, DESIGN.md, dependency, database, CI or performance file changed. Root integrates exported `platformRoutes` at top level after30 and updates shared PROGRESS.md/SESSION_HANDOFF.md serially. Before completed status, root must run the fresh independent Impeccable finish reviewer and documenter; all4 agent slots were occupied during implementation. This branch is intentionally still In progress until that review and registration are verified.

Verification logs: `/tmp/hygene-spec34-focused.log` (15 tests), `/tmp/hygene-spec34-tests.log` (57 Node+71 component tests/7files), `/tmp/hygene-spec34-lint-final.log` (zero), `/tmp/hygene-spec34-build-final.log` (TypeScript+Vite), `/tmp/hygene-spec34-detect.json` (zero findings), `/tmp/hygene-spec34-render.log` (all controls48px, no overflow/JS errors). Vite emitted its existing non-failing plugin-timings advisory. No backend source changed and no backend qualification claim is made.

Reviewer packet: project `/tmp/hygene-spec34`; artifact `frontend/src/pages/Platform/OperatorLogin.tsx` plus sibling session/routes/translations/CSS/tests; direction contract `.impeccable/surfaces/frontend-src-pages-platform-operatorlogin-tsx.md`; required screenshots `.impeccable/review/spec34/{desktop,mobile,desktop-ur,mobile-ur,security,security-ur,callback}.png`. All captures were opened and validated after the scoped48px correction. Code-led ordinary approvedv5 extension, no comp/fidelity-build phase. The temporary isolated render fixture was removed after capture; no app/provider data or integrated product E2E was used. Approved design authority is root `design/v5`; historical DESIGN.md teal context is not authoritative. Documenter write boundary: read-only ordinary-extension comparison, preserve existing DESIGN.md and sidecar.

Independent finish review: ship for the scoped disabled operator boundary. Reviewer opened all7 captures and verified tenant isolation/callback rejection. Initial claimed final lint log actually contained3 unused-binding errors; root corrected those, and reviewer independently reproduced a fresh exit0 lint pass. Independent ordinary-extension documenter comparison passed, preserving DESIGN.md/sidecars and reporting inherited token/heading drift only. Global route registration/integrated checks remain root-owned before completed status.

Root registered platformRoutes at top level outside tenantApp on implementation/spec-34-operator-integrated after30/PR62. ActualReact synthetic login/security/callback/wildcard render check recorded zero API/tenantbootstrap requests and zero JS errors; callback response scrubbed. Integrated fullfrontend57Node+102component/10files, lint/type/buildpass. Independentreview/documentationcomplete, configuredproviderqualificationstillabsentanddisabled.
