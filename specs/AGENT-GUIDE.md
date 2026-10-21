# Implementation agent guide

## Read before implementing
1. PROGRESS.md is current state and outranks previous-session assumptions.
2. docs/implementation/SESSION_HANDOFF.md and DECISIONS.md.
3. ARCHITECTURE.md, DESIGN-SYSTEM.md, INVENTORY.md and inventory fragments.
4. Assigned spec; approved discovery/audit references only as needed.

## One spec per session
Default one focused unit; the user explicitly authorizes sequential units in this session. Finish verification and update handoff after each. Do not restart discovery/design or add a new prototype. Preserve pre-existing dirty changes documented in the survey.

## Claim the GitHub issue before writing code
Search `gh issue list --state all --search "Spec NN"`, reuse or create `Spec NN — title`, write its number to spec/tracker. One issue/PR per spec; PR body names its spec and Closes issue. Never merge your own PR. Skip without GitHub remote; log gh failures and continue. The skill explicitly authorizes this issue/PR ritual. Do not include unrelated dirty changes in commits/PRs.

## Other specs and ownership
No other agents are currently dispatched. Dependency waves permit later Orchestro execution; workers change only Owns paths in their worktrees. The lead updates status/tracker at merge. Sequential execution updates local status only after checks pass. Shared hot files have one owner; additional necessary ownership is amended and validated before editing, with dependency consumption documented. Do not introduce dynamic plugin registries merely to avoid wiring edits.

## The model on the spec is the model to run
Model lines record sizing. A stalled Light unit must be re-tiered before retry. They do not override this session's active model. Provider IDs verified in docs/implementation/research/models.md.

## Verify before you assert
Read package.json for installed libraries; resolve files using rg --files; check library exports in installed .d.ts; find ancestor Done when for planned symbols. Inspect environment configuration presence without printing secrets. Never log raw credentials, photos, tokens, private URLs or precise worker coordinates.

## Reuse before creating
Search INVENTORY.md, inventory fragments and code by purpose before writing components/hooks/utils. Extend near matches. Record reusable additions in inventory/NN-slug.md in the same unit. Keep existing technologies; no forced house-pattern migration, new queue/state library or unnecessary abstraction.

## Design tokens are a closed list
DESIGN-SYSTEM.md is transcribed from approved design/v5. No arbitrary raw colors/palette classes in new UI. Missing tokens need a source-backed addition, not an invented local variant. Preserve existing operational functions and blue/white identity.

## Unit tests verify behavior, not visual acceptance
Backend single file: `npm test --prefix backend -- src/path.test.ts`; full backend: `npm test --prefix backend`.
Web full: `npm test --prefix frontend`; mobile full: `npm test --prefix frontend-mobile`.
Web component testing infrastructure is installed by spec 08; use roles/text, not snapshots. Mobile uses existing tsx/node test harness and react-test-renderer, not a new Jest migration.
End-to-end: `npm run test:e2e --prefix frontend` (installed only by spec 40); spec40 owns integrated browser/device flows; the explicitly authorized V5 correction may extend that harness for paired visual acceptance. Use dedicated disposable test DB explicitly supplied by operator; never load production .env for DB integration.

## Acceptance criterion tiering
[static] inspection/type/build; [unit] isolated behavior; [runtime] one started process; [e2e] integrated flow (spec 40 only); [suite] clean whole suites (spec 41 only); [requires: named dependency] cannot pass without it. Tick only checks actually passed in this session.

## Before finishing a spec
Verify behavior, tenant/site/role denial, invariants, targeted plus full affected unit suite, type checks and build. Record real counts and limitations. Backend has no configured lint script; do not invent a passing lint claim. Web lint is enforced on touched code; baseline failures documented separately. Full lint release gate remains spec 41.

## Update tracker before finishing
Append dated spec Log with files, commands/counts, decisions, blockers; update PROGRESS.md and SESSION_HANDOFF.md. Never mark Done based on intent or provider mocks alone.

## When blocked
Record unavailable external configuration in the affected criterion; keep safe functionality disabled and continue independent units. A production deployment, irreversible change or unapproved business commitment needs explicit authorization. Do not migrate/reset a real database in development.

## Mandatory visual acceptance — V5 correction, 2026-10-21

Passing backend tests, TypeScript checks and builds does **not** prove UI/UX completeness.
Every UI-related specification must be visually verified against approved `design/v5`.
Historical Done checkmarks and synthetic render counts are retained as history, not
accepted as evidence that the approved layout was implemented.

Track four independent facts for each page: functional implementation, visual
implementation, functional verification, visual verification. A UI page is complete
only when all four pass and its API, authorization, responsive EN/UR and loading,
empty/error states are verified. Any unmet criterion leaves the page Incomplete;
name an external blocker where appropriate. Do not infer verification from a build.

Before edits, verify the served checkout/process cwd, API target and revision.
Capture the V5 reference and the actual rendered React route at matching viewport
sizes (desktop and phone), in English and Urdu. Inspect composition, navigation,
type, spacing, controls, tables/charts and significant interactions; fix and recapture.
Record screenshot paths, viewport, state, fixture provenance, commands and deviations.
Reviewer bars/sample identities are prototype tooling and must not ship. Never use
prototype data in the application or label intercepted HTTP fixtures as real API proof.
Native screenshots must come from a native runtime; Expo web export is not native
visual acceptance. Missing device/provider access is an explicit unverified gate.

Current page inventory and correction evidence: `docs/implementation/V5_IMPLEMENTATION.md`.
User authorizes sequential V5 corrections beyond the historical one-spec restriction.
Preserve pre-existing changes; commit only the correction's own paths/hunks. Never
merge/deploy or change production data as part of visual verification.
