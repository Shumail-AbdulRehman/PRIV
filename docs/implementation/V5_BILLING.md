# V5 Billing and restricted owner access

Spec32 consumes completed15 (actual billing lifecycle/catalog/checkout/portal),27 (approved workspace shell),28 (shared lifecycle client/setup). Current continuation uses issue69 and a new isolated `implementation/v5-billing-acceptance` branch based on verified55061b8. Existing draft70 records historical functional delivery; the new draft is limited to V5 acceptance. No specification dependency or commercial decision changed.

## Implemented scope

The actual React `/subscription` follows immutable `design/v5/billing.html`: a main subscription/capacity/activity stack and300px help rail, labelled fact rows, semantic provider states, actual active usage/capacity and responsive English/Urdu. A separate activity panel displays only the recorded latest provider event. It does not manufacture activation history, invoices, card details or amounts paid.

Existing linked subscribers use a fresh guarded Paddle portal. Server-created transaction checkout, principal/company checks, duplicate locks, transaction reuse, uncertain reservations and no automatic purchase retry remain intact. Failed catalog refresh hides stale checkout actions; a mismatched lifecycle cannot request catalog, including manual refresh. Unavailable catalog/commercial/support configuration stays unavailable. Public/legacy pricing and checkout returns retain the canonical existing billing path; a return URL never grants activation.

`WorkspaceGate` was historical unused code. Its actual owner-only integration now wraps operational content inside `DashboardLayout`. It presents the approved `design/v5/access.html` composition for actual `company.operationalStatus=SUSPENDED` or `company.isActive=false`, including legacy false/ACTIVE. Billing/settings bypass this presentation gate; own-security/help already use separate top-level routes. The backend lifecycle DTO additively exposes the existing isActive column. There is no schema, migration, new policy or entitlement computation. Active unpaid accounts retain operational reads; the API denies unauthorized new work. Explicit401/403 refetch errors supersede a cached active presentation; initial unknown/error has a retry and safe destinations, rather than claiming suspension. Transient errors do not erase a previously active workspace. Server authorization remains authoritative.

## Intentional reference differences

- Prototype sample identities, reviewer controls, timestamps and lifecycle-state simulation are absent.
- Fictional compare/cancellation dialogs are omitted: plan/payment/cancellation changes belong to the actual configured portal. No approved independent mutation contract exists.
- Actual facts replace the sample subscription and date range. Period start/end are explicit; null dates remain unavailable. Provider state differs from workspace permission.
- Only the latest recorded event is exposed by the API. No invented invoice or activation history appears.
- Restricted recovery uses actual suspension/inactivity, without guessing grace/trial or blocking permitted unpaid reads. Security and help are additional real destinations. The existing shell retains its working sign-out control (phone navigation menu); no second logout workflow is introduced.
- Unconfigured merchant/catalog/terms/support disables checkout and portal in the real browser. Positive transaction/portal behavior remains component-boundary proof, not live provider qualification.

## Verification and evidence

Final commands/counts, paired images and independent review are recorded below after execution. Tests use an explicitly guarded disposable UUID child PostgreSQL database on owned loopback56442, never the restored local customer database on56445. The existing Spec40 runner sanitizes runtime configuration, disables Paddle, builds matched private API/React assets, uses one Chromium worker and removes its generated child/runtime. Response delay/abort state tests are explicitly labelled; no successful HTTP response is fabricated.

External release gates remain39/40: approved merchant/catalog/terms, actual sandbox checkout/portal/signed lifecycle/reconciliation, verified support/legal content and physical native/device/provider/privacy qualification. This web specification cannot certify those facts.
