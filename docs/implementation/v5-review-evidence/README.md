# V5 Photo Reviews screenshot evidence

45 PNGs plus the six-observation render manifest.

Current correction: issue84/spec36, branch `implementation/v5-photo-review-workspace`.
This directory contains rendered evidence, not a new prototype or complete-product
acceptance. Source: unmodified approved `design/v5/reviews.html` and actual compiled
React + backend with guarded migrated synthetic SQL fixtures. No restored customer
records, credentials, tokens, private operational photos or production providers.

Viewports1366×900,390×900,1920×900; English and Urdu. `render-results.json` records
six observations with zero overflow/JS errors. Desktop/phone ordering and modal
geometry are asserted in `frontend/e2e/photo-review-v5.spec.ts`.

| Reference | Actual application | Observation |
|---|---|---|
| [V5 desktop missing](v5-missing-1366-en.png) | [Real desktop detail](app-detail-1366-en.png) | Queue, reason, evidence, task record and decision panel; actual missing evidence |
| [V5 phone missing](v5-missing-390-en.png) | [Real phone detail](app-detail-390-en.png) | Detail replaces queue; evidence precedes decision |
| [V5 Urdu phone](v5-missing-390-ur.png) | [Real Urdu phone](app-detail-390-ur.png) | RTL hierarchy and translated controls |
| [V5 wide desktop](v5-missing-1920-en.png) | [Real wide desktop](app-detail-1920-en.png) | Queue/evidence/decision columns |
| [V5 phone queue](v5-queue-390-en.png) | [Real phone queue](app-queue-390-en.png) | Actual scoped queue, totals, filters and pagination |

`app-*` captures use actual API/SQL data (including real empty, denied and concurrent
conflict states). `v5-*` are approved reference renders with fictional examples and
the prototype reviewer bar. These fixtures intentionally differ in data/counts.

**`http-fixture-*` are presentation-only HTTP seams**: the synthetic SQL review has
no retained image. Test-only intercepted attempt metadata and an explicitly labelled
synthetic SVG exercise the real authenticated viewer component, thumbnails, inline
zoom/fit, enlargement, image-error and retry behavior. They do not prove live media
storage, privacy qualification, real AI results or an uploaded operational photo.
Example: [viewer](http-fixture-image-1366-en.png), [phone enlargement](http-fixture-enlarged-390-en.png),
[Urdu enlargement](http-fixture-enlarged-390-ur.png), [image outage](http-fixture-image-error-390-en.png).

Inspection corrected two material inherited differences: mobile decision-first
ordering and retained queue filters on selected phone detail. The final viewer
capture waits for opaque modal state, avoiding a transient fade frame.

Six guarded browser cases pass; five use real backend/SQL, one uses the explicitly
labelled image seam. Broader recorded closed/setup/held/large queue visual acceptance
remains open. Full V5 is incomplete; see [V5_REVIEWS.md](../V5_REVIEWS.md) for current
implementation, tests, deviations and remaining gates.
