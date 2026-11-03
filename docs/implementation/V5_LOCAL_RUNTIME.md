# Compatible local development environment — 2026-10-29

The V5 frontend, API and existing local database now have persistent user services.
The previous transient replacement disappeared; the enabled old backend restarted
from another checkout, causing missing V5 API routes. See the
[runtime data audit](V5_RUNTIME_DATA_AUDIT.md) for evidence and verification.

## Current runtime

| Component | Address | Persistent user unit |
|---|---|---|
| Vite, current checkout `frontend/` | http://127.0.0.1:5173 | `hygeneops-frontend-development.service` |
| Current compiled backend | http://127.0.0.1:8080/api | `hygeneops-backend-development.service` with `local-v5.conf` drop-in |
| Existing PostgreSQL 17 | `127.0.0.1:56445/hygene_ops_local` | `hygeneops-local-postgresql.service` |

Checkout: `/home/shumail/bkacup-16-oct-bkpriv/bk-Priv/PRIV`. Repair branch:
`fix/v5-runtime-data-loading`, based on `55061b8`, with the repair working tree.
Frontend uses credentialed relative `/api`; Vite proxies to `127.0.0.1:8080`.

The database is the previously restored local copy documented on October 21.
It is **not synchronized with subsequent remote changes**. Existing records,
password hashes and all 18 applied migrations were retained. No migration,
seed, reset, password replacement or remote database operation was needed.

## Guards and restart

The [launcher](../../scripts/local-development.mjs) reads only the protected
`~/.local/share/hygene-ops/local-development/config.json`. Its existing
`directory`, `backend`, `bin`, `lib`, `pgdata`, `pglog` and `env` settings are
preserved. No secrets belong in this repository or in unit files.

The launcher requires the matching checkout, exact local database, an existing
PG17 data directory, disabled external billing/push/credentials, a fresh backend
build and exact completed migration checksums. Startup checks are read-only.
It never initializes a database or applies migrations. Backend runs from the
private runtime directory with an allowlisted environment and no checkout `.env`.

```sh
node scripts/local-development.mjs check
systemctl --user restart hygeneops-backend-development.service
systemctl --user restart hygeneops-frontend-development.service
```

After backend source changes, compile before restarting. Use an explicitly local
database environment when running backend commands; repository `.env` files
contain remote targets and must not select this runtime's database. The managed
E2E runner compiles backend, web and browser tests with sanitized environments.
A stale build makes the launcher fail visibly.

Browser Maps is the explicit provider exception: the existing `GOOGLE_MAP_API_KEY`
is copied from backend configuration into the protected local config. The launcher
also supports the existing preferred `GOOGLE_MAP_BROWSER_API_KEY` and optional
`GOOGLE_MAP_ID` conventions. It does not load the checkout `.env` or inherit other
provider credentials. The key is delivered only through the existing authenticated
map-config API and Google's browser SDK, not through a Vite build variable.
See [the live Maps verification](V5_MAPS_RUNTIME.md). Reload an already-open page
after changing Maps settings, because the map-config query is cached for the page.

The frontend requires the backend unit; the backend requires local PostgreSQL,
which waits for a read-only connection before declaring startup complete. All
three units are enabled for the user session. No reboot was performed.

## Persistent configuration provenance

Templates are in [scripts/systemd](../../scripts/systemd). They were rendered
with `@ROOT@` set to the checkout above and `@NODE@` set to the existing Node24
executable, then installed in `~/.config/systemd/user/`:

- `hygeneops-local-postgresql.service`
- `hygeneops-frontend-development.service`
- `hygeneops-backend-development.service.d/local-v5.conf`

The original backend unit was retained; the drop-in replaces its old checkout
command. A private copy is saved as
`~/.local/share/hygene-ops/local-development/v5-original-backend-development.service`.
`systemctl --user daemon-reload` and `systemd-analyze --user verify` accepted the
configuration. Do not recreate the old transient compatible service in parallel.

The separate old verification-worker service was left untouched. It is not wired
to this local database, and this repair does not qualify real photo processing.
Provider operations remain disabled in the compatible local environment.

## Authentication and evidence

Local signing keys are separate from the old remote-backed server. Sign in again
after switching to this environment. Existing copied password hashes were not
changed. Managed E2E uses real password login against disposable synthetic users;
the existing-record smoke uses a short-lived signed local access cookie without
persisting it. Those are distinct verification methods.

Private logs and redacted smoke summaries remain under the protected runtime
directory. Do not publish its configuration, copied records, session material or
private logs wholesale. The source-controlled audit contains sanitized results.


## Local demo company — 2026-10-31

At the user's request, a separate **Hygene Ops Demo — Local Testing** company
(company20, owner23) is available at http://localhost:5173/dashboard. The owner
login identifier is `demo.owner@hygeneops.example`. Its generated password is
only in the protected `~/Downloads/HygeneOps-Demo-Account.txt` and private task
credentials; never copy it into Git, logs or screenshots. Choose **Owner or manager**
on web login. This company-owner login is separate from staff Android login.

This is an explicitly labeled **local subscription fixture**, not a Paddle
checkout, payment or qualified provider subscription. Pro access expires
2026-11-30T04:43:30.590Z. Existing Pro limits remain5locations/25staff/3managers
including the owner. No location or permanent staff fixtures were added; set up
a real test location and staff using the application.

Paddle stays `sandbox`; `PADDLE_BILLING_ENABLED=false` and provider credentials
remain absent from the running server. The launcher now permits precisely one
local-demo Pro price mapping (`pri_localdemo` followed by17zeroes) in the private
configuration. Empty catalog is still valid; arbitrary/real catalogs, API keys,
production mode, billing activation, remote databases and push remain rejected.
The existing application authorization/quota/subscription code is unchanged; only
the new demo company's exact customer/subscription/price/period linkage qualifies.
No email was verified and no recovery, photo-provider or Paddle qualification gate
was changed. A `LOCAL_DEMO_SUBSCRIPTION_PROVISIONED` audit records the fixture.

Verification:11launcher tests pass. Actual browser password login, Pro subscription
read and staff creation(201) pass; wrong password returns401 and a foreign-tenant
staff read returns404. Temporary staff rows were removed; the demo workforce is
empty. Hash comparisons prove pre-existing company and manager records unchanged.
The first browser script's final heading selector expected `Team`; correcting it
to the actual `Your team` heading produced a fresh complete pass. No product code
was changed for that script correction.

Private backups, provision script, redacted verification and demo-only screenshot:
`~/.local/share/hygene-ops/demo-company-20261031T044226Z/`. No migration/reset,
remote provider call, real charge, production action, branch switch or PR merge.
The signup/billing-policy investigation is paused; specification statuses are
unchanged and no acceptance is inferred from this demo.
