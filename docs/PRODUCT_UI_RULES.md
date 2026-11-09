# Hygene Ops product interface rules

Moved from `DESIGN.md` on 2026-11-09, when that file became visual-only. Removed as outdated: teal styling, Expo Speech and Listen, occupied-room reporting during photography, and phone-saved photo statuses.

## Web navigation

Overview / Today / Photo Reviews / Locations / Team / Attendance; administrative tools stay quieter. Managers see server-scoped assigned locations. Owners can compare locations.

Overview (`/dashboard`) is a company and location performance report. Today (`/today-status`) is the daily work and attendance workspace, with server-paginated Staff and Tasks tabs, visible filters and an inline task panel. Daily records use paired location-local day ranges and labelled overnight overlap.

Overview uses 7 and 30-day periods ending on the selected local date, with weighted attendance and submission rates. The location status column is for the selected day, while the rates cover the whole period. Missing denominators display a dash or No data, never a fabricated zero rate. Charts use no decorative animation and provide a daily-figures table as an accessible alternative.

## Staff flow

Staff tabs are My day / Tasks / Help & account. Home shows location, shift, attendance and next task. The sequence is: check in, select task, scan the task QR, clean, follow required photo steps, submit. Starting cleaning and submitting evidence are different actions.

## Language

Keep English / اردو visible. Persist the preference without altering authentication. Web sets document language and direction; native provides explicit text alignment and row direction plus React Navigation direction. Keep email and URL fields left-to-right. Preserve user-entered location names, task titles and immutable requirements.

Vocabulary lives in each app's `src/i18n/translations.ts`, and a parity test enforces equivalent web and native dictionaries. Manager-only Urdu vocabulary lives in `frontend/src/i18n/managerTranslations.ts`. Built-in instructions are translated. Arbitrary configured instructions retain their original text. Do not silently rewrite a task's snapshotted requirement.

## Photo status meanings for staff

| Condition | Staff-facing meaning |
| --- | --- |
| Photo checking unavailable | Task photos are unavailable; received results are kept; ask your manager |
| Temporary picture not yet received | Upload again; if the screen closes, take a new photo |
| Received and processing | Uploading and checking photo |
| RECAPTURE_REQUIRED | Take another photo, with the specific correction |
| CLEANING_REQUIRED | Needs cleaning, then scan the task QR again |
| REVIEW_REQUIRED / PRIVACY_HOLD | Waiting for manager review |
| SERVICE_FAILURE | Photo check could not finish; never present this as dirty |
| staffSubmittedAt | Work submitted; manager review may still be needed |
| VERIFIED_COMPLETE (manager) | Verified |
| COMPLETED_WITH_EXCEPTIONS (manager) | Accepted with exceptions |

Never infer upload success from a captured picture, or verification from submission. Show persistent feedback for attendance, submission, permissions and upload status. Explain every unavailable action with the reason and next step.

## Operational constraints

The API remains authoritative for tenant access, permissions, attendance, assigned QR, capture sequencing, immutable requirements, generations, deadlines, privacy and completion. Preserve stable capture identity, direct uploads with explicit retry, audit history and protected-media authorization. Do not persist staff photos or auto-retry network failures. Do not offer occupied-room or ask-manager exception actions; required photos remain mandatory. Reconnecting does not restore expired authority; a fresh scan may be required. Staff screens do not show internal provider names, scores, slot IDs or spatial diagnostics.

## Areas and task QR codes

The location's Area template tab owns inline area creation, renaming, fixture editing and archiving. Area bookmarks redirect into this workspace. Do not restore separate area configuration pages, fixture QR labels or manual QR replacement controls. Area template IDs and immutable task photo snapshots remain unchanged.

Each generated task instance has an automatically signed QR bound to its task ID and assigned area. The same instance keeps the same code; other instances, even from the same schedule, get different codes. Owners and scoped managers can display or print Task QR from task history, Today task details and actual weekly-schedule items. Planned schedule previews have no task code until the instance exists. Staff scan that task code at start and again for capture or rework. Old shared-area and fixture codes cannot authorize a task scan. Keep QR payloads out of staff task responses, logs and persistent browser storage.

## Reviews

Reviews (`/exceptions`) uses reason-first rows, actionable queue tabs, period/search/location filters and server pagination. Case details combine protected evidence, snapshotted requirements, optional screened examples, context photos and audited decisions on one page. Evidence enlargement uses an accessible dialog and protected blob fetches.

Task review detail leads with **What went wrong**: grouped cleaning findings, named missing views, required-photo progress, the server's photo deadline and a specific next step. Fixture links focus the recorded explanation and available manager actions. Missing, rejected or discarded, restricted and unavailable photos must have distinct copy. Clean results awaiting manual approval and checking failures must not be described as dirty findings. Use saved categorical findings and named surfaces, without another model call or invented visual explanations.

Only server-authorized actions are displayed. Managers choose one whole-review outcome: resolve with a note, or record a categorized issue against assigned staff performance KPIs and close. Until saved, the task remains in exceptions. Closure is audited and leaves task completion and photo requirements as recorded. Do not offer photo retakes, cleaning requests, deadline extensions, or the previous-decisions/earlier-photos section. Staff detail shows manager-recorded performance issues for the selected reporting period.
