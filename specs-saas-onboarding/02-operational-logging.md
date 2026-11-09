# Spec 02 — Safe error logging and trusted proxy

**Status:** Done
**Depends on:** Spec 00
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `backend/src/utils/operationalLog.ts`, `backend/src/utils/operationalLog.test.ts`, `backend/src/app.ts`, `backend/src/routes/launch.route.ts`, `backend/src/routes/launch.route.test.ts`, `specs-saas-onboarding/inventory/02-operational-logging.md`
**Reuses:** `backend/src/config/runtimeSecurity.ts`, `ARCHITECTURE.md#invariants`

## Goal

Make server failures diagnosable without leaking personal data, and make `req.ip` correct behind a proxy.

## Scope

- Create a structured logger that accepts only an allowlist of fields: event name, route, method, status, error class, provider code, provider type, company ID, reservation ID. Everything else is dropped.
- Make the global error handler log unexpected errors through it, with a request ID also returned to the client as `X-Request-Id`. It logs the class and Prisma or provider code, never the message.
- Set Express `trust proxy` from a validated `TRUST_PROXY_HOPS` integer, default 0. Invalid values fail safely to 0 with a logged warning.
- Fix the listen callback so a port error is reported and the process exits non-zero instead of logging that it is listening.

## Explicit non-scope

- Logging Paddle errors inside billing calls → spec 08.
- Rate limiting → spec 11.

## Reuse first

- Keep `launchErrorHandler` as the single error handler. Do not add another.
- Express 5 passes listen errors to the callback. Confirm in `node_modules/express/lib/application.js` before changing it.

## Steps

1. Create the logger with an explicit field allowlist.
2. Wire the error handler and request ID.
3. Add `trust proxy` configuration before routes are mounted.
4. Handle the listen error.
5. Test with a fake sink that a thrown error containing an email, token and SQL text logs none of them.
6. Record what you created in `specs-saas-onboarding/inventory/02-operational-logging.md`, and add a dated Log with real test counts and anything you could not verify.

## Done when

- [x] `cd backend && npx vitest run src/utils/operationalLog.test.ts` passes and proves: unknown fields, emails, tokens and messages never reach the sink. [unit]
- [x] `cd backend && npx vitest run src/routes/launch.route.test.ts` passes and proves: an unexpected error returns the generic 500 with `X-Request-Id` and logs only allowed fields; `TRUST_PROXY_HOPS` of 2 sets the hop count and an invalid value falls back to 0. [unit]
- [x] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [x] `specs-saas-onboarding/inventory/02-operational-logging.md` lists what this spec created for reuse. [static]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [x] `npm run build --prefix backend` passes. [static]

## Log

**2026-11-09** — Completed on `saas-onboarding`. GitHub issue and PR steps skipped per the user's run override; the result is committed locally. Read the context, guide, architecture, shared inventory and spec 01 fragment before implementation. Confirmed Express 5's callback/error behavior in installed `express/lib/application.js` and its installed TypeScript callback signature.

- Built a field-allowlisted structured logger with primitive-value validation, injected sinks, warning severity, safe error-class/code/type extraction and separate validated UUID correlation metadata. The existing global handler returns the unchanged generic unexpected-error response with a fresh `X-Request-Id`, logs its matching safe record, and preserves expected error responses. Only the matched route template is logged; request URLs, query values, headers, bodies and incoming request IDs are excluded. CORS exposes the correlation header.
- Added validated `TRUST_PROXY_HOPS` setup before middleware, defaulting to 0 and warning without the value on invalid input. Kept runtime-security initialization first. The guarded listen callback logs bind failures and requests process exit 1 before any successful-listen message or startup callback.
- Focused logger command: **26 passed, 0 failed**. The first run had one assertion that depended on JSON key order; changed it to compare the parsed record's complete contents and reran successfully.
- Focused route command: **60 passed, 0 failed**. Covers unexpected 500s, unique correlation IDs, safe Prisma/provider classification, known responses, real local forwarded-IP resolution, invalid proxy values and an actual occupied local port with an injected exit function. The app wiring is checked statically to avoid starting its cron/database dependencies.
- Whole backend command: `npm test --prefix backend -- --maxWorkers=2` — **100 files passed, 1 skipped; 1,642 tests passed, 7 skipped, 0 failed**. The 86 focused tests are included in that total. The SQL persistence tests were skipped because `LAUNCH_PERSISTENCE_TEST_DATABASE_URL` was unset; its presence was checked without printing a value.
- Static checks: `cd backend && npx tsc --noEmit -p tsconfig.json` passed with **0 errors**; `npm run build --prefix backend` passed. Prisma only generated its client under `node_modules`; no migration ran. The build printed a Prisma upgrade advisory (7.5.0 to 8.0.0-rc.33), with no compiler warnings/errors. The backend has no lint script. The inventory fragment exists and was reviewed; `git diff --check` passed.
- Plan validation: `python3 .ai/plan-project/scripts/validate-specs.py specs-saas-onboarding` passed — **44 specs, 0 errors, 51 nonblocking warnings**. The earlier in-progress check flagged the then-missing Log; adding this completion Log resolved it. Warnings concern the plan's existing ownership/caller heuristics and missing GitHub issues; the extra missing-issue warning for spec 02 follows the user's explicit issue/PR override. No unrelated planning files were changed.
- Final verification commands used `DATABASE_URL=postgresql://none:none@127.0.0.1:1/none` and `DOTENV_CONFIG_PATH=/dev/null`. No real Paddle or application database access, migrations, push or deploy. Real deployment proxy-hop topology and full API startup/process termination were not exercised; local callback tests used an injected exit function. Frontend/mobile were unchanged and not rerun. No required Done when item remains unverified.
- Application edits stayed within `Owns`; no test-only scope exception was needed. The spec/tracker/inventory record this result, and `docs/CURRENT_CONTEXT.md` is updated as required by the root `AGENTS.md`. Existing unrelated working-tree changes are excluded from the commit. Provider-call logging remains with spec 08 and rate limiting with spec 11. Next eligible spec: **03 — Flow shell, tokens and motion**.
