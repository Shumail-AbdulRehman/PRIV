# Follow-up specification — bounded tenant master lists

Status: Proposed backlog, not implemented or authorized in38/39. This is a separate focused follow-up contract requested by39; do not silently rewrite APIs or renumber the approved launch DAG. Release qualification remains blocked until the query-volume risk is resolved or explicitly accepted with measured bounds.

## Confirmed boundary

`backend/src/controllers/staff.controller.ts` getStaff/getStaffByLocation, `manager.controller.ts` getManagers and `location.controller.ts` getLocations materialize tenant/site master lists with findMany and no server cursor/take. Current role/tenant/site restrictions must remain. Existing operations/review/platform metadata lists already have explicit windows/cursors; do not replace these with unbounded client pagination.

`platformSupport.service.ts` bounds inquiry pages to50 but performs up to50 latest-audit JSON-path lookups per page with no dedicated inquiry-state index. This is a confirmed scale qualification risk, not an observed latency incident. Measure with representative synthetic volume and EXPLAIN in a disposable database before choosing an index or storage change.

## Scope

Design an explicit bounded list contract, compatibility/call-site migration and minimal indexing only where measured. Reuse existing pagination conventions; preserve owner/manager/staff denial, current site scope, historical records, search/filter semantics and selectors requiring more than one page. No cache/queue rewrite, microservice or guessed limit in a UI-only patch.

## Acceptance

- Unit tests prove hard server maximum, stable cursor boundaries, invalid cursor rejection, search/filter reset and cross-company/site denial.
- Consumer tests prove staff/manager/site selectors load all permitted choices through pages without silently truncating old behavior.
- Isolated PostgreSQL representative-volume query evidence records cardinality, access plans and redacted timings; no production queries/data.
- Full affected backend/web/native suites, types/builds pass; update inventory and separate draft PR. Required spec DAG amendment/issue/approval precedes implementation.
