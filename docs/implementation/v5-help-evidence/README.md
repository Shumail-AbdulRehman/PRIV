# V5 Help and service information evidence

Captured2026-10-22 by the guarded existing spec40 browser runner from
`/tmp/hygene-v5-integrated` at integration revision `5acdf6a`, which includes
Agent B source `944186b` and independent Organization/Settings changes. The runner
compiled matching backend/React sources into its private runtime build and used
fresh migrated synthetic disposable PostgreSQL data. No production/restored customer
database, existing user development server, provider activation or deployed service
was used. No tenant sign-in is needed for these public routes.

Run by the coordinator:
`npm run test:e2e --prefix frontend -- settings-v5.spec.ts help-v5.spec.ts customer-auth-v5.spec.ts lifecycle.spec.ts workspace.spec.ts`
with explicit guarded loopback disposable-test database and browser variables.
**21cases passed in52.2s**, including both Help cases; not full-product acceptance.

## Capture matrix and findings

- `app-help-*`/`app-information-*`: actual built React plus actual support endpoint.
- `v5-help-*`/`v5-information-*`: unmodified approved V5 `journeys.js` references.
- Matching1366×900 and390×900 viewports, English and Urdu. Images use fullPage
  capture, so their saved heights differ with actual content.
- `render-results.json`:8base observations, zero horizontal overflow/JS errors,
  correct LTR/RTL, approved Inter/Arabic and30px desktop headings (Help27px phone).
  Every observed public API request was solely `GET /api/support/contact`.
- Four FAQ-open captures preserve actual native disclosure after interaction.
- Loading capture delays then forwards the actual support response. Error capture
  explicitly aborts the network request; it is a named presentation fault seam,
  not proof of a real backend outage. Retry then gets actual200unavailable facts.
- Configured safe mailbox/legal/distribution positives are unit-network/config
  seams only. No live approved values or delivery/device qualification is claimed.

The implementer, coordinator and independent Agent C compared rendered desktop/phone
EN/UR pairs and representative FAQ/loading/error captures. Scoped Help/Information
core composition is visually verified; no significant clipping/composition issue
remains in this matrix. Public header/title, unsupported prototype ticket-form
omission and expanded truthful fact copy are documented in [V5_HELP](../V5_HELP.md).
Full spec38 remains In progress for configured-positive qualification/visual states.

## Files

- [app-help-1366-en.png](app-help-1366-en.png)
- [app-help-1366-ur.png](app-help-1366-ur.png)
- [app-help-390-en.png](app-help-390-en.png)
- [app-help-390-ur.png](app-help-390-ur.png)
- [app-help-faq-1366-en.png](app-help-faq-1366-en.png)
- [app-help-faq-1366-ur.png](app-help-faq-1366-ur.png)
- [app-help-faq-390-en.png](app-help-faq-390-en.png)
- [app-help-faq-390-ur.png](app-help-faq-390-ur.png)
- [app-help-loading-390-en.png](app-help-loading-390-en.png)
- [app-help-network-error-390-en.png](app-help-network-error-390-en.png)
- [app-information-1366-en.png](app-information-1366-en.png)
- [app-information-1366-ur.png](app-information-1366-ur.png)
- [app-information-390-en.png](app-information-390-en.png)
- [app-information-390-ur.png](app-information-390-ur.png)
- [v5-help-1366-en.png](v5-help-1366-en.png)
- [v5-help-1366-ur.png](v5-help-1366-ur.png)
- [v5-help-390-en.png](v5-help-390-en.png)
- [v5-help-390-ur.png](v5-help-390-ur.png)
- [v5-information-1366-en.png](v5-information-1366-en.png)
- [v5-information-1366-ur.png](v5-information-1366-ur.png)
- [v5-information-390-en.png](v5-information-390-en.png)
- [v5-information-390-ur.png](v5-information-390-ur.png)
