# Spec 33 — Task details screen

**Status:** Done
**Depends on:** Spec 07, Spec 19, Spec 20, Spec 21, Spec 24
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/screens/task/TaskDetailScreen.tsx`, `frontend-mobile/src/design/StepPath.tsx`, `frontend-mobile/tests/screens/taskDetail.test.mjs`, `specs-mobile-redesign/inventory/33-task-detail.md`
**Reuses:** `frontend-mobile/src/verification/api.ts`, `frontend-mobile/src/api/client.ts`, `frontend-mobile/src/queries/staff.ts`, `frontend-mobile/src/design/taskState.ts`, `frontend-mobile/src/design/TopBar.tsx`, `frontend-mobile/src/navigation/routeNames.ts`, `design/mobile-redesign/v3/index.html`

## Goal

Tapping a task shows what it is, where it is in four steps, the manager's note, what to clean, and the one button to start or continue.

## Scope

New screen `TaskDetailScreen` (route `TaskDetail`, param `taskId`):
- Data: the task from the cached today feed if present, else `GET /task-instance/{id}?view=mobile` exactly as `StartTaskScreen` loads it. What to clean: `verificationManifest(taskId)` (read only; allowed for the assigned staff member before start). If the manifest read fails, hide the section and log nothing to the user.
- `TopBar` "Task {id}". Then the area name (`headline`, untranslated), the task title (muted), and a line with a clock icon, the time range and the status pill.
- **`StepPath`** (new shared part in `src/design/StepPath.tsx`): four steps "Scan QR", "Clean", "Photos", "Submit" with numbered circles joined by a line; done steps blue with a tick, the current step yellow, later steps `canvas`. Current step: not started 1, in progress 2, photos needed or retake or overdue 3, submitted 4 done. Mirrors in Urdu.
- Notes: before check-in, the yellow "Check in before starting a task." note; when photos are unavailable (the manifest says `photoChecking.available` false) and the task is past start, the red note "Task photos are unavailable" with "Results already received are kept. Ask your manager what to do next."
- "Note from your manager": the template description (`task.template.description`) in a `blueWash` note, untranslated.
- "What to clean": one row per manifest item with a fixture tile (icon by `typeSnapshot` the same way `PhotoGuide` maps `TOILET`, `SINK`, `MIRROR`, `BIN`, `FLOOR`), the item name through `translateText`, and "{n} photo" or "{n} photos" from its mandatory requirements.
- Dock: not started and checked in → `next` "Start cleaning" (QR icon) to `StartTask`; in progress, photos needed, retake or overdue → "Take task photos" (camera icon) to `Verification` with `requirePhotoQr: true`; not checked in → "Check in" to My day; submitted or photos unavailable → no button (the note explains).

## Explicit non-scope

- The scan and the photo flow → specs 34 and 45.
- History task details → spec 43.

## Reuse first

- Fetch exactly as `StartTaskScreen` does; `verificationManifest` from `verification/api.ts`.

## Steps

1. Build `StepPath` and the screen.
2. Test with mocked data.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/screens/taskDetail.test.mjs` passes: a pending task shows step 1 current and "Start cleaning" that navigates to `StartTask`; an in-progress task shows step 2 and "Take task photos"; before check-in the note and "Check in" show; manifest items render with "2 photos" for two mandatory requirements; a failed manifest read hides the section; the manager note renders untranslated; Urdu mirrors the step path. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `StepPath` and `TaskDetailScreen`. `tests/screens/taskDetail.test.mjs`: 13 of 13 pass. Whole mobile suite: 458 of 459 pass; the one failure (and a hang when rerun alone) is `tests/screens/tasks.test.mjs`, spec 32 mid-edit, not mine. Typecheck 0 errors. `build:web` passes (screen is not imported by the app until spec 48, so it is not bundled). [runtime] not required by this spec; no headless screenshot taken, so 360 wide layout is not viewed (rows use flex, one-line labels, gutters from `gutterFor`).
- Not verified: device, font scaling, rendering in Urdu.
- Gaps: no Urdu entries exist for "Task {id}", "Task photos are unavailable", "{n} photo" and "{n} photos"; the English key falls back through `t()` (add in spec 49). The notStarted pill uses the English key "Not started" because `displayFor` gives it no pill. "Check in" navigates to `StaffTabs` with `{ screen: 'Shift' }` so it works from the stack. The detail read also runs when the feed task has no `template`, because the feed may omit the manager note. Spec 48 must register the route and clear the header (the screen draws its own `TopBar`).
- **2026-11-11** — Lead: reran the whole mobile suite after spec 32 finished: 464 of 464 pass, 0 fail; `tasks.test.mjs` alone exits in 3 s (the hang was spec 32 mid-edit).
- **2026-11-12** — Part 1 release-check fixes in StepPath: the connector now runs edge to edge between circles (it was painted over the digits by a later step's stacking context) and step labels have no line limit, so the Urdu "کیو آر اسکین" wraps instead of truncating. Regression assertions in tests/screens/taskDetail.test.mjs; re-rendered in English and Urdu at 360x700, clean.
