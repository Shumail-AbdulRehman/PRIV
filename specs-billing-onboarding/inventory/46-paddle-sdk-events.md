# Spec 46 — Paddle singleton and event subscriptions

`frontend/src/lib/paddle.ts` retains `getPaddle(): Promise<Paddle>` with exact environment/token-family validation. Concurrent calls share initialization; successful instances remain cached even after subscription cleanup. Rejected loads release only the failed promise, so another explicit call can retry. The official CDN script is loaded before initializePaddle because the installed wrapper permanently caches failed CDN promises; failed scripts/listeners are removed before retry. Initialized is checked because the wrapper catches provider initialization exceptions.

New project export `subscribePaddleEvents(listener: PaddleEventListener): () => void` registers a listener without initializing the SDK and returns idempotent, independent cleanup. One installed eventCallback fans out to current listeners, isolates consumer exceptions, skips subscriptions removed during dispatch and defers newly added subscriptions to the next event. Consumers must clean up on owner/transaction/unmount changes and use events only as refresh signals; correlation belongs to spec53.

The module re-exports installed `CheckoutEventNames` (including CHECKOUT_CLOSED and CHECKOUT_COMPLETED) and type `PaddleEventData`, plus project type `PaddleEventListener`. No SDK subscribe export, public reset, browser access grant or test switch is introduced. Existing moduleLoadRecovery remains the separate bounded stale-app-chunk recovery boundary.

`frontend/src/lib/paddle.test.tsx`:22 focused tests cover invalid/missing config, valid sandbox/production config, concurrency, retained success, explicit failure retries, actual installed-loader recovery with synthetic script events/provider global, event fanout, cleanup and consumer isolation. No live provider request is made.

Verified commands: focused Vitest (22 passed); `npm test --prefix frontend` (64 Node +497 Vitest/36 files passed); in frontend/, `npm exec -- tsc -b` and scoped ESLint with max-warnings0; `npm run build --prefix frontend`. Detailed evidence and fixture boundaries are in spec46 Log. Live sandbox delivery/entitlement acceptance remains outside this unit.
