# Independent V5 Attendance visual QA — 2026-10-28

Scope: reopened Specification29 Attendance register and exception-context presentation, after the fresh Specification27 shell gate. Persistent QA worktree `v5-worktrees-20261028/qa`, branch `verification/v5-team-workforce`. Application source stays read-only; coordinator owns progress and integrated acceptance.

## Approved reference evidence

Opened actual immutable `design/v5/attendance.html` and `attendance-case.html` through an exclusive loopback5197 static server, Google Chrome/Playwright.24 viewport PNGs cover1366×900 and390×900 EN/UR: register base, scrolled records, protected-photo notice, follow-up base, lower context form and illustrative attributed history. No page overflow or JavaScript errors in any reference observation. `v5-attendance-qa-evidence/reference-manifest.json` records dimensions, language, direction, bounds and scroll state; `reference-sources.json` hashes the11 loaded HTML/CSS/JS files.

`attendance.html` uses retained `legacy.js`, with `app.js`/`bridge.js` shared tooling; `attendance-case.html` uses `journeys.js`/`journeys.css`. Unused renderer functions are not the visual source. Directly inspected EN/UR desktop/phone base pairs, records/photo and lower form/history states. Prototype records/notes are fictional, including the explicitly synthetic note entered only in the offline reference.

## Concrete implementation guidance

Register:30px heading and purpose; one bordered filter panel with location/from/to/apply, applied scope/timezone and Today; four-cell summary strip adapting to two columns on phone; a bordered record panel with clear identity, expected shift, captured check-in, status, protected evidence and next actions. Phone rows become readable labelled summaries; no page overflow or horizontally compressed controls. The bridge's “Open attendance follow-up sample” shortcut and reviewer bar are prototype navigation and do not ship.

Follow-up reference: full-page desktop split, original immutable attendance facts and follow-up history in the main column, Add context form in a narrower rail. Phone order is original facts, history, then form. Actual existing AttendanceContext is a record-scoped dialog consumed by both Attendance and Staff Detail; retain that functional entry and faithfully apply the flat facts/history/form hierarchy within the existing dialog rather than create another modal system or new unsupported route. Record the dialog/full-page difference explicitly. Retain real note/acknowledgement, attributed chronology, strict reason, exact-request retry, conflict draft, protected evidence and server denial contracts.

Do not fabricate scheduled/checked-in/late/checked-out denominators. Metrics must derive from the actual filtered complete dataset, with unavailable/loaded-subset limits named where necessary. Preserve captured times/status, local scheduled day and historical site authorization; a context note never edits paid hours, check-in/out or evidence. Distinguish missing/restricted/unavailable photos and avoid claiming an actual selfie render from the prototype's photo notice. Full retained-media provider qualification remains separate.

Use existing approved blue/white tokens,44px desktop/48px phone actions, persistent labels, visible focus, logical RTL and LTR-isolated dates/IDs. Shared shell correction is already verified separately; do not reaccept whole page functionality from a sidebar screenshot.

## Current application verification

Pending Agent A's scoped implementation and coordinator's matching compiled React/API/disposable synthetic SQL captures. Reference generation is not application acceptance. No production/restored database, real provider activation, native acceptance or synthetic positive operator session is part of this QA.
