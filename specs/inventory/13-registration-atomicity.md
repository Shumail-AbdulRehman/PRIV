# Spec13 reuse additions

### company-registration
`backend/src/services/companyRegistration.service.ts` — strict safe company/first owner transaction via existing password-hashing client; use instead of separate Company/Manager writes.

### committed-account-session
`backend/src/controllers/companyRegistration.controller.ts` — distinguishes committed signup from session issuing; sessionEstablished false keeps frontend unauthenticated and offers login.
