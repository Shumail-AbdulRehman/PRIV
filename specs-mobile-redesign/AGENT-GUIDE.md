# Agent guide: staff phone app redesign

Everything an implementing session needs. It assumes no memory of the design or planning conversation. The planned implementer is GPT Sol 6.1 (`gpt-6.1-sol`) at high effort, one spec per session.

## Read before implementing

1. `docs/CURRENT_CONTEXT.md`: what the product is, working rules, safe commands.
2. This file.
3. `ARCHITECTURE.md`, especially the invariants and the Part 2 API contract.
4. `DESIGN-SYSTEM.md`. Tokens are a closed list.
5. `INVENTORY.md` and every file in `inventory/`.
6. `PROGRESS.md`. It is the single source of current state and outranks anything you assume.
7. Your spec, completely.
8. The screen in the design. Open `design/mobile-redesign/staff-app-design.html` in a desktop browser. Use **All screens** in the left menu and click the screen your spec names; switch **Language** to اردو to see Urdu. The source is `design/mobile-redesign/v3/` (`views.js` draws each screen, `style.css` holds the sizes). Read the design for layout, sizes and copy; **never copy its HTML, CSS or JavaScript into the app**. Rebuild in React Native with the tokens.

## One spec per session

Do exactly the spec you were given. `Explicit non-scope` is binding. If you find other work, write it in your Log, do not do it.

## Other work is happening at the same time

- Other sessions may be implementing other specs in this plan, and an unrelated session may be changing the web app and backend. Write only inside your spec's `Owns`, except: (a) the test-only exception below, (b) a file your Scope explicitly names you the sole later editor of.
- Do not edit `PROGRESS.md` status cells or `README.md` unless the person running the plan asks you to. Under Orchestro the lead writes them at merge. Under a single manual session, update your own row and append to the PROGRESS Log.
- Record new reusable things in your own fragment `inventory/NN-<slug>.md`. Never edit `INVENTORY.md`.
- New Urdu strings go only into `frontend-mobile/src/i18n/staffAppTranslations.ts` (spec 04 creates it). If your spec runs before spec 04 is Done, use the English string through `t()` and list it in your Log; spec 49 sweeps such strings in.

## Test-only exception

Existing tests in `frontend-mobile/tests/` (for example `nativeComposition.test.mjs`, `startTaskLifecycle.test.mjs`, `attendanceCamera.test.mjs`, `verificationLifecycle.test.mjs`) cover screens you may restyle. You may change assertions in those files only where they cover the screen you own, only because markup or wording legitimately changed, and you must keep the behaviour each test proves. Never delete a test to make it pass. Removing an assertion needs a Log line saying why it no longer applies.

## Git and delivery

No GitHub issues or pull requests unless the owner asks (`**Issue:** —` stays). Do not commit unless the owner asks. **Never push `main`: pushing deploys the backend to Heroku and the repository is public.** Never run against production. Never build or upload an APK unless your spec says so.

## Commands

Always set the safe environment first, in the same shell:

```bash
export DATABASE_URL='postgresql://none:none@127.0.0.1:1/none' DOTENV_CONFIG_PATH=/dev/null
```

| Purpose | Command (from the repo root) |
|---|---|
| One mobile test file | `cd frontend-mobile && npx tsx --test <path relative to frontend-mobile>` |
| Whole mobile unit suite | `npm test --prefix frontend-mobile` |
| Mobile typecheck | `npm run typecheck --prefix frontend-mobile` |
| Mobile build gate | `npm run build:web --prefix frontend-mobile` (Expo web export) |
| Web parity test for the shared Urdu dictionary | `cd frontend && node --experimental-strip-types --test tests/operationsLanguage.test.mjs` |
| One backend test file | `cd backend && npx vitest run <path relative to backend>` |
| Whole backend unit suite | `cd backend && npx vitest run --maxWorkers=2` |
| Backend typecheck | `cd backend && npx tsc --noEmit -p tsconfig.json` |
| Backend build | `npm run build --prefix backend` |
| Mobile e2e (spec 52 only) | `npm run test:e2e --prefix frontend-mobile` |

`frontend-mobile` has no lint script. Typecheck with 0 errors is the static gate. Do not add a linter.

Until spec 01 is Done, `npm test --prefix frontend-mobile` does not pick up tests in new folders. If your spec finishes before spec 01, run your own file with the single-file command and say so in the Log.

## Writing tests

- Pure modules: `node:test` and `node:assert/strict`, file next to the module as `*.test.ts`.
- Components and hooks: one file per spec under `frontend-mobile/tests/<area>/`, as `*.test.mjs`, using `tests/support/nativeHarness.mjs` (spec 01). Mock at the boundary (network client, navigation, camera, location, haptics, clock). Assert on visible text, accessibility labels, roles and the callbacks a press triggers. No snapshots.
- Every screen spec proves: the normal state, loading, empty where it exists, error, offline where it applies, English and Urdu (at least one Urdu assertion: the Urdu label text and `isRTL` row direction), and that every action calls the right handler.
- Backend: Vitest; mock `prisma` at `../../prisma/prisma.js`; assert the exact `where` clauses that enforce tenant and actor scope, as `controllers/selfAuthorization.test.ts` does.

## Verify before you assert

- A package claimed as installed: read `frontend-mobile/package.json`.
- A path: resolve it against the tree. Specs were written on 2026-11-11 and another session is changing code; if a path moved, use the real one and write the difference in your Log.
- A library export: grep the installed `.d.ts` under `node_modules`.
- A prior-state claim ("spec 14 created `NameLine`"): read that spec's `Done when` and the file.
- An icon: confirm the file exists in `frontend-mobile/node_modules/lucide-react-native/dist/esm/icons/` (`History` does not exist in this version; use `RotateCcwClock`).

## Reuse before creating

Search `INVENTORY.md`, `inventory/` and the code first. Extend a near match instead of adding a second one. Shared parts live in `src/design/`; a screen-only part lives beside its screen.

## Design rules

- Only tokens from `DESIGN-SYSTEM.md`, read from `src/design/tokens.ts`. No raw hex anywhere else in new code.
- Text through `StaffText` (spec 14) with a role. Visible strings through `t()`.
- RTL: when `isRTL`, rows use `row-reverse`, text aligns right, arrows mirror. Email, password, code and server address inputs stay left-to-right.
- Every action has an accessibility label. Touch targets at least 44 (48 for icon-only).
- Respect `useReducedMotion()` from Reanimated for every animation.

## Done bar for every screen spec

- Matches the named design screen in layout, order, copy and colour, in English and Urdu.
- Normal, loading, empty, error and offline states behave as specified, with real API shapes.
- No feature, message or recovery path lost (ARCHITECTURE invariant 1).
- At a 360 by 700 window nothing is clipped or cut off horizontally. Say in the Log how you checked (web export in a browser at that size is acceptable; a device is better).

## Tiers

The `**Model:**` line's tier marks risk: Heavy specs touch shared logic, the data layer or the token system. A Light spec that comes back Blocked is re-run one tier higher, not at the same tier.

## Before finishing

1. Every `Done when` box you tick was run in this session and passed. Real counts go in the Log.
2. No invariant in `ARCHITECTURE.md` was broken.
3. Typecheck passes with 0 errors; build passes.
4. `inventory/NN-<slug>.md` lists what you created for reuse (component or function name, path, one line of purpose, "use instead of").
5. Add a `## Log` as the last section of your spec, one bullet per session starting with the date in bold (`- **2026-11-12** — …`): what you built, real test counts, what you could not verify (device, font scaling, screen reader), and every place the spec was wrong.

## When blocked

Set `**Status:** Blocked`, explain in the Log what you tried and what decision is needed, and stop. Do not change a decision in spec 00, the API contract or a protected file to get unblocked.
