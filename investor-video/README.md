# Hygene Ops investor film

A complete 90-second, 1920 × 1080, 30 fps investor explainer. The rendered film includes English neural narration, captions, an original instrumental soundtrack, and deterministic vector product animation. It uses the existing Hygene Ops mark, colors, fonts, and licensed repository photographs. All numbers, names, and screens are illustrative sample data.

## Deliverables

- `output/hygene-ops-investor.mp4`: H.264 video with AAC stereo audio and visible English captions.
- `output/captions.srt`: separate timed English captions.
- `output/hygene-ops-editable.zip`: portable editable project, without dependencies or intermediate video clips.
- `output/previews/`: twelve full-resolution design checkpoints.
- `output/audio-report.json`: voice duration, speech pace, and scene fit.
- `output/validation.txt`: completed media and browser checks.

## Edit and preview

```bash
cd investor-video
npm ci
npm run preview
```

Open `http://127.0.0.1:5198`. The player supports seeking, audio mute, captions, keyboard play/pause, and five-second keyboard seeks. It starts paused so the viewer controls motion and sound. The finished MP4 also plays directly in an ordinary video player.

`story.json` controls scene timing and narration. `film.js` draws every frame from a supplied time; it does not depend on frame rate, random values, or a live application. The example schedule is the user's six tasks in Building A and Building B. Change the `TASKS` array to edit those examples.

## Voice and rendering

The bundled media make preview and rendering possible without contacting a voice service. Regenerate narration only when its script changes:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-voice.txt
.venv/bin/python make_voice.py
python3 make_audio.py
npm run stills
npm run render
npm run verify
```

`make_audio.py` needs NumPy (the current system Python already supplies it). `CHROME_PATH` can override the default `/usr/bin/google-chrome`. FFmpeg and Playwright Core are pinned in `package-lock.json`; Playwright Core uses the installed Chrome. `make_voice.py` sends only the narration text to Microsoft Edge neural TTS. The selected synthetic English voice is `en-GB-RyanNeural`, at a 5% slower speaking rate. Narration is never accelerated to fit. The audio assembler rejects scene overruns.

## Edit timings

| Time | Scene | Purpose |
| --- | --- | --- |
| 00–09 | Opening | Establish the specialized cleaning operations platform. |
| 09–21 | Centralized operations | Multiple locations, workforce visibility, location check-in, and selfie capture. |
| 21–25 | Automation setup | “Set it once. Let the schedule work.” |
| 25–46 | Automatic task scheduling | Manager setup → recurring calendar → today's generated tasks → assigned mobile work → completion → dashboard monitoring. |
| 46–59 | Mobile workflow | View assignment → task QR → cleaning → photographic proof; submission remains separate from verification. |
| 59–68 | Monitoring | Completed, in-progress, scheduled, pending, missed, and overdue activity. |
| 68–81 | Planned AI | Explicitly planned cleaning verification and manager oversight. |
| 81–90 | Closing | Workforce management, task automation, operational visibility, and planned AI. |

The requested product narration is preserved word for word from 09–68 seconds, including the automation bridge. The opening and closing were shortened to protect the overall duration and keep the voice relaxed.

## Implementation inspection and claim boundaries

Inspected the current implementation on 2026-10-19 before depicting automation:

- `backend/src/app.ts` imports the daily scheduler and runs the startup catch-up routine.
- `backend/src/cron/dailyTaskScheduler.ts` loads active `DAILY` templates, evaluates effective and end dates in each location's timezone, resolves the task window, generates today's instances, and ensures assignments. It runs at startup and every 90 seconds outside tests.
- `backend/src/cron/taskInstanceWindow.ts` resolves local clock times, including overnight staff shifts.
- `backend/src/services/verification-v2/inventorySnapshot.service.ts` checks for an existing template/day instance before creating it. Generation requires an active company/location/template and a configured, ready area inventory schedule. Unmapped or invalid schedules produce a setup review issue rather than a usable new task. It creates an assignment for the template's configured staff member.
- `backend/src/services/templateAssignment.service.ts` supports manager-selected staff, checks location and shift compatibility, and synchronizes eligible unstarted tasks while preserving work already under way.
- `backend/src/services/taskAssignment.service.ts` also contains rules-based assignment for otherwise unassigned work. That fallback is gated by the company's `automaticAssignment` feature and depends on eligible staff. The film demonstrates configured employees; it does not promise universal automatic staff selection.
- `frontend/src/pages/Task/components/TaskScheduleWizard.tsx` exposes Task → Team → Schedule → Review setup. The film is an abbreviated illustration of this workflow, not a recording of the live application.
- `frontend/src/pages/Location/components/LocationScheduleTab.tsx` distinguishes planned previews from actual generated instances. The film likewise labels future days “Planned”; it does not claim the whole future calendar has already been generated.
- `backend/src/services/mobile/staffMobile.service.ts` scopes mobile tasks to the assigned staff member and current assignments.
- `backend/src/services/staff-notifications/policy.ts` defines a task-assigned notification. Native delivery still depends on device registration and platform configuration. Notifications in the animation are illustrative.
- `backend/src/controllers/attendance.controller.ts` requires a check-in photo and validates reported coordinates against the configured location radius, with a bounded accuracy allowance. The film says “Selfie captured”; it makes no biometric facial-recognition claim.
- `backend/src/cron/taskStatusCron.ts` and `backend/src/services/verification-v2/deadline.service.ts` distinguish missed work and work not completed in time. The film uses “Overdue” and “Not completed in time”; it does not invent a dedicated late-completion analytics metric. `lateMinutes` in the task start controller tracks start lateness.
- `backend/src/services/verification-v2/completion.service.ts` and the mobile workflow distinguish receipt of submitted evidence from final completion. The mobile scene says “Submitted / Awaiting verification.” The earlier automation overview explicitly states completion follows cleaning, photo submission, and review.

The source supports recurring task generation, but this review does not certify a deployed scheduler's uptime or delivery. Existing schedule-window and schedule-preview tests were run as a targeted check. No production database was changed or required for the video.

The film intentionally follows the requested planned positioning for AI, even though the repository contains verification infrastructure. It makes no AI accuracy, time-saving percentage, customer traction, autonomous approval, AI workforce optimization, or automatic reassignment claims. No backend or product frontend files were changed for this film.

## Visual direction and provenance

Palette: Hygene blue `#4264D9`, operational ink `#15233C`, ice `#F1F5FC`, mint `#DDF0E8`, white `#FFFFFF`, and amber `#996119`. Manrope carries product and editorial text; Geist Mono is used for player time. The signature sequence is a recurring calendar generating today's task cards and routing them to assigned employee phones. The same buildings, task titles, and staff recur across scenes.

Photograph attribution and font licenses are in `assets/credits.json` and the `assets/LICENSE-*.txt` files. Repository photographs are illustrative, not customer evidence. Music and interface cues are generated from original synthesis code in `make_audio.py`; no stock music was used.
