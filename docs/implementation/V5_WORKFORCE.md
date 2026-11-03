# V5 Team, Workforce and Attendance checkpoint — 2026-10-28

Specs **27, 29 and 31 meet their applicable web acceptance criteria**. Full V5, native/provider qualification, Spec40 and final release certification remain incomplete. The combined tracker has31Done (including decision00),10In progress and1Not started:11specs remain.

## Delivered in the application

- Shared shell: translated logical dialog Close controls,44px desktop/48px phone targets, verified owner/manager navigation, focus, denial, staff handoff and safe recovery.
- Team: four supported directory metrics, real search/location filters, inline hiring, reusable name/contact/shift editing, separate empty/no-match/error/loading states and preserved drafts.
- Staff Detail: V5 profile, applied date filters, real execution counts, translated reports/charts, schedule/task/attendance tabs and a persistent phone Attendance context action.
- Workforce: reasoned transfer, deactivation/archive and current-password one-use recovery; actual conflict/context refresh, scoped draft/secret isolation, owner manager assignment editing and explicit release-then-assign handover. No general restore or manager/owner password reset was added.
- Attendance: V5 register/filter/summary/mobile layout; existing authorized location/from/to API contract; retained secondary month/staff/quick filters; site calendar and explicit timezone fallback.
- Context: original captured facts and protected-photo availability remain separate from attributed immutable notes/history, acknowledgements, exact retries and explicit409review.

## Reference fidelity and accepted differences

Actual approved TeamHTML uses legacy.js/app.js/bridge.js; Workforce and Attendance-case use journeys.js/css. Team's daily attendance/task metrics are unavailable in the directory API, so real active/assigned/location/unassigned counts replace fictional totals. Staff Detail is a placeholder destination in the prototype: its production composition follows V5 conventions and preserves real reports/history. Managers remains the real owner assignment destination. Attendance context retains the existing accessible dialog rather than adding a new route; its facts/history/editor hierarchy and phone stack follow V5. Secondary working filters and necessary policy/attribution text add height. Reviewer bars, fake identities, sample mutations and unsupported policies never ship.

Paired reference/application evidence uses1366×900 and390×900 EN/UR; supplemental full-page files support lower-content inspection. Every filename width was checked. The independent QA agent supplied reference captures and initial findings; after its usage limit, the coordinator inspected corrected final screens and closed the recorded findings. Final review must not be attributed to that agent.

## Verification

- Current whole web: **64Node +274React tests /21files**, no failures. Full frontend lint0; frontend, backend and browser TypeScript plus production builds pass.
- Focused Staff tests34; Attendance tests20. Final changed-page/context checks27 and translated-copy checks8 pass; these overlap earlier counts.
- Relevant backend workforce/credential/history authorization:48tests /3files. Actual isolated workforce lifecycle and credential SQL proofs pass, including races, open-shift denial, historical rows, session/push epochs, one-use consumption and secret-free audit.
- **33-case integrated milestone passed in3.0minutes** across actual React/API/disposable SQL. Covers persisted hire/edit, transfer/offboarding/recovery/handover, notes/history, registration destination, settings conflicts, role/site/tenant denial, suspension, billing/support safe states and session recovery.
- After the final layout correction,7rendered cases passed in2.6minutes. The subsequent state run passed7cases and exposed a mobile context action inside collapsed fields; that source issue was fixed and2focused cases passed in1.5minutes. The genuine409review case additionally passed independently on Spec29's branch. These are overlapping scoped runs, not a claim of a single complete whole-product suite.
- Real capacity403/noinsert and preserved draft are distinct from the successful hire fixture with available quota. Quota/provider guards were retained. The conflicting annotation request is created through a real authorized API call before forwarding the browser request; no positive HTTP response is replaced. Loading forwards actual reads; network/chunk aborts are labelled frontend fault seams.
- Spec validator:42specs,0errors,12previously documented warnings. Mechanical UI detector returns[]. No native or provider success is inferred.

## Provenance and Git safety

Started at dependency-complete d2c426b on implementation/v5-parallel-final, including the latest Settings/Help checkpoint. User stopped agents26Oct and resumed28Oct; the environment removed uncommitted /tmp worktrees. Committed QA inputs survived. Reconstructed source was committed early in persistent worktrees under `/home/shumail/.local/share/hygene-ops/v5-worktrees-20261028/`.

The coordinator owns shared records and final integration. Shell, Workforce and Attendance have separate review branches; source and rendered checks establish the actual dependency contracts. Existing draft stacks remain unmerged. Root's9original tracked modifications and unrelated untracked design/skills/performance/investor inputs were preserved; hashes/patch are saved in the persistent parent directory. No blanket staging, reset, force push, schema migration or production operation.

Existing8080serves a different checkout (`/home/shumail/bk-Priv/PRIV/backend/dist/app.js`) and was left untouched. Tests used a freshly initialized owned PostgreSQL17 cluster, loopback56442,18existing migrations in disposable UUID child databases, matched backend/frontend revisions, sanitized environment and private web assets. No production/restored customer database was used. Device enumeration on28Oct found0devices.

## Remaining scope

Next eligible work is Spec28: setup/location composition and careful reconciliation of the user's Dashboard/performance work. Specs30/32 depend on28. Broader review/account/help states, operator identity, qualified photo processing/privacy, Paddle, delivered owner email, approved legal/support/distribution facts, physical Android and production infrastructure/backup certification remain incomplete or externally blocked. Spec41 remains ineligible while40is incomplete.

Evidence and detail: V5_WORKFORCE_QA.md, V5_ATTENDANCE_QA.md; v5-shell-evidence, v5-workforce-evidence and v5-attendance-evidence manifests. Passing this batch does not certify all V5 pages or a production release.

## Published review checkpoint

OPEN/DRAFT [PR92](https://github.com/Shumail-AbdulRehman/PRIV/pull/92), [PR93](https://github.com/Shumail-AbdulRehman/PRIV/pull/93) and [PR94](https://github.com/Shumail-AbdulRehman/PRIV/pull/94). Attendance and Workforce are independent siblings on the accepted shared shell. Independent Attendance409case and scoped Workforce production build pass. Existing drafts remain unmerged. Combined source/handoff is preserved separately so future work starts from both siblings.
