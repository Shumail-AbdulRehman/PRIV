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
