# V5 Team and Workforce continuation — 2026-10-28

Status: current implementation/verification in progress; no full V5 acceptance.

## Source and ownership

Latest dependency-complete base `d2c426b`, root branch `implementation/v5-parallel-final`; includes latest Settings/Help sibling corrections. Current inspected tracker:42specs,28Done (00–26,39),13In progress (27–38,40),41Not started. Historical UI completions were reopened for V5 acceptance.

Persistent isolated worktrees are under `/home/shumail/.local/share/hygene-ops/v5-worktrees-20261028/`: coordinator (`implementation/v5-workforce-checkpoint`), shell (`implementation/v5-shell-acceptance`), workforce (`implementation/v5-team-workforce`), qa (`verification/v5-team-workforce`). A owns27sharedshell, B owns31Staff/Managers/dictionary, C source-read-only report/reference evidence; coordinator owns shared records and workforce integrated browser harness. Existing issues35/65 and historical drafts retained, never merged.

User stopped all agents26Oct, then resumed28Oct. Environment removed /tmp worktrees and uncommitted implementation while stopped. QA commits313a10b through b7b2b49 survived; db6f10a records historical-only limits and revalidates38referencePNGdimensions/11sourcehashes. A/B reconstruct in persistent worktrees and commit early. No old app screenshots/tests are current acceptance until rerun. Original9rootdirtytracked files/untracked work preserved; persistent hashes/patch in parent directory. No root blanket staging.

## Dependencies and runtime

Backend11cf25742 and composedcredential17/26at7368750 are actual baseancestors. Existing27shell source/basevisual contract already available; A completes fresh shared27acceptance before dependent31canbe fullyaccepted. No dependency bypass or extraedge.28/29 eligibleafter27;32 depends28.40 and41 remain incomplete/ineligible.

Current8080serves **different checkout** `/home/shumail/bk-Priv/PRIV/backend/dist/app.js`; left untouched and never tested. No5173. Frontenddefault `/api`, devproxy8080 would mismatch. Owned freshPG17 cluster under persistent `runtime/data`, loopback56442 bootstrap `priv_e2e_test`; existing guardedrunner migrates18SQLfiles intoUUIDchildDBs and builds matchedsource API/frontend with dynamicexplicit API URL/privatewebassets and sanitizedenv. Dedicated `hygene_workforce_test` independently migrated for SQLproofs. No production/restoredcustomer data,provideractivation,secret/traces/authstate/credentialpixels in artifacts.

## Reference truth and deviations

TeamHTML loads legacy.js/app.js/bridge.js; Workforce loads journeys.js/css. Teamhas4summarycells,expandableinlinehire,filterabledirectory. ActualstaffAPI returns activeaccountsonly and lacks dailyattendance/taskcounts; use supportedactive/assigned/location/unassigneddirectorymetrics. Never invent inactivefilter/dailytotals. Prototype staffdetail is explicitly aplaceholder; realdetailinherits approvedV5 conventions with actualreports/history/schedule/evidence, not pixelparity against nonexistentdetail. Managerhandover retains explicit deactivate/release then active replacementassignment; no fakeatomictransition or managerpasswordreset.

## Current evidence

Pending reconstructed-source checks and rendered integration. Prior26Oct48focusedbackend and lifecycle/credentialSQL passes are historical; rerun results follow. SourceQArefs remain valid by hashes. Full31acceptance not claimed.

## External blockers

OperatorIdP/MFA,qualifiedphoto/privacy,Paddle,deliveredowneremail/validissuedlinks,approvedlegal/support/distribution,productioninfrastructure/backup and actualAndroidremain unqualified/unavailable. BrowserSQLcannot qualify providers/native. These do not block supportedworkforcewebUI.
