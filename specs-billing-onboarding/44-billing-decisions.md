# Spec 44 — Record approved sandbox repair decisions

**Status:** Done
**Depends on:** —
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Reasoning:** medium (requested Codex execution profile; tier describes risk)
**Issue:** —
**Owns:** —
**Reuses:** `AGENT-GUIDE.md`, `ARCHITECTURE.md`, `DESIGN-SYSTEM.md`, `INVENTORY.md`

## Goal

Record the feature contract and approved design amendment so a fresh Sol medium session can implement one bounded unit without reopening product decisions.

## Scope

- Keep Netlify frontend, Heroku backend, Paddle sandbox, existing React/Vite/Express/Prisma/PostgreSQL, owner auth and test runners.
- Use approved revision-2/v3 after removing help/contact/FAQ/support copy; reuse branded primitives and the existing language context.
- Preserve six catalog IDs and provider pricing/trials. New owners choose capacity, enter a test card in Paddle, wait for server-confirmed permission, then enter the workspace.
- Fix the actual deployed prerequisite/session/route issue only after evidence; a missing flag, stale build or cross-site cookie problem is not yet a proven diagnosis. Adopt qualified same-origin browser API proxying without changing native/webhook URLs.
- Use additive DTO contracts, scoped UI modules, existing reservation/fulfillment/access policy, per-unit tests, isolated SQL proof, one browser spec and separate deployed acceptance.
- User-selected runtime for every Codex unit: gpt-6.1-sol, medium effort. Heavy remains a risk label; break work down instead of silently raising effort.

## Explicit non-scope

- Backend lifecycle implementation → spec 49.
- Application UI and route composition → spec 59.
- Actual local/browser/deployed acceptance → spec 63.

## Reuse first

- Read INVENTORY.md and existing fragments before creating a helper; extend the named existing boundary rather than a parallel implementation.
- Follow ARCHITECTURE.md invariants and the approved no-Help/Contact amendment. New symbols named here are project code owned by this or a dependency spec, not assumed library exports.

## Steps

1. Read the intake and approval.json; record that the user authorized proceeding after removing Help/Contact controls.
2. Reject UI-only enablement, custom card forms, provider migration, hardcoded prices, local trial/access overrides and a broad auth/data-model rewrite.
3. Retain production email/commercial gates. Removing support UI does not authorize real-money checkout or replacement of backend support policy.
4. Freeze ownership, acceptance tiers and execution settings in the four steering documents; keep historical specs 00–43 untouched.

## Done when

- [x] Confirmed scope, rejected alternatives, no-support amendment, ownership and Sol medium profile are recorded. [static]
- [x] Typecheck/lint gates are recorded in AGENT-GUIDE.md; this decision unit does not claim an implementation test pass. [static]
- [x] Build gates are recorded as `npm run build --prefix backend` and `npm run build --prefix frontend`; actual implementation runs belong to their units. [static]

## Log

**2026-11-06** — Planning decision recorded from verified source, confirmed Netlify/Heroku/Paddle sandbox intake and the user-authorized no-Help/Contact amendment. No implementation, issue creation, deployment or payment performed.
