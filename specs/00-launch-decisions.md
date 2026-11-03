# Spec 00 — Existing stack and launch decisions

**Status:** Done
**Depends on:** —
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** —
**Reuses:** `docs/implementation/DECISIONS.md`, `design/v5/DESIGN.md`

## Goal
Record authorized technical decisions without restarting discovery or design.

## Scope
Retain React/Vite/Query/Redux, Expo/React Native, Express/Zod, Prisma/PostgreSQL.
Keep Paddle, Cloudinary, existing fixed company roles and monolith.
No new state/queue framework or shared-workspace migration.
Use current unit runners; add only web component harness in spec 08.
Install Playwright/Chromium and Maestro flows only in spec 40.
Use approved design/v5; no new design version or approval checkpoint.
D01–D12 choices and external blockers are recorded in docs/implementation/DECISIONS.md.

## Explicit non-scope
- Source authorization changes → spec 01.
- Provider and production release qualification → spec 39.

## Reuse first
Preserve existing provider/services and reusable UI listed in INVENTORY.md.

## Steps
1. Read approved discovery/audit and actual referenced implementation.
2. Record decisions, rejected alternatives and practical boundaries.
3. Validate four steering docs and execution DAG.

## Decisions
Single refresh family beats device registry for current launch simplicity.
Separate OIDC operator identity beats public SUPERADMIN/tenant-role reuse.
Immutable attendance annotations beat an unapproved payroll/correction engine.
Provider catalog/portal beats custom subscription billing/trial logic.
Retained DAILY/ONCE beats speculative weekly calendar pending customer fit.
Private media proxy beats public/signed links for per-request authorization.
Existing modular monolith beats microservices/new infrastructure.

## Done when
- [x] D01–D12 defaults and external release gates recorded. [static]
- [x] Four source-grounded steering docs exist; v5 remains immutable. [static]
- [x] Existing package scripts and installed test runners inspected. [static]
- [x] Specification validator reports zero errors. [static]

## Log
- **2026-10-20** — User authorizes approved scope/v5 and sequential implementation after validation. Decisions recorded; external facts remain gated. GitHub issue not needed for this recorded planning decision.
