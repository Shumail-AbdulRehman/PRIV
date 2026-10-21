# Proposed fix spec — post-registration billing navigation

Status: confirmed in integrated Spec40 browser run, proposed follow-up only. Not implemented; not added silently to the41-unit dependency graph.

## Boundary and evidence

After submitting the actual React registration form, the real backend responds201 and persists exactly one Company/ADMIN owner. The authenticated browser settles at `/dashboard` rather than `/subscription`, the canonical billing destination used by `/choose-plan`. This reproduces on separate new synthetic registrations and a fresh migrated child database. Failing case: `frontend/e2e/lifecycle.spec.ts`, `registration CTA lands in canonical billing after durable account creation`; final2026-10-21 run has29passed/1failed, no skips or expected failures.

The signup hook calls `/choose-plan`; Pricing/ChoosePlanPage redirects to `/subscription`. GuestRoute also redirects an authenticated signup route to `/dashboard`. The exact navigation race/cause needs investigation in the fix; the integrated symptom is established. Hook unit tests alone do not prove the resulting browser destination. No account duplication, false photo verification or cross-tenant exposure was observed in this case.

## Proposed scope

Preserve atomic account creation, session-failed response handling, role authorization and cache clearing. Make successful registration reliably reach canonical owner billing; preserve reload/direct-entry/logout behavior. Do not change billing entitlement, introduce checkout without configuration or rewrite application routing.

## Proposed acceptance

- [unit] Successful signup and GuestRoute handoff cooperate; committed-account/session-failed result remains unauthenticated with accurate feedback.
- [e2e owned by40] Existing persisted registration regression passes without loosening expected destination, request interception or expected-failure masking; owner/company remains single and correct.
- [static] Frontend lint/type/build and existing account/registration/navigation tests pass.

Explicit non-scope: device/provider qualification belongs to40/external evidence; final whole release pass belongs to41. No production modifications.
