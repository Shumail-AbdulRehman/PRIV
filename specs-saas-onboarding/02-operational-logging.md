# Spec 02 — Safe error logging and trusted proxy

**Status:** Not started
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

- [ ] `cd backend && npx vitest run src/utils/operationalLog.test.ts` passes and proves: unknown fields, emails, tokens and messages never reach the sink. [unit]
- [ ] `cd backend && npx vitest run src/routes/launch.route.test.ts` passes and proves: an unexpected error returns the generic 500 with `X-Request-Id` and logs only allowed fields; `TRUST_PROXY_HOPS` of 2 sets the hop count and an invalid value falls back to 0. [unit]
- [ ] `npm test --prefix backend` passes with 0 failures; real count in the Log. [unit]
- [ ] `specs-saas-onboarding/inventory/02-operational-logging.md` lists what this spec created for reuse. [static]
- [ ] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. The backend has no lint script. [static]
- [ ] `npm run build --prefix backend` passes. [static]
