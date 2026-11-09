# Spec 23 — Session resilience

## Shared session error classification

`frontend/src/api/client.ts` exports `isSessionInvalid(error: unknown)`. It returns true for a 401, or a 403 with the existing `Account is deactivated` message or structured `SESSION_REVOKED` error. Network errors, 5xx, generic permission denials, `ACCOUNT_SUSPENDED` and `PASSWORD_CHANGE_REQUIRED` do not establish a lost session. The session query, application restore and refresh recovery share this classifier.

## Session read and guards

`useGetCurrentUser` in `frontend/src/queries/auth.ts` retries an unconfirmed failure once after 500 ms. Confirmed session rejection and forced password replacement are not retried. `networkMode: 'always'` lets an offline session read fail into the retry screen instead of remaining paused indefinitely.

`frontend/src/App.tsx` keeps the Redux identity during an outage, blocks child routes until restoration is known and synchronized, and shows the existing `FlowShell` with translated outage copy, heading focus and a retry action. Confirmed rejection clears auth before child routes mount. The existing forced password screen remains available.

`GuestRoute` sends an authenticated ADMIN to `/continue` and MANAGER/STAFF to `/dashboard`, forwarding only a `state.from` accepted by spec 06's `isSafeFromPath`. `/continue` resolution remains owned by spec 40.

## Refresh recovery

The shared Axios client allows one refresh per concurrent group of expired requests. If refresh fails, it re-reads `/common/get-current-user` once with refresh disabled for that probe. A successful probe recovers the original session read directly or allows each other original request one replay. Only a confirmed probe rejection clears auth; temporary probe failures are forwarded for retry. The shared promise is released after either result. No session credentials or provider data are logged.

## Test seams

- `frontend/src/App.test.tsx`: real QueryClient, Redux and router with a mocked auth API; covers retries, offline startup, outage recovery, sign-out, stale-data rejection, forced password replacement, Urdu, safe return paths and role destinations.
- `frontend/src/api/client.test.tsx`: real Axios interceptors with a synthetic adapter and Redux; covers a lost refresh response, concurrent recovery, confirmed versus unconfirmed rejection, bounded replay, later recovery and existing multipart credentials.

All tests use synthetic data. No real database, Paddle, migration, deployment or application end-to-end run is needed for this spec.
