# Spec33 — platform company workspace

- 2026-10-31 refinement: local `CompanyResources` renders real active manager/staff/location totals in desktop rows, mobile records and account overview. Temporarily hidden service/inquiry/audit routes redirect to Companies; company sidebar retains Companies and Platform security. Details: docs/implementation/PLATFORM_COMPANY_OVERVIEW.md.

- `frontend/src/pages/Platform/CompaniesPage.tsx`: guarded route component and named CompanyWorkspace, bounded search/cursor list and Account/Billing/Activity detail. Explicit version/reason confirmation; refresh preserves reason and intended target, legacy inactive reactivation unavailable.
- `frontend/src/pages/Platform/companyApi.ts`: exact24 allowlisted summary/detail/status contracts through dedicated `operatorRequest`; never tenant Axios/Redux/cookies/refresh.
- `frontend/src/pages/Platform/platformRoutes.tsx`: company routes registered outside tenant App; existing34 OperatorBoundary never mounts protected children until a real provider adapter is qualified.
- `frontend/src/pages/Platform/companies.css`, `frontend/src/i18n/platformCompanyTranslations.ts`: semantic approved v5 layout/EN/UR/RTL, responsive detail/confirmation; global dictionary registration preserves all existing features.
- Existing34 auth stays unmodified and unavailable; positive component/presentation fixtures replace only the network request seam, not operational provider configuration. No live sign-in/status mutation claimed.39/40 own actual qualification.

## V5 continuation — 2026-10-29

- `CompaniesPage.tsx`/`companies.css`: company-scoped V5 sidebar/header adaptation,
  bounded-page facts/register/mobile records, Account profile/access/context split,
  real Billing/Activity and safe status dialog. Reuses PageHeader, existing
  DataTable mobile rendering, Button/Input/Dialog, operator query scope and API.
- `CompaniesPage.test.tsx`:18 focused behaviors, including uncertain/conflict
  refresh locking, retained draft on failed refresh, pending close/duplicate guard,
  cached denial, safe IDs, cursor reset and stale save-receipt clearing. Mocks only
  the dedicated request seam.
- `platformCompanyTranslations.ts`: complete owned V5 labels and recovery copy.
- `docs/implementation/V5_PLATFORM_COMPANIES.md`: contract deviations, real local
  verification and explicit unqualified IdP/visual limits. No global totals,
  owner contacts, usage or prototype identities are synthesized from missing DTOs.
