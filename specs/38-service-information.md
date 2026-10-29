# Spec 38 — Configured support and service information

**Status:** Done
**Depends on:** Spec 27, Spec 25
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** #89
**Owns:** `frontend/src/main.tsx`, `frontend/src/components/layout/PublicLayout.tsx`, `frontend/src/i18n/translations.ts`, `frontend/src/i18n/serviceTranslations.ts`, `frontend/src/pages/Help/help.css`, `.impeccable/surfaces/frontend-src-pages-help-helppage-tsx.md`, `frontend/src/pages/Help/HelpPage.tsx`, `frontend/src/pages/Help/HelpPage.test.tsx`, `frontend/src/pages/Help/serviceInformation.ts`, `docs/implementation/COMMERCIAL_CONTENT.md`, `docs/implementation/V5_HELP.md`, `docs/implementation/v5-help-evidence/`, `specs/inventory/38-service-information.md`
**Reuses:** `frontend/src/components/layout/PublicLayout.tsx`, `DESIGN-SYSTEM.md#component-conventions`, `design/v5/information.html`

## Goal

Configured support and service information in the existing application, with persisted behavior and explicit safety boundaries.

## Scope

Consume spec25 `/api/support/contact` explicit availability; no invented support address or assumed verified delivery.


Provide actual support path, approved service/privacy/exit text via explicit configured facts. Unavailable recipient/legal terms/Android link shows unavailable and blocks purchase/release where required. Describe current supported photo guarantees; no invented legal promises, refund policy, prices or retention. Register via shell ownership handoff.

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

- [x] Approved V5 layout and interactions are implemented and paired actual-app/reference screenshots are inspected at desktop/phone EN/UR; state/permission deviations are recorded. Native acceptance requires a native runtime. [static]
- [x] `npm run test:components --prefix frontend -- src/pages/Help/HelpPage.test.tsx` passes: Missing support/link/policy never renders a working claim; configured safe links use expected origin; EN/UR assistance available. [unit]
- [x] `npm test --prefix frontend` passes the whole affected unit suite; record count. [unit]
- [x] Only scoped paths changed; relevant denial/empty/error/config-unavailable states inspected. [static]
- [x] `npm run lint --prefix frontend` reports zero errors/warnings in changed files; document baseline separately. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

- **2026-10-29 — Single-spec continuation:** Dependencies25/27 are Done on verified
  2011a90; issue89 reused. Existing unavailable behavior is part of approved38,
  not a dependency on activating live services. Verify its web contract with real
  public-router responses and separately labelled configured rendering fixtures;
  retain actual mail/legal/distribution qualification in39/40. The unchanged
  Node parity test exposed ten missing shared web strings from earlier native
  work. Synchronize only those existing translations in the already owned shared
  dictionary as a narrow dependency correction; no native flow or test weakening.

- **2026-10-21** — Issue75 claimed, actual25/27 ancestors verified; branch implementation/spec-38-service-information based35/5f10d3c. Latest user authorizes38/39 only. Explicit shared ownership transferred30/32/34/35 before edits, no DAG change. Preserve eight dirty files snapshot /tmp/hygene-spec38-39-preserved.json.
- **2026-10-21** — Added actual public help/information routes outside tenant bootstrap, configured safe support/contact no-credentials/no-store request and retry, escaped facts, origin-pinned explicitly approved policy/distribution links with unavailable defaults. Separate photo upload/submission/review/verification and unqualified processing guidance. New checkout blocks absent policy/support, rechecks recipient before transaction; existing portal retained. No legal promises, production config/provider activation, database or dependency changes.
- **2026-10-21** —16focused Help +24billing React tests; full57Node+215React/16files;109existing support/billing backend tests. Full frontend lint0/TypeScript/Vite build pass.8built-route synthetic HTTP renders EN/UR390/1440 zero overflow/JS errors, only public support requests; desktop/mobile viewed, fixed marketing heading precedence and contact wrapping. Detector[]. No live delivery/legal/device/provider qualification inferred;39/40 retain gates. Inventory38/COMMERCIAL_CONTENT list files/config/limits; logs /tmp/hygene-spec38-*.
- **2026-10-21** — Published44df792 as OPEN/DRAFT PR76 https://github.com/Shumail-AbdulRehman/PRIV/pull/76, base35/PR74. Continue39 only.
- **2026-10-21** — Final computed-style review found retained PublicLayout Manrope overriding approved Inter headings; fixed in38 follow-up66723be, pushed normally and integrated into39 through a dependency-branch merge. Rebuilt TypeScript/Vite and repeated8EN/URrenders; h1 computed30px Inter, no overflow/JS errors. No PR merge or rewritten history.

- **2026-10-21 — Visual acceptance correction:** reopened for outstanding approved V5 acceptance. Historical functional checkmarks/logs are preserved; they do not certify visual fidelity. Current four-part status and evidence: docs/implementation/V5_IMPLEMENTATION.md. No prior visual requirement is newly verified by a build.

- **2026-10-21:** serialized Sidebar ownership returns to27 for approved V5 correction; prior38support navigation remains functional.

- **2026-10-22 — V5 correction issue89:** isolated branch implementation/v5-help-information based16264ae/PR87; actual public Help split panels and distinct centered Service information card implemented in944186b. Coordinator granted serialized main.tsx ownership for only these two routes, keeping both outside tenant bootstrap and leaving PublicLayout unchanged. Existing configured support/legal/distribution guards, recovery and truthful photo guidance retained; unsupported prototype support acknowledgement omitted.20focused Help,64Node+239React/19files, frontend lint0/TypeScript/Vite build and existing e2e/tsconfig pass; detector[]. Real API/SQL paired captures and independent visual QA are coordinated in the integration worktree and recorded in V5_HELP.md/evidence. Configured-positive/legal/mail/device qualification remains open;38 stays In progress. Historical issue75/PR76 retained above.

- **2026-10-22 — Integrated visual checkpoint:** coordinator guarded matching React/API/disposable-SQL run21cases passed52.2s including both Help cases; integrated64Node+245React/full lint/types/build pass.22PNGs/8base observations, actual unavailable support200, public-only API requests, FAQ/navigation/loading and explicitly aborted network-error/retry. Implementer/coordinator/independent QA compared matching1366/390 EN/UR; core compositions/readability verified with public shell/title/no-ticket-form/real-copy differences documented in V5_HELP.md. Configured-positive live mailbox/legal/distribution visual states remain unverified, so38 remains In progress; no full-V5/provider/native completion claim.

- **2026-10-29** — Serialized ownership transferred to32 for existing `frontend/src/pages/Subscription/SubscriptionPage.tsx`, `frontend/src/pages/Subscription/SubscriptionPage.test.tsx` during approved billing/restricted-account correction. Existing policy and public help/security composition preserved.

- **2026-10-29 — Complete approved web contract:** Bounded cancellable contact read,
  localized distinct policy link names,44/48px language targets, support alignment
  and public navigation scroll/main-focus fixes reuse existing implementation.
  Final32Help/64Help+billing tests,64Node+372React whole web,110backend support/billing,
  full frontend lint0 and TypeScript/production build pass. Final18visual observations
  and34PNGs include paired1366/390EN/UR plus configured fixtures/FAQ/loading/error/
  retry; all inspected. Actual public router/service HTTP200, no-store, omitted
  cookies and no tenant bootstrap verified; no SQL/external services required.
  Initial vocabulary parity, harness cwd/static-path, test-type option and captured
  alignment/retained-focus defects corrected; failed/interrupted runs not accepted.
  Native is outside this web unit. Real mailbox/legal/distribution/photo/merchant
  qualification remains39/40; default unavailable guards and30Blocked retained.
  No other spec implementation. V5_HELP and final evidence map every criterion.
