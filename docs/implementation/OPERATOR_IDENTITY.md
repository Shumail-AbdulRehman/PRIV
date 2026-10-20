# Platform identity boundary

Spec19 implements a separate backend verifier; platform routes consume it in24–26 and provider sign-in is34. It is not a deployed operator workspace. No tenant role, cookie, email address or public registration grants platform access. Authorized output is only `{kind, issuer, subject}` on `req.operator`; `req.user` remains the tenant boundary.

## Configuration required before activation

All values must come from the real identity provider setup; none are supplied or activated by this implementation:

- `PLATFORM_OIDC_ISSUER`: exact HTTPS token issuer, including its documented trailing slash/path.
- `PLATFORM_OIDC_AUDIENCE`: dedicated Hygene platform **API** resource audience. Never use a tenant API audience or the browser application's client ID/ID-token audience.
- `PLATFORM_OIDC_JWKS_URL`: explicit HTTPS signing-key endpoint on the issuer's origin. No redirects, credentials, fragments or query strings. A provider requiring another origin or algorithm needs an explicitly reviewed adapter change; do not work around this with a proxy or guessed settings.
- `PLATFORM_OIDC_MFA_ACR`: exact provider-issued `acr` value confirmed to mean the approved MFA policy. No assumed `mfa`, password-only claim, email verification or tenant role substitution.
- `PLATFORM_OIDC_SUBJECTS`: JSON array of explicitly provisioned provider `sub` strings. No email-based bootstrap. Removing a subject denies its next request, independently of key caching.

Missing or malformed service configuration produces503 without fetching provider keys. Missing bearer identity produces401. Do not copy fixture values from tests into deployed configuration. Provision named accounts in the provider with MFA and a reviewed recovery process; there is no default operator identity or password.

## Verification and availability

Accept RS256 signed JWT API access tokens with a selected provider `kid`, exact issuer/audience, finite integer expiry/issue time, provisioned subject and exact approved assurance. JWT verification checks expiry/not-before and limits token age to15 minutes; require nonfuture issue time and expiry after issue time. Qualification must confirm the provider issues a new suitable API token within this window; no automatic lifetime extension. Browser OIDC state/nonce/PKCE and logout remain34. Provider session revocation is bounded by issued access-token lifetime; no fabricated introspection or immediate IdP logout guarantee.

Reuse installed jsonwebtoken9 verification and Node's JWK parser with public RSA keys of at least2048 bits. Reject token-supplied key URLs/inline keys/critical extensions and private or ambiguous key documents. HTTPS provider fetch has3-second timeout,128KiB response and32-key bounds, no redirects. Coalesce concurrent fetches, cache keys60 seconds, back off failures5 seconds. Unknown IDs do not force refetch; real rotation may take up to60 seconds. Expired key caches never authorize requests during provider outage. Application-local caches are not a provider availability claim.

## Required live qualification — release39 / e2e40

Confirm real issuer/API audience/JWKS metadata and approved MFA `acr` against provider documentation and sandbox tokens. Verify non-MFA, wrong-audience, deprovisioned and tenant identities fail; valid named operator passes only metadata endpoints; no workforce records or impersonation. Test provider key rotation, outage/recovery and chosen sign-in/recovery/logout policy. Store no tokens in logs, URLs or database records. Provider configuration and actual people/MFA approval remain external blockers; unit fixture keys prove implementation behavior only.

## Sources checked 2026-10-20

- [jsonwebtoken maintained documentation](https://github.com/auth0/node-jsonwebtoken): explicitly pinned algorithms, issuer/audience verification, expiry and maxAge options. Installed9.0.3 implementation/types checked locally.
- [Node crypto documentation](https://nodejs.org/api/crypto.html#cryptocreatepublickeykey): native JWK public-key import; installed Node crypto declarations checked locally.
