# Spec 01 reuse additions

### staff-self-profile
`backend/src/controllers/staffSelf.controller.ts` — role/tenant/active scoped self DTO; use instead of Staff-by-ID lookup for any principal.

### staff-self-attendance
`backend/src/controllers/attendanceSelf.controller.ts` — recent own attendance with tenant relation scope; use instead of manager numeric IDs in staff history.
