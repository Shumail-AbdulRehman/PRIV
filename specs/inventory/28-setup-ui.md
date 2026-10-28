# Spec28 reuse inventory

- `frontend/src/pages/Setup/{SetupPage,api,setup.css}`: bounded persisted per-location readiness, role-specific actions, exact server permission, local checked time, current page/selection and failure states. Route `/setup`; STAFF excluded.
- `frontend/src/i18n/setupTranslations.ts`: English-key→Urdu setup/calendar/guidance dictionary registered with existing translator; LanguageProvider owns document direction.
- `frontend/src/pages/Subscription/{api,types}.ts`: `getBillingLifecycle(signal?)` and `BillingLifecycle` mirror15 owner lifecycle read.32 consumes these rather than adding another owner lifecycle client.
- `backend/src/services/taskReadiness.service.ts`: additive `access.manageWork` from14 persisted account state/evaluator; no write or task preparation, including empty scoped pages.
- Existing Location/Staff/LocationTemplatesTab pages own the dialog state represented by `create=1`/`newSchedule=1`; scoped site filter retained when closing. Setup links reuse those forms, existing area entry point and staff Edit shifts.
- Today preserves actual operations, adds daily/weekend/location-timezone guidance and setup navigation. Existing dirty Dashboard performance code remains intact.
- `docs/implementation/SETUP_UI.md`: contracts, commands, intentional future30/32 boundaries and external qualification limits. Surface brief under `.impeccable/surfaces/` records approved v5 extension; synthetic captures in `.impeccable/review/spec28/` are local review evidence, not shipping assets or integrated E2E.

### V5 correction reuse — 2026-10-22
`frontend/src/pages/Manager/TodayPulse.tsx` exports TodayPulse and TodayAside using existing OperationOverview facts and dailyLink/reviewLink. `TodayStatusPage.tsx` reuses DataTable/mobileRender, Pagination, OperationsState, ScopeFilters and Radix Dialog for a real edge drawer. Query identities, API filters, QR and authorization contracts are preserved. `today.css` owns the approved manager-page composition. Five new component behavior tests; paired real API/SQL screenshots in docs/implementation/v5-evidence. Setup and other visual acceptance remain open.

## V5 continuation additions — 2026-10-29

- `frontend/src/pages/Dashboard/performance.ts`: existing supplied performance DTO/client, cache key scoped by company/role/principal and filters. Use for owner/manager weighted period reporting; no UI-derived substitute. Spec28 deliberately adopts the pre-existing user implementation in its isolated branch.
- `backend/src/services/companyPerformance.service.ts`: existing supplied site-local occurrence windows, weighted period totals and actor-scoped SQL seam. Its unit and guarded integration tests cover DST/overnight/no-data and denied sites/roles.
- `frontend/src/pages/Location/locationStatsFilter.ts`: saved-site calendar day history filters; reuse for Today/Yesterday/7-day history instead of UTC date slicing.
- `frontend/src/pages/Location/locationTranslations.ts`: feature-local V5 Location vocabulary and fallback to the existing language provider. Saved names and configuration remain data.
- `frontend/src/pages/Attendance/AttendancePage.tsx`: narrow initial deep-link adapter for validated location/staff IDs and date ranges. Existing explicit filter application/context APIs stay authoritative.

UI source remains in the existing Setup/Dashboard/Location/Area components; design/v5 is an immutable reference, never a runtime dependency. Shared form translations and final verification are recorded after their isolated implementation is integrated.

- `frontend/src/pages/Area/areaFormText.ts`: bounded form translation and safe error vocabulary; reuse from existing area/inventory/schedule forms rather than exposing transport errors or editing shared language registration.
- `frontend/src/pages/Area/setup-forms.css`: V5 Dialog/control/focus/RTL sizing for those existing forms.
- `frontend/src/pages/Area/AreaTemplateForm.tsx`: persisted area editor in shared Dialog with pending protection and explicit unknown-create result.
- Existing `TaskScheduleWizard` / `TemplateInventoryEditor` preserve real inventory version/mandatory selection and save reconciliation; use these instead of another schedule editor.
