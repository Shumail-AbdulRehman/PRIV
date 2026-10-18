# Hygene Ops interface system

Updated 2026-10-11. Applies to authenticated web operations and the staff app. Read `PRODUCT.md` and `PROJECT_CONTEXT.md` before changing workflows. Implementation and validation: `docs/UX_REDESIGN.md`.

## Audience and direction

Adults running cleaning businesses and doing field work in Pakistan. Digital confidence, reading fluency, language, device quality and connectivity vary. Design for confident task completion without requiring training. Keep a calm, dependable operations workspace; prioritize today's work over decoration.

## Visual rules

- Daylight surfaces, strong ink, restrained deep teal for actions. Amber draws attention; textual labels explain the state. Color never carries meaning alone.
- Web tokens live inside `.workspace` in `frontend/src/workspace.css`, so operational styling does not rewrite the public marketing site. Native tokens live in `frontend-mobile/global.css` and are consumed by the existing NativeWind UI components.
- English uses the existing interface typography. Web Urdu uses bundled Noto Sans Arabic, 400 and 600. Native uses system shaping; verify Urdu and system text enlargement on real Android/iOS devices.
- Body text: 16 logical units; web compact labels approximately 14–15; native instructions 16–18. Headings approximately 24–32. Avoid uppercase paragraphs, dense tiny metadata and truncated instructions.
- Spacing follows 4/8/12/16/20/24/32 increments. Give instructions and primary actions space. Web operational cards use restrained borders and 12–16 radii; no gradients or large shadows. Native cards use generous 20-unit padding.
- Frequent actions target at least 48 × 48. Native default/large buttons have minimum 52/56 heights and grow with text. Use minimum heights instead of fixed text containers. Icon-only actions need accessible names; common actions should include short text.
- A workflow has one clear next action. Secondary actions use outline/ghost styling. Keep occupied-room reporting visible during photography.
- Retain visible keyboard focus, screen-reader names and persistent status announcements. Do not add continuous motion to operational screens.

## Components and navigation

Use existing Button, Input, Text, ScreenHeader, PageHeader, SurfaceCard, StatusBadge and DataTable before creating another visual pattern. DataTable gives desktop comparisons and mobile summaries with expandable details; actions stay outside collapsed detail. A custom `mobileRender` can prioritize domain-specific content.

Web: Overview / Today / Review photos / Locations / Team / Attendance; administrative tools stay quieter. Overview and Today share the daily implementation. Managers see server-scoped assigned locations. Owners can compare locations and expand a defined seven-day submission comparison.

Staff: My day / Tasks / Help & account. Home shows location, shift, attendance and next task. Use the existing sequence: check in, select task, scan the assigned area, clean, follow required photo steps, submit. Starting cleaning and submitting evidence are different actions.

## Language and listening

Keep English / اردو visible. Persist the preference without altering authentication. Web sets document language/direction; native provides explicit text alignment and row direction plus React Navigation direction. Keep email/URL fields LTR. Preserve user-entered location names, task titles and immutable requirements.

Vocabulary lives in each app's `src/i18n/translations.ts`. A parity test enforces equivalent web/native dictionaries. Built-in instructions are translated; arbitrary configured instructions retain their original text. Do not silently rewrite a task's snapshotted requirement.

Listen is available in the staff mobile app through Expo Speech. The manager web dashboard displays written instructions without speech controls. In the staff app, select an installed voice for the chosen language; never silently substitute English for Urdu. If unavailable, show a persistent explanation and ask for manager assistance. A compatible Urdu voice must be installed; native dependency changes require rebuilding the app. Do not claim offline speech availability for every installed voice.

## Status and feedback contracts

| Condition                                        | Staff-facing meaning                                     |
| ------------------------------------------------ | -------------------------------------------------------- |
| SAVED / RETRY_WAIT                               | Photo saved on this phone; receipt is not confirmed      |
| UPLOADING                                        | Photo uploading                                          |
| SERVER_ACCEPTED / PROCESSING                     | Photo received and being checked                         |
| RECAPTURE_REQUIRED                               | Take another photo, with the specific correction         |
| CLEANING_REQUIRED                                | Needs cleaning, then the authorized QR/rework flow       |
| REVIEW_REQUIRED / PRIVACY_HOLD                   | Waiting for manager review                               |
| SERVICE_FAILURE                                  | Photo check could not finish; retain evidence for review |
| staffSubmittedAt / staff completion presentation | Work submitted; manager review may still be needed       |
| VERIFIED_COMPLETE (manager)                      | Verified                                                 |
| COMPLETED_WITH_EXCEPTIONS (manager)              | Accepted with exceptions                                 |

Never infer upload success from a local save or verification from submission. Never turn a service failure into a dirty finding. Show persistent feedback for attendance, submission, permissions and upload status. Explain every unavailable action with the reason and next step.

## Operational constraints

The API remains authoritative for tenant access, permissions, attendance, assigned QR, capture sequencing, immutable requirements, generations, deadlines, privacy and completion. Preserve stable capture identity, direct uploads with explicit retry, audit history and protected-media authorization. Do not persist staff photos or auto-retry network failures. Do not offer occupied-room or ask-manager exception actions; required photos remain mandatory. Reconnecting does not restore expired authority; a fresh scan may be required. Staff screens do not show internal provider names, scores, slot IDs or spatial diagnostics.

## Manager web update — 2026-10-12

Overview (`/dashboard`) and Today (`/today-status`) now have distinct purposes. Overview provides linked daily metrics, a short attention queue, a task-status chart and location comparison. Today has server-paginated Staff and Tasks tabs with visible location/date/search/status filters and an inline task panel. Daily records use paired location-local day ranges and labelled overnight overlap.

Reviews (`/exceptions`) uses reason-first rows, actionable queue tabs, period/search/location filters and server pagination. The previous priority/reason/worker-ID filter block is removed. Case details combine protected evidence, snapshotted requirements, optional screened examples, context photos and audited decisions on one page. Missing requirements can be inspected and acted on individually. Action availability preserves privacy, photo-window and resolution rules.

New manager components use the `.ops-*` rules in `workspace.css`; keep the slate canvas, readable typography, restrained teal, 48px controls, logical spacing and mobile stacking. Manager-only Urdu vocabulary lives in `frontend/src/i18n/managerTranslations.ts`; the shared web/mobile dictionary remains unchanged. Evidence enlargement uses an accessible dialog and protected blob fetches. Hidden/offscreen images load when viewed, including collapsed history.

## Owner and manager web refresh — 2026-10-15

This section applies only to the authenticated web workspace. The staff app is unchanged. `frontend/src/workspace-refresh.css` supplies the current web tokens and component refinements over retained structural/evidence rules. Workspace dialogs receive the same tokens through `WorkspaceTheme` context, so portal placement does not introduce a second palette.

Use a solid deep teal sidebar, a mint leaf mark, light neutral canvas, Inter body/controls and restrained Manrope headings. Operational panels use 8px corners and quiet borders; controls use 5px corners. Green signals received/passed work, amber signals review/rework, red signals missing attendance or overdue work, and muted blue distinguishes active processing. Text labels preserve the meaning of every status. Keep unsupported reports/metrics out of navigation.

Owner and manager overviews have role-specific composition. Summary lists show three or four records and link to full lists. On narrow screens, attention precedes location comparisons. Owner trends use available seven-day aggregates rather than fabricating a daily series. Full local lists sort before pagination; server-paginated views keep backend-owned totals and filters. Preserve schedule anchors, scoped reads, immutable task instructions, explicit manager decisions and protected evidence access.

Reuse `OperationalSummary`, `AttentionList`, `WorkProgress`, `PageHeader`, `SurfaceCard`, `StatCard`, `OperationStatus` and `DataTable`. Tables use mobile summaries with visible actions, and desktop scroll regions remain keyboard reachable. Loading skeletons retain the shell, errors offer retry, and form success/failure remains visible. Reference implementation, screenshots and validation boundaries: `docs/web-dashboard-redesign/README.md`.
