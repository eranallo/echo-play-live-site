# Public website overhaul — September 7, 2026

This candidate makes echoplay.live a public home for fans and buyers. The primary journeys are finding a show, discovering one of the four active bands, and sending a booking inquiry. The visual system uses generous space, system typography, real performance imagery, restrained gold, and clear navigation.

## Scope

- Rebuilt the home, band, show, booking, story, press, public musician, and podcast experiences; added `/bands` and `/privacy`.
- Retired `/admin`, `/portal`, and `/api/admin` and their supporting internal modules. They return 404; no operational data is deleted in another system.
- Preserved public performer biographies, music exploration, song requests, existing QR landing URLs, authentic media, and press downloads.
- Replaced the admin-dependent show reader with a tested public publication contract. Only approved upcoming Confirmed/Cancelled shows survive, cancellation removes ticket actions, and private fields/source IDs do not cross the public boundary.
- Fixed inquiry feedback so an email draft or upstream error is never presented as a saved inquiry. Input mapping uses existing Airtable choices without schema creation.
- Deferred music loading, removed web-font requests from the public shell/PDF generator, constrained upstream reads, and removed private song notes from the public projection.
- Corrected pixel initialization and qualified leads only on confirmed inquiry persistence. Configured vendor behavior needs a hosted check.

No dependency upgrade, paid service, new account, live data change, or release is included. The lockfile remains the current production baseline.

## Local verification

Use the hosting project's Node 24 runtime for release parity. Local checks also passed with Node 22.

```sh
npm ci
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3107
```

With that production server running in a separate terminal:

```sh
npm run check:routes
node tests/inquiry/public-artifact-audit.mjs
```

The route audit is deliberately restricted to a credential-free loopback server. Do not point it at production or configure live Airtable write credentials. Fixture/service tests mock writes; missing-credential behavior is part of the route audit. Public-show tests originated in the prior isolated public-show-boundary work and are preserved with the implementation.

The added GitHub Actions workflow runs tests and a build without business credentials. It has not executed remotely until the candidate is pushed and a triggering event occurs.

## Before release

1. Review the visual candidate and approve the exact source for a hosted preview.
2. Confirm existing environment variable presence and least-needed access without copying secrets into source or documentation.
3. Verify actual published shows, member photos, music providers, ticket links, and configured tracking in the hosted preview. Test writes only against an authorized isolated destination or with explicit live-test authorization.
4. Review band facts, press copy, inquiry expectations, privacy text, and tracking choices with their owners. Privacy copy is a proposal, not a legal-compliance certification.
5. Complete genuine keyboard/assistive-technology and hosted performance checks. Local responsive checks do not establish WCAG conformance or field Core Web Vitals.
6. Approve production promotion, record a verified rollback deployment, and smoke-test the public journeys and retired endpoints after release.

Known retained dependencies include Airtable attachment URL expiry, Spotify/Bandsintown/RSS availability, per-instance rate limiting, and the existing non-atomic song-request vote update. Canonical public shows never silently fall back to a different data source.
