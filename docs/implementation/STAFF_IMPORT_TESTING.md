# Current Password-column amendment — 2026-10-31

The latest user instruction supersedes the original handoff-only onboarding. Download the updated six-column template; the previous five-column test file is obsolete. The required Password column is last. Passwords stay hidden in preview and all backend responses. New staff use the spreadsheet email/password directly. Existing employees are still rejected as duplicates; this feature does not reset existing accounts.

Current local app: http://localhost:5173/login. Following verified amendment builds, restart the existing matching-checkout units sequentially. The alternate-port instructions below remain an optional manual method and do not replace the active systemd setup.

# Location staff import: local testing

Implementation lives in `/home/shumail/.local/share/hygene-ops/v5-import-20261031`, branch `implementation/spec-42-location-staff-import`. Following the user’s explicit restart request, services on5173/8080 now run this feature worktree using compiled backend/production frontend assets. Original root source and protected database configuration remain preserved. Local systemd overrides and their backups are in the private local-development runtime directory. No PR was merged or app deployed.

## Automated disposable-data verification

Use the existing guarded runner with a separately owned local PostgreSQL bootstrap named `priv_e2e_test`. This session used loopback56443. The runner creates/migrates/seeds and finally drops only its generated UUID child database. It never loads checkout backend .env files. Provider billing states are synthetic SQL mirrors, not real Paddle qualification.

```sh
cd /home/shumail/.local/share/hygene-ops/v5-import-20261031
HYGENE_E2E_DATABASE_URL=postgresql://shumail@127.0.0.1:56443/priv_e2e_test nice -n 15 node frontend/e2e/run.mjs staff-import.spec.ts
```

The temporary cluster was stopped after verification. Do not interpret connection refused on56443 as an app failure. Start only that owned proof cluster if rerunning; its location is `/home/shumail/.local/share/hygene-ops/v5-import-proof-20261031/pgdata`. Use the existing local PG17 tooling and a writable Unix socket directory beside pgdata, never an unknown database/reset.

## Run this checkout interactively with the existing local development database

These commands use the already configured **local** development database on56445, without replacing the running root checkout or changing its user services. Imports entered here create real local rows. Use synthetic employees with unique email addresses and a company with paid local entitlement/capacity. Real email delivery is unnecessary.

Run dependencies/builds sequentially if needed (they were installed/built in this session):

```sh
cd /home/shumail/.local/share/hygene-ops/v5-import-20261031
nice -n 15 npm ci --prefix backend
nice -n 15 npm ci --prefix frontend
nice -n 15 npm run build --prefix backend
```

Start the existing local database if stopped:

```sh
systemctl --user start hygeneops-local-postgresql.service
```

Start the feature API in terminal1 with a sanitized environment from the existing protected local configuration. This uses a separate port8082 and a private working directory so checkout .env files cannot select remote data. No configuration values are printed:

```sh
node --input-type=module <<'JS'
import {readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
const config=JSON.parse(readFileSync(join(homedir(),'.local/share/hygene-ops/local-development/config.json'),'utf8'));
for(const name of ['DATABASE_URL','DIRECT_URL']) {
  const target=new URL(config.env[name]);
  if(target.hostname!=='127.0.0.1'||target.port!=='56445'||target.pathname!=='/hygene_ops_local') throw Error('Expected the existing local development database');
}
const child=spawn(process.execPath,[resolve('backend/dist/app.js')],{
  cwd:config.directory,
  env:{...config.env,PATH:process.env.PATH,LD_LIBRARY_PATH:config.lib,PORT:'8082',FRONTEND_URL:'http://127.0.0.1:5175'},
  stdio:'inherit',
});
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
child.on('exit',code=>{process.exitCode=code??1;});
JS
```

Start Vite in terminal2:

```sh
cd /home/shumail/.local/share/hygene-ops/v5-import-20261031
VITE_API_BASE_URL=http://127.0.0.1:8082/api nice -n 15 npm run dev --prefix frontend -- --host 127.0.0.1 --port 5175 --strictPort
```

Open **http://127.0.0.1:5175**. Use your existing local company-owner or assigned-site-manager credentials. Existing protected configuration and credentials were not changed. This alternate-port manual setup is documented, not claimed as executed; automated verification used the isolated runner above.

## Import an employee

1. Open Locations, choose an active authorized location, then Staff and shifts → Import Staff.
2. Download Excel Template. Keep its one sheet and exact six headers: Full Name, Email, Phone, Shift Start, Shift End, Password. The manager enters each initial password as text; do not add a location column.
3. Enter name, unused email, phone stored as Text (preserve0300…), distinct local HH:mm shifts, and an initial password of at least6characters and at most72UTF-8bytes. Passwords are used exactly as entered. Examples08:00–16:00 or22:00–06:00; actual Excel time cells also work. DAILY rules include every calendar day, matching current scheduling.
4. Save .xlsx (or matching UTF-8 CSV), <=1MB and <=500rows. Current active-staff capacities remain3/25/200 company-wide; existing staff consume them. No500staff commercial plan was introduced.
5. Upload. Preview creates no accounts. Fix any row errors and reupload. Inspect selected location, totals, shifts and all preview pages.
6. Confirm Import once. On an uncertain network response, retry the same confirmation/file to reconcile its saved receipt. Do not change emails just to retry.
7. Close the success receipt and inspect the selected location staff list and Staff Management. Staff can sign in immediately using the email and password in their spreadsheet row. Passwords are hashed in PostgreSQL and are hidden from previews and import receipts.
8. Give each employee their email and spreadsheet password privately. They sign in normally on the staff app; no access-code or email-delivery step is required. Existing Staff access recovery remains available if a password is later forgotten.

First attendance eligibility is a shift whose start does not predate account creation. Importing after today's shift began does not backfill an absence; the next applicable shift uses existing site-zone/overnight preparation. No tasks are fabricated: create/assign cleaning schedules using existing workflows. Physical-device photo/geofencing/provider acceptance remains part of the original open V5 gates.

Stop the alternate Vite/API terminals with Ctrl+C when finished; the original local services are untouched.
