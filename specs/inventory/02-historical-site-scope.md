# Spec 02 reuse changes

### staff-history-scope
`backend/src/controllers/staff.controller.ts` — getStaffDetails applies one historical company/site scope to lists and totals; use instead of current-site-only authorization for retained records. Legacy getProfile delegates the actor-safe self controller.
