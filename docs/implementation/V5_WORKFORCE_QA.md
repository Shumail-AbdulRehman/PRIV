# Independent V5 Team and Workforce visual QA — 2026-10-26

Scope: Specification27 shared-shell gate followed by Specification31 Team, Staff Detail and workforce interfaces. QA worktree `/tmp/hygene-v5-qa-20261026`, branch `verification/v5-team-workforce`, baseline `d2c426b`. Application source is read-only; this agent owns only this report and `v5-workforce-qa-evidence/`. Coordinator owns integrated verification, progress and handoff.

## Reference provenance

Opened the actual immutable `design/v5/team.html` and `workforce.html` through an exclusive loopback static server5197, Google Chrome and Playwright.38 independent viewport PNGs cover1366×900 and390×900, English/Urdu: Team register, inline Team hire, owner and manager workforce composition, staff-access dialog, transfer dialog, manager-handover dialog workforce hire dialog, scrolled Team directory and mobile navigation. Fresh browser contexts, fonts settled and reduced motion requested. The reference manifest records dimensions, language, heading, direction, shell/dialog rectangles, overflow and JavaScript errors. All38 observations have zero page overflow and JavaScript errors.

`team.html` loads `legacy.js`, `app.js` and `bridge.js`; the retained Team renderer is in `legacy.js`. `workforce.html` loads `journeys.js` and `journeys.css`. These are distinct visual surfaces. Unused functions in other scripts are not the rendered source of truth.

Team reference:30px heading, blue primary hire action, four-cell summary strip (two columns on phone), bordered directory panel with search and staff identity/site/shift/state/work columns, inline hire panel with persistent field labels. Workforce reference: main staff access/transfer panel plus an owner Manager assignments rail and safe-offboarding guidance; manager variant exposes assigned-site permissions. Modals have clear title/identity, persistent fields, reason, safety notice and cancel/submit actions with blue focus.

Prototype reviewer bars, role-preview selectors, fictional identities/counts, decision links, illustrative history and simulated mutation receipts must not ship. Both prototypes use224px desktop sidebar and72px topbar. Desktop content padding differs slightly between retained Team and journeys Workforce; the existing documented unified application shell is acceptable if role boundaries and operational destinations remain correct.

## Supported deviations established before implementation

- Legacy Team's View details reveals only the placeholder “Selected staff details appear here in the production app.” It does not define a complete Staff Detail layout. Preserve actual record/history functionality and apply V5 typography, tokens, profile/panel/rail hierarchy; do not claim pixel parity with a nonexistent detail prototype.
- Existing directory contract does not provide daily attendance/task totals. Show honest persisted directory metrics and columns instead of fabricated checked-in/submitted figures. Active login access must not be labelled today's attendance.
- Real credential handoff, accountable deactivation/archive, compare-and-set transfer and two-step manager release/assignment controls supersede the prototype's illustrative mutation controls. Retained history and server authorization remain authoritative.
- No positive operator/browser-provider qualification or native acceptance can follow from web screenshots. External mail/photo/Paddle/operator/device/release blockers remain outside this scoped evidence.

## Application provenance and current gate

Coordinator reports existing port8080 serves a different checkout; no5173 server was present at session start. Neither is a QA target. Current actual-app renders must use the coordinator's compatible compiled revision, private web/API runtime and migrated disposable synthetic SQL child database under the explicitly owned local test cluster. No restored customer/production database, auth bypass or fake operator session is authorized.

Specification27 fresh paired visual review is pending Agent A's guarded captures. Specification31 source edits wait for the coordinator's prerequisite decision. Reference capture alone is not application acceptance.
