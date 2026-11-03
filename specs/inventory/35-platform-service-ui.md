# Spec35 — platform service, audit and inquiries

- Current V5 continuation `2f504f9` reuses the same exported ServiceWorkspace,
  OperatorShell/boundary, PageHeader, DataTable, OperationStatus and query/API
  contracts. Feature-local224px platform navigation, section tabs, panel/header
  hierarchy and responsive split diagnostics/inquiry composition live entirely
  in ServicePage/service.css; no shared operator source or backend change.
- InquiryEditor retains drafts on failed background refresh, blocks stale saves,
  removes cached details on401/403/404 and consumes accepted PATCH handling before
  follow-up reads. Support handoff is unavailable while contact refresh is pending.
  Five new component regressions bring ServicePage to27cases; source ESLint0.
- `docs/implementation/V5_PLATFORM_SERVICE.md` records the current source,
  intentional prototype/API differences and pending rendered/provider gates.

- `frontend/src/pages/Platform/ServicePage.tsx`: default OperatorBoundary-guarded actual route plus named ServiceWorkspace. Real scoped diagnostics/support, bounded audit/inquiry filters and cursor pages, escaped inquiry detail and explicit reason/version/status/SELF-or-UNASSIGNED queue handling. Failed/conflicting saves block resubmission until explicit successful refresh; draft stays intact.
- `frontend/src/pages/Platform/serviceApi.ts`: exact25 envelope contracts through existing separate operatorRequest; no tenant Axios, auth promotion, raw secret logging or arbitrary actor assignment.
- `frontend/src/pages/Platform/service.css`, `frontend/src/i18n/platformServiceTranslations.ts`: semantic approved v5 layout, responsive tables/facts, EN/UR/RTL; dictionary registration retains prior features.
- Serialized routes/dictionary/company navigation ownership moves33→35. `/platform/service`, `/platform/audit`, `/platform/inquiries` remain outside tenant App and guarded. Company nav adds service link only.
- `docs/implementation/PLATFORM_SERVICE_UI.md` records verification and external gates. No backend/schema change or new provider; positive fixtures are network-seam behavior proof, never live browser identity/MFA or operational integration qualification.
