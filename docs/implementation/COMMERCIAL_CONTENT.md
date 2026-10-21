# Customer information and commercial boundaries — Spec38

`/help` and `/service-information` mount outside tenant App/session bootstrap using PublicLayout. Guests, locked-out/suspended companies and forced-password users can reach configured assistance without workforce or platform authorization. Sidebar/footer link to this public boundary. No tenant auth, refresh or cookies are used for GET `/api/support/contact`; fetch omits credentials, uses no-store and rejects redirects. Only25's available/EMAIL/OPERATOR_CONFIGURED safe email creates a mailto link. Unavailable/loading/error/retry are separate. Opening an email client never proves receipt/delivery.

## Publishable approved facts

All VITE values are public, build-time input, never secrets. No actual production values were set. Missing/malformed/unapproved facts stay unavailable; there are no fallback contacts or policy/download URLs.

- `VITE_SERVICE_POLICIES_APPROVED=true` only after responsible business/legal approval of the linked current documents, with `VITE_SERVICE_POLICY_ORIGIN` an exact HTTPS origin (no slash/path/credentials) and `VITE_SERVICE_TERMS_URL`, `VITE_SERVICE_PRIVACY_URL`, `VITE_SERVICE_EXIT_URL` absolute HTTPS document paths on that origin. Reject unexpected origin, credentials, query, fragment, root-only or non-HTTPS link. Actual legal/refund/retention/export/closure content must be supplied and approved, not inferred by the application.
- `VITE_ANDROID_DISTRIBUTION_APPROVED=true`, exact HTTPS `VITE_ANDROID_DOWNLOAD_ORIGIN` and `VITE_ANDROID_DOWNLOAD_URL` only after signed distribution/artifact provenance and company delivery approval. A safe link is not signed-device installation, notification or camera proof;39/40 retain those gates.
- Support recipient must separately be approved/verified through25 server config. Frontend flags never verify a mailbox, authenticate an operator or enable provider processing.

New checkout buttons require all three approved policy links and a currently available support contact. The click path rechecks contact before reserving a provider transaction. Existing linked subscribers retain their portal/account access. Missing customer facts cannot enable a purchase even when mocked/server billing metadata says checkoutAvailable. Existing server PADDLE_BILLING_ENABLED activation is still a separate business-owner qualification gate, not set by these public values; direct API/operator activation must remain disabled until merchant/catalog/terms/support qualification in39. Browser display configuration is not independent legal review or server-side authorization.

No price/trial/refund/retention/legal promise invented. Guidance accurately separates uploaded/submitted/reviewed/verified, authorized evidence access and currently unavailable new automated processing. Existing result reconciliation remains supported; no AI accuracy/identity/redaction claim.

## Checks

16 Help React tests plus24 billing tests pass; whole frontend57Node+215React/16files. Existing109 backend support/billing tests/2files. Full frontend lint0 and TypeScript/Vite build pass (non-failing plugin timing advisory).8 built-route synthetic HTTP renders EN/UR390/1440 cover configured/unavailable support, with no page overflow/JavaScript errors and only public support requests; desktop/mobile inspected and stylesheet precedence/link wrapping corrected. Fixtures do not qualify real support, legal content, billing or Android distribution. Logs `/tmp/hygene-spec38-*.log`, captures `/tmp/hygene-spec38-visual/` are ephemeral. No provider/production/data changes.
