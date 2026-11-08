# Billing implementation test contract — 2026-11-06

This is required future implementation coverage, not a report of application tests already run. Each numbered spec has the exact owning test path and package commands. Use the existing runners and mock only network/provider/clock boundaries. Do not add implementation-mirroring assertions, a second billing engine or visual snapshots as the only proof.

## Per-unit assertions

| Owner | Case | Given / action | Required result |
| --- | --- | --- | --- |
| 45 | C01 | Valid no-link owner lifecycle/catalog fixtures | Exact validated shape; explicit server permission false |
| 45 | C02 | Legacy payload missing new fields | Compatible read; no ready/resume permission inferred |
| 45 | C03 | String true, malformed ID, unsupported interval or malformed amount | Safe rejection/degradation, no actionable checkout |
| 45 | C04 | Supplied resume object inconsistent with required contract | No guessed ID, owner, plan or interval |
| 46 | C05 | Missing env/token, sandbox with live_, production with test_ | SDK fails before server checkout mutation |
| 46 | C06 | Two simultaneous getPaddle calls | Exactly one initialization/shared promise |
| 46 | C07 | Initialization rejects then explicit retry | Retry can succeed; no permanently rejected singleton |
| 46 | C08 | Subscribe/unsubscribe/repeated events | Current listeners receive once; cleaned listeners receive none |
| 47 | C09 | Setup/current/completed step variants | Correct current-step labels and keyboard-visible selection |
| 47 | C10 | Existing active subscriber layout | Settings navigation; zero onboarding confirmation steps |
| 47 | C11 | Every shell state, both languages | No Help/Contact/support/FAQ/mailto/# assistance action |
| 47 | C12 | Missing policy destinations | Omit links; do not render a dead # destination |
| 48 | C13 | /api request with nested path/query | Rewrite takes precedence and preserves intended Heroku API path/query |
| 48 | C14 | Unknown API/asset/deep app path | API not treated as SPA; existing asset404/deep-link fallback retained |
| 49 | C15 | ADMIN from companyA supplies companyB in body/query | Canonical ownerA only; strict purchase body rejects injected fields |
| 49 | C16 | Missing/disabled/invalid server config | Safe unready reason; zero provider create; no secret/raw payload |
| 49 | C17 | Unverified sandbox versus production owner | Sandbox checkout allowed; production verification gate still denies |
| 49 | C18 | Matching active/trialing subscription inside qualified window | workspaceAccessAllowed true |
| 49 | C19 | Null/reversed/future/expired period or effective cancellation/pause | workspaceAccessAllowed false despite active status |
| 49 | C20 | Wrong customer/tenant/catalog/company plan | workspaceAccessAllowed false, no cross-tenant resume |
| 49 | C21 | Inactive/suspended company with paid subscription | Operations remain restricted; safe billing/security facts retained |
| 49 | C22 | Matching RESERVED+READY audit, draft/no mirror yet | Resume exact server-saved transaction/plan/interval only |
| 49 | C23 | Paid/completed/billed/past_due/unknown/unresolved outcome | No new transaction or reopenable paid draft |
| 49 | C24 | Provider-confirmed canceled draft | Replacement follows existing reservation rule; no local expiry shortcut |
| 49 | C25 | Inactive product, wrong cycle/frequency/currency/amount/trial facts | Catalog fails safely rather than substitute local facts |
| 49 | C26 | Existing signed-byte/dedup/rollback/owner tests | Preserve all incumbent negative checks |
| 50 | C27 | Every lifecycle/read state fixture | One consistent view classification; stale/401/403 never ready |
| 50 | C28 | USD1234, JPY1234, three-decimal currency1234, zero | Correct exact minor-unit display; zero differs from unavailable |
| 50 | C29 | Annual amount, arbitrary trial frequency | Full provider annual amount/trial; no invented discount/7-day default |
| 50 | C30 | Usage exceeds capacity | Real counts preserved; visual meter alone may cap fill |
| 51 | C31 | Same company but different owner, or owner/company switch | Distinct keys; old private cache removed and requests aborted/ignored |
| 51 | C32 | Pending read then one5xx/network failure | Safe retained display; bounded polling can recover |
| 51 | C33 | Repeated error beyond2-minute automatic window | Stop automatic attempts; retain manual refresh path |
| 51 | C34 | 401/403, reconnect/focus and later successful refresh | Denied reads do not loop/purchase; permitted refresh recovers |
| 51 | C35 | Existing linked owner needs catalog read | Catalog is readable without checkout creation permission |
| 51 | C36 | Portal URL http/userinfo/port/foreign host | Reject before navigation; approved HTTPS Paddle hosts only |
| 52 | C37 | Empty fields, malformed email, short password | Existing inline validation, correct labels and no request |
| 52 | C38 | Slow signup + duplicate click + backend error | One mutation; disabled pending; draft preserved |
| 52 | C39 | Language switch after typing all four fields | Values and meaningful focus preserved, email/password LTR |
| 52 | C40 | sessionEstablished false after account persisted | Sign-in recovery, no fabricated auth or duplicate signup |
| 52 | C41 | Successful session and old-tenant cached data | Existing hook clears old cache, sets current owner, navigates choose-plan |
| 53 | C42 | SDK/config fails before POST | Exactly zero checkout requests/reservations |
| 53 | C43 | Rapid double action | Exactly one prepare and one selected transaction |
| 53 | C44 | Overlay closed or known open failure after preparation, then reopen | Fresh server-safe same transaction, no second POST |
| 53 | C45 | POST submitted but response lost/409 | Uncertain/status-first, no automatic mutation retry |
| 53 | C46 | Server already linked/restricted after initial render | Fresh check prevents stale purchase |
| 53 | C47 | Wrong transaction event or old owner callback | Ignored; no ready/overlay/navigation for new principal |
| 53 | C48 | Actual completed/closed event for current transaction | Refresh current owner facts; no direct paid flag |
| 53 | C49 | Known server draft after reload | Exact resume; URL/localStorage provider ID ignored |
| 54 | C50 | All/partial/missing combinations | Display real choices/disabled availability, never sample prices |
| 54 | C51 | Native radio/interval keyboard action | Checked state, accessible units and selected continuation update |
| 54 | C52 | Unavailable then retry | Selection retained; focus moves to selected radio; status announced |
| 54 | C53 | Saved unresolved checkout versus changed URL selection | Server selection wins; no new price request |
| 55 | C54 | Plan/year/currency selected | Order summary matches exact recurring amount, not made-up due-today |
| 55 | C55 | Validated sandbox versus production/mismatch | Test card instructions only in matched sandbox |
| 55 | C56 | Missing/stale/uncertain price/action | No enabled new payment; no custom card/address inputs |
| 55 | C57 | Close payment, language change, reopen | Selection preserved; controller invoked safely |
| 56 | C58 | Return URL/completed SDK event but permission false | Pending/refresh, zero workspace or new-payment action |
| 56 | C59 | Current server permission true and correct company | Ready state; Open workspace navigates dashboard |
| 56 | C60 | Active label with false/missing/future/foreign server facts | Never ready; show correct recoverable/restricted state |
| 56 | C61 | Delayed webhook/read error then manual success | Progress recovers without another card entry |
| 57 | C62 | Linked canceled/past-due/unknown owner | Existing settings/portal; no new subscription purchase |
| 57 | C63 | No real catalog price/date | Explicit unavailable/portal context, no sample amount/date |
| 57 | C64 | Real over-limit counts and Urdu ratios | Exact numbers and correct LTR isolation; data preserved |
| 57 | C65 | Successful/failed/late portal request | One fresh allowed navigation; no stored bearer URL or stale actor action |
| 58 | C66 | Known pre-submit error versus unknown submitted payment | Retry only in known case; unknown has status-first action |
| 58 | C67 | Restricted/denied account | Neutral self-service security/refresh/sign-in, no Help/Contact promise |
| 59 | C68 | Guest loading versus confirmed owner session | No premature login bounce or role bypass |
| 59 | C69 | New owner/linked owner/deep-link/welcome | Correct screen/compatible alias; query alone never activates |
| 59 | C70 | Forced password reset | Own-security enforcement wins over billing navigation |
| 59 | C71 | Manager/staff and historical subscriber read policy | Existing role/access semantics retained; no new owner checkout |
| 59 | C72 | Owner access gate loading/error/restricted | Billing/security/refresh reachable; Help/Contact absent |
| 60 | C73 | Two concurrent real-SQL checkouts | Actual lock/audit state permits exactly one provider draft |
| 60 | C74 | Lost response then later provider reconciliation | Saved exact transaction resumes after a fresh service read |
| 60 | C75 | Duplicate/older/early event, rollback and foreign customer | Ordered/idempotent canonical persistence; no false access |
| 60 | C76 | Qualified current period versus future/expired/suspended | Fresh service permission agrees with real persisted policy |

## Browser contract

Spec62 owns the single30-flow browser table and all browser-test changes. Every row maps to a named test; one test may prove more than one row only when its assertions establish each. Use the existing guarded real signup/session/database harness. Provider SDK/API responses used to exercise checkout are explicitly fixture boundaries, not proof that a real server/provider purchase occurred. Actual SQL guarantees are proved by spec60 and actual provider acceptance below.

Run representative layouts at320/390/768/1366/1440 CSS px, both languages; check the six screens and loading/unavailable/closed/decline/uncertain/pending/ready/restricted states. Test visible keyboard focus, native radio arrows, language preservation, modal Escape/focus, and reduced motion. Check200% native browser zoom when supported; report unsupported evidence rather than call a683px viewport zoom. No horizontal body overflow, clipped action or sticky control covering content.

## External sandbox acceptance — spec63 only

| Check | Required evidence |
| --- | --- |
| Revisions/config | Netlify build + Heroku release match candidate; matching sandbox/token family/enabled/catalog/default link/webhook validation, no secret values |
| First-party session | Signup Set-Cookie stored; authenticated current-user survives reload/sign-in under normal and blocked-third-party-cookie browser settings |
| Plan and card | Actual provider prices/interval/trial/card policy; new synthetic owner reaches real Paddle sandbox and enters official test card |
| Activation | Signed real delivery accepted; persisted canonical customer/subscription/effective period; lifecycle permission and real workspace entry agree |
| Retry/resume | Close/reload/reopen exact draft; late/unknown outcome does not create another provider transaction/subscription |
| Existing subscriber | Settings/portal work; no second-purchase or Help/Contact entry point |

Do not run this external matrix with real-money production configuration. Missing operator access, wrong provider trial/card configuration or a failed cookie path remains an explicit incomplete gate; green mocked UI tests cannot close it.

## What is already verified during planning

Only the amended static prototype:26 local EN/UR/width/state checks, no help/contact elements/copy, no overflow/browser errors, checkout illustration still opens/closes. The implementation suites above have not been run against code that does not yet exist.
