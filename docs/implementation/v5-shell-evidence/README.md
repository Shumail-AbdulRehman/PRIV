# Spec27 shared V5 shell evidence — 2026-10-28

Source: isolated persistent shell worktree, branch `implementation/v5-shell-acceptance`, source commit7965d06 based dependency-complete d2c426b. Source is independent of the root's preserved Dashboard/backend performance overlay. Approved design/v5 is linked read-only, never modified or committed.

The interrupted26October temporary source/evidence was lost by the environment. Those earlier checks are historical; all current acceptance below is rebuilt from the committed source and newly captured evidence.

The guarded existing Spec40 runner compiles React and its matching backend from this checkout. It creates/migrates/seeds a UUID child database under the explicitly owned loopback PostgreSQL17 bootstrap127.0.0.1:56442/priv_e2e_test, serves private production assets on unused dynamic ports and removes that child/runtime afterward. Company/people/task facts are synthetic persisted fixtures. No restored customer or production database is used. No provider is enabled. Traces, video, stored auth state and failure screenshots are disabled; explicit images have empty credential fields.

`frontend/e2e/shell-v5.spec.ts` captures matching1366×900 and390×900 English/Urdu. `render-results.json` records eight owner/manager base observations. These cover the shell, not the entire feature page's visual acceptance.

- `app-owner-*` / `v5-owner-*`: actual owner shell on Today, compared with approved owner shell on Overview. Content-page differences are outside27; owner Dashboard remains unaccepted and its user work is preserved.
- `app-manager-*` / `v5-manager-*`: actual manager Today shell and approved manager reference.
- `app-*-menu-*`: real phone edge navigation with role links/current page, bounds, Escape/focus return and Team navigation assertions.
- `app-manager-security-*`: actual403 company-settings response/canonical manager redirect verified before independent own-security; capture is the independent security form.
- `app-staff-handoff-*`: real STAFF authentication reaches actual configured-off Android handoff without tenant navigation or fake distribution link. Web evidence never proves Android runtime qualification.
- `app-not-found-*`: actual unmatched route, localized safe recovery and working workspace return.
- `app-localized-dialog-*`: existing real Staff access dialog verifies shared close names/logical end/dismissal. This does not accept previous Staff/Workforce page styling. Capture waits opacity1/opaque white and disables animation.
- `app-lazy-resource-fault-*`: labelled frontend resource-failure seam. Only ManagersPage JavaScript chunk is aborted; no API response replaced. Actual error boundary hides loader details, translated reload succeeds after seam removal.

Intentional supported differences: prototype reviewer bar/sample names/times omitted; actual company/authenticated role replace examples. Full accessible Radix edge drawer replaces reference phone details/popover and exposes all permitted navigation. Owner Managers tools/Staff access reuse real routes rather than fake Team access destination. Manager Settings reaches independent own-security; owner company settings/billing remain denied. Actual logout remains reachable by scrolling; no fake operator promotion.

Source fixes: existing DialogContent and optional DialogFooter Close use existing language context and logical inline-end. Workspace language selector targets44px desktop/48px phone; shared phone button/Close targets48px and STAFF signout48px. Topbar retains72px minimum (up to73px including border with enlarged controls). Actual geometry is asserted. No new modal abstraction, dependency, API, schema or provider configuration.

Native, platform IdP, delivered mail, photo, Paddle and all-feature/full-product acceptance remain separate. Current commands/results and independent visual review are appended after the fresh run completes.

## Fresh verified outcomes

- Current source7965d06 with test-settling correction2ab7c96: guarded `HYGENE_E2E_DATABASE_URL=postgresql://shumail@127.0.0.1:56442/priv_e2e_test HYGENE_E2E_BROWSER_PATH=/usr/bin/google-chrome npm run test:e2e --prefix frontend -- shell-v5.spec.ts`: **3passed50.0s**.40current PNGs all match labelled1366/390×900 dimensions; eight base route/role/language observations have zero overflow/JavaScript errors. Header min72px/border-inclusive≤73px,44/48px control targets and settled opaque dialog geometry are asserted.
- `npm run test:components --prefix frontend -- src/routes/launchPages.test.tsx`:26passed. `npm test --prefix frontend`:64Node+250React/19files, zero failures. `npm run lint --prefix frontend`:0findings. `npm run build --prefix frontend`:TypeScript+Vite pass. Guarded runner also compiles backend and strict browser types from this source. No backend business source changed.
- Mechanical detector:dialog has no finding; workspace stylesheet retains two generic Inter warnings, intentionally overridden by approved V5's pinned Inter font. No palette/design change made.
- The first fresh run passed shell/fatal cases but failed one dialog target assertion during entry zoom43.835px before settlement. That evidence check was corrected to wait opacity/opaque surface and poll final geometry; final run passes without weakening44/48px requirements. Earlier/interrupted results are not substituted for final acceptance.
- Local logs remain in persistent shell/.verification; source/evidence are committed. Runner-owned child SQL/runtime is removed by its finally cleanup. No deployment, merge, production operation or provider activation.
