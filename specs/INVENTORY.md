# Reuse inventory

Read with every specs/inventory fragment. Source checked 2026-10-20; full source/export index: docs/implementation/research/inventory-index.md. Extend existing near matches before creating alternatives.

## Components

### shared-forms
`frontend/src/components/ui/dialog.tsx` — Dialog, focus and overlay; use instead of another modal primitive.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### data-table
`frontend/src/components/common/DataTable.tsx` — Existing tables; extend pagination rather than build a second table.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### operation-states
`frontend/src/pages/Manager/OperationsState.tsx` — Error/loading/stale feedback; use instead of false zero states.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### protected-evidence
`frontend/src/pages/Verification/ProtectedEvidence.tsx` — Authorized blob display with cleanup/zoom; extend the purpose for attendance.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### layout
`frontend/src/components/layout/DashboardLayout.tsx` — Workspace shell with role-aware navigation.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### staff-camera
`frontend-mobile/src/components/AttendanceCamera.tsx` — Actual selfie/permission capture; no mock photos.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### schedule-wizard
`frontend/src/pages/Task/components/TaskScheduleWizard.tsx` — Existing schedules; no new calendar engine.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

## Hooks

### query-hooks
`frontend/src/queries/auth.ts` — Auth query/invalidation.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### language
`frontend/src/i18n/context.ts` — Language DI hook; preserve RTL.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### auth
`frontend/src/hooks/useAuth.ts` — Existing role/auth hook.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

## API and services

### client
`frontend/src/api/client.ts` — Credentialed API and refresh queue.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### scope
`backend/src/utils/scope.ts` — Manager current site checks.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### verification-auth
`backend/src/services/verification-v2/authorization.service.ts` — Active actor and task assignment/site authorization.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### media
`backend/src/services/verification-v2/media.service.ts` — Authenticated Cloudinary storage and bounded private read.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### subscription
`backend/src/services/subscription.service.ts` — Existing subscription/entitlement and quota seam.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### paddle
`backend/src/services/paddleFulfillment.service.ts` — Provider event ordering/dedup/fulfillment.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### retention
`backend/src/services/verification-v2/retention.service.ts` — Retained entity archives.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### notifications
`backend/src/services/staff-notifications/session.ts` — Push session renewal/revocation.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### operations-scope
`backend/src/services/operationsScope.service.ts` — Site-bound local-day filters and pagination.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

## Utils

### dates
`backend/src/utils/dateTime.ts` — Timezone-aware calendar ranges; use instead of UTC Today.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### auth-tokens
`backend/src/utils/auth.ts` — bcrypt and JWT issuing.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### errors
`backend/src/utils/ApiError.ts` — Safe HTTP error with structured details.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### cloudinary
`backend/src/utils/cloudinary.ts` — Existing provider account/upload seam.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

## Constants and types

### request-user
`backend/src/types/express.d.ts` — Role/company/location-aware request identity.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### schema
`backend/prisma/schema.prisma` — Authoritative existing persistence.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.

### mobile-types
`frontend-mobile/src/types.ts` — Typed native navigation and API model.
**Use instead of:** duplicate code with this purpose. **Added by:** existing application.
