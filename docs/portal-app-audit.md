# Echo Play Live Portal App Audit

## Source reviewed

- Uploaded handoff: `EPL_APP_HANDOFF.md`
- Drive snapshot folder: `EPL App Playground / epl-app`
- Old app files reviewed:
  - `pages/index.js`
  - `pages/api/airtable.js`
  - `pages/api/blackout.js`
  - `pages/api/setlist-save.js`
  - `pages/api/upload-photo.js`
  - `lib/airtable.js`
  - `package.json`

## Current conclusion

The older Claude-built app should be treated as a reference implementation for the musician and crew portal, not copied directly into the current site. Its ideas are valuable, but the implementation is a large Pages Router single-file app that fetches broad Airtable data to the client.

The current `echo-play-live-site` project should remain the long-term platform:

- public-facing website for fans, bookers, and talent scouters
- private admin command center
- musician and crew portal
- future AI-assisted workflows

## What to keep

High-value patterns from the old app:

- mobile-first app feel
- member selector
- crew selector
- member dashboard with next show and assigned shows
- crew dashboard with sound/merch assignments
- show detail page with load-in, set time, venue, address, members, crew, and setlist context
- blackout date workflow
- profile photo upload workflow
- booking inquiry form

## What to modernize

- Rebuild with App Router routes instead of one giant `pages/index.js`.
- Use focused server-side Airtable helpers instead of sending whole table dumps to the browser.
- Keep Airtable credentials server-only.
- Avoid legacy env-var drift. The current site uses the newer server-side credential pattern.
- Keep member/crew-facing pages separated from admin-only data.
- Do not expose financial fields, internal admin notes, approval queues, AI run logs, deal terms, or payout data in the portal.
- Do not bring over the hardcoded setlist-builder password.
- Add write workflows later with explicit guardrails.

## Phase 2.1 scope

Build the portal foundation inside the current website without touching the older app:

- `/portal`
- `/portal/member/[id]`
- `/portal/crew/[id]`
- `/portal/shows/[id]`

This duplicates the useful member/crew show-reference experience while the old app remains available until the new portal is ready.

## Not included in first pass

- blackout add/edit/delete
- profile photo uploads
- public booking form
- setlist builder
- crew/member authentication
- push notifications

Those will follow after the read-only portal is tested.
