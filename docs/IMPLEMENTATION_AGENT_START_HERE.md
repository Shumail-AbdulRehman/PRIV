# Prompt to give the implementation model

Copy the prompt below into the model session with access to this repository.

---

Implement **P0 and P1 only** from `docs/PRODUCT_IMPROVEMENT_HANDOFF.md`.

Read that complete document first, including its exclusions, invariants, tests,
stop conditions, and final checklist. The current working tree includes existing
uncommitted work; preserve it. Do not reset or recreate the project.

The user has explicitly removed these ideas:

- Reassigning tasks directly from Today.
- A manual photo-review screen with approve/reject actions.
- The broad security/reliability/monitoring improvement workstream.
- Notifications and notification preferences.

The automatic scheduler and existing manual assignment already exist and must
keep working. Do not replace or extend those workflows. Keep the current shared
visual theme and permanent-deletion behavior.

Before editing, inspect the phase's actual files and record baseline checks.
Then implement P1 completely, with the focused verification specified in the plan.
Do not stop after analysis or produce placeholder code. Do not continue into P2.

When finished, update `docs/PRODUCT_IMPROVEMENT_PROGRESS.md` and report:

1. What changed and which files changed.
2. The acceptance criteria satisfied.
3. The commands and browser scenarios you verified, with results.
4. Any real limitations/blockers, separated from completed work.
5. The next phase to implement.

Do not claim that tests ran if you did not run them. Do not use production data,
real checkout, database resets, or scheduler changes to make tests pass.

---

## Subsequent phase prompt

After reviewing the preceding phase, use:

> Read `docs/PRODUCT_IMPROVEMENT_HANDOFF.md` and
> `docs/PRODUCT_IMPROVEMENT_PROGRESS.md`. Implement **[PHASE / UNIT] only**.
> Preserve completed work, all exclusions, and all invariants. Complete its
> acceptance checks, update the progress file, and report changes and evidence.
> Do not implement unrelated phases or resolve blockers by changing excluded
> scheduling, assignment, billing, verification, or deletion behavior.

Replace the bracketed text with a bounded unit, such as “P2 extraction only”,
“P2 wizard”, “P3 API only”, “P3 UI”, “P4 status endpoint only”, “P4 UI/form
integration”, “P5A”, “P5B Team only”, or “P5B Attendance only”. Follow the order in
the main plan. Splitting a phase does not waive its final acceptance criteria.

The main plan is the authority. This short prompt is a launcher, not a replacement
for reading the complete specification.
