# Spec 60 — Fix: the e2e build never shares a bundler cache with real builds

**Status:** Done
**Depends on:** Spec 53
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/tests/e2eBuildIsolation.test.mjs`, `specs-mobile-redesign/inventory/60-fix-test-build-cache.md`
**Reuses:** `frontend-mobile/playwright.config.ts`, `frontend-mobile/e2e-web/support/env.ts`, `frontend-mobile/e2e-web/serve.mjs`, `frontend-mobile/metro.config.js`, `frontend-mobile/src/config.ts`, `frontend-mobile/package.json`

## Goal

A normal `npm run build:web` (or any `expo export`) can never contain the e2e fixture host `http://api.staff-e2e.test/api`, and the e2e build can never pick up a normal build's API host, whatever order they run in. This removes a release risk: today a phone or web build made after an e2e run can ship pointing at a host that does not exist. This fixes finding 60 (`docs/plan-project/mobile-redesign/planning/verification.md` §2 and §7).

## Scope

The cause, from the code: `playwright.config.ts` `webServer.command` runs `npm run build:web -- --output-dir <workDir>/dist` with `EXPO_PUBLIC_API_BASE_URL` set to the fixture host (`e2e-web/support/env.ts`), but nothing about the bundler cache. `metro.config.js` takes Expo's default config, whose cache store is `path.join(os.tmpdir(), 'metro-cache')` (`node_modules/expo/node_modules/@expo/metro-config/build/ExpoMetroConfig.js` line 191). The inlined `EXPO_PUBLIC_*` value is not part of the cache key, so both builds read and write the same transformed `src/config.ts` (whose fallback is `http://10.0.2.2:8080/api`). The output folders are already separate.

- Give the e2e build its own temporary folder, so Metro's cache (and any other tool that uses the system temp folder) lives inside the suite's work folder (`workDir`, already under the system temp folder) and never in the default one: set `TMPDIR` (and `TMP`, `TEMP`) in `webServer.env` to a folder under `workDir`, created before the build starts. Also make the e2e build start from an empty cache (`--clear` on its export), so a stale fixture build from an older config cannot survive either.
- Normal builds are then never touched by e2e; the reverse direction needs nothing in the normal build.
- Machines that already ran e2e before this fix hold fixture entries in the default cache. Write in the Log, for the lead to carry into `docs/CURRENT_CONTEXT.md`, the one-time step: the first release build after this fix runs `expo export --clear` (or deletes `<system temp>/metro-cache`).
- This spec is the **sole later editor** of `playwright.config.ts` among specs 56 to 63 (owned by spec 52) and changes only the `webServer` block and what it needs (creating the folder). It does not change `metro.config.js`, `package.json` or any test under `e2e-web/`.

## Explicit non-scope

- Running the e2e suite (`npm run test:e2e`) → spec 52; the lead reruns it after this spec to prove the suite still builds and passes.
- Changing `build:web` or adding `--clear` to normal builds in `package.json` → not planned (spec 01 owns the scripts; normal builds are safe once e2e stops writing to the shared cache).
- Writing `docs/CURRENT_CONTEXT.md` → the lead, from this spec's Log (spec 53 lists release steps as unverified).
- Maestro device flows in `frontend-mobile/e2e/` → unchanged (spec 52).

## Reuse first

- `workDir` and `API_ORIGIN` already in the config; Node's `os.tmpdir()` honours `TMPDIR`. No new dependency.

## Steps

1. Change the `webServer` block.
2. Write `tests/e2eBuildIsolation.test.mjs` (picked up by `npm test`): load the config with `tsx` (or read it as text if loading it would start anything) and check the build environment.
3. Run the two builds by hand in both orders (below), outputs in scratch folders, never the e2e suite.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/e2eBuildIsolation.test.mjs` passes: `webServer.env` sets `TMPDIR`, `TMP` and `TEMP` to one folder inside the suite's work folder that differs from the system temp folder; the build command clears the cache and writes to the suite's own output folder; `EXPO_PUBLIC_API_BASE_URL` is still the fixture host plus `/api`; the `TMPDIR` assertion fails on the tree before the change. [unit]
- [x] Order A: a plain `npx expo export --platform web --clear --output-dir <scratch>/a`, then the e2e build step alone (the `webServer` build command with its env, output to `<scratch>/e2e`), then a plain export without `--clear` to `<scratch>/b`: `grep -rl "api.staff-e2e.test" <scratch>/b` prints nothing and `<scratch>/e2e` contains the fixture host and not `10.0.2.2`. Real output in the Log. [runtime]
- [x] Order B: a plain export, then the e2e build step: the e2e output contains the fixture host and not `10.0.2.2`. Real output in the Log. [runtime]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- `playwright.config.ts`: `webServer` only. Added `mkdirSync(<workDir>/tmp)`, `TMPDIR`/`TMP`/`TEMP` = that folder in `webServer.env`, and `--clear` in the build command. Nothing else changed.
- `tests/e2eBuildIsolation.test.mjs`: 3/3 pass (loads the real config). The config has no earlier committed copy, but the old `webServer.env` had no `TMPDIR`, so the TMPDIR assertion could not hold before.
- Order A (scratch folder, plain `expo export --clear` to a, e2e build step with its env and `TMPDIR` to e2e, plain export to b): `grep -rl api.staff-e2e.test b` printed nothing. e2e contains the fixture host.
- Order B (plain export c, then e2e step): e2e contains the fixture host inlined: `const t=("http://api.staff-e2e.test/api"?.trim()||"http://10.0.2.2:8080/api")`.
- Spec wording "not `10.0.2.2`" cannot hold literally: `src/config.ts` keeps `http://10.0.2.2:8080/api` as the fallback after `||`, and `10.0.2.2` also sits in a loopback list, so the string is in every bundle (b has it too). The proof used is that the inlined value before `?.trim()` is the fixture host in e2e and absent from plain builds.
- Plain-build isolation holds because the plain export used the default `<system temp>/metro-cache` while the e2e step used `<scratch>/etmp/metro-cache`.
- `npm test`: 625/625 pass, 0 fail. `npm run typecheck`: 0 errors. `npm run build:web`: exit 0.
- For the lead, for `docs/CURRENT_CONTEXT.md`: machines that ran e2e before this fix may hold fixture entries in `<system temp>/metro-cache`. The first release build after this fix must run `expo export --clear` (or delete `<system temp>/metro-cache`). Spec 53 lists release steps as unverified.
- Note: running `expo export` and `npm run build:web` leaves `frontend-mobile/dist` as a normal build output; not touched otherwise.
