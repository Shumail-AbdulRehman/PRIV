# Agent guide

## Read before implementing

1. `docs/CURRENT_CONTEXT.md`
2. This file
3. `ARCHITECTURE.md`
4. `DESIGN-SYSTEM.md` for any UI spec, and open `design/saas-onboarding/v3/index.html`
5. `INVENTORY.md` and `inventory/`
6. `PROGRESS.md`, which outranks anything assumed from an earlier session
7. The spec you were given

## One spec per session

Implement exactly the spec you were dispatched. Its `Explicit non-scope` is binding. If the spec needs a file outside its `Owns`, record that in its Log and stop that part. Do not edit it.

## Claim the GitHub issue before writing code

Search for an open issue titled `Onboarding Spec NN — <title>`. Create one if none exists. Write `#<n>` into the spec header and the tracker row before any code. Open a PR with `Closes #<n>`. Never merge your own PR. The prefix is `Onboarding Spec` because earlier spec sets used the same numbers. A `gh` failure is logged, not fatal.

## Other specs are running at the same time

Write only inside your spec's `Owns`. Under Orchestro, do not edit status rows or the spec's `Status` line. Record new reusable things in your inventory fragment, not `INVENTORY.md`.

## The model on the spec

The user runs this set with `gpt-6.1-sol`. The tier records how risky each spec is. A spec that stalls is re-run at a higher effort, not retried unchanged.

## Verify before you assert

- A package: read its `package.json`.
- A path: check it exists.
- A library export: grep the installed `.d.ts` under `node_modules`.
- A prior-state claim: find the earlier spec's `Done when` that establishes it.
- An odd environment value: print the variable's presence, never its value.

## Reuse before creating

Search `INVENTORY.md`, `inventory/`, then the code. Extend a near match. A second version of something is a review failure. Finish by writing your fragment to `specs-saas-onboarding/inventory/NN-<slug>.md`.

## Design tokens are a closed list

A token not in `DESIGN-SYSTEM.md` does not exist. No raw colours outside `frontend/src/pages/Onboarding/flow.css`. Rebuild screens from the prototype in React. Never paste its HTML, CSS or scripts. The prototype's preview bar and Paddle fixture are never built.

## Safety rules

- Run tests with these set, so nothing touches real data:
  `export DATABASE_URL='postgresql://none:none@127.0.0.1:1/none' DOTENV_CONFIG_PATH=/dev/null`
- Never print or commit secrets. Private `.env` files exist.
- Never run tests against an application database.
- No deploys, schema changes or live Paddle changes unless your spec says so and the user has approved it.
- Never store or log card data.

## Commands

| Purpose | Command |
|---|---|
| Backend single file | `cd backend && npx vitest run <path>` |
| Backend whole suite | `npm test --prefix backend` |
| Backend types | `cd backend && npx tsc --noEmit -p tsconfig.json` |
| Backend build | `npm run build --prefix backend` |
| Frontend single file | `cd frontend && npx vitest run <path>` |
| Frontend whole suite | `npm test --prefix frontend` |
| Frontend types | `cd frontend && npx tsc -b --noEmit` |
| Frontend lint | `npm run lint --prefix frontend` |
| Frontend build | `npm run build --prefix frontend` |
| End-to-end, spec 42 and 43 only | `HYGENE_E2E_DATABASE_URL=<isolated priv_e2e_test URL> npm run test:e2e --prefix frontend` |

The backend has no lint script. Only the end-to-end spec writes or runs end-to-end tests.

## Acceptance tiers

| Tag | Meaning |
|---|---|
| `[static]` | Types, lint, build or inspection. Required on every spec |
| `[unit]` | Tests that ran. Required on every spec that creates code |
| `[runtime]` | Needs the app running |
| `[e2e]` | Spec 42 only |
| `[suite]` | Spec 43 only |
| `[requires: X]` | Needs a live service. Name it. Never mark it passed if you could not run it |

## Before finishing

1. The spec works within its scope.
2. No invariant was broken.
3. Types, lint and build pass with 0 errors and 0 warnings.
4. Every `[unit]` command ran, with real counts in the Log.
5. Your inventory fragment exists.
6. The Log says what was built, what was verified and what could not be verified.

A box is ticked only after its command ran and passed in this session.

## When blocked

Set `Blocked` in the spec and tracker, write what was tried and what decision is needed, then stop.
