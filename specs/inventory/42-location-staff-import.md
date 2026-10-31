# Spec42 reuse inventory

- `backend/src/services/staffProvisioning.service.ts`: transaction-scoped shared staff insertion; normalized-email advisory lock and current Prisma bcrypt hook. Individual and import creation both consume it.
- `backend/src/services/staffImport.service.ts`: bounded XLSX/CSV parser, template, row validation, signed preview and atomic capacity-governed confirmation/receipt. Existing location router mounts the route adapter.
- `backend/src/routes/staffImport.route.ts`: authenticated location-scoped multipart/template adapters. No second tenant identity model.
- `frontend/src/pages/Location/StaffImportDialog.tsx`: location Staff-tab workflow, existing dialog/input/button/query/language/cache primitives.
- Existing `prepareStaffAttendance` now declines creating a shift starting before account creation; recorded rows remain authoritative.
- Existing `issueStaffHandoff`/`completeStaffHandoff` remain the secure individual credential distribution mechanism. No batch credentials are returned. Latest user amendment uses manager-provided spreadsheet passwords for direct initial login; handoff is retained only for recovery.
- Preview rendering reuses the shared paginated `DataTable`, including its native mobile record layout; no second table primitive.
