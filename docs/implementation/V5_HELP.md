# V5 Help and service information correction

Issue89; branch `implementation/v5-help-information`, based on dependency-complete
`16264ae`/PR87. The actual React routes now have distinct approved V5 compositions.
Spec38 remains **In progress** until all relevant states/configured-positive visual
acceptance are established. Whole-product V5 and spec40 remain incomplete.

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

Spec38 therefore remains **In progress**. Real approved commercial/legal facts,
mail delivery and Android/native qualification were unavailable and not activated.
This checkpoint implements and visually verifies the scoped public core; it does
not complete full V5 or qualification gates. No further UI group starts this session.
