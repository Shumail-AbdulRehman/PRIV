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

## Specification27 independent rendered assessment

**Shared base shell visual gate passes for the captured scope.** Independently inspected all eight actual owner/manager1366/390 EN/UR base screenshots, all four phone menu screenshots, all four manager own-security boundary screenshots, all four Staff handoff screenshots and all four not-found screenshots from Agent A's guarded runtime. Compared shell composition with its matching approved owner/manager references and the independently rendered Team/Workforce references above. Evidence lives in `v5-shell-evidence/` after coordinator integration; the owner reference's Overview page content is deliberately not compared with actual Today content.

White224px desktop sidebar, blue selected route, actual company/principal identity,72px desktop topbar, readable type/spacing, grouped operational navigation, role-specific owner administration and phone RTL geometry are coherent. The phone300px Radix edge drawer shows visible focus and correctly mirrored close/navigation controls; the manager menu includes own-security and excludes owner management/billing. The owner's extra links make its drawer scroll; that is supported rather than clipping the footer. Actual EN/UR public boundary screens remain readable with empty credentials, honest unavailable Android distribution, working recovery destinations and no tenant content leakage.

Meaningful supported differences: prototype reviewer strip omitted; real data/identity replace samples; unified application navigation and owner Managers destination retain the existing operational contract; manager Settings leads to independent own-security because owner company settings remain denied; accessible Radix edge drawer replaces prototype details/popover navigation; mobile header hides redundant account identity to retain control space. These differences do not require another design or relaxed permissions. No significant base-shell visual blocker remains for Spec31 implementation to begin.

Functional geometry, Escape/focus return, Team navigation and role/API denials are reported passing by Agent A's two guarded browser cases; this QA inspected their screenshots/manifest but did not independently rerun those cases. The manifest reports zero page overflow/JavaScript errors for the eight role/viewport/language base observations. The generic dialog Urdu close-label/logical-position correction was directly inspected in all four settled final recaptures; its functional assertion is attributed to A's guarded runner. Page-specific V5 states and native/operator qualification are outside this shell conclusion.

Specification31 actual-app rendered review is pending the implementation output. Reference capture alone is not acceptance.

### Shared-target follow-up before final shell acceptance

Q27-01: source/readable capture review identified trailing shared language-button minimums38px desktop/44px phone, below the closed-system44/48px floor. Agent A was asked to measure and normalize the hit areas in its owned shared stylesheet and rerun the shell gate. This does not block the stable layout contract consumed by Workforce, but final Spec27 acceptance must record its resolution. Existing Staff handoff signout has44px phone minimum in the separately owned auth stylesheet; record or transfer this small Spec30 follow-up rather than silently treating screenshot legibility as full target-size acceptance.

Q27-02: the first generic localized-dialog screenshots showed table text through the panel during its opening fade. Requested settled opacity1/white-background assertion and screenshot animation completion, rather than changing implementation based on a transient capture. Agent A added those checks and is recapturing. These images assess shared close localization/position only; the old Team/dialog composition beneath them does not establish Spec31 V5 completion. Independently inspected all four lazy-resource-fault EN/UR desktop/phone captures: recoverable translated UI is clear and exposes no implementation internals. The resource fault is an explicitly labelled frontend fault injection, not a real provider/API outage. Independent PNG header check confirms all40 shell images have their named width and900px height.


Q27-02 resolved: directly re-inspected all four updated EN/UR1366/390 localized-dialog screenshots after the harness asserted opacity1, opaque white background and disabled screenshot animation. Modal content is now clean and fully readable; the original issue was capture timing. The translated close label and logical position are correct. A normalizes shared language controls to44px desktop/48px phone and the Staff handoff signout to48px phone through its owned shared stylesheet, preserving the separately owned auth file. The resulting73px border-inclusive topbar satisfies its72px minimum; updated phone header/handoff captures remain coherent. Final measured target-size assertions are A's functional evidence, not a screenshot-only inference.
