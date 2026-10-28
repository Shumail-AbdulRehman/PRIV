# Spec 30 — Account settings and recovery UI

**Status:** In progress
**Depends on:** Spec 16, Spec 17, Spec 22, Spec 27, Spec 28
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #88
**Owns:** `frontend/src/pages/Account/settings-v5.css`, `docs/implementation/V5_SETTINGS.md`, `docs/implementation/v5-settings-evidence/`, `frontend/src/routes/launchPages.tsx`, `frontend/src/components/common/AuthShell.tsx`, `frontend/src/components/common/auth.css`, `frontend/src/pages/Signup/SignUpPage.tsx`, `frontend/src/pages/Login/LoginPage.test.tsx`, `docs/implementation/V5_AUTH.md`, `frontend/src/pages/Account/AccountPages.tsx`, `frontend/src/pages/Account/AccountPages.test.tsx`, `frontend/src/pages/Account/api.ts`, `frontend/src/pages/Account/linkToken.ts`, `frontend/src/pages/Account/linkToken.test.tsx`, `frontend/src/pages/Account/account.css`, `frontend/src/i18n/accountTranslations.ts`, `frontend/src/App.tsx`, `frontend/src/routes/workspaceRoutes.tsx`, `frontend/src/pages/Login/LoginPage.tsx`, `docs/implementation/ACCOUNT_UI.md`, `.impeccable/surfaces/frontend-src-pages-account-accountpages-tsx.md`, `specs/inventory/30-account-ui.md`
**Reuses:** `frontend/src/pages/Help/serviceInformation.ts`, `frontend/src/components/common/AuthShell.tsx`, `frontend/src/pages/Login/LoginPage.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/recovery.html`

## Goal

Account settings and recovery UI in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Consume16 owner identity status/requests/completion. Implement fixed `/verify-owner-email` and `/reset-owner-password` fragment-token pages: capture and remove fragment immediately, POST token bodies, never auto-consume on GET or expose token to analytics/logs. Public request receipt states delivery unconfirmed, not email sent. Missing sender/legacy bootstrap has honest unavailable guidance; no automatic trust or production bootstrap.


Replace27 CompanySettingsUnavailable in frontend/src/routes/workspaceRoutes.tsx via explicit serialized ownership handoff; keep owner-only company settings and independent own-security capability.

Implement real reset/verify/self-password and owner Organization settings forms; neutral request states, expired/used links, force replacement and unavailable delivery. Clear cached identity on credential changes. Register actual pages via spec27 ownership handoff; no pretend sent mail.

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
- [x] `npm run test:components --prefix frontend -- src/pages/Account/AccountPages.test.tsx` passes: Owner/manager separation, required/current password, expired recovery, unavailable sender and saved-setting display tested. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- 2026-10-21: Issue58 claimed; isolated worktree based28 at2d77fd3. Implemented actual22 versioned organization name,16 owner verification/recovery/link confirmation,17 own-password and structured forced-password bootstrap fallback; first-import volatile fragment scrub; complete new EN/UR workflow and48px v5 forms. Reused incumbent UI/client/auth; no dependency/backend/schema/production changes.19 focused tests and57 Node+75 component whole frontend tests pass (final principal-change regression). Detector once returned[]; nine synthetic EN/UR mobile/desktop captures checked, not E2E/mail qualification. Final whole suite, full lint and TypeScript/build all exit0 after principal-cache regression; independent finish reviewer/documenter remain coordinating-agent gates, so status stays In progress. Root serializes ownership/PROGRESS/handoff and publishes after review; do not mark delivery/provider qualification. User stop after batch29/30/34/37.

- **2026-10-21** — Root integrated83e8a8c/2b42bad/be81d57 after29/PR61, retaining both dictionaries and existing routes. Direct28 records actualshared nav/route consumption;27 main/test and29 registration handoff serialized.19 focused tests; isolated full57Node+75components/8files, lint/tsc/buildpass. Independent fullreview foundonlyerrorbutton44px; scoped48pxfix recaptured9views andsamereviewer scoredresolved/ship atfixscope. Read-only documentercomparisonpass, historicalDESIGNdriftpreserved. Ownerverification query/receipt principal-bound withregression. Fragmentfirstimportscrub+explicitPOST; exactreal16/17/22 APIs, unavailabledeliveryhonest. Root integratedwholewebchecks recordedinbatchhandoff. No credentials/provider/production/schema/dependencychanges.

- **2026-10-21** — Serialized main route registration ownership passed34; first-import ownerlink scrub and account routes preserved.

- **2026-10-21** — Serialized workforce integration ownership transferred to31; existing setup/account behavior retained.

- **2026-10-21** — Serialized ownership handed to38 before support/information route/nav/dictionary/checkout-availability integration; existing feature behavior preserved.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-22 — Issue86 V5 correction:** serialized ownership of shared AuthShell/login/registration presentation and existing account security surfaces. Spec13 hands off SignUpPage presentation only; registration API/hook/atomicity stay unchanged. App GuestRoute owns the confirmed registration-to-billing race correction; explicit signup destination, no entitlement change. Spec40 consumes rendered public authentication/recovery/link/security states and persisted login/registration. Historical issue58/PR62 retained; overall acceptance remains In progress until verified.

- **Issue86 scope continuation:** staff web handoff shares the V5 public shell; preserve WorkspaceAudience role exclusion, actual sign-out and38 approvedLink/serviceInformation distribution guard. No native or fake app-open route, prototype-only CTA or provider claim.

- **2026-10-22 — V5 public-auth checkpoint:** AuthShell now matches actual journey gallery; all customer credential/owner-link/security forms and staff web handoff consume it.50 focused account/auth/role tests; whole64Node+235React; lint0/TS/build.21 real isolated browser cases pass, including the original registration destination regression and staff sign-in/out;79 screenshots,36 EN/UR desktop/phone observations without overflow/JS errors. Existing APIs, token scrub/explicit POST, failed session delivery, restricted own-security access and staff exclusion remain. Exact limits/deviations in V5_AUTH.md; provider-issued delivery and complete organization/settings visual acceptance are not certified. No backend/schema/dependency/production changes. Latest user requests stop after current checkpoint and complete new-session handoff.

- **2026-10-22 — checkpoint saved; STOP per user:** implementation68709b1 on implementation/v5-customer-auth published OPEN/DRAFT PR87 (https://github.com/Shumail-AbdulRehman/PRIV/pull/87), base review correction/PR85. Independent clean worktree frontend build/TypeScript/lint and64Node+235React tests pass. Backend owner identity60pass;21 integrated browser cases and final5capture cases pass;79 screenshots/36 clean observations retained. Detailed new-session handoff saved in SESSION_HANDOFF.md. Owned56442 test cluster stopped/0generated DBs; user5173/8080 running, no adb device. Organization/settings is next but not started; full V5/spec30/40 acceptance remains incomplete. Original eight source diffs and five-line handoff append preserved; no merge/deploy/production action.

- **2026-10-22 — Issue88 organization/settings correction:** authorized parallel implementation in isolated dependency-complete worktree; Agent A owns AccountPages/settings-only CSS/account vocabulary/tests/evidence and this log, coordinator owns tracker/handoff. Existing AccountPages retained without extraction; launchPages.test heading assertion transferred exclusively for approved Settings title. Organization/name-only optimistic save/protected rail, actual My account/owner verification and inline existing password/session flow use EN/UR responsive tabs. Spec22 contact/manager restrictions and standalone own-security remain. Failed explicit refresh now retains mounted draft and cached saved facts; successful reload consumes current version. Independent A23Account tests; whole64Node+242React/19files; frontend lint0/TypeScript/production build pass; detector[]. Coordinator integrated64Node+246React pass; initial21browser cases and final13settings/workspace cases pass (24.9s final), actual disposable SQL/API and explicitly labelled network-abort seam.35PNG evidence/12clean main observations, paired1366/390EN/UR; Agent A/coordinator/independent C inspect core composition and states. Manager API403/safe redirect provenance is separate from Dashboard visuals. Exact four-part statuses/deviations in V5_SETTINGS.md. Scoped owner settings core accepted; provider-issued delivery, all credential-state visuals and wider account acceptance remain unverified. Full spec30 stays In progress; no new backend/schema/provider/production behavior.

- **2026-10-28 — Serialized shared-shell handoff:** launchPages.test.tsx transfers30→27 for actual navigation/role/dialog regressions. Account/auth sources and own-security contracts remain30. No additional dependency or product policy.
