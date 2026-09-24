# Launcher for the remaining implementation units

Give the implementing model repository access and copy the prompt below. The detailed remaining-work plan is `docs/REMAINING_PHASES_IMPLEMENTATION_PLAN.md`. The original handoff remains the source for shared exclusions and original contracts.

## First implementation session

```text
Read these files completely, in order:
1. docs/PRODUCT_IMPROVEMENT_HANDOFF.md
2. docs/PRODUCT_IMPROVEMENT_PROGRESS.md
3. docs/REMAINING_PHASES_IMPLEMENTATION_PLAN.md

Implement P2-A only: extract the existing location task-template UI and form helpers without changing behavior. P0/P1 are complete. Preserve the current login/signup image design and all other existing changes. Do not reset the working tree or recreate files from an earlier commit.

Before editing, inspect the actual implementation and record a short unit plan in the progress file: allowed files, contracts, baseline checks, and intended tests. Follow the P2-A task IDs and exit checks. Do the implementation, not just another plan.

Preserve automatic scheduling, existing manual assignment, automatic photo verification, permanent deletion, billing/signup behavior, and the current theme. All exclusions in the handoff remain binding. Do not start P2-B or any later unit.

Verify the result, update docs/PRODUCT_IMPROVEMENT_PROGRESS.md, and report changed files, checks actually run, remaining blockers, and the exact next unit. If evidence is incomplete, say so. Stop for review after this unit.
```

## Later sessions

Use the same prompt, replacing the implementation paragraph with:

```text
Implement [UNIT ID AND NAME] only from docs/REMAINING_PHASES_IMPLEMENTATION_PLAN.md. Confirm its dependencies are completed in the progress record. Preserve completed phases and all current user changes. Complete that unit's task IDs and exit checks, update the progress file, then stop for review. Do not begin the next unit automatically.
```

Recommended order:

1. P2-A — extract existing task UI and helpers
2. P2-B — guided task creation and safe partial success
3. P3-A — weekly schedule read API
4. P3-B — weekly schedule UI
5. P4-A — setup-status read API
6. P4-B — setup checklist and existing-form entry points
7. P5-A — route and heavy-component loading
8. P5-B1 — shared pagination contract and Team search
9. P5-B2 — Attendance search and pagination
10. P5-C1 — bounded task histories and lightweight detail reads
11. P5-C2 — image previews
12. P6 — final integration verification and report

Do not give the model all twelve units as one unbounded implementation task. The detailed document provides context for all phases; the prompt authorizes one unit at a time.
