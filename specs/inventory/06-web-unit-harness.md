# Spec 06 reuse additions

### web-component-harness
`frontend/vitest.config.ts` and `frontend/src/test/setup.ts` — jsdom, app alias, jest-dom and automatic cleanup. `npm test --prefix frontend` runs 57 existing node tests plus component suite; use instead of screenshot snapshots or another runner.
