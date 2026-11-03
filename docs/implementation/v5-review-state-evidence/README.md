# Recorded V5 review states — 2026-10-29

Spec36 implementation, with integrated captures owned by the existing Spec40 harness.
Source revision: `10fb4a4` (after `f589992`, `0b94928`, `4cf5e76`).
This directory contains **40 PNGs**, not 40 independently accepted screens:
32 full-page application state captures, four application decision-panel viewport
captures and four approved V5 reviewed-state references. Viewports are
1366×900 and390×900, English/Urdu. PNG width/height/hash and reference hashes are
in `evidence-manifest.json`; `render-results.json` records32 state observations,
all without page overflow. Each browser matrix also asserted zero page JS errors.

## Provenance

The private application/API were compiled and started from this isolated worktree
by `frontend/e2e/run.mjs`. The runner creates a fresh UUID child database from the
explicitly owned loopback56442 `priv_e2e_test` bootstrap, applies existing migrations
and uses generated synthetic credentials/data in a sanitized environment. It
removes its database and temporary runtime in `finally`. No existing development
server, restored customer database, production configuration or provider credentials
were used. No credential-bearing trace, video or auth state was persisted.

`review-states-v5.spec.ts` adds25 synthetic setup-only rooms/reviews, an independent
cloned task closed through the actual API, and a persisted HOLD attempt. The HOLD
asset deliberately has no remote image bytes: its synthetic unavailable locator is
not evidence of storage delivery, real privacy evaluation, AI qualification or a
native capture. The actual metadata read proves HOLD takes precedence over an older
CLEANING_REQUIRED requirement. Actual foreign-site detail/content requests return403.

Loading delays forward actual API requests. Network failures explicitly abort those
requests and then retry the real API. No positive JSON/image response is replaced.
These two captures are labelled fault seams, not proof of a real provider outage.

## Captured state matrix

Every application prefix below has `1366-en`, `1366-ur`, `390-en`, `390-ur` variants.

| Prefix | Actual state / interaction |
|---|---|
| `app-setup` | Real SETUP record, no generated task or staff closure authority; existing room-setup destination; forged closure409 |
| `app-closed` / `app-closed-decision` | Actual saved closure after reload, note/manager/local timestamp and next pending action; SQL task status/submission/verification/outcome unchanged |
| `app-held-unavailable` | Actual recorded HOLD metadata with unavailable private bytes; no dirty inference or photo acceptance control |
| `app-held-site-denied` | Real manager for another site denied review/content access |
| `app-large-queue-page1` / `app-large-queue-page2` |25 persisted matching records;20 then5, correct filters/page URL, distinct rows and real next-review navigation |
| `app-loading` | Delayed real API request, skeleton and unknown counts |
| `app-network-error` | Labelled aborted-request seam, visible retry, no stale counts/false zero; real retry succeeds |

## Visual comparison and corrections

New paired V5 reviewed references are `v5-closed-<width>-<language>.png`.
Representative direct pairs:

| View | Approved reference | Actual decision panel |
|---|---|---|
| Desktop English | [V5](v5-closed-1366-en.png) | [React](app-closed-decision-1366-en.png) |
| Desktop Urdu | [V5](v5-closed-1366-ur.png) | [React](app-closed-decision-1366-ur.png) |
| Phone English | [V5](v5-closed-390-en.png) | [React](app-closed-decision-390-en.png) |
| Phone Urdu | [V5](v5-closed-390-ur.png) | [React](app-closed-decision-390-ur.png) |

Direct inspection compared the closed panel's hierarchy, success fill, title,
spacing, attributed facts, preserved mixed-language note and blue next action.
Setup/HOLD/paging/loading/error are contract-derived variants of the approved
existing workspace; V5 has no exact setup-only/recorded-HOLD/25-row data equivalent.
The unchanged approved core references in `../v5-review-evidence/` remain the layout
reference, rather than inventing fictional state parity. State inspection covered
responsive stacking, permission recovery, controls, readable EN/UR, navigation and
no horizontal clipping. The live records, retained guidance and unavailable photo
facts deliberately replace prototype sample pictures/counts/identities.

Inspection found and corrected setup's conflicting staff-performance callout and
false Unassigned worker fact. A closed review now offers a real next pending review
instead of looping inside an exhausted Reviewed queue. The Urdu review tabs use the
existing review vocabulary, avoiding untranslated Reviewed and task-not-started
Pending wording. The inherited selected-queue accent matches approved V5 and remains.

## Actual verification

- Focused review React checks:36 pass.
- Whole web:64 Node utility +282 React tests across21 React files pass; no failures/skips.
- Final managed browser state batch:5 cases pass in51.3s. These are additional
  Spec40 state checks, not completion of the full flow table or live qualification.
- Frontend full lint0findings; frontend/backend TypeScript and private production
  Vite builds pass in the managed runner. `npm run build --prefix frontend` and
  standalone strict E2E TypeScript pass. Spec validator:42 specs,0 errors,12 existing
  documented warnings.
- Initial fixture creation failed before browser work because V2 task clones omitted
  mandatory deadlines; the fixtures now copy those fields. A later loading capture
  had a route-release race; forwarding after the gate and waiting for handler cleanup
  fixed the harness. Neither failure required weakening an application policy.

Spec36 remains **In progress** for full retained-media/provider and applicable native
qualification. No merge, deployment, production mutation or new processing authority.
