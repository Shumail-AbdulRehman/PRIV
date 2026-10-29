# V5 Organization and Settings correction — 2026-10-22

Correction issue: [88](https://github.com/Shumail-AbdulRehman/PRIV/issues/88). Base16264ae preserves the completed shared-shell, Photo Reviews and customer-authentication stack. Worktree `/tmp/hygene-v5-settings`, branch `implementation/v5-organization-settings`. The coordinating agent integrates this with the independent Help correction; no other V5 group is started before the requested checkpoint.

The approved rendered reference is `design/v5/settings.html`, `journeys.js` functions `settings()` and `security(false)`, and `journeys.css`. This correction changes the actual React `/settings` route in `AccountPages.tsx`; it creates no prototype and changes no backend, schema, dependency or production configuration.

## Implemented behavior

- Settings heading, Organization/My account/Security navigation, organization form with protected-information rail, account facts, and password/session-security split use the approved blue/white workspace. Desktop uses a300px rail;900px stacks panels;390px has full-width controls and wrapping profile facts. Existing shared sidebar, topbar, language control, Button/Input and semantic tokens are reused.
- Section selection is shareable through `/settings?section=account` and `?section=security`; back/forward navigation works through React Router. The organization draft remains mounted across section changes. Password fields are unmounted on leaving Security; credentials are never browser-persisted.
- Organization reads actual `GET /company/settings` and saves strict `{name,expectedVersion}` through `PATCH /company/settings`. Whitespace-only names are rejected before mutation. Persisted feedback appears after the response; pending submission is disabled.409 keeps the draft and saved facts; explicit successful refresh replaces the draft and consumes the newly returned version. Failed reloads leave the draft mounted. Existing name-only backend validation and owner-only business authorization remain authoritative.
- My account shows the authenticated principal's real name, role and LTR-isolated email. Existing principal-keyed `/owner-identity/status` and current-password `/owner-identity/email/request` live in this section. Loading/retry, verified/unverified, unconfigured sender, legacy enrollment and delivery-unconfirmed receipts remain truthful.
- Security embeds the existing password form and `POST /common/security/password` with current password, confirmation and existing8-character/72-UTF-8-byte rules. Success reuses the existing volatile-link discard, Redux identity clear, full query-cache clear and sign-in notice. Existing standalone `/account/security` and forced-password path are unchanged and remain available independently of company operational/billing restrictions.
- Complete section/form/status vocabulary is translated in `accountTranslations.ts`. Urdu inherits document RTL and Arabic typography; email/password inputs remain LTR. No user-provided names or email addresses are rewritten.

## Contract-driven differences from the prototype

1. The operational-contact field and contact-change dialog are omitted because approved spec22 explicitly permits only the company name; Company has no approved verified-contact fields or mutation endpoint. My account uses the actual owner email and existing verification workflow. No simulated email-change control ships.
2. Prototype reviewer bar, fictional identities, policy-decision links, pretend save/password actions and snapshot footer are omitted. Actual API data, saved receipts, real password limits and actual session revocation replace their fictional copy.
3. `/settings` stays owner-only. The prototype's manager My account route is not a grant to change existing authorization; managers retain standalone own security. Real manager denial and independent security are integration checks.
4. A company-name save does not need a confirmation modal; the existing explicit save and optimistic version contract remain. Password change follows the existing explicit authenticated submission and revokes sessions after actual success.
5. Provider-issued verification/recovery delivery and delivered-link success remain externally unverified. The unavailable sender is displayed honestly. This correction does not enable delivery or certify the full account specification.

## Verification and evidence

- Independent Agent A checkout: `npm test --prefix frontend` passes **64 Node +242 React tests/19 files**, including **23 Account cases**. `npm run lint --prefix frontend` reports0 findings. `npm run build --prefix frontend` passes TypeScript and production Vite build. The existing non-failing plugin-timing advisory remains. Mechanical Impeccable detector returned`[]`; this alone is not visual acceptance.
- Coordinator integrated application (Settings +independent Help): **64 Node +246 React tests pass**. Initial21 real browser cases pass in52.2s; after the additional refresh fix/state coverage, final `settings-v5.spec.ts workspace.spec.ts` passes **13 cases in24.9s**. The guarded runner compiles current backend, browser-test types and frontend and serves its private production assets against a fresh migrated synthetic SQL database.
- **35 settings PNGs** are saved in `v5-settings-evidence/`:24 matching reference/application screenshots across3 sections ×2 widths ×2 languages;5 saved/conflict/loading/manager-redirect/independent-security states;6 unverified/network-error/stale-draft EN/UR390 states. `render-results.json` records12 main matrix observations, each with no page overflow or JS errors. PNG widths match their labels. Extra state cases assert phone overflow and actual persistence/authorization/retry boundaries.
- Agent A directly inspected desktop English Organization/Security versus their references, phone Urdu My account versus its reference, and the added unverified/network-error/stale-draft states. Independent Agent C inspected all12 core renders and state evidence; the coordinator also inspected desktop/phone results. Core composition, hierarchy, approved palette, controls, spacing and RTL are coherent; significant contract-driven differences are listed above.

| Scope | Functional implementation | Visual implementation | Functional verification | Visual verification |
| --- | --- | --- | --- | --- |
| Owner Organization/My account/Security core | Implemented with existing APIs | Approved composition implemented | Actual API/SQL +component cases pass | Desktop/phone EN/UR paired captures inspected |
| Owner verification unavailable/legacy | Existing safe behavior preserved | Real unverified/enrollment state shown | Actual synthetic SQL status, no sender enabled | EN/UR390 captures inspected |
| Name conflict and network failure/retry | Draft/version retained and explicit reload | Persistent error/receipt/busy feedback | Actual SQL409 +labelled transport abort/retry +unit tests pass | Saved/conflict/loading/network/stale-draft captures inspected |
| Manager settings | Existing owner-only authorization preserved | No manager organization UI exposed | Real API403, canonical safe redirect and separate own-security pass | Redirect-loading capture is provenance only; no Dashboard visual acceptance claim |
| Password pending/error and revocation | Existing shared password implementation | Existing field/error/loading pattern reused | Component validation/pending/revocation; real endpoint/lifecycle regressions retained | Core empty form captured; every credential error/pending state is not separately visually certified |
| Provider-issued email delivery and full account lifecycle | Safe unavailable path retained | Truthful configured/unconfigured guidance | Real delivery/valid delivered-link success unverified | Wider provider-qualified states remain unverified |

The coordinator ran `frontend/e2e/settings-v5.spec.ts` using the guarded disposable SQL harness and synthetic seeded records, never the restored customer database. GET loading delays then forwards the original request; no API response is replaced. Network-failure screenshots are explicitly labelled transport seams created with `route.abort`, followed by real API retry; they are not server outage proof. The unverified-status test changes and restores only the disposable fixture's emailVerifiedAt in `finally`; it does not enroll or verify a person or qualify delivery. Credential fields are empty in screenshots; no traces, videos or saved auth state are written.

**The scoped owner settings core is implemented and visually verified. Full V5 and spec30 remain In progress.** Genuine mail delivery, valid delivered-link success and all broader account/provider acceptance are not inferred from these checks. No native runtime acceptance, production action, deployment or merged PR is claimed. The coordinating agent owns final checkpoint/handoff and publication decisions.

## Credential-state continuation — 2026-10-29
The coordinator's Spec40 `account-security-states-v5.spec.ts` adds actual EN/UR390
pending/denied/network-error observations from the standalone own-security page.
Pending forwards the delayed original request;403comes from the real private API
with a synthetic incorrect password; disconnection is an explicit route abort.
All six captures have empty password fields. The20-case managed regression passes,
including a separate real successful-password/session-revocation lifecycle case.
See `v5-account-state-evidence/`. This closes these six visual gaps without claiming
provider-issued delivered-link qualification;30remains In progress.
