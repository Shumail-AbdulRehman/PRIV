# Spec33 — platform company workspace

- `frontend/src/pages/Platform/CompaniesPage.tsx`: guarded route component and named CompanyWorkspace, bounded search/cursor list and Account/Billing/Activity detail. Explicit version/reason confirmation; refresh preserves reason and intended target, legacy inactive reactivation unavailable.
- `frontend/src/pages/Platform/companyApi.ts`: exact24 allowlisted summary/detail/status contracts through dedicated `operatorRequest`; never tenant Axios/Redux/cookies/refresh.
- `frontend/src/pages/Platform/platformRoutes.tsx`: company routes registered outside tenant App; existing34 OperatorBoundary never mounts protected children until a real provider adapter is qualified.
- `frontend/src/pages/Platform/companies.css`, `frontend/src/i18n/platformCompanyTranslations.ts`: semantic approved v5 layout/EN/UR/RTL, responsive detail/confirmation; global dictionary registration preserves all existing features.
- Existing34 auth stays unmodified and unavailable; positive component/presentation fixtures replace only the network request seam, not operational provider configuration. No live sign-in/status mutation claimed.39/40 own actual qualification.
