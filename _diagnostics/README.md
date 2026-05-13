# Diagnostic endpoints

These two API routes are diagnostic-only. They were added during Phase 20 troubleshooting to verify that env vars, Spotify, and Airtable were all reachable from the live runtime. **They're already deployed to your repo** from earlier rounds — you don't need to re-upload them unless you want the latest version of `spotify-check` (which got the `limit=20` fix in 20.4 so its discography probe shows green).

| Bundle path | GitHub path | What it does |
|---|---|---|
| `_diagnostics/app/api/spotify-check/route.js` | `app/api/spotify-check/route.js` | GET → JSON report on Spotify token, track search, artist search, and discography. **Updated in 20.4** to use the corrected `limit=20`. |
| `_diagnostics/app/api/airtable-check/route.js` | `app/api/airtable-check/route.js` | GET → JSON report on Airtable token presence, SONGS table reachability, and per-band Performed By match counts. |

## URLs after deploy

- `https://echoplay.live/api/spotify-check`
- `https://echoplay.live/api/airtable-check`

Both return JSON with a plain-English `conclusion` field at the bottom that names the failure mode.

## Safety

Neither endpoint echoes secret values — only booleans, lengths, HTTP statuses, and short error previews. Safe to leave deployed.

## When to delete

Both can be removed from the repo whenever you're satisfied the catalog and discography are working. They have no marketing surface — they're not linked from any public page, just direct URLs. To remove:

1. Delete `app/api/spotify-check/` and `app/api/airtable-check/` folders from your GitHub repo
2. Redeploy

No env vars or settings to clean up.
