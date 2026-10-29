# V5 Help and service information correction

Issue89; branch `implementation/v5-help-information`, based on dependency-complete
`16264ae`/PR87. The actual React routes now have distinct approved V5 compositions.
This original checkpoint was **In progress** until relevant web states and
configured rendering were verified. The single-spec continuation below records
the latest work. Whole-product V5 and spec40 remain incomplete.

**Current status: Spec38 Done for its approved web implementation contract.**
Unavailable configuration is an implemented scope branch, not a claim of live
service qualification. Real recipient/legal/distribution approval remains a
separate release gate; default purchases/services stay unavailable.

## Actual application behavior

- `/help`: blue/white brand/language header, contact and common-question panels,
  recovery/service-information rail, truthful photo and Android guidance. FAQ
  disclosure, recovery navigation and the dedicated information link work.
- `/service-information`: approved centered public brand/card foundation using
  existing AuthShell, with real configured service/privacy/closure documents or
  explicit unavailability; truthful support, photos and distribution information.
- Both routes remain outside tenant App bootstrap. Public and restricted-account
  visitors can obtain assistance without protected tenant requests. The unrelated
  marketing navbar/footer no longer appears on these two routes. Marketing pages
  and PublicLayout remain unchanged.
- Existing `useServiceInformation`, credential-free/no-store `/api/support/contact`,
  safe configured email and origin-pinned approved legal/distribution guards remain
  authoritative. Failed requests offer retry; contact loading leaves help usable.
  A fetching/error response never presents stale contact as ready.
- No ticket form/backend, sample acknowledgement, fake message delivery, prototype
  identity, policy claim or production configuration was introduced. Mailto means
  opening an email client; it never confirms receipt or delivery.
- Complete new EN/UR copy and structural RTL; semantic tokens, approved Inter/Arabic
  font foundation, mobile stacking and44/48px action targets are reused.

## Comparison and intentional differences

Actual `help.html`/`information.html` load `journeys.js` and `journeys.css`; these
rendered pages, rather than unused functions in another prototype script, are the
reference. No design file or standalone prototype changed.

V5 help has a fictional company sidebar/account identity. Public help cannot invent
that identity or require tenant authorization merely to reproduce a reference rail.
The actual public header uses BrandLogo/LanguageChoice and the approved split panels.
The semantic heading remains “Help & service information” for existing restricted
account navigation/regression compatibility (V5 says “Help & support”). Prototype
support-preview form is replaced by the actual configured mailbox handoff or honest
unavailability; there is no support-ticket endpoint in approved spec38. Existing
photo/distribution guidance adds real information absent from the shorter reference.

V5 information's centered card is retained. Its policy placeholders/decision IDs
become actual guarded facts and approved documents; reviewer links and fictional
approval promises do not ship. Required truthful photo/support/distribution copy
makes the real card longer than the reference. This is content expansion within
the approved layout, not invented legal/provider functionality.

## Verification

Independent source-worktree commands:

- `npm run test:components --prefix frontend -- src/pages/Help/HelpPage.test.tsx`:
  **20passed**, including real request options, retry, pending state, safe/unsafe
  links, unavailable facts, distinct service route, FAQ/recovery and EN/UR.
- `npm test --prefix frontend`: **64Node +239React/19files**, zero failures/skips.
- `npm run lint --prefix frontend`: **0findings**.
- `npm run build --prefix frontend`: frontend TypeScript and Vite production build
  **pass**; existing nonblocking plugin-timing advisory only.
- `frontend/node_modules/.bin/tsc -p frontend/e2e/tsconfig.json`: **pass**.
- Impeccable detector over HelpPage/help.css/serviceTranslations: `[]`.

An initial ad-hoc NodeNext browser-type invocation was incompatible with the
existing bundler-based e2e project and reported module resolution errors. The actual
committed e2e/tsconfig check above passes; no source exception or disabled check.

The coordinator owns the real-backend/disposable-SQL render run and final evidence
integration. `frontend/e2e/help-v5.spec.ts` captures matching1366×900/390×900 EN/UR
actual/reference pages, FAQ state, delayed-forwarded actual support loading and an
explicitly aborted network-error/retry state. It verifies public-only API access,
real configured-unavailable200 responses, navigation, RTL and zero horizontal
overscroll/JS errors. Traces/video/automatic failure screenshots are disabled.

Screenshots and final inspected results are recorded in `v5-help-evidence/`. The source-worktree unit/config seams are not live
mail delivery, approved legal content, Android-device or production qualification.
Those externally unavailable configured-positive states remain explicitly unverified.


## Final integrated visual checkpoint

The coordinator integrated source944186b with independent Organization/Settings at
`5acdf6a` in `/tmp/hygene-v5-integrated`, then ran the existing guarded real-API/SQL
browser harness: **21cases passed in52.2s**, including both Help cases. Matching
frontend/backend were built privately against a fresh migrated synthetic disposable
DB. The integrated whole frontend passes **64Node+245React**, full lint, TypeScript
and production build. Agent B's independent source-worktree count remains239React;
the higher integrated count includes the other parallel implementation.

**22PNGs +8base observations** are in [the evidence index](v5-help-evidence/README.md):
16paired base captures,4FAQ captures and2loading/network-error captures. No base
horizontal overflow or JavaScript errors; only credential-free public support API
requests occur. Actual support200unavailable facts, real loading-forward, explicit
network-abort/retry, native FAQ and recovery/information navigation pass. No network
response replaced for the base screenshots. No saved credentials/traces/video.

Agent B directly inspected Help1366EN/ref, Information390UR/ref, Information1366EN,
Help390UR and network-error390EN. The coordinator and independent Agent C reviewed
all8base variants and representative interactions/states. No significant clipping,
reading or core-composition issue remains in the current matrix. Blue/white panels,
Inter/Arabic hierarchy, split/stack geometry, centered public card and RTL are
visually verified within the intentional content/audience differences above.

| Page/state | Functional implementation | Visual implementation | Functional verification | Visual verification |
|---|---|---|---|---|
| Public Help, unavailable support, EN/UR1366/390 | Implemented | V5 core with documented public/header/title differences | Actual support API/navigation/FAQ pass | Paired reviewed; no significant issue |
| Public Service information, unconfigured facts, EN/UR1366/390 | Implemented | Approved centered card, expanded truthful copy | Actual support/guarded facts/navigation pass | Paired reviewed; no significant issue |
| Help loading and network-error/retry390EN | Implemented | Readable within panels | Actual delayed-forward plus explicitly aborted network seam/retry pass | Captures inspected |
| Approved-positive mailbox/documents/Android | Existing guards preserved | Implemented conditional links |20focused unit/config seam checks include safe/unsafe links | **Unverified with live approved configuration** |

At that historical checkpoint Spec38 remained **In progress**. Real approved commercial/legal facts,
mail delivery and Android/native qualification were unavailable and not activated.
This checkpoint implements and visually verifies the scoped public core; it does
not complete full V5 or qualification gates. No further UI group starts this session.

## Single-spec completion — 2026-10-29

Branch `implementation/spec-38-public-information`, base2011a90, issue89. Completed
only38; dependencies25/27 verified Done and actual source present. Existing public
Help/AuthShell/routes, query client, support contract and semantic tokens are reused.

Changes:10-second contact timeout with propagated cancellation and timer/listener
cleanup; distinct EN/UR policy link accessible names; busy retry disabled;44/48px
language controls; aligned support action/email; route scroll reset/main focus, preserving existing Android-help fragments.
Shared AuthShell title handling already worked and was regression-tested. The
unchanged whole-suite parity test exposed ten missing shared web Urdu entries;
copied existing native translations without changing any native behavior/test.

Fresh checks:

- `npm run test:components --prefix frontend -- src/pages/Help/HelpPage.test.tsx src/pages/Subscription/SubscriptionPage.test.tsx --maxWorkers=1`:64pass.
  Final focused run includes32Help and32billing cases; earlier Help-only31pass was before the added Android-fragment regression.
- `npm run test:unit --prefix frontend`:64pass. Whole
  `npm run test:components --prefix frontend -- --maxWorkers=1`:372pass/28files,
  225.57s. Together these are the complete436-test frontend suite; zero failures/skips.
- `DATABASE_URL=postgresql://spec38_unit@127.0.0.1:65432/spec38_nonexistent npm test --prefix backend -- src/services/platformSupport.service.test.ts src/services/billingLifecycle.service.test.ts --maxWorkers=1`:110pass/2files.
  Injected persistence/provider boundaries; no SQL integration or full backend claim.
- `npm run lint --prefix frontend`:0findings. Frontend TypeScript and exact
  `npm run build --prefix frontend -- --outDir /home/shumail/.local/share/hygene-ops/v5-spec38-20261029/verified-web`
  pass; final Vite40.53s with existing non-failing plugin-timing advisory.
- `backend/node_modules/.bin/tsx docs/implementation/v5-help-evidence/capture-spec38.mjs`:
  final18observations/34PNGs pass. Actual compiled React and actual public Express
  router/service; no database, base-response replacement or external service call.
  Env-file loading disabled; configured `.invalid` links/contact are explicit fixtures.
- Spec validator:42specifications/0errors/10existing documented warnings.
  Whitespace check passes. Mechanical design detector returned no findings; rendered
  inspection remains the visual evidence.

| Acceptance fact | Verified result |
|---|---|
| Functional implementation | Existing conditional contact/policy/distribution and purchase guards retained; timeout/cancellation/navigation/accessibility completed |
| Visual implementation | V5 split Help and centered information compositions, semantic blue/white typography/spacing, responsive RTL |
| Functional verification |64focused/436whole web;110backend; real public-route facts/no-store/cookie omission, FAQ/navigation/focus/retry; no tenant bootstrap |
| Visual verification |16base app renders plus8matching references,4FAQ and6phone state PNGs; all34inspected at1366×900/390×900 EN/UR |

The previously documented public shell/no fictional identity/no pretend ticket
form and expanded truthful copy are intentional scope-driven deviations. New
inspection fixed a contact alignment specificity issue and a focused old link
appearing mid-page after navigation. Final rerenders confirm those fixes; no
horizontal overflow or page JavaScript errors. Changed-state captures were viewed
again; unchanged source/render images were hash-compared. Evidence includes source
and PNG dimension/SHA256 provenance in `spec38-final/`.

Initial failed runs are retained privately: baseline vocabulary parity mismatch;
capture cwd/Babel resolution and Express absolute-path handling; unsupported
Testing Library `exact` option. One parallel build was interrupted with exit143;
the later exact final build passes. No security behavior was weakened for a check.

**Live approval/delivery and release remain unverified.** No real mailbox was
qualified, legal contents approved, Android artifact downloaded/signed/installed,
Paddle activated, photo provider qualified or native device exercised. These are
existing39/40release gates; missing facts keep actual services/purchases unavailable.
Spec30 remains Blocked. No backend/schema/package/design/production data change.
Six specifications remain; next dependency-eligible task is36, identified only.

Published implementation36fd568 in OPEN/DRAFT
[PR103](https://github.com/Shumail-AbdulRehman/PRIV/pull/103), based on the verified
Spec30handoff branch/2011a90. Issue89remains open for human review; no merge or
production deployment. Final publication documentation follows the source commit.

## Single-spec continuation — 2026-10-29

Baseline `2011a90` preserves accepted implementation and the blocked Spec30 handoff.
Branch `implementation/spec-38-public-information` reuses issue89; only38 is selected.
Dependencies25/27 are Done and actual public contact/shell/route sources are present.
The approved scope explicitly includes unavailable support/legal/distribution states.
Conditional web behavior can be verified without approving a mailbox, inventing
legal text, delivering email or qualifying Android. Actual publication/provider/
device facts stay unverified in39/40. Spec30 remains Blocked and unchanged.

Scoped changes:

- Bound public support reads to10seconds with query cancellation and cleanup;
  stalled connections reach localized retry instead of permanent loading.
- Give policy links distinct EN/UR accessible names, retaining the V5 visible label
  and pinned-origin/approval guards. Prevent duplicate retry while fetching.
- Apply the intended44px/48px language targets and align support labels/email in
  both directions; existing selectors were losing precedence.
- Reset scroll and focus new main content between the public surfaces. State
  captures exposed retained scroll and an old focused link. Language changes and
  data refresh do not reset scroll. AuthShell already sets the title; test it.
- Synchronize ten existing native Urdu entries into the owned shared web dictionary.
  The unchanged parity test exposed this baseline mismatch. No native behavior or
  test exception was added.

No backend, migration, package, tenant authorization, billing policy, design or
production configuration changed. No other specification implementation started.
