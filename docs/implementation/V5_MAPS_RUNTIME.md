# Local Google Maps configuration repair — 2026-10-29

The existing key now reaches the isolated local runtime. Actual Google Maps,
Places address search, coordinate selection and radius rendering pass in the
running Add Location form on both local origins. No location was created.

## Configuration

`backend/src/controllers/mapConfig.controller.ts` reads
`GOOGLE_MAP_BROWSER_API_KEY` first, falling back to `GOOGLE_MAP_API_KEY`.
`GOOGLE_MAP_ID` is optional and defaults to Google's `DEMO_MAP_ID` for local use.
These existing conventions are also documented in `backend/.env.example`.

This checkout has its existing key in `GOOGLE_MAP_API_KEY`. The repair copies only
the named Maps settings into the existing protected runtime `config.json` under
`~/.local/share/hygene-ops/local-development/`. Its mode remains `0600`. The original
config was backed up privately before the atomic update. No key value is included
in source, this report, command logs, Git, screenshots or a Vite environment variable.
The SHA256 of `backend/.env` before and after matches; no `.env` file was rewritten.

`scripts/local-development.mjs` now permits the three named browser Maps settings
through its existing allowlist. The backend still starts with its private cwd and
sanitized environment. Remote database/provider settings are not imported.
`scripts/local-development.test.mjs` adds coverage for both key names/map ID while
preserving unrelated provider-credential rejection: **10/10 tests pass**.

The browser necessarily receives this browser key through the existing
authenticated `/api/location/map-config` endpoint and passes it to Google's SDK.
The endpoint retains `Cache-Control: private, no-store`. The checked source files
and existing frontend build contain no literal copy of the key. No key was created
or rotated; no Google Cloud configuration was changed.

## Services

Only `hygeneops-backend-development.service` was explicitly restarted. Its required
frontend relationship caused `hygeneops-frontend-development.service` to restart
automatically as well. Both serve the matching checkout. PostgreSQL and the
separate verification worker kept their original PIDs and were not restarted.

## Actual verification

The live smoke uses a short-lived local signed access cookie and the existing local
database for authenticated configuration. It uses the real running React frontend,
API and Google SDK/network responses. It never intercepts responses or submits the
Create Location form. SDK constructor observation retains the actual Google circle
instances so radius/center assertions measure real map objects.

| Check | `http://127.0.0.1:5173` | `http://localhost:5173` |
|---|---|---|
| Authenticated map-config |200, `enabled:true`, key present |200, `enabled:true`, key present |
| Actual Maps basemap and pin |Pass |Pass |
| Real Places autocomplete/search |Pass |Pass |
| Select public place and fetch details |Pass |Pass |
| Name/address/latitude/longitude populated |Pass |Pass |
| Circle visible and centered on selected coordinates |Pass |Pass |
| Default 500 m radius |Pass |Pass |
| Switch to 100 m updates actual circle radius |Pass |Pass |
| Google errors / failed Google HTTP responses / JavaScript errors |0/0/0 |0/0/0 |
| Location POST/PATCH/DELETE requests |0 |0 |

Both runs searched for a public Islamabad destination and cancelled the form.
The final screenshots were taken after basemap tiles painted; 500 m and 100 m views
were visually inspected. The 500 m boundary extends beyond the small map viewport
at the existing zoom; its real circle radius remains 500 m. The 100 m circle is fully
visible and centered on the pin. No UI, map zoom policy or geofence logic changed.
This is a focused live check, not a new full-product/browser-suite claim.

Sanitized result JSON and dialog-only screenshots are in the private runtime's
`maps-live-results.json` and `maps-evidence/`. No cookies, HAR, traces or auth-state
files were persisted. Normal provider usage from the requested live test occurred.

## Google Cloud verification boundary

Live map rendering, autocomplete and place-detail success demonstrate that the
existing key is operationally accepted for Maps JavaScript and the Places (New)
features used here, on both tested origins. This is not a direct inspection of
the project's enabled-service list or the key's restriction configuration.

Google Cloud administrative access is unavailable in this session. For manual
configuration review, open the project owning this existing key:

1. **APIs & Services → Enabled APIs & services:** verify **Maps JavaScript API**
   and **Places API (New)** are enabled. This application uses the new Places
   autocomplete and `Place.fetchFields`, not just the legacy Places API.
2. **APIs & Services → Credentials → existing key:** review **API restrictions**
   and allow those two APIs.
3. Under **Application restrictions → Websites**, verify the development entries
   `http://127.0.0.1:5173/*` and `http://localhost:5173/*`, retaining other required
   application origins. Successful calls do not prove a key is restricted; an
   unrestricted key could also succeed.
4. Confirm the project's billing link and quotas remain appropriate. This repair
   did not change billing, restrictions, quotas, API activation or project policy.

Google's current primary guidance, checked 2026-10-29:
[Maps JavaScript setup](https://developers.google.com/maps/documentation/javascript/get-api-key),
[Places New prerequisites](https://developers.google.com/maps/documentation/javascript/place-autocomplete-new),
[programmatic autocomplete](https://developers.google.com/maps/documentation/javascript/place-autocomplete-data),
[website/API key restrictions](https://developers.google.com/maps/api-security-best-practices).

Reload an already-open Locations page once to clear its previously cached disabled
map configuration. No remaining map/search/radius failure was observed in the
tested origins. Cloud restriction-list inspection remains manual.
