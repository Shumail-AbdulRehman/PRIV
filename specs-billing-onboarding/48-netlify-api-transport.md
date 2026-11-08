# Spec 48 — Qualify same-origin browser API transport on Netlify

**Status:** Done
**Depends on:** Spec 44
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** `frontend/public/_redirects`, `frontend/tests/billing-proxy.test.mjs`, `specs-billing-onboarding/inventory/48-netlify-api-transport.md`
**Reuses:** `frontend/src/api/client.ts`, `backend/src/utils/cookies.ts`, `backend/SANDBOX_BILLING.md`, `INVENTORY.md#cookies-and-hosting`

## Goal

Route browser /api traffic through Netlify to the existing Heroku API so session cookies can be qualified in first-party browser context.

## Scope

- Add the exact /api/* proxy rewrite before asset and SPA fallback, preserving request path/query and existing asset-not-found behavior.
- Target the confirmed Heroku deployment; do not create a second backend, change native API origins or proxy Paddle webhooks through the SPA.
- The release build must use VITE_API_BASE_URL=/api; changing that Netlify build setting/rebuilding is documented in spec61, not faked by a source fallback.
- Keep httpOnly secure cookie semantics and CORS allowlist. Do not move tokens into localStorage or infer that current deployed cookies already fail.
- Unit-check rule ordering and representative API/asset/deep-link behavior; real Set-Cookie/refresh qualification is external acceptance.

## Explicit non-scope

- Actual Netlify/Heroku settings and release proof → spec 61.
- Full cookie/reload/denied-flow browser coverage → spec 62.
- Authenticated owner route logic → spec 59.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read current redirect rules and API client default; keep native and direct backend URLs out of this change.
2. Insert the API rewrite with the correct Heroku /api path and precedence, including unknown API paths remaining API responses rather than index.html.
3. Add a Node test for the redirect contract and existing asset/deep-link fallbacks; include a query-bearing API request fixture.
4. Record remaining real deployed cookie/redirect/header checks in the inventory handoff, not as a claimed local pass.
5. Record new reusable paths/purposes and verified commands in `specs-billing-onboarding/inventory/48-netlify-api-transport.md`; append a dated Log only when work starts.

## Done when

- [x] `node --experimental-strip-types --test frontend/tests/billing-proxy.test.mjs` passes: API rule precedes SPA/asset fallbacks; query/path mapping reaches Heroku /api; API404 is not configured as SPA200; existing asset and app deep links retain their routing contract. [unit]
- [x] `npm test --prefix frontend` whole package unit suite passes; actual counts and any external prerequisites are recorded in the Log. [unit]
- [x] `npm exec --prefix frontend -- tsc -b frontend/tsconfig.json` and `node --check frontend/tests/billing-proxy.test.mjs` pass. [static]
- [x] `npm run build --prefix frontend` passes. [static]

## Log

**2026-11-07** — Started the next sequential unit after guide/tracker, steering/inventory, decision44 and current API client/cookie/runbook review. Existing client already defaults to relative /api and withCredentials; confirmed target public origin from backend/SANDBOX_BILLING.md. Added one /api/* external200 rewrite before the unchanged asset404/SPA200 rules. Only the assigned redirect/test/inventory and status/Log paths are changed by this unit; no settings, credentials, cookies, native origin, direct webhook configuration or route logic is changed. No external issue/PR bookkeeping performed by this request.

Checked official Netlify documentation on2026-11-07: https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/ (external200 rewrite and static-file shadowing), https://docs.netlify.com/manage/routing/redirects/redirect-options/ (splat/query forwarding) and https://docs.netlify.com/resources/troubleshooting/request-chain/ (request-chain precedence). Public documentation describes platform semantics; local tests cannot establish actual deployed Set-Cookie/status/header behavior.

**2026-11-07** — Focused `node --experimental-strip-types --test frontend/tests/billing-proxy.test.mjs` exited0:17 tests passed. Tests read actual public/_redirects, validate three-column rule syntax/order and use a bounded test-local first-match/static/splat reader to check route destinations/query mapping. No Netlify runtime, provider, auth session, network or backend response is mocked as a successful deployed result; the configured200 is proxy mode, not asserted upstream200. Existing asset404/SPA200 routing and existing static-file serving remain explicitly asserted.

`npm test --prefix frontend` exited0:81 Node tests and514 Vitest tests across37 files passed (0 failures). `npm exec --prefix frontend -- tsc -b frontend/tsconfig.json`, `node --check frontend/tests/billing-proxy.test.mjs` and `git diff --check` exited0. The assigned static checks use Node syntax validation for the .mjs contract test; no TS application source or linter configuration changed. Full suite emits the pre-existing frontend-mobile module-type warning; no test failure or skipped billing regression is hidden.

Inventory48 records target/rule semantics, exact fixture boundaries and pending live qualification. Spec61 must update the stale absolute-browser-API instruction in backend/SANDBOX_BILLING.md and require Netlify VITE_API_BASE_URL=/api plus rebuild. Actual frontend/backend release identity, same-origin request/Set-Cookie attributes, reload/refresh with blocked third-party cookies, upstream status/body/header forwarding, mutation delivery and no-cache behavior remain external61/63 evidence. No private value was printed and no environment setting or webhook/native configuration was changed. These external checks do not prevent this unit's local contract checks, and no deployed cookie failure is inferred.

**2026-11-07** — Final `npm run build --prefix frontend` exited0 (TypeScript + production Vite build); only the non-failing plugin-timing warning remains. `cmp frontend/public/_redirects frontend/dist/_redirects` exited0, verifying the published artifact includes the exact rewrite. All required local checks passed; marked48 Done. No deployment, provider call, account mutation, Git commit/push or history operation performed. Next sequential unit49 owns server readiness and safe resume.
