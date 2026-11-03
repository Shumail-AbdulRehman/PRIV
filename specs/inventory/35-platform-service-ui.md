# Spec35 — platform service, audit and inquiries

- `frontend/src/pages/Platform/ServicePage.tsx`: default OperatorBoundary-guarded actual route plus named ServiceWorkspace. Real scoped diagnostics/support, bounded audit/inquiry filters and cursor pages, escaped inquiry detail and explicit reason/version/status/SELF-or-UNASSIGNED queue handling. Failed/conflicting saves block resubmission until explicit successful refresh; draft stays intact.
- `frontend/src/pages/Platform/serviceApi.ts`: exact25 envelope contracts through existing separate operatorRequest; no tenant Axios, auth promotion, raw secret logging or arbitrary actor assignment.
- `frontend/src/pages/Platform/service.css`, `frontend/src/i18n/platformServiceTranslations.ts`: semantic approved v5 layout, responsive tables/facts, EN/UR/RTL; dictionary registration retains prior features.
- Serialized routes/dictionary/company navigation ownership moves33→35. `/platform/service`, `/platform/audit`, `/platform/inquiries` remain outside tenant App and guarded. Company nav adds service link only.
- `docs/implementation/PLATFORM_SERVICE_UI.md` records verification and external gates. No backend/schema change or new provider; positive fixtures are network-seam behavior proof, never live browser identity/MFA or operational integration qualification.
