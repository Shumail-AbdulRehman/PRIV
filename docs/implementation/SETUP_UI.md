# Derived setup — Specification28

The owner and assigned-location manager `/setup` page consumes the persisted, scoped `GET /api/location/readiness` contract. It never saves browser checkboxes or runs task generation. Each page requests20 locations; the selector and progress describe only the selected location, and the footer exposes the total and cursor navigation. Returning, reloading, focusing or reconnecting refetches server facts. STAFF cannot mount this operational route or fetch these queries.

Four steps describe saved location, active staff with shifts, active area templates and ready daily/one-time schedules. Missing records remain incomplete. The existing location, area, staff and schedule screens are reused through actual URL state. `/locations?create=1` opens the existing location dialog; `/staff?locationId=<id>&create=1` scopes the existing staff dialog; `/locations/<id>?tab=areas&newArea=1` uses the incumbent area entry point; `?tab=templates&newSchedule=1` opens the existing schedule wizard. Closing removes only the relevant dialog parameter. Staff shifts use the incumbent staff edit form. There is no duplicate setup CRUD implementation.

The readiness service also returns `access.manageWork`, evaluated with the actual14 account policy. The browser never derives permission from a plan name, contact verification or provider availability. Incomplete mutation entry points are disabled when the server denies new work; saved records and team navigation remain available where authorized. Every underlying API still enforces its own role, site, entitlement and capacity rules. Missing access metadata fails closed.403, service/network error, loading and no locations are distinct; a query failure never presents cached success as current.

Owner-only contact/configuration guidance consumes15 `GET /api/subscription/manage/lifecycle` through the shared `getBillingLifecycle` and `BillingLifecycle` type, also reusable by32. Managers make no owner billing request. Email verification, billing service configuration and new-work availability remain separate facts. `/settings` and `/subscription` link to existing routes; the honest settings-unavailable boundary is replaced by30 and billing lifecycle management by32. No provider qualification is fabricated.

Location-local refreshed timestamps, daily schedules including weekends, task-specific QR guidance and the exact site's unassigned task/team links explain operational next steps. Missing staff shifts and uncertain replacement are explicit. Today adds the same calendar explanation and a setup link. The dirty user Dashboard performance integration and manager translation file are preserved byte-for-byte. No Android distribution URL is invented; approved distribution remains an external release input.

UI inherits the approved design/v5 blue/white workspace tokens, buttons, typography and RTL. Scoped setup task-list naming avoids a marketing `.setup-steps` collision found during rendering. No new package, schema, migration, production data/configuration, background work, paid entitlement or release qualification is introduced.

## Verification

- 16 focused setup component tests cover refetch from API state, role boundaries, selection/paging, missing metadata, empty/loading/403/error/read-only, Urdu and the real incumbent dialog entry points.
- 17 readiness service tests, including actual account-policy evaluation, missing state and permission denial; whole backend1416 tests/92 files/zero skips with explicit isolated test database.
- Whole frontend57 Node tests and56 component tests/6 files. Frontend lint, TypeScript/build and backend TypeScript/build pass. The backend has no lint script.
- Actual React renders at1440 and390px, English and Urdu, plus manager-empty/read-only/error/loading fixtures: no horizontal overflow or browser JS errors. Captures are synthetic API-intercepted component/render evidence, not40 integrated persistence E2E. The Impeccable detector returned no findings. Independent finish review and documentation results are recorded in the spec Log.

Live mail, billing, photo qualification, Android devices and full production release proof remain external39/40 gates. This setup read boundary does not claim them.

## 2026-10-29 V5 continuation (verification in progress)

Spec28 continues from verified8ff718e in persistent `v5-continuation-20261028` worktrees. Approved Setup and owner/manager dashboard compositions are implemented against existing APIs. The user's previously dirty performance service/client is preserved in isolated checkpointb69a532; root originals remain untouched. Locations is independently implemented in its own worktree and awaits integration. Final acceptance evidence and limits are recorded in V5_SETUP.md / V5_LOCATIONS.md when inspected; this paragraph does not mark the spec Done.
