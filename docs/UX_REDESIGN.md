# Hygene Ops operations redesign — implementation and validation

Date: 2026-10-11. This describes a working implementation pass in the existing dirty workspace, not a deployed release or completed participant study. Existing backend, mobile and evidence-security changes were preserved.

## What changed and why

The audit found competing metrics/actions, technical vocabulary, two separate daily pages, icon-only frequent actions, dense tables on phones, weak submission confirmation and limited language discovery. The product is a multi-tenant cleaning operations system with attendance, area-based schedules, guided evidence capture and manager verification; simplifying it must retain those rules.

### Shared foundation

`DESIGN.md` defines reusable rules. The authenticated web shell now uses calm surfaces, deep teal, larger controls, clear hierarchy, logical RTL placement and visible language selection. Page headings, cards, status badges, metric labels and empty states share the vocabulary. DataTable adapts records to phone summaries with expandable details and visible actions. Team editing now has a text label; cleaning schedules expose Edit schedule beside the row.

Native shared buttons, fields, text and headers have larger minimum touch targets and text that can grow. The navigation adds Help & account, preserves safe-area spacing, supports font scaling and changes direction with Urdu. Login exposes connection settings progressively.

### Manager and owner daily overview

`frontend/src/pages/Manager/DailyOverview.tsx` is shared by `/dashboard` and `/today-status`.

- Today and assigned locations are the manager default; backend scoping remains authoritative.
- Attendance, submitted work, overdue work and open manager reviews link to filtered work.
- Absent staff, expired unfinished tasks, unassigned work and pending reviews have adjacent next actions.
- Search and location/status filters remain available. Phone records expand for individual task details.
- Unassigned work comes from each location's existing weekly schedule, selecting actual PENDING instances on its local day. Assignment opens the matching template with an exposed Edit schedule action. Loading or failed schedules never imply an authoritative zero.
- Reviews are labeled all open reviews rather than falsely constrained to today's work.
- Submitted work is explicitly separate from verified work and work accepted with exceptions.
- Owners see location comparisons and can expand `OwnerTrends.tsx`. Two existing date-range stats reads per location compare the last seven local calendar days including today with the preceding seven days. Counts are submitted (`COMPLETED` in the operational stats contract) out of non-cancelled scheduled instances. It is a submission comparison, not a cleanliness score. Fetching is deferred until expanded; today's unfinished shifts are disclosed.
- Loading, empty, failed, denied and offline views give next steps. Unknown metrics use an em dash. Offline records remain identified as last loaded information.

### Staff day and attendance

`HomeScreen.tsx` prioritizes assigned location, shift, attendance and the next task. Task cards use area, time, understandable status and one main action. Tasks stays a full list; Help & account contains language, instructions, account and sign-out.

Attendance keeps the existing selfie/location APIs and shift rules. Camera and location denial lead to settings; action failures and successful recording remain visible. Early/closed attendance explains its availability. A pending offline feed does not claim there is no work. Attendance requires an online server response; the redesign does not add durable offline attendance.

### Guided photography and submission

`VerificationScreen.tsx` keeps the existing capture authority, encrypted queue, sequential policy, expiry, native lifecycle and rework paths.

- One fixture and required view at a time, with a code-native pictogram and the snapshotted instruction. No restricted reference photos are introduced.
- Progress identifies the current required photo. Optional fixtures/views do not inflate required progress. Retakes retain their original requirement identity.
- Listen can read translated built-in instructions. Occupied-room reporting remains visible near capture.
- Camera-opening and permission feedback explain blocked capture. Interruptions preserve existing evidence and continue through existing reconciliation/renewal rules.
- Saved, uploading, received/checking, retake/cleaning, manager-review and submission states are distinct in `VerificationProgress.tsx` and `verification/feedback.ts`.
- Required checks must finish before a visible Submit work action is offered. Submission calls the existing finish endpoint; it no longer happens merely because polling reached a checked state. The backend still validates mandatory received evidence and pending jobs. A service/privacy review outcome can be submitted when the existing rules permit it, but never becomes verified approval.
- Final staff confirmation says Work submitted and explains that manager review may remain.
- Staff UI no longer offers the development spatial diagnostics button in the ordinary task flow. The development diagnostic route remains available for engineering.

### English, Urdu and audio

Language preference persists separately from credentials. Web sets `lang=ur-PK` and `dir=rtl` and bundles Noto Sans Arabic. Native uses explicit RTL text/rows and React Navigation's supported direction property. API IDs and custom names are preserved. A regression test compares both vocabulary dictionaries.

Listening uses supported browser SpeechSynthesis and Expo SDK 54 `expo-speech ~14.0.8`. It selects only a matching installed language voice and stops on language/step changes; native also stops on backgrounding. Missing speech capability or a missing Urdu voice has visible guidance. Voice quality, system voice downloads and iOS silent-mode behavior need device validation. References: [Expo Speech](https://docs.expo.dev/versions/v54.0.0/sdk/speech/) and [browser speech voices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices).

## Verification

All browser fixtures are fabricated, with no live accounts or customer evidence.

| Check                                                 | Result                                                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Web production build and ESLint                       | Passed; existing large-chunk warning remains                                                                                             |
| Web unit/regression tests                             | 36 passed                                                                                                                                |
| Mobile TypeScript                                     | Passed                                                                                                                                   |
| Mobile unit/lifecycle tests                           | 73 passed                                                                                                                                |
| Mobile Expo web export                                | Passed; includes Speech module                                                                                                           |
| Chrome manager/owner at 1440 and 390 logical pixels   | Passed; filters, action destinations, Urdu persistence and RTL, offline indicator, 200% text with no horizontal overflow, no page errors |
| Chrome owner comparison / loading / empty / 403 / 503 | Passed using fabricated responses                                                                                                        |
| Exported staff web at 390 logical pixels              | English and Urdu home / tasks / help passed, no page errors; screenshots inspected                                                       |
| Git whitespace check                                  | Passed                                                                                                                                   |
| Backend regression baseline from initial analysis     | 411 passed across 46 files; backend was not changed by this UI pass                                                                      |

The staff browser script is `frontend-mobile/scripts/check-staff-ui.mjs`. Serve `frontend-mobile/dist` at `http://127.0.0.1:5180` after `npm run build:web --prefix frontend-mobile`, then run it with the same `PLAYWRIGHT_MODULE` / `CHROME_PATH` variables. Web screenshots confirm exported layout only; they do not establish native camera, GPS, speech or system font-scaling behavior.

- Web unit/regression tests include privacy-safe evidence actions, manual versus verified presentation and dictionary parity.
- Mobile tests include save/retry/queue durability, account isolation, capture lifecycle, expiry, targeted retakes, front-camera attendance and explicit submission after checked evidence.
- `frontend/scripts/check-operations-ui.mjs` is an opt-in Chrome/Playwright smoke script. It checks desktop and phone widths, filters, real action destinations, Urdu persistence/direction, enlarged text and page errors. It also checks owner comparisons, empty, loading, access-denied and failed states, an offline indicator after loaded records, expandable phone details and missing-voice feedback. It uses local frontend development serving and fabricated API responses, so it does not establish live API integration.
- Existing backend regression results establish a baseline only; no backend business rules were weakened by this redesign.

Browser runner example (use your own installed playwright-core path):

```sh
PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs \
CHROME_PATH=/usr/bin/google-chrome \
UI_BASE_URL=http://127.0.0.1:5179/dashboard \
node frontend/scripts/check-operations-ui.mjs
```

Screenshots are written to `/tmp/priv-operations-browser` by default. They are local generated artifacts, not tracked customer data.

## Remaining limits and next validation

This is the initial shared-system and representative-flow rollout. Deeper inventory, staff/detail, billing and configuration forms still contain English copy and some legacy styling. Shared headings, controls, table layouts and navigation extend the foundation, but full screen-by-screen localization and redesign are not complete. Arbitrary custom instructions are not machine-translated. A Pakistani Urdu reader should validate terminology and common configured instructions before rollout.

The web app still produces a large existing bundled chunk; route-level splitting is a separate improvement. Historical owner queries use an existing endpoint that returns more than aggregates; larger fleets should eventually have a bounded dedicated summary endpoint. No backend endpoint was introduced for UI convenience.

No physical-device testing, APK/iOS rebuild, provider evaluation, live database integration, deployment or actual participant sessions were performed. Native camera, GPS, safe areas, system text sizes, Urdu shaping, installed voices, iOS silent mode and interruption behavior require device validation. Rebuild the installed native app to include Expo Speech.

## Short usability sessions to run

Recruit two owners, two managers and four staff, including English/Urdu preference, lower digital confidence and someone who prefers spoken instruction. Use a test company and real mid-range Android devices; include iOS if deployed. Allow 20–30 minutes each. Explain that the interface is being tested, not the participant. Obtain consent before recording; do not photograph other workers or live private areas.

Ask without coaching:

1. Owner: tell who is present, which location needs attention, and how much work was submitted. Explain the seven-day comparison in their own words.
2. Manager: find overdue work at an assigned location, open the task, assign unassigned work and find a photo waiting for review.
3. Staff: choose a language, check in, find the next task, scan its assigned QR, start cleaning and follow the required photos.
4. Staff: handle a blurry/incorrect photo retake, then an occupied room. Interrupt the app and return to saved work.
5. Staff: turn off connectivity after a durable save, explain whether the photo was received, reconnect, retry and submit.

Record completion, time, hesitation, wrong turns, exact confusing words and requests for assistance. Ask what happened after Save, Submit and Review to verify the mental model. Do not use reading speed as a proxy for competence. Prioritize any permission/privacy/evidence misunderstanding, then revise copy/action placement and rerun the same tasks.

| Participant / role / language | Task | Completed without help | Confusion / exact phrase | Change to test next |
| ----------------------------- | ---- | ---------------------- | ------------------------ | ------------------- |
| To be recruited               |      |                        |                          |                     |


## Photo review detail refinement

The review detail page now leads with the issue, room, staff member and due time. Missing evidence opens the existing task-photo view; expired work links to the existing cleaning schedule. No missing-photo case defaults to a decision. Everyday permitted actions stay visible; exceptional manager options, earlier photos and the audit timeline expand on request. Required decision reasons, notes, follow-up proof, optimistic version checks, retry request IDs and server permissions remain intact. Unknown photo privacy state remains unavailable until clearance. Decisions show a persistent success message; offline and stale-refresh notices explain limitations without claiming approval. Essential guidance supports the existing optional Listen control and English/Urdu rendering.

The sidebar has one Today entry. `/dashboard` and legacy `/today-status` remain working routes to the shared daily screen; filtered links retain their query parameters.

Browser verification uses fabricated data in `frontend/scripts/check-review-ui.mjs`: desktop/mobile, missing photos, explicit decision selection, 409 conflict with note preservation, retry request IDs, offline saving blocked with the note retained, persistent success, Urdu RTL and enlarged text. It does not authorize or decide live customer cases. Physical voices and representative-user comprehension still require real testing.

Review refinement verification: production build, ESLint and all 38 web tests passed. Browser checks passed at 1440px and 390px with fabricated data; live manager decisions were not exercised.

## Manager workflows, 2026-10-12

Implemented the focused Overview → Today → Reviews → case workspace redesign. The four summary cards navigate to their correct filtered records. Date/location scope, actual unassigned tasks, overnight overlap, submission/verification distinctions and list pagination now come from explicit backend read contracts. Reviews show reasons and context; details include all required photos and decisions without needing a second investigative page. Filter/page return state, stale-version notes, retry identity and partial-resolution results are covered by the new browser workflow script.

See `MANAGER_WEB_IMPLEMENTATION_RESULTS.md` for actual validation, commands, screenshots and remaining live-data/usability limits. The standalone HTML preview remains a design artifact, not the running application.
