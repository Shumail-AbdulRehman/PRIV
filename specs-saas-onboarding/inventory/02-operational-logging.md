# Spec 02 — Safe error logging and trusted proxy

## Safe structured logging

- `backend/src/utils/operationalLog.ts` exports `operationalLog`, the shared logger, and `createOperationalLogger(sink)` for an injected sink. Reuse this for provider logging in spec 08; never send raw errors or payloads to console.
- The explicit field allowlist is `event`, `route`, `method`, `status`, `errorClass`, `providerCode`, `providerType`, `companyId` and `reservationId`. Values must be bounded identifiers, HTTP facts or positive safe integer IDs. Company and reservation IDs match the existing integer Prisma keys. Unknown fields and nested objects are dropped before serialization.
- Logger context accepts `level` (`error` by default, or `warn`) and a server-generated UUID `requestId` as correlation metadata. The request ID is separate from event fields; incoming request IDs are never trusted. A sink receives the serialized safe record and level.
- `operationalErrorFields(error)` extracts only the error constructor class, `code` and `type`; the logger validates these. It never copies messages, stack traces, provider details or Prisma metadata.

## Existing transport and startup seams

- `launchErrorHandler` remains the sole global handler. Expected schema, transport, conflict and API errors retain their responses. Unexpected errors get the existing generic 500 plus a fresh `X-Request-Id`, shared with the safe log. It logs the matched route template rather than a raw URL, query, parameter or request body. CORS exposes the response header.
- `configureTrustProxy(app, value?)` in `backend/src/routes/launch.route.ts` reads `TRUST_PROXY_HOPS` by default. An unset value means 0. A canonical nonnegative safe integer sets that hop count; invalid values reset it to 0 and log a warning without the environment value. `app.ts` calls this before middleware/routes and preserves the first runtime-security initialization import.
- `createListenCallback(onListening, exit?)` in the same module wraps Express 5's callback. A bind error logs only its classification and invokes `exit(1)` (`process.exit` by default), without reporting a successful bind or running startup work. Success awaits the existing startup callback.

## Verification seams

- `operationalLog.test.ts` uses injected sinks to check filtering before serialization, invalid values, severity and error classification.
- `launch.route.test.ts` covers safe 500s and correlation IDs over local HTTP, known-error preservation, actual forwarded-IP resolution for hop counts 0 and 2, invalid-config warnings, and an occupied local port with an injected exit function. A static wiring check covers `app.ts` without importing its cron or database dependencies.
