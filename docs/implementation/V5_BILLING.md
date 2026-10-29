# V5 Billing and restricted owner access

Spec32 consumes completed15 (actual billing lifecycle/catalog/checkout/portal),27 (approved workspace shell),28 (shared lifecycle client/setup). Current continuation uses issue69 and a new isolated `implementation/v5-billing-acceptance` branch based on verified55061b8. Existing draft70 records historical functional delivery; the new draft is limited to V5 acceptance. No specification dependency or commercial decision changed.

## Implemented scope

The actual React `/subscription` follows immutable `design/v5/billing.html`: a main subscription/capacity/activity stack and300px help rail, labelled fact rows, semantic provider states, actual active usage/capacity and responsive English/Urdu. A separate activity panel displays only the recorded latest provider event. It does not manufacture activation history, invoices, card details or amounts paid.

Existing linked subscribers use a fresh guarded Paddle portal. Server-created transaction checkout, principal/company checks, duplicate locks, transaction reuse, uncertain reservations and no automatic purchase retry remain intact. Failed catalog refresh hides stale checkout actions; a mismatched lifecycle cannot request catalog, including manual refresh. Unavailable catalog/commercial/support configuration stays unavailable. Public/legacy pricing and checkout returns retain the canonical existing billing path; a return URL never grants activation.

`WorkspaceGate` was historical unused code. Its actual owner-only integration now wraps operational content inside `DashboardLayout`. It presents the approved `design/v5/access.html` composition for actual `company.operationalStatus=SUSPENDED` or `company.isActive=false`, including legacy false/ACTIVE. Billing/settings bypass this presentation gate; own-security/help already use separate top-level routes. The backend lifecycle DTO additively exposes the existing isActive column. There is no schema, migration, new policy or entitlement computation. Active unpaid accounts retain operational reads; the API denies unauthorized new work. Explicit401/403 refetch errors supersede a cached active presentation; initial unknown/error has a retry and safe destinations, rather than claiming suspension. Transient errors do not erase a previously active workspace. Server authorization remains authoritative.

## Intentional reference differences

- Prototype sample identities, reviewer controls, timestamps and lifecycle-state simulation are absent.
- Fictional compare/cancellation dialogs are omitted: plan/payment/cancellation changes belong to the actual configured portal. No approved independent mutation contract exists.
- Actual facts replace the sample subscription and date range. Period start/end are explicit; null dates remain unavailable. Provider state differs from workspace permission.
- Only the latest recorded event is exposed by the API. No invented invoice or activation history appears.
- Restricted recovery uses actual suspension/inactivity, without guessing grace/trial or blocking permitted unpaid reads. Security and help are additional real destinations. The existing shell retains its working sign-out control (phone navigation menu); no second logout workflow is introduced.
- Unconfigured merchant/catalog/terms/support disables checkout and portal in the real browser. Positive transaction/portal behavior remains component-boundary proof, not live provider qualification.

## Verification and evidence

Final commands/counts, paired images and independent review are recorded below after execution. Tests use an explicitly guarded disposable UUID child PostgreSQL database on owned loopback56442, never the restored local customer database on56445. The existing Spec40 runner sanitizes runtime configuration, disables Paddle, builds matched private API/React assets, uses one Chromium worker and removes its generated child/runtime. Response delay/abort state tests are explicitly labelled; no successful HTTP response is fabricated.

External release gates remain39/40: approved merchant/catalog/terms, actual sandbox checkout/portal/signed lifecycle/reconciliation, verified support/legal content and physical native/device/provider/privacy qualification. This web specification cannot certify those facts.

## Source and verification boundaries

Implementation1040ef2 is saved before browser qualification. Source inspection was split across backend, frontend and independent integration agents with exclusive ownership; all expensive checks are coordinator-run sequentially. Initial whole-web verification caught an outdated shell network fixture and an in-flight pre-fix access test snapshot (8failures). The real lifecycle fixture and final source were then checked together:70focused cases passed, followed by64Node and348React/28files with0failures. Full frontend lint passed with0findings. Component/provider mocks prove safeguards; they do not qualify an actual financial operation.

Dependency provenance:15 implementation1ea9ae8,27 original shellb8396ff plus integrated V5 refinements and28 sourcee212e40 are present in current ancestry. Historical27 publicationd18a26b is an independent metadata commit, not a required source ancestor; do not mistake that PR-history difference for missing shell code. Current70focused billing/access/shell cases and full348React regression checks pass.

The first SQL-enabled backend whole run passed1448/1449 and failed only the existing token lifetime fixture: Node TZ=UTC and the scratch PostgreSQL default Asia/Karachi disagreed for timestamp-without-time-zone parameters. The mismatch was confirmed directly; no application/schema/test invariant was weakened. A new generated child explicitly sets timezone UTC. Its focused158tests (including all7real persistence invariants) pass; full rerun and billing SQL proof are recorded after completion.

Final SQL-aligned backend run:158focused/5files and1449whole/95files, zero failures/skips; actual isolated billing SQL proof passes canonical ownership, untrusted email/customData denial, atomic dedup/rollback/order, placeholder convergence, unknown catalog denial, concurrent one-draft and lost-response resolution. Provider is a no-network fixture. Backend TypeScript and strict standalone integration compilation pass. The generated child database was removed. Logs: `/tmp/hygene-v5-billing-backend-utc-final.log`.

Initial matched React/API/SQL browser run:27/27cases pass. Visual review then caught the reused standalone workspace-access-page min-height stretching the owner recovery grid, despite functional assertions passing. The owner gate now uses exclusive owner-access-* selectors and a real panel header/body; standalone staff/platform access styles remain untouched. A full-source recapture with an in-viewport primary recovery-action assertion follows. Post-correction70focused cases and targeted ESLint pass; exact `npm run build --prefix frontend` passes (11.07sVite; existing non-failing plugin-timing advisory).

## Final acceptance

The corrected27-case gate passed again on final application5f90451; two additional access loading/error/recovery English/Urdu cases passed separately (29distinct scoped cases across those runs). Final source/harness lint and strict E2E TypeScript pass. Paired core16viewport frames and meaningful full-page/state images were inspected;86PNG artifacts (70actual/16references) have verified dimensions and SHA256 values. There is no outstanding local failing check. Initial diagnostic failures are retained above; no provider or device qualification is implied.

9specifications remain:30,33,34,35,36,37,38,40,41. Next recommended33 consumes completed24/27 and can continue approved local UI boundaries; positive IdP/MFA remains external. Spec40 stays In progress and41is ineligible. The dependency graph is unchanged.

No production/database schema/provider configuration changed.19original modified/untracked files in the root preservation manifest and its exact Git status remain unchanged. The root stays on fix/v5-runtime-data-loading; this implementation is in the isolated persistent worktree. All generated SQL children and private runner processes/assets were removed; only the owned test56442cluster was stopped. User5173/8080/56445services were preserved.

## Modified files

Backend: `backend/src/services/billingLifecycle.service.ts` and `.test.ts`.

Frontend: `frontend/src/pages/Subscription/{SubscriptionPage.tsx,SubscriptionPage.test.tsx,billing.css,types.ts}`, `frontend/src/i18n/billingTranslations.ts`, `frontend/src/components/layout/DashboardLayout.tsx`, `frontend/src/components/onboarding/{WorkspaceGate.tsx,WorkspaceGate.test.tsx,workspace-access.css}`, `frontend/src/routes/launchPages.test.tsx`, `frontend/e2e/billing-v5.spec.ts`.

Records: this document, `BILLING.md`, `V5_IMPLEMENTATION.md`, `SESSION_HANDOFF.md`, `v5-billing-evidence/` (README/manifests/verification/86PNGs), `specs/{AGENT-GUIDE.md,PROGRESS.md,README.md,15-billing-lifecycle.md,27-workspace-shell.md,28-setup-ui.md,32-billing-ui.md,38-service-information.md,40-e2e-suite.md}`, `specs/inventory/32-billing-ui.md`, `docs/implementation/planning/validator.md`. Ownership handoffs are metadata only; no unrelated specification was implemented.
