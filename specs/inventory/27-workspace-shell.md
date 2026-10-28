# Spec27 reuse inventory

- `frontend/src/routes/workspaceRoutes.tsx`: exact existing route list and owner-only billing/managers/settings guards consumed by main and tests. `workspacePages.tsx` retains lazy page imports. Future feature registration needs explicit current ownership handoff.
- `frontend/src/routes/launchPages.tsx`: `WorkspaceAudience` sends STAFF to real Android handoff without operational web pages; `WorkspaceRouteError` hides raw errors with working reload/workspace links; honest settings/platform unavailable boundaries for30/34. No tenant role promotion or fake download/IdP URL.
- `frontend/src/components/layout/{DashboardLayout,Sidebar}.tsx`: approved white navigation/blue selection and existing blue H logo; actual count/logout hooks, translated mobile dialog/close label, focus return, owner-only administration, logout failure/pending feedback.
- `frontend/src/i18n/launchTranslations.ts`: shared launch EN-key→Urdu vocabulary registered ahead of old dictionaries; attendance vocabulary retained. LanguageProvider remains the single html lang/dir owner.
- `frontend/src/workspace-refresh.css`: exact v5 semantic RGB aliases/Inter/Arabic, logical224px sidebar,72px header,900px mobile navigation, focus48px targets and reduced motion; existing data/page structures preserved.
- `docs/implementation/previews/shell-*.png`: current rendered actual React fixtures, not prototypes or provider/persistence E2E. Source detector's sole generic Inter advisory is superseded by approved font.

### V5 correction reuse — 2026-10-22
Existing Sidebar/DashboardLayout now use actual subscription company identity, V5 operational navigation, a quieter account group and the same role guards. Existing workspace tokens now use V5 type/control/table/panel dimensions. `OperationStatus` supports informational SUBMITTED independently from semantic success. `ScopeFilters` accepts an optional actual site-local date without changing the query's today semantics.

### Shared boundary completion — 2026-10-28

- `frontend/src/components/ui/dialog.tsx`: existing DialogContent/optional DialogFooter Close now use existing language context (safe English default outside a provider), plus logical inline-end. No new modal abstraction.
- `frontend/src/workspace-refresh.css`: language hit areas44px desktop/48px phone; shared phone button/Close targets48px; existing STAFF handoff signout48px. Topbar retains72px minimum.
- `frontend/src/routes/launchPages.test.tsx`:26shared boundary cases cover translated dismissal, real mobile billing navigation/close and manager Urdu independent security destination. Test ownership returns30→27 serially for this batch.
- `frontend/e2e/shell-v5.spec.ts` (Spec40 harness): actual matching API/React/disposable SQL shell/navigation/boundary captures, no positive response replacement; evidence/provenance in docs/implementation/v5-shell-evidence. Feature pages/native/providers separate.
