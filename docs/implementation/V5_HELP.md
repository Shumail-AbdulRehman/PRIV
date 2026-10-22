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

Screenshots and final inspected results are recorded in `v5-help-evidence/` after
the coordinator's guarded run. The source-worktree unit/config seams are not live
mail delivery, approved legal content, Android-device or production qualification.
Those externally unavailable configured-positive states remain explicitly unverified.
